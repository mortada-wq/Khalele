# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Kheleel (خليلي) is a single Next.js 14 monolith (App Router) — one service handles both frontend and all API routes. There are no separate backend services or local databases to run.

### Commands

Standard commands are in `package.json`:
- **Dev server**: `npm run dev` (port 3000)
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Environment variables

Copy `.env.example` to `.env.local`. The only required external credentials for full chat functionality are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (with Bedrock access). All other services (DynamoDB, S3, Polly, Transcribe, Google OAuth, Resend) are optional — the app has in-memory fallbacks or gracefully handles missing credentials.

Set `NEXTAUTH_SECRET` to any non-empty string for local development (e.g. `dev-secret-key-for-local-testing`).

### Gotchas

- The chat API route (`/api/chat`) returns "AWS credentials not configured" when `AWS_ACCESS_KEY_ID` is empty. This is expected behavior, not a bug.
- The admin page (`/admin`) requires Google OAuth authentication with an admin-flagged account. Without auth, it redirects to the homepage.
- `npm run build` logs `CredentialsProviderError` warnings during static generation for routes that call AWS at build time — these are harmless without credentials configured.
- No `.nvmrc` or `engines` field is present; Node 18+ works fine (tested with Node 22).
