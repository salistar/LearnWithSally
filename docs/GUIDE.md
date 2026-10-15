# Guide LearnWithSally — de zéro à la leçon vocale

Ce guide suit les 18 étapes du tutoriel Lingua (JavaScript Mastery) et indique, pour chacune, **où se trouve le
code dans ce dépôt** et **comment la valider**. Les prompts correspondants sont dans [PROMPTS.md](PROMPTS.md).

> Les validations sont à faire sur ton installation (émulateur ou téléphone Android). Elles n'ont pas été
> exécutées pendant la création du dépôt : seuls `npm run lint`, `npm run typecheck` et une compilation du
> bundle Android (`npx expo export --platform android`) ont été lancés et passent.

---

## 0. Comptes et outils

| Outil | Lien | Pourquoi |
| --- | --- | --- |
| Node.js LTS | https://nodejs.org/en/download | Expo SDK 54 |
| Git | https://git-scm.com/downloads | cloner / versionner |
| Android Studio | https://developer.android.com/studio | SDK, Platform Tools, émulateur (minSdk 24) |
| Clerk | https://dashboard.clerk.com | authentification (clé publique + clé secrète) |
| Stream | https://getstream.io | appel audio (API key + secret) |
| OpenAI Platform | https://platform.openai.com | modèle Realtime (facturation API, différente de ChatGPT) |
| PostHog | https://posthog.com | analytics (facultatif) |
| Python ≥ 3.12 + uv | https://docs.astral.sh/uv/getting-started/installation/ | service de Sally |

### Réglages Clerk
1. Crée une application *Development*.
2. **Email** : active l'identifiant email, la **vérification par code** et le mot de passe (inscription) ;
   active la connexion **Email code** (la connexion de l'app est sans mot de passe).
3. Facultatif : Google, Facebook, Apple dans *SSO connections*.
4. Copie `pk_test_…` → `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` et `sk_test_…` → `CLERK_SECRET_KEY`.

### Réglages Stream
Crée une app Video & Audio, copie API key / secret. Le type d'appel utilisé partout est `default`.

---

## 1. Installer et lancer (Windows + Android)

```powershell
git clone https://github.com/salistar/LearnWithSally.git
cd LearnWithSally
npm ci
Copy-Item .env.example .env
npx expo-doctor
adb devices                 # ton émulateur / téléphone doit apparaître
npx expo run:android
```

Second terminal :

```powershell
cd vision-agent
uv sync
uv run main.py serve
```

- Après une modification JavaScript seule : Metro recharge tout seul.
- Après l'ajout d'un module natif ou d'un plugin : relance `npx expo run:android`.
- Sur téléphone physique, `localhost` désigne le téléphone : les appels `/api/...` passent par Metro en dev.
  Si ce n'est pas le cas, définis `EXPO_PUBLIC_API_URL` (ex. `http://192.168.1.20:8081`).
- `VISION_AGENT_URL` est l'adresse du service Python **vue par le serveur Expo** (même PC → `http://localhost:8000`).

---

## 2. Les étapes et leurs fichiers

| # | Étape (repère vidéo) | Fichiers | Validation |
| --- | --- | --- | --- |
| — | AGENTS.md (03:07, 28:37) | `AGENTS.md` | l'assistant connaît la stack et les versions |
| 01 | NativeWind v5 (38:01) | `global.css`, `metro.config.js`, `postcss.config.mjs`, `babel.config.js`, `nativewind-env.d.ts`, `app/_layout.tsx` | une classe `bg-sally-purple` s'affiche en violet |
| 02 | Thème & design system (47:13) | `global.css` (`@theme`, `@utility h1…caption`, `btn-primary`, `card`, `field`), `constants/theme.ts`, `constants/images.ts` | polices Poppins chargées, couleurs cohérentes |
| 03 | Onboarding (58:26) | `app/onboarding.tsx`, `components/Logo.tsx` | logo + mascotte, bouton visible sans débordement |
| 04 | UI d'authentification (1:08:58) | `app/(auth)/sign-up.tsx`, `app/(auth)/sign-in.tsx`, `components/AuthShell.tsx`, `components/VerificationModal.tsx`, `components/SocialButton.tsx` | la modale de code reste au-dessus du clavier |
| 05 | Clerk réel (1:15:45) | `app/_layout.tsx`, `app/(auth)/*`, `lib/useSocialAuth.ts`, `app/index.tsx` | un code faux est refusé ; la session persiste ; la déconnexion ramène à l'onboarding |
| 06 | Contenus pédagogiques (1:27:04) | `types/learning.ts`, `data/languages.ts`, `data/units.ts`, `data/lessons.ts` | chaque leçon référence une unité et une langue existantes |
| 07 | Sélection de langue (1:33:27) | `app/language-select.tsx` | bouton désactivé tant qu'aucune langue n'est choisie |
| 08 | Zustand & persistance (1:39:01) | `store/languageStore.ts`, `app/index.tsx`, `app/(tabs)/profile.tsx` (outils dev) | la langue survit à un redémarrage ; « Reset language » relance la sélection |
| 09 | Navigation 5 onglets (1:45:16) | `app/(tabs)/_layout.tsx`, `components/TabBar.tsx` | le cercle violet glisse vers l'onglet actif |
| 10 | Accueil (1:51:30) | `app/(tabs)/index.tsx`, `store/learningStore.ts`, `lib/progress.ts` | changer de langue change l'accueil ; XP et série partent de 0 |
| A | PostHog initial (2:00:23) | `lib/posthog.ts`, `app/_layout.tsx` | sans jeton, l'app fonctionne (analytics désactivées) |
| 11 | Liste des leçons (2:14:57) | `app/(tabs)/learn.tsx`, `components/LessonCard.tsx` | chaque carte ouvre `/lesson/<id>` ; aucune leçon verrouillée |
| 12 | Écran leçon audio (2:19:55) | `app/lesson/[id].tsx` | un id inconnu affiche « Lesson not found » sans crash |
| B | Environnement natif (2:25:25) | `app.config.js` (plugins Stream/WebRTC, minSdk 24) | `npx expo run:android` compile |
| 13 | Stream : appel audio (2:39:35) | `app/api/stream-token+api.ts`, `lib/server-auth.ts`, `app/lesson/[id].tsx` | sans session → 401 ; avec session → l'appel est rejoint |
| 14 | Vision Agents (2:47:51) | `vision-agent/main.py`, `vision-agent/pyproject.toml` | `uv run main.py serve` démarre sur :8000 |
| 15 | Connecter Sally à l'UI (2:53:45) | `app/api/agent-session+api.ts`, `lib/teacher.ts`, `vision-agent/main.py` | statut « Online », la voix de Sally est audible, Sally quitte l'appel à la sortie |
| 16 | Améliorer la prof (3:04:56) | `lib/teacher.ts` (`buildTeacherPrompt`), `vision-agent/main.py` | Sally attend ta réponse et ne félicite pas dans le silence |
| 17 | Sous-titres en direct (3:15:29) | `vision-agent/main.py` (événements `transcript_partial` / `transcript_final`), `app/lesson/[id].tsx` | le texte grandit pendant la parole, une phrase finie n'est pas dupliquée |
| 18 | PostHog : événements métier (3:28:58) | `lib/posthog.ts` (`track`), `app/_layout.tsx` (identify), `app/language-select.tsx`, `app/lesson/[id].tsx` | un seul `lesson_started` et un seul `lesson_completed`/`lesson_abandoned` par leçon |

---

## 2 bis. Au-delà du tutoriel

| Ajout | Fichiers | Validation |
| --- | --- | --- |
| Onglet Chat avec Sally | `app/(tabs)/chat.tsx`, `app/api/chat+api.ts`, `store/chatStore.ts` | sans session → 401 ; Sally répond et corrige ; la clé OpenAI n'est jamais dans l'app |
| Build APK / déploiement API | `eas.json` | `eas build -p android --profile preview` produit un APK |
| CI GitHub | `.github/workflows/ci.yml` | l'onglet *Actions* de GitHub est vert |

## 3. Différences avec le dépôt d'origine (corrections appliquées)

Les écarts listés dans la section 6 du guide PDF ont été corrigés :

- **Script `typecheck`** ajouté (`tsc --noEmit`).
- **Zustand déclaré** explicitement dans `package.json` (il n'était qu'une dépendance transitive).
- **Logo** : le fichier `moscot-logo.png` est renommé `mascot-logo.png`, l'export reste `images.mascotLogo`.
- **`/api/agent-session` est authentifié** : session Clerk obligatoire et l'appelant doit être propriétaire du `callId`
  (`lesson-<lessonId>-<userId>`), en POST comme en DELETE.
- **`/api/stream-token`** utilise la validation officielle `verifyToken` de `@clerk/backend` (signature, expiration,
  émetteur, `authorizedParties` optionnel via `CLERK_AUTHORIZED_PARTIES`) au lieu d'une vérification JWT manuelle.
- **`web.output = "server"`** pour que les routes API soient réellement incluses à l'export.
- **URL des API configurable** (`EXPO_PUBLIC_API_URL`, `lib/api.ts`) pour les téléphones et la production.
- **Type d'appel unique** `default` (constante `CALL_TYPE` côté app/API, même valeur côté Python).
- **Progression réelle** : XP, série et leçons terminées démarrent à 0 (plus de 15 XP / 12 jours de démonstration).
- **Contexte de Sally** : tout le contexte utile (vocabulaire, phrases, objectifs) est dans `system_prompt`,
  le seul champ réellement lu par Python.
- **Sous-titres sans doublons** : une seule source (événements de l'agent) avec mise à jour partielle puis finale.
- **SDK Python figé** à `vision-agents==0.6.0` : les versions ≥ 0.6.2 ont supprimé les événements de transcription
  utilisés pour les sous-titres.
- Pas de faux indicateurs « Excellent / Great / Good » : l'écran leçon affiche les objectifs et phrases réelles.

### À faire avant une mise en production
- Héberger les routes API (EAS Hosting ou autre serveur Node) et le service Python **non exposé publiquement**.
- Renseigner `CLERK_AUTHORIZED_PARTIES` et passer Clerk / Stream en instances de production.
- Vérifier les droits des illustrations (le dépôt d'origine n'a pas de licence).

---

## 4. Checklist de validation

- [ ] **Environnement** : Node, npm, Git, Android SDK et Python ≥ 3.12 détectés.
- [ ] **Installation** : `npm ci` et `uv sync` terminent sans erreur.
- [ ] **Qualité** : `npm run lint` et `npm run typecheck` passent.
- [ ] **UI** : maquettes, polices et images apparaissent ; aucun débordement au clavier.
- [ ] **Clerk** : code invalide refusé ; session conservée ; déconnexion effective.
- [ ] **Langue** : choix conservé après relancement ; pas de redirection incorrecte pendant l'hydratation.
- [ ] **Leçons** : langue et id de route corrects ; id inconnu traité.
- [ ] **API** : token refusé sans session (401) ; routes joignables depuis Android.
- [ ] **Stream** : appel rejoint, micro activable, permission micro demandée.
- [ ] **Agent** : service démarré, session créée, voix audible, contexte de la bonne leçon.
- [ ] **Dialogue** : tours courts, Sally attend l'élève, l'interruption fonctionne.
- [ ] **Sous-titres** : deux locuteurs distincts, texte partiel puis final sans duplication.
- [ ] **Nettoyage** : quitter l'écran coupe l'appel, la session de l'agent et les abonnements.
- [ ] **PostHog** : bon projet, utilisateur identifié, événements sans doublons.
- [ ] **Production** : aucun secret dans le bundle ; autorisations API et hébergement revus.

## 5. Diagnostiquer dans cet ordre

1. Compilation native → 2. Variables `.env` → 3. Authentification Clerk → 4. Réponse de `/api/stream-token` →
5. Connexion à l'appel Stream → 6. `/api/agent-session` → 7. Service Python et OpenAI → 8. Micro, son, transcription.
Ne mélange pas les erreurs de ces couches.
