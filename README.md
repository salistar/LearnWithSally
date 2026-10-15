<div align="center">
  <img src="assets/images/mascot-logo.png" width="96" alt="Sally the fox" />
  <h1>LearnWithSally</h1>
  <p><strong>Apprends une langue en parlant avec Sally, ta prof IA.</strong></p>
  <p>Expo · React Native · NativeWind v5 · Clerk · Stream · OpenAI Realtime · PostHog</p>
</div>

---

## Ce que fait l'application

- **Onboarding** puis **inscription / connexion** (email + code à 6 chiffres, Google / Facebook / Apple) avec Clerk.
- **Choix de la langue** : espagnol, français, japonais, coréen, allemand, chinois (mémorisé avec Zustand + AsyncStorage).
- **Accueil** : objectif du jour, série de jours, leçon à continuer, programme du jour.
- **Learn** : unités et leçons (30 leçons locales et typées), onglet Practice avec le vocabulaire.
- **Leçon audio avec Sally** : appel audio Stream, la prof IA (Vision Agents + OpenAI Realtime) rejoint l'appel,
  micro « maintenir pour parler », **sous-titres en direct** de Sally et de l'élève, fin de leçon avec XP.
- **Analytics PostHog** : `language_selected`, `lesson_started`, `lesson_abandoned`, `lesson_completed`…

## Architecture

```
 Téléphone Android/iOS                     Serveur Expo (app/api)               Service Python (vision-agent)
 ┌──────────────────────┐  Bearer Clerk   ┌───────────────────────────┐        ┌──────────────────────────┐
 │ Clerk session        │ ──────────────▶ │ /api/stream-token         │        │ Sally                    │
 │ Écran leçon          │                 │  verifyToken (Clerk)      │        │  lit custom.system_prompt│
 │ Client Stream (audio)│ ──────────────▶ │ /api/agent-session ─────────────▶  │  rejoint le même appel   │
 └─────────┬────────────┘                 │  vérifie le propriétaire  │  HTTP  │  OpenAI Realtime (voix)  │
           │        appel audio partagé   └───────────────────────────┘        └────────────┬─────────────┘
           └──────────────────────────────── Stream (WebRTC) ◀─────────────────────────────┘
```

## Démarrage rapide (Windows + Android)

Prérequis : Node.js LTS, Git, Android Studio (SDK + émulateur ou téléphone en débogage USB), Python ≥ 3.12, [uv](https://docs.astral.sh/uv/).

```powershell
git clone https://github.com/salistar/LearnWithSally.git
cd LearnWithSally
npm ci
Copy-Item .env.example .env      # puis remplis .env avec TES clés
npx expo run:android             # build natif (Stream/WebRTC ne marche pas dans Expo Go)
```

Dans un **second terminal**, lance Sally :

```powershell
cd vision-agent
uv sync
uv run main.py serve             # écoute sur http://localhost:8000
```

### Variables d'environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | app | clé publique Clerk (`pk_test_…`) |
| `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST` | app | projet PostHog (facultatif) |
| `CLERK_SECRET_KEY` | serveur | vérification officielle des sessions dans `app/api/*` |
| `STREAM_API_KEY` | serveur | identifiant public Stream |
| `STREAM_API_SECRET` | serveur + Python | **secret**, jamais dans l'app |
| `VISION_AGENT_URL` | serveur | URL du service Python vue par le serveur Expo |
| `OPENAI_API_KEY` | Python | **secret**, utilisé seulement par Sally |
| `EXPO_PUBLIC_API_URL` | app (option) | URL publique du serveur API quand l'app ne tourne pas via Metro |

## Scripts

```bash
npm run lint        # ESLint (expo lint)
npm run typecheck   # tsc --noEmit
npm run android     # expo run:android
```

## Documentation

- [docs/GUIDE.md](docs/GUIDE.md) — le parcours complet en 18 étapes, fichier par fichier, avec la checklist de validation.
- [docs/PROMPTS.md](docs/PROMPTS.md) — les 18 prompts (en français) pour reconstruire chaque étape avec un assistant IA.
- [AGENTS.md](AGENTS.md) — règles du projet pour les assistants IA.
- [docs/mockups/](docs/mockups) — maquettes de référence.

## Crédits

Projet construit en suivant le tutoriel *JavaScript Mastery* « Lingua » ([vidéo](https://www.youtube.com/watch?v=Q7AYc2kECDI),
[dépôt d'origine](https://github.com/adrianhajdin/react-native-lingua)). Le code a été réécrit et les illustrations,
polices Poppins et maquettes proviennent du dépôt d'origine, qui ne fournit pas de licence : vérifie les droits
avant toute utilisation commerciale.
