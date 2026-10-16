"""Check APK/AAB integrity and ensure session server secrets did not ship."""
import os
import sys
import zipfile
from pathlib import Path

names = ("CLERK_SECRET_KEY", "STREAM_API_SECRET", "OPENAI_API_KEY")
secrets = [os.environ.get(name, "").encode() for name in names]
if not all(len(value) >= 20 for value in secrets):
    raise SystemExit("FAIL: all three server secrets must be supplied in the process environment")
overlap = max(map(len, secrets)) - 1
for argument in sys.argv[1:]:
    artifact = Path(argument)
    with zipfile.ZipFile(artifact) as archive:
        assert archive.testzip() is None, "Archive integrity failed"
        bundle = "assets/index.android.bundle" if artifact.suffix == ".apk" else "base/assets/index.android.bundle"
        assert bundle in archive.namelist(), "Missing JavaScript bundle"
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            with archive.open(entry) as stream:
                previous = b""
                while block := stream.read(1024 * 1024):
                    combined = previous + block
                    if any(secret in combined for secret in secrets):
                        raise SystemExit("FAIL: server secret detected in an Android artifact")
                    previous = combined[-overlap:]
    print(f"PASS ZIP integrity, bundled JavaScript and no session server secrets: {artifact.name}")
