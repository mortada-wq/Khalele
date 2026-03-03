# Kheleel AI‑Agent Instructions

> These notes are written for GitHub Copilot / other automated agents that are
> being invoked in this repository.  The goal is to make it easy to be
> effective immediately rather than having to read the whole codebase.

---

## 🧩 Big‑picture architecture

1. **Next.js `app` router.**  All UI lives under `app/`.  Default components are
   **server components**.  Add `"use client"` at the top of a file if it
   uses hooks, browser APIs or local state (see `app/chat/page.tsx`, most of
   the files in `components/`).

2. **API endpoints = files under `app/api/<name>/route.ts`.**  They export
   `GET`, `POST`, etc. and return `NextResponse`.  Business logic usually lives
   in `lib/*` and is imported by the handlers.

3. **Client ↔ server data flow.**  Chat page (`app/chat/page.tsx`) keeps
   conversation state in React state/localStorage; it sends the current
   message array to `/api/chat` which in turn calls the LLM helper `invokeDeepSeek`
   in `lib/llm.ts`.  Responses are appended and rendered by `components/Chat`.

4. **LLM integration.**  `lib/llm.ts` wraps a DeepSeek/SiliconFlow model via the
   `openai` package.  The system prompt is built there; adjust style, persona
   or extra flags (`useSearch`, `empathyMode`, `ramadanMode`) here when adding
   features.

5. **Memory/knowledge.**  Stateless helpers in `lib/memory/*` keep a tiny
   in‑memory pool (`SHARED_KNOWLEDGE`) and dialect vocabulary.  `getRelevantKnowledge`
   is called before every LLM invocation.  Extend here to add new recall types.

6. **Characters & tools.**  `lib/characters.ts` defines the preset personas
   users can choose.  `lib/tools.ts` and `components/Tools` deal with external
   integrations; `detectIntegrationIntent` lives in `lib/connectors.ts`.

7. **Authentication & admin.**  NextAuth is configured in `lib/auth.ts` with
   Google + credentials providers.  The `session` callback tags the user as
   `admin` when the email matches `ADMIN_EMAIL`.  `lib/admin-auth.ts` is a
   small helper used by protected API routes/pages to enforce the role.

8. **AWS helpers.**  Although the LLM moved to SiliconFlow, the repo still
   contains AWS wrappers under `lib/aws` for Bedrock, DynamoDB, S3, Polly,
   Transcribe.  Follow the existing pattern when calling other AWS services.

9. **Frontend components.**  Most interactive bits are under
   `components/Chat`, `components/Voice`, `components/Gamification`, etc.  Use
   `lucide-react` icons and Tailwind CSS classes.  Shared state is lifted to
   pages; components are mostly presentational.

10. **State persistence.**  - `lib/chat.ts` contains helpers used by the UI to
    generate and group conversations and to manage a pseudo‑user id stored in
    `localStorage`.  The chat page sends `x-user-id` or `incognito_*` headers
    with most API requests.

---

## 🚀 Developer workflows

```bash
npm install
cp .env.example .env.local             # populate with your own keys
# (use AWS credentials only if you plan to hit DynamoDB/S3/Polly)

npm run dev                            # start the dev server on :3000
# or use `npm run dev:fresh` to kill any process binding port 3000 first

npm run build && npm run start        # production build
npm run lint                          # run ESLint
```

- **Environment variables** live in `.env.local`.  Common keys:
  `SILICONFLOW_API_KEY`, `NEXTAUTH_*`, `ADMIN_EMAIL`, `DYNAMODB_*`, etc.  See
  `.env.example` for the full list.  Restart the server if you add/change any.
- AWS services are optional; the app works in memory when tables/buckets are
  missing.
- There are no automated tests yet; changes generally require manual verification
  in the browser.  Keep an eye on the console logs added by API handlers.

---

## 📁 Conventions & patterns

* **TS interfaces are used systematically.**  Look into `lib/chat.ts`,
  `lib/llm.ts`, `lib/memory/index.ts` for examples of typing shapes.
* **`use client` at the top of files that use state/hooks/browser API.** 
  Otherwise the file is a server component and runs on the server.
* **File/route names** follow Next.js rules (`[id]` for dynamic segments).
* **Error handling** in API routes usually catches exceptions, logs detailed
  info, and returns a `NextResponse.json({error: ...}, {status: ...})`.
* **Console logging** is the preferred debugging method; look at existing
  `console.log` calls in `/app/api` routes for formatting.
* **User feedback flow:** `components/Chat/MessageActions.tsx` shows the
  pattern for client-side callbacks that POST to `/api/feedback` and manage
  UI state.
* **Style** uses Tailwind; dark/light mode and theming are handled by
  `components/ThemeProvider.tsx` and related files.

---

## 🔗 Integration points & external dependencies

* **LLM:** `openai` package with a custom base URL for SiliconFlow.
* **Voice:** Web Speech API for STT; ElevenLabs or Google TTS via
  `lib/aws/polly.ts` and `app/api/voice/synthesize/route.ts`.
* **Authentication:** NextAuth; frontend uses `useSession()` and
  `signIn()`/`signOut()` from `next-auth/react`.
* **Data storage:** DynamoDB for conversations, users, corrections, and
  training sessions.  The tables' expected schemas are documented in
  `infra/README.md`.
* **Email:** Resend (see `lib/tools.ts` for how the helper is called).
* **Integrations:** `lib/connectors.ts` holds logic for detecting when the
  user is asking to connect to external services and populating the `tools`
  modal.

---

## 📝 When adding features

1. **Decide where the code lives.**  - UI? put it under `components/`.  -
   Route logic? add under `app/api` or the corresponding `app/.../page.tsx`.
   - Shared business logic belongs in `lib/` so both server and client can reuse
   it.
2. **Follow existing interfaces.**  Look at `Message`, `Conversation`,
   `ChatUserProfile` etc. to remain consistent.
3. **Update or add environment variables** in `.env.example` and document
   them here if needed.
4. **Use the `apiHeaders()` pattern** from `app/chat/page.tsx` for requests
   that need user/anon identification.
5. **Guard admin routes** with `requireAdminResponse()`.
6. **Run `npm run lint`** before committing.

---

> ❓ **Need more context?**  Browse the `README.md` and `infra/README.md` for
> setup instructions, and read the top of each file for comments – many
> modules are heavily documented by the original author.

Feel free to request clarification if any section feels incomplete or
confusing.