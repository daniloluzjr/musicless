# 🎵 MusicLess — Free & Open-Source AI Stem Separation & Practice Mixer

<p align="center">
  <a href="https://github.com/daniloluzjr/musicless"><img src="https://img.shields.io/github/stars/daniloluzjr/musicless?style=social" alt="GitHub Stars" /></a>
  <a href="https://github.com/daniloluzjr/musicless"><img src="https://img.shields.io/github/forks/daniloluzjr/musicless?style=social" alt="GitHub Forks" /></a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-informational" alt="Platforms" />
  <img src="https://img.shields.io/badge/Framework-Expo%20%2F%20React%20Native-blueviolet" alt="Expo React Native" />
  <img src="https://img.shields.io/badge/AI%20Model-Meta%20Demucs%20v4%20(6%20Stems)-success" alt="Demucs v4 6-Stems" />
</p>

> **The 100% Free & Open-Source Alternative to Moises.ai.**  
> Separate any track into **6 isolated studio stems** (Vocals, Drums, Bass, Piano, Brass/Sax, and Guitar) via direct file upload or YouTube/Spotify link with **zero bleed**!

---

## ⭐ Why MusicLess?

Commercial stem separation apps force musicians behind expensive paywalls (\$10–\$30/month) or restrict basic playback features like loop, speed, and track count. 

**MusicLess** is built to give musicians full freedom to practice, jam, and produce:
- 🎤 **Karaoke / Acapella Mode**: Mute or isolate lead & backing vocals with 1 click.
- 🥁 **Drumless Mode**: Silence drums completely to practice on acoustic or electronic kits.
- 🎸 **Bassless & Guitar Isolation**: Isolate basslines or solos to learn songs note-for-note.
- 🎹 **Keys & Brass Isolation**: Dedicated channels for **Piano/Keyboards** and **Sax/Horns/Brass**.
- 🎚️ **6-Stem Synchronized Studio Mixer**:
  - Independent volume faders for **Vocals, Drums, Bass, Piano, Brass/Sax, and Guitar**.
  - Tactile **MUTE** and **SOLO** buttons per channel with sample-accurate synchronization.
  - Real-time animated **VU Peak Meters** per track.
- 🔗 **Smart Link Importer**: Paste **YouTube**, **YouTube Music**, or **Spotify** links directly with automatic anti-bot bypass.
- ⚡ **Speed & Pitch Controls**: Slow down tricky passages (0.75x) or speed them up (1.25x) without altering pitch.
- 🚀 **High-Performance Streaming**: Auto-converts isolated stems to lightweight studio MP3s for fast browser loading and minimal RAM usage.
- 📱 **Universal Cross-Platform**: Run on Web, or compile to native Android and iOS via Expo.

---

## 📸 Interface Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  MusicLess [OPEN SOURCE]                 Stem Practice Player          │
├────────────────────────────────────────────────────────────────────────┤
│  Load Song: [ Paste Link (YouTube/Spotify) ] | [ Upload Audio File ]   │
│  Quick Modes: [Karaoke] [Drums] [Bass] [Piano] [Sax/Brass] [Guitar] [All]
│  Transport:   [◀◀]  [ ▶ PLAY ]  [Speed: 0.75x 1.0x 1.25x]              │
├────────────────────────────────────────────────────────────────────────┤
│  [🎤] Vocals              [MUTE] [SOLO]  ═══════════● 85%   [||||||  ] │
│  [🥁] Drums               [MUTE] [SOLO]  ════════════● 90%  [||||||||] │
│  [🎸] Bass                [MUTE] [SOLO]  ═════════════● 95% [||||||| ] │
│  [🎹] Keys / Piano        [MUTE] [SOLO]  ══════════● 80%    [|||||   ] │
│  [🎺] Sax / Horns / Brass [MUTE] [SOLO]  ══════════● 80%    [||||    ] │
│  [🎸] Guitar & Other      [MUTE] [SOLO]  ══════════● 80%    [||||||  ] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Architecture

```
MusicLess/
├── app/                  # Frontend (React Native + Expo Web + Web Audio API)
│   ├── assets/           # Custom instrument icons (microfone, bateria, etc.)
│   ├── src/
│   │   ├── audio/        # StemAudioEngine.ts (Multi-stem sync & zero-bleed routing)
│   │   └── types.ts      # Stem & Player type contracts
│   ├── App.tsx           # Mixer, In-Player Hub & Transport Controls
│   └── package.json
│
├── backend/              # AI Separation Engine (Python / FastAPI)
│   ├── server.py         # Demucs v4 (htdemucs_6s) + yt-dlp + ffmpeg conversion
│   ├── requirements.txt  # PyTorch, Demucs, FastAPI, yt-dlp, imageio-ffmpeg
│   └── Dockerfile        # Container for local or cloud deployment (Hugging Face / Render)
│
├── .vercelignore         # Prevents heavy AI backend from exceeding Vercel limits
├── recon_3.md            # Clean-room functional reverse-engineering analysis
└── features_2.csv        # 50-item product roadmap & priorities
```

---

## 🚀 Quickstart

### 1. Run the Web Player (Frontend)

```bash
cd app
npm install
npm run web
```
- Open your browser at `http://localhost:8081` (or `8082`).
- Paste any YouTube link or upload an audio file to practice immediately!

To run on native mobile:
- **Android**: `npm run android`
- **iOS**: `npm run ios`

### 2. Run the AI Separation Backend

Ensure you have Python 3.10+ installed.

```bash
cd backend
pip install -r requirements.txt
python server.py
```
- The backend API runs at `http://localhost:8000`.
- API interactive documentation: `http://localhost:8000/docs`.

#### Running via Docker:
```bash
cd backend
docker build -t musicless-ai .
docker run -p 8000:8000 musicless-ai
```

---

## ☁️ Deployment Guide

### Deploying the Frontend (Vercel)

The frontend is a lightweight static web app (~2.7 MB).
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to: `app`
3. In **Build Settings**:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**!

### Deploying the AI Backend (Hugging Face / Render / Railway)

Because PyTorch + Demucs requires ~4.5 GB of dependencies:
- **Recommended Free Cloud Host**: Deploy `backend/Dockerfile` to **[Hugging Face Spaces](https://huggingface.co/spaces)** (free 16 GB RAM Docker tier).
- **Self-Hosting**: Run `docker compose` or `python server.py` on any VPS or local machine with a GPU/CPU.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the audio engine, add chord recognition, or package on-device CoreML/TFLite models, please submit a Pull Request or open an Issue.

If you find this project helpful, please consider giving it a **⭐ Star on GitHub**!

---

## 📄 License

Distributed under the **MIT License**. Free for personal, educational, and commercial use.
