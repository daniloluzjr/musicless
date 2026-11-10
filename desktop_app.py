import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Ensure local backend dir is in PATH for ffmpeg
os.environ["PATH"] = str(BACKEND_DIR) + os.pathsep + os.environ.get("PATH", "")

def start_server():
    import uvicorn
    from server import app
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def main():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1.2)

    url = "http://127.0.0.1:8000"

    # Launch native desktop application window using pywebview (Edge WebView2)
    try:
        import webview
        window = webview.create_window(
            title="MusicLess - AI Stem Separation & Practice Player",
            url=url,
            width=1280,
            height=860,
            min_size=(980, 680),
            background_color="#090d16"
        )
        webview.start()
    except Exception:
        # Fallback to browser if webview encounters any issue
        webbrowser.open(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
    finally:
        # When native window is closed, immediately terminate background server and free RAM
        os._exit(0)

if __name__ == "__main__":
    main()
