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
- **Chat** : conversation écrite avec Sally (route serveur `/api/chat`, la clé OpenAI reste côté serveur).
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

Prérequis : Node.js 22.18+ ou 24, Git, Android SDK 36 + Java 17, téléphone USB, Python 3.12 et [uv](https://docs.astral.sh/uv/).
Le [guide local Windows / APK / AAB](docs/LOCAL_ANDROID.md) décrit la session sans secrets sur disque, les tests réels et les limites de la signature de test.

```powershell
git clone https://github.com/salistar/LearnWithSally.git
cd LearnWithSally
npm ci
Copy-Item .env.example .env      # renseigner seulement les valeurs publiques
# Ajouter EXPO_PUBLIC_API_URL=http://127.0.0.1:8097 dans .env pour les tests USB.
cd vision-agent
python -m uv sync --locked --python 3.12
cd ..
npm run local:session
```

### Brancher tes comptes (Clerk, Stream, OpenAI, PostHog)

```powershell
# Ouvrir http://127.0.0.1:8791/ et charger les secrets dans les champs masqués.
# Démarrer les services, puis cliquer sur « Vérifier les services ».
```

`check:env` contrôle aussi que le type d'appel Stream `default` existe et que ton projet OpenAI a accès aux modèles Realtime.

Le lanceur démarre Metro sur `127.0.0.1:8097` et Sally sur `127.0.0.1:8000`. Il transmet les secrets uniquement en mémoire aux processus enfants.

### Variables d'environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | app | clé publique Clerk (`pk_test_…`) |
| `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST` | app | projet PostHog (facultatif) |
| `CLERK_SECRET_KEY` | serveur | vérification officielle des sessions dans `app/api/*` |
| `STREAM_API_KEY` | serveur | identifiant public Stream |
| `STREAM_API_SECRET` | serveur + Python | **secret**, jamais dans l'app |
| `VISION_AGENT_URL` | serveur | URL du service Python vue par le serveur Expo |
| `OPENAI_API_KEY` | serveur + Python | **secret** : voix de Sally et onglet Chat |
| `OPENAI_CHAT_MODEL` | serveur (option) | modèle du Chat (défaut `gpt-4o-mini`) |
| `EXPO_PUBLIC_API_URL` | app (option) | URL publique du serveur API quand l'app ne tourne pas via Metro |

## Scripts

```bash
npm run lint        # ESLint (expo lint)
npm run typecheck   # tsc --noEmit
npm run android     # expo run:android
```

## Installer l'app sur ton téléphone (APK)

```powershell
npm install -g eas-cli
eas login
eas init                              # lie le projet à ton compte Expo
eas env:create                        # ajoute tes variables (Clerk, Stream, OpenAI…) côté EAS
eas build -p android --profile preview   # produit un APK installable
eas deploy --prod                     # publie les routes API (EAS Hosting)
```

Dans `eas.json`, remplace `https://learnwithsally.expo.app` par l'URL affichée par `eas deploy`.
Le service Python de Sally doit être hébergé à part (VM, Render, Fly.io…) et `VISION_AGENT_URL` doit pointer vers lui.

## Intégration continue

`.github/workflows/ci.yml` lance à chaque push : lint, typecheck, bundle Android et vérification du service Python.

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
