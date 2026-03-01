# Khalele — خليلي

Arabic AI — understands every dialect, responds in Fusha or Easy Arabic.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with AWS credentials

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

| Phase | Feature |
|-------|---------|
| **1** | Next.js, Bedrock chat, Admin dashboard, DynamoDB/S3 libs |
| **2** | Fusha / Easy Arabic output, RAG context, anti-repetition |
| **3** | Voice: Web Speech API (STT), Amazon Polly (TTS) |
| **4** | Memory: Core, Episodic, Semantic (in-memory + DynamoDB) |
| **5** | Characters, feedback/corrections, admin corrections view |

## Project Structure

```
├── app/
│   ├── page.tsx, chat/, admin/
│   └── api/chat, feedback, corrections, voice/synthesize
├── components/Chat/     # ChatInput, ChatMessage, FeedbackButtons, CharacterSelector
├── components/Voice/   # MicButton (STT), SpeakButton (TTS)
├── lib/aws/            # Bedrock, DynamoDB, S3, Transcribe, Polly
├── lib/memory/         # Memory context, RAG knowledge
├── lib/characters.ts   # Character definitions
└── infra/              # AWS setup instructions
```

## AWS Setup

See [infra/README.md](./infra/README.md). Minimum: Bedrock access. DynamoDB/S3/Polly optional (in-memory fallback for corrections).
