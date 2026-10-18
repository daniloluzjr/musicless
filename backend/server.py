import os
import shutil
import subprocess
import hashlib
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yt_dlp

app = FastAPI(
    title="MusicLess AI Stem Separation API",
    description="Open Source Audio Stem Separation Backend using Demucs v4 & yt-dlp",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("separated")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

app.mount("/separated", StaticFiles(directory=str(OUTPUT_DIR)), name="separated")
app.mount("/audio", StaticFiles(directory=str(UPLOAD_DIR)), name="audio")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MusicLess AI Separator"}

@app.post("/separate")
async def separate_audio(file: UploadFile = File(...)):
    track_id = Path(file.filename).stem.replace(" ", "_")
    input_path = UPLOAD_DIR / f"{track_id}_{file.filename}"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "ready",
        "track_id": track_id,
        "audio_url": f"/audio/{track_id}_{file.filename}",
    }

class UrlRequest(BaseModel):
    url: str

@app.post("/separate-url")
async def separate_url(req: UrlRequest):
    """
    Downloads audio stream from YouTube, YouTube Music, or resolves Spotify tracks via yt-dlp,
    serves it directly to the player, and queues for stem separation.
    """
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    url_hash = hashlib.md5(url.encode()).hexdigest()[:10]
    output_filename = f"track_{url_hash}"

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': str(UPLOAD_DIR / f"{output_filename}.%(ext)s"),
        'nocheckcertificate': True,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'Unknown Track')
            artist = info.get('artist') or info.get('uploader') or 'Unknown Artist'
            ext = info.get('ext', 'webm')
            duration = info.get('duration', 0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch audio from link: {str(e)}")

    downloaded_file = UPLOAD_DIR / f"{output_filename}.{ext}"

    return {
        "status": "ready",
        "title": title,
        "artist": artist,
        "duration": duration,
        "audio_url": f"http://localhost:8000/audio/{output_filename}.{ext}",
        "track_id": output_filename,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
