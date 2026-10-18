# 🎵 MusicLess — Open Source Stem Separation & Practice Mixer

Um aplicativo **100% gratuito e open source** para prática musical, karaokê e estudo de instrumentos (guitarra, baixo, bateria, vocais).

Inspirado nos conceitos de engenharia reversa do Moises.ai (`recon_3.md` e `features_2.csv`), o **MusicLess** foi arquitetado para permitir que qualquer músico isole ou silencie instrumentos de uma música sem custos de assinatura.

---

## 🚀 Funcionalidades Principais

- 🎤 **Modo Karaokê**: Silencie a voz principal e coros em 1 clique para cantar por cima.
- 🥁 **Modo Drumless**: Silencie a bateria para praticar na bateria acústica ou eletrônica.
- 🎸 **Modo Bassless / Guitarras**: Isole o baixo ou guitarras para aprender linhas e solos de ouvido.
- 🎚️ **Mixer Multi-Pistas (4 Stems)**:
  - Faders de volume independentes para **Vocais, Bateria, Baixo e Harmonia (Outros)**.
  - Botões **MUTE** (silenciar) e **SOLO** (isolar).
  - VU Meters animados com leitura de pico em tempo real.
- ⚡ **Controle de Velocidade**: 0.75x, 1.0x, 1.25x sem alterar a afinação.
- 📱 **Multiplataforma**: Código único em **React Native com Expo** funcionando na **Web**, **Android** e **iOS**.

---

## 📂 Estrutura do Projeto

```
MusicLess app/
├── app/                  # Frontend Multiplataforma (Expo / React Native / TypeScript)
│   ├── src/
│   │   ├── audio/        # StemAudioEngine (Web Audio API sincronizado)
│   │   └── types.ts      # Tipagens dos Stems e Mixer
│   ├── App.tsx           # Interface visual da Mesa de Mixagem
│   └── package.json
│
├── backend/              # Motor de Separação de IA (Python / FastAPI / Demucs v4)
│   ├── server.py         # API de upload e separação em 4 stems
│   ├── requirements.txt  # Dependências (PyTorch, Demucs, FastAPI)
│   └── Dockerfile        # Container pronto para Docker ou Hugging Face Spaces
│
├── recon_3.md            # Engenharia reversa e especificação de produto (Moises)
└── features_2.csv        # Matriz de 50 requisitos e prioridades
```

---

## 🛠️ Como Executar

### 1. Rodar o App (Web / Mobile)

Entre na pasta `app`:

```bash
cd app
npm run web
```

- Pressione **Play** para testar imediatamente o backing track interativo de 4 pistas gerado em tempo real pelo motor de áudio.
- Para rodar no Android: `npm run android`
- Para rodar no iOS: `npm run ios`

### 2. Rodar o Backend de IA (Demucs v4)

Se quiser separar suas próprias músicas utilizando a rede neural HTDemucs:

#### Opção A: Via Docker (Mais fácil)
```bash
cd backend
docker build -t musicless-backend .
docker run -p 8000:8000 musicless-backend
```

#### Opção B: Direto no Python
```bash
cd backend
pip install -r requirements.txt
python server.py
```

A API estará disponível em `http://localhost:8000/docs`.

---

## 📄 Licença

Distribuído sob a licença **MIT** — livre para uso pessoal, educacional e comercial.
