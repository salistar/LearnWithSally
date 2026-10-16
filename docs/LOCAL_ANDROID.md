# LearnWithSally: local Windows and Android

## Public configuration

Copy `.env.example` to `.env` and set the Clerk **publishable** key for your development instance.
For USB testing use `EXPO_PUBLIC_API_URL=http://127.0.0.1:8097`.
Only list social providers actually enabled in Clerk using `EXPO_PUBLIC_SOCIAL_PROVIDERS` (default: `google`).
Never ship the Clerk secret, Stream secret or OpenAI key in Expo config or `EXPO_PUBLIC_*`.

## Keep secrets in memory

```powershell
npm ci
cd vision-agent
python -m uv sync --locked --python 3.12
cd ..
npm run local:session
```

Open `http://127.0.0.1:8791/`, enter the four server values in the masked fields and select **Démarrer les services**.
The launcher passes them only to child-process environments. It never saves them to disk. Closing the session loses those values.
Metro listens on `http://127.0.0.1:8097`; the Python teacher listens on `http://127.0.0.1:8000`.
The Python `/ready` endpoint checks startup; `/openapi.json` documents the real session lifecycle.

Select **Vérifier les services** once both services are running. This runs:

- real credential checks against Clerk, Stream Video and OpenAI's model list;
- configuration of the development native callback `learnwithsally://sso-callback`;
- a temporary Clerk test user and session, authenticated Stream-token request, foreign-call denial, and a short real OpenAI chat request;
- cleanup of the temporary user/session in a `finally` block.

The chat smoke test consumes a small API request. It does not prove an end-to-end spoken conversation.
PostHog is optional and stays disabled until configured.
The web preview supports onboarding, authentication, lessons and chat. Live WebRTC lessons run in the native Android app; the browser lesson page offers vocabulary review.

## Build installable APK and AAB for local testing

Prerequisites: Java 17, Android SDK 36, NDK 27.1.12297006, Node.js 22.18+ or 24, and `ANDROID_HOME`.

```powershell
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:8097'
powershell -ExecutionPolicy RemoteSigned -File ./scripts/build-android-local.ps1 -Architectures arm64-v8a
```

The script regenerates Android, uses a short temporary directory for Java/CMake, retains canonical source roots and runs `:app:assembleRelease :app:bundleRelease`.
Default architectures are ARM64 and ARMv7. An ARM64-only build runs on compatible ARM64 devices.
Artifacts go to `dist-android` by default; choose a destination with `-OutputDirectory`.

**Signing:** Expo's generated release build uses its development/debug certificate. These artifacts are for local/internal testing. A Google Play release needs your own upload keystore, a production Clerk instance and a deployed HTTPS API. No production signing key is created or saved by this workflow.
The local network configuration permits cleartext only to the explicitly configured loopback host; other hosts still require HTTPS.

```powershell
& "$env:ANDROID_HOME/platform-tools/adb.exe" reverse tcp:8097 tcp:8097
& "$env:ANDROID_HOME/platform-tools/adb.exe" install -r ./dist-android/LearnWithSally-local.apk
& "$env:ANDROID_HOME/platform-tools/adb.exe" shell am start -n com.salistar.learnwithsally/.MainActivity
```

The USB reverse mapping and running local server are required for the local APK's chat and voice services.

## Checks

```powershell
npm run lint
npm run typecheck
npm run test:dates
```

Dates follow the learner's local calendar. Python dependencies pin `getstream==3.3.4` with Vision Agents `0.6.0`; `3.5.0` broke event registration during real service startup.
EAS preview/production profiles explicitly produce APK/AAB and no longer assume an unverified hosting domain. Set `EXPO_PUBLIC_API_URL` in the corresponding EAS environment before cloud builds.
