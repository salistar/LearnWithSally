# AGENTS.md — LearnWithSally

Context file for AI coding assistants (Claude Code, Cursor, Copilot…). Read it before every change.

## Project

LearnWithSally is an Expo (React Native) language-learning app. Learners pick a language, follow local
lessons and practise out loud with **Sally**, an AI voice teacher (a fox mascot) that joins a Stream audio
call through a Python service built with Stream Vision Agents + OpenAI Realtime.

## Stack and versions (do not upgrade without asking)

| Area | Package | Version |
| --- | --- | --- |
| Framework | expo / react-native / react | ~54.0.33 / 0.81.5 / 19.1.0 |
| Routing | expo-router (typed routes) | ~6.0.23 |
| Styling | nativewind **v5 preview** + tailwindcss v4 + react-native-css | 5.0.0-preview.3 / ^4.3 / ^3.0.7 |
| State | zustand + AsyncStorage | ^5.0.3 / 2.2.0 |
| Auth | @clerk/expo (Core 3 API: `signIn.emailCode`, `signUp.verifications`) + @clerk/backend (server) | ^3.2.10 / ^3.2 |
| Audio calls | @stream-io/video-react-native-sdk + @stream-io/react-native-webrtc | ~1.34.0 / ~137.2.0 |
| Analytics | posthog-react-native | ^4.45.3 |
| AI teacher | Python ≥ 3.12, uv, vision-agents (+ getstream, openai plugins) | **0.6.0 pinned** |

- NativeWind is v5: config lives in `global.css` (`@theme`, `@utility`), `metro.config.js` (`withNativewind`)
  and `postcss.config.mjs`. There is **no** `tailwind.config.js` — never paste v4 instructions.
- vision-agents ≥ 0.6.2 removed `Realtime*SpeechTranscriptionEvent`; upgrading requires rewriting captions.

## Folders

```
app/            routes only (Expo Router)
  (auth)/       sign-up, sign-in
  (tabs)/       home, learn, ai-teacher, chat, profile (custom TabBar)
  lesson/[id]   audio lesson with Sally
  api/          server routes: stream-token, agent-session, chat (secrets live here)
components/     reusable UI (TabBar, LessonCard, VerificationModal, SocialButton, AuthShell, Logo)
constants/      theme.ts (tokens for StyleSheet), images.ts (ALL image imports)
data/           languages.ts, units.ts, lessons.ts — typed local content, no database
lib/            posthog, api (URL helper), teacher (prompt builder), server-auth (API only), progress
store/          zustand stores (language + learning persisted with AsyncStorage, chat in memory only)
types/          learning.ts
vision-agent/   Python teacher service
docs/           guide, prompts, mockups
```

## Rules

1. Build one feature per request, keep code simple and teachable.
2. Styling: NativeWind classes first. Use `style`/`StyleSheet` only for SafeAreaView, KeyboardAvoidingView,
   Modal, ScrollView `contentContainerStyle`, TextInput text styles, animated/dynamic/pressed styles, shadows.
3. Reusable class patterns go into `global.css` as `@utility` (BEM names: `btn-primary`, `btn-primary__label`).
4. Images only through `constants/images.ts` (`images.mascotLogo`, …).
5. Lesson content is typed TypeScript in `data/`. No `any`.
6. **Secrets never reach the app**: `STREAM_API_SECRET`, `CLERK_SECRET_KEY`, `OPENAI_API_KEY` are read only by
   `app/api/*` and `vision-agent/`. Never add them to `app.config.js` `extra` or to an `EXPO_PUBLIC_*` variable.
7. Every API route calls `requireUserId()` (lib/server-auth.ts) and, for calls, `assertOwnsCall()`.
8. Call type is `default` everywhere (`lib/teacher.ts` → API route → Python).
9. Progress values (XP, streak) are real local values that start at 0 — no fake demo numbers.
10. Analytics: reuse `lib/posthog.ts` (`track()`); never send keys, audio or transcript text.

## Commands

```bash
npm run lint
npm run typecheck        # tsc --noEmit
npx expo run:android     # native build (needed for Stream/WebRTC — Expo Go is not enough)
cd vision-agent && uv sync && uv run main.py serve
```

Run lint + typecheck before finishing any task, then explain what changed and how to test it.
