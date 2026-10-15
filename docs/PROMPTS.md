# Prompts de construction (français)

Les 18 prompts reformulés du guide « Créer l'application Lingua », adaptés à LearnWithSally.
Routine pour chaque étape : lire les fichiers et la maquette indiqués → envoyer **un seul** prompt à l'assistant
(avec `AGENTS.md` en contexte) → vérifier sur Android → `npm run lint` + `npm run typecheck` → commit.

Les maquettes sont dans [`docs/mockups/`](mockups).

---

### Prompt préparatoire — AGENTS.md
> Examine ce projet Expo et crée un AGENTS.md adapté à sa stack réelle. L'application enseigne les langues via des
> leçons locales et une professeure vocale. Utilise TypeScript, Expo Router, NativeWind, Zustand/AsyncStorage, Clerk,
> Stream, PostHog et un service Python Vision Agents. Garde les écrans simples, les imports d'images centralisés et les
> secrets côté serveur. Documente les versions, les dossiers et les commandes réellement disponibles. Construis une
> seule fonctionnalité par demande, puis explique sa validation.

### 01 — NativeWind · maquette : aucune
> Lis AGENTS.md et vérifie la version NativeWind du projet. Configure les fichiers nécessaires avec la documentation
> correspondant à cette version : CSS global, Metro, Babel si nécessaire, PostCSS et types TypeScript. Ne copie pas une
> configuration NativeWind v4 dans ce projet v5. Crée une vérification visuelle minimale et indique les commandes exécutées.

### 02 — Thème et design system · maquette : `01-design-system.png`
> Lis AGENTS.md. À partir de la maquette du design system, définis les tokens de thème et les utilitaires NativeWind dans
> global.css. Charge les polices Poppins du dossier assets/fonts. Respecte les couleurs, la hiérarchie typographique et
> les espacements. Prévois des styles réutilisables et limite les styles inline aux cas natifs ou dynamiques.

### 03 — Onboarding · maquette : `02-onboarding-screen.png`
> Lis AGENTS.md et réalise l'onboarding à partir de la maquette jointe. Utilise les images locales via
> constants/images.ts. Affiche le logo de la mascotte et le nom « learn with sally », sans les points de pagination.
> Ajoute une navigation pour ouvrir l'onboarding depuis la racine. Vérifie les marges et les petites tailles d'écran.

### 04 — Interface d'authentification · maquette : `03-auth-screen.png`
> Lis AGENTS.md. Crée les interfaces d'inscription et de connexion depuis la maquette, avec email et boutons sociaux.
> Prépare une modale de vérification à six chiffres, lisible au-dessus du clavier. Relie le bouton de l'onboarding à
> l'inscription. Si un flux simulé est nécessaire pour vérifier l'UI, identifie-le clairement ; aucune saisie locale de
> code ne doit constituer une authentification réelle.

### 05 — Clerk réel
> Lis AGENTS.md et inspecte les écrans d'authentification. Remplace les comportements simulés par @clerk/expo, suivant la
> documentation compatible. Gère inscription, connexion, vérification par code et SSO si les providers sont activés.
> Préserve l'UI. N'ouvre l'accueil qu'après validation réelle de la session ; un utilisateur non authentifié doit
> accéder à l'onboarding. Gère les codes invalides et les erreurs réseau.

### 06 — Contenus pédagogiques
> Lis AGENTS.md. Crée types/learning.ts et les données languages.ts, units.ts et lessons.ts. Modélise les langues, unités,
> leçons, objectifs, vocabulaire et phrases. Prépare aussi un contexte pédagogique pour la professeure vocale. Ajoute un
> jeu de données débutant simple et extensible. Les identifiants et relations doivent être cohérents et typés.

### 07 — Sélection de langue · maquette : `04-language-selection-screen.png`
> Lis AGENTS.md. Crée l'écran de choix de langue d'après la maquette en utilisant data/languages.ts. Affiche l'image earth
> via les imports centralisés et réutilise les utilitaires du thème. Prévois une sélection claire et un bouton de
> confirmation à la place de « See all languages ». Ajoute une navigation permettant de vérifier cet écran depuis la racine.

### 08 — Zustand et persistance
> Lis AGENTS.md. Persiste le choix de langue avec Zustand et @react-native-async-storage/async-storage. Une session Clerk
> valide sans langue choisie doit ouvrir language-select ; une session avec langue choisie doit ouvrir l'accueil.
> Attends l'hydratation pour éviter un flash de navigation. Ajoute un bouton de réinitialisation uniquement en
> développement, puis teste un redémarrage.

### 09 — Navigation par cinq onglets · maquette : `05-home-and-tab-navigation.png`
> Lis AGENTS.md. Implémente uniquement la navigation basse de la maquette avec cinq routes : Home, Learn, AI Teacher, Chat
> et Profile. Crée une TabBar personnalisée ; l'onglet actif apparaît dans un cercle coloré avec son icône, les autres
> conservent icône et texte. Anime le déplacement de l'indicateur. Ne construis pas encore l'accueil complet.

### 10 — Accueil · maquette : `05-home-and-tab-navigation.png`
> Lis AGENTS.md. Réalise l'accueil de la maquette avec le profil Clerk et la langue persistée. Utilise les contenus data/*
> pour la leçon courante et le programme affiché. Branche la progression locale sur les stores. Utilise les images
> locales ; ne charge une image temporaire distante que si elle manque et identifie-la. Les cartes et boutons doivent
> mener aux routes correspondantes.

### Complément A — PostHog initial
> Inspecte la version de posthog-react-native installée. Initialise une seule instance dans lib/posthog.ts et un Provider
> dans le layout. Lis la configuration fournie par app.config.js, traite son absence sans bloquer l'application et vérifie
> un événement de test dans le bon projet. Prépare l'identification Clerk sans collecter le contenu des échanges vocaux.

### 11 — Liste des leçons · maquette : `06-lesson-screen.png`
> Lis AGENTS.md. Crée l'écran Learn à partir de la maquette et des contenus typés. Filtre les unités et leçons selon la
> langue choisie et affiche leur statut local. Permets l'ouverture de toutes les leçons sans verrouillage. Si le jeu
> d'une langue est trop petit pour vérifier l'écran, enrichis-le de façon cohérente. Utilise les images locales et
> conserve une liste fluide.

### 12 — Interface de leçon audio · maquette : `07-audio-lesson-screen.png`
> Lis AGENTS.md. Implémente l'écran de leçon audio à partir de la maquette. Utilise l'id de route pour lire la leçon et
> son contexte pédagogique. Prépare le microphone, les sous-titres, la fin d'appel et les états de session. Utilise les
> assets centralisés. Ne connecte pas de caméra et ne présente pas le portrait comme une vidéo en direct.

### Complément B — Environnement natif
> Vérifie la configuration Android de ce dépôt : SDK, JDK, appareil, plugins Stream/WebRTC et permissions. Compile une
> version native avec Expo. Distingue un problème de compilation d'un problème de token ou d'agent. Donne les erreurs
> exactes et n'indique le parcours vocal comme validé qu'après un appel réel.

### 13 — Stream : appel audio
> Lis AGENTS.md et les docs du SDK Stream installé. Branche la leçon sur un appel audio seul. Obtiens le token via une
> route serveur authentifiée par Clerk ; ne livre aucun secret Stream au client. Utilise l'utilisateur et la leçon pour
> identifier la session. Gère connexion, appel rejoint, erreur, mute et arrêt. Nettoie le client et l'appel au départ de
> l'écran.

### 14 — Vision Agents : service Python
> Lis AGENTS.md et vérifie les signatures du SDK Vision Agents installé. Prépare un service dans vision-agent/ avec
> Python ≥ 3.12, Stream Edge et OpenAI Realtime. Charge les secrets depuis la configuration serveur. La professeure
> utilise principalement l'anglais pour enseigner la langue choisie. Vérifie le démarrage de serve et les méthodes du
> cycle de vie avant de connecter l'UI.

### 15 — Connecter la professeure à l'UI
> Lis AGENTS.md. Relie la leçon à Vision Agents via une route serveur de session. La professeure doit rejoindre le même
> callId et callType que l'utilisateur. Transmets le contexte pédagogique dans les données custom de l'appel et fais-le
> lire par Python. Vérifie les permissions de publication audio. Affiche idle, connecting, connected et failed. Arrête la
> session et l'appel lors de la sortie.

### 16 — Améliorer la professeure
> Lis AGENTS.md. Améliore seulement les instructions initiales et les contextes par leçon. La professeure enseigne un mot
> ou une phrase à la fois, donne une traduction courte et demande une répétition. Elle s'arrête pour écouter et ne simule
> jamais la réponse de l'élève. Elle corrige ce qu'elle a réellement entendu, avec une ou deux phrases, en restant dans la
> langue et l'objectif de la leçon.

### 17 — Sous-titres en direct
> Lis AGENTS.md et les docs Stream/Vision Agents. Affiche les transcriptions en direct de l'utilisateur et de la
> professeure sur l'écran audio. Distingue les locuteurs, les mises à jour partielles et les phrases finales. Évite les
> doublons quand plusieurs sources de captions sont disponibles. Permets de masquer les sous-titres et nettoie les
> abonnements à la sortie.

### 18 — PostHog : événements métier
> Lis AGENTS.md. Réutilise l'instance PostHog existante. Identifie l'utilisateur avec son id Clerk après authentification
> et associe sa langue préférée. Ajoute language_selected, lesson_started et lesson_abandoned aux moments réels du
> parcours, avec leurs propriétés utiles. Mesure la durée via une référence temporelle. Évite les doublons au démontage et
> n'envoie ni clés, ni audio, ni contenu privé.

---

### Prompt de vérification du contexte de Sally
> Pour chaque leçon de data/lessons.ts, vérifie la cohérence entre langue, titre, objectifs, vocabulaire, phrases et
> instructions de la professeure. Signale les incohérences sans modifier toute la base. Vérifie ensuite que Python reçoit
> et utilise réellement le contexte nécessaire. Fais un essai avec deux langues différentes et confirme que l'agent ne
> conserve pas le contexte de la session précédente.
