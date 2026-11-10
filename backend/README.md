---
title: MusicLess AI Engine
emoji: 🎵
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# 🎵 MusicLess AI Stem Separation Engine

Open-source high-fidelity stem separation backend powered by **UVR5 MDX-Net** and **Meta Demucs v4**.

- **Endpoints:**
  - `POST /separate`: Upload local audio file for 6-stem isolation.
  - `POST /separate-url`: Extract and separate streams from YouTube / Spotify.
  - `GET /track-stems/{track_id}`: Poll separated stem audio URLs.
  - `GET /health`: Healthcheck.

Web App: [musicless-app.vercel.app](https://musicless-app.vercel.app)  
GitHub: [github.com/daniloluzjr/musicless](https://github.com/daniloluzjr/musicless)
