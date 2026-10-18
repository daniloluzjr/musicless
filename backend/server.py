import os
import shutil
import subprocess
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="MusicLess AI Stem Separation API",
    description="Open Source Audio Stem Separation Backend using Demucs v4",
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

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MusicLess AI Separator"}

@app.post("/separate")
async def separate_audio(file: UploadFile = File(...)):
    """
    Receives an audio file (MP3, WAV, FLAC, M4A) and separates it into:
    - vocals.wav (Vocals / Karaoke)
    - drums.wav  (Drums / Drumless)
    - bass.wav   (Bass / Bassless)
    - other.wav  (Guitars / Keys / Harmony)
    """
    track_id = Path(file.filename).stem.replace(" ", "_")
    input_path = UPLOAD_DIR / f"{track_id}_{file.filename}"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    track_output_dir = OUTPUT_DIR / track_id
    track_output_dir.mkdir(exist_ok=True)

    # Run Demucs CLI: separates into 4 stems using standard htdemucs model
    cmd = [
        "demucs",
        "--two-stems", "vocals", # Or full 4-stems: demucs -n htdemucs input_path -o OUTPUT_DIR
        "-n", "htdemucs",
        str(input_path),
        "-o", str(OUTPUT_DIR)
    ]

    try:
        # Full 4-stems command:
        full_cmd = ["demucs", "-n", "htdemucs", str(input_path), "-o", str(OUTPUT_DIR)]
        result = subprocess.run(full_cmd, capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Separation failed: {e.stderr}")

    base_separated = OUTPUT_DIR / "htdemucs" / Path(input_path).stem

    return {
        "status": "completed",
        "track_id": track_id,
        "stems": {
            "vocals": f"/separated/htdemucs/{Path(input_path).stem}/vocals.wav",
            "drums": f"/separated/htdemucs/{Path(input_path).stem}/drums.wav",
            "bass": f"/separated/htdemucs/{Path(input_path).stem}/bass.wav",
            "other": f"/separated/htdemucs/{Path(input_path).stem}/other.wav",
        }
    }

from pydantic import BaseModel

class UrlRequest(BaseModel):
    url: str

@app.post("/separate-url")
async def separate_url(req: UrlRequest):
    """
    Downloads audio from YouTube, SoundCloud, or resolves Spotify tracks via yt-dlp,
    then separates it into 4 stems using Demucs v4.
    """
    import hashlib
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    url_hash = hashlib.md5(url.encode()).hexdigest()[:10]
    output_filename = f"track_{url_hash}"
    output_wav = UPLOAD_DIR / f"{output_filename}.wav"

    # Step 1: Download audio using yt-dlp
    # Note: For Spotify links, yt-dlp / spotdl searches YouTube by metadata
    ytdlp_cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "wav",
        "--audio-quality", "0",
        "--max-filesize", "50M",
        "-o", str(UPLOAD_DIR / f"{output_filename}.%(ext)s"),
        url
    ]

    try:
        subprocess.run(ytdlp_cmd, capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch audio from link: {e.stderr}")

    # Step 2: Separate with Demucs v4
    full_cmd = ["demucs", "-n", "htdemucs", str(output_wav), "-o", str(OUTPUT_DIR)]
    try:
        subprocess.run(full_cmd, capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Demucs separation failed: {e.stderr}")

    return {
        "status": "completed",
        "source_url": url,
        "track_id": output_filename,
        "stems": {
            "vocals": f"/separated/htdemucs/{output_filename}/vocals.wav",
            "drums": f"/separated/htdemucs/{output_filename}/drums.wav",
            "bass": f"/separated/htdemucs/{output_filename}/bass.wav",
            "other": f"/separated/htdemucs/{output_filename}/other.wav",
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
