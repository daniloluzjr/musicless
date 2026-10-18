# 🎵 MusicLess — Free & Open-Source AI Stem Separation & Practice Mixer

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-informational" alt="Platforms" />
  <img src="https://img.shields.io/badge/Framework-Expo%20%2F%20React%20Native-blueviolet" alt="Expo React Native" />
  <img src="https://img.shields.io/badge/AI%20Model-Meta%20Demucs%20v4-success" alt="Demucs v4" />
  <img src="https://img.shields.io/badge/Audio-Web%20Audio%20API-orange" alt="Web Audio" />
</p>

> **The 100% Free & Open-Source Alternative to Moises.ai.**
> Mute vocals for karaoke, isolate drums or bass to jam along, change speed without pitch shift, and separate any track via file upload or YouTube/Spotify link!

---

## ⭐ Why MusicLess?

Most commercial stem separation apps force musicians behind expensive subscriptions ($10–$30/month) or lock basic features like loop and speed control behind paywalls. 

**MusicLess** is built from clean-room reverse engineering specifications to offer:
- 🎤 **Karaoke Mode**: Mute lead & backing vocals with 1 click to sing over backing tracks.
- 🥁 **Drumless Mode**: Silence drums completely to practice on acoustic or electronic kits.
- 🎸 **Bassless & Guitar Isolation**: Isolate basslines or solos to learn songs by ear.
- 🎚️ **4-Stem Synchronized Mixer**:
  - Independent volume faders for **Vocals, Drums, Bass, and Other (Keys/Guitar)**.
  - Tactile **MUTE** and **SOLO** buttons per channel.
  - Real-time animated **VU Peak Meters**.
- 🔗 **Smart Link Importer**: Paste **YouTube**, **Spotify**, or **SoundCloud** links directly (`yt-dlp` integration).
- ⚡ **Speed & Pitch Controls**: Slow down tricky guitar solos (0.75x) without altering pitch.
- 📱 **Universal Cross-Platform**: Run locally on Web, or compile to native Android and iOS via Expo.

---

## 📸 Interface Preview

```
┌──────────────────────────────────────────────────────────┐
│  MusicLess [OPEN SOURCE]        Stem Practice Player     │
├──────────────────────────────────────────────────────────┤
│  Quick Modes: [Karaoke] [Drums] [Bass] [Guitar] [All]    │
│  Transport:   [◀◀]  [ ▶ PLAY ]  [Speed: 0.75x 1.0x 1.25x]│
├──────────────────────────────────────────────────────────┤
│  [🎤] Vocals           [MUTE] [SOLO]  ═══════════● 85%   │
│  [🥁] Drums            [MUTE] [SOLO]  ════════════● 90%  │
│  [⚡] Bass             [MUTE] [SOLO]  ═════════════● 95% │
│  [🎸] Guitar & Other   [MUTE] [SOLO]  ══════════● 80%    │
├──────────────────────────────────────────────────────────┤
│  Import Hub: [Paste YouTube/Spotify Link] | [Upload MP3] │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Project Architecture

```
MusicLess/
├── app/                  # Frontend (React Native + Expo + Web Audio API)
│   ├── src/
│   │   ├── audio/        # StemAudioEngine.ts (Sample-accurate multi-stem sync)
│   │   └── types.ts      # Stem & Player type contracts
│   ├── App.tsx           # Mixer & Player Interface
│   └── package.json
│
├── backend/              # AI Separation Engine (Python / FastAPI)
│   ├── server.py         # Demucs v4 + yt-dlp audio extractor API
│   ├── requirements.txt  # PyTorch, Demucs, FastAPI, yt-dlp
│   └── Dockerfile        # Docker container for local/cloud deployment
│
├── recon_3.md            # Clean-room functional reverse-engineering analysis
└── features_2.csv        # 50-item product roadmap & priorities
```

---

## 🚀 Quickstart

### 1. Run the Web/Mobile Player

```bash
cd app
npm run web
```
- Open your browser at `http://localhost:8081`.
- Press **Play** to test the real-time synthesized 4-channel funk backing track.
- Try toggling **MUTE** on Vocals or **SOLO** on Bass.

To build mobile apps:
- Android: `npm run android`
- iOS: `npm run ios`

### 2. Run the AI Separation Backend (Optional for file/link processing)

#### Using Docker:
```bash
cd backend
docker build -t musicless-ai .
docker run -p 8000:8000 musicless-ai
```

#### Directly with Python:
```bash
cd backend
pip install -r requirements.txt
python server.py
```
API Documentation will be live at `http://localhost:8000/docs`.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the audio engine, add chord recognition, or package on-device CoreML/TFLite models, please submit a Pull Request or open an Issue.

If you find this project helpful, please consider giving it a **⭐ Star on GitHub**!

---

## 📄 License

Distributed under the **MIT License**. Free for personal, educational, and commercial use.
