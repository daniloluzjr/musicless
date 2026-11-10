import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Protect against None stdout/stderr when running via pyw / pythonw
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

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
    print("=" * 60)
    print("   🎵 MusicLess - AI Stem Separation & Practice Mixer")
    print("=" * 60)
    print("\nIniciando servidor local de IA (UVR5 MDX-Net + Meta Demucs v4)...")
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    time.sleep(1.5)
    url = "http://127.0.0.1:8000"
    print(f"Abrindo MusicLess Studio no seu navegador: {url}")
    webbrowser.open(url)
    print("\n[PRONTO] MusicLess ativo em http://127.0.0.1:8000")
    print("Para fechar o programa a qualquer momento, clique em 'Fechar MusicLess' no navegador.")
    print("Ou pressione Ctrl+C nesta janela.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nMusicLess encerrado com sucesso. Até a próxima!")

if __name__ == "__main__":
    main()
