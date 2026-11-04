# Holy Moly! for Android

A small Android app around the same single-file game. It works offline, and it updates itself from GitHub, but only with builds signed by the project's update key. Setup, building and installing are explained step by step in [docs/ANDROID.md](../docs/ANDROID.md).

## Files

| File | What it does |
|---|---|
| `AndroidManifest.xml` | App id `app.holymoly`, name "Holy Moly!", portrait, one permission (INTERNET, used only by the updater) |
| `src/app/holymoly/MainActivity.java` | Full-screen WebView that serves the game at a fixed address with a strict Content-Security-Policy |
| `src/app/holymoly/GameStore.java` | Picks which copy of the game to serve: the one in the APK or a newer verified download |
| `src/app/holymoly/UpdateCheck.java` | Checks the update signature (ECDSA P-256) and the manifest fields |
| `src/app/holymoly/Updater.java` | Downloads newer builds from the `gh-pages` branch in the background |
| `res/` | Launcher icons, made by `node tools/make_icon.js` from the game's own art |
| `build.sh` | Builds the APK without Gradle: aapt2, javac, d8, zipalign, apksigner |

## Saves

The game saves to the page's localStorage under the key `holymoly1`, and writes it straight away on every change. The app serves the page from one fixed address, `https://appassets.androidplatform.net/index.html`, whether it is the copy inside the APK or a downloaded update, so the save always belongs to the same address and survives game updates and APK updates. It is deleted only when the app is uninstalled or its storage is cleared. The page has no JavaScript bridge into Android, because saving needs none.

## How updates work, and why they are safe

1. The APK contains a full copy of the game, so it plays with no connection from the first launch.
2. When it's online (at most every 3 hours), the app downloads `update/manifest.json` and `update/manifest.sig` from the `gh-pages` branch of ML-Chen/holy-moly. The manifest names the game file, its version, size and SHA-256.
3. The app checks the signature against the public key compiled into the APK. It skips the update unless the signature is valid, the manifest is for this app, and the version is newer than what's installed.
4. Only then does it download `update/index.html`, and installs it only if its size and SHA-256 match the signed manifest. A downloaded build is checked again on every launch. The new build loads the next time the app starts.

The private key that makes those signatures exists only as the GitHub Actions secret `HOLYMOLY_UPDATE_KEY`. `.github/workflows/publish.yml` uses it to sign each push to `main`. `UpdateCheck.java` contains only a placeholder, `@@UPDATE_PUBKEY_B64@@`; `build.sh` derives the public key from the same secret (`openssl pkey -pubout -outform DER | base64 -w0`) and writes it into a temporary copy of the sources, and it refuses to build if the secret is missing, is not a P-256 key, or the placeholder survives. So the APK and the signatures always use the same key, and no key is ever committed.

GitHub never gives secrets to workflows from forks or pull requests, and branches other than `main` don't trigger publishing. So pushing a branch, opening a pull request, forking the repository, or tampering with a download cannot get code onto a phone: the signature check fails and the app keeps what it has.

The page is locked down too: no bridge into Android, no file access, and a Content-Security-Policy with no outside hosts at all (`connect-src 'none'`). The app also refuses every request that isn't for the game page itself. Links open in the phone's browser.

## Build

The APK is normally built by `.github/workflows/android.yml` (see docs/ANDROID.md). By hand, with the Android SDK installed:

```
python3 src/build.py dist/holymoly.html
export ANDROID_HOME=<sdk>   # or ANDROID_BUILD_TOOLS=<sdk>/build-tools/<ver> ANDROID_PLATFORM=<sdk>/platforms/android-<n>
export HOLYMOLY_UPDATE_KEY="$(cat holymoly_update_key.pem)"
export ANDROID_KEYSTORE=holymoly-release.jks ANDROID_KEYSTORE_PASSWORD=<password>
android/build.sh dist/holymoly.html dist/holymoly.apk
```

Every future APK must be signed with the same release keystore (key alias `holymoly`), or Android refuses to install it over the old one.

Tests: `node tools/test_app_csp.js dist/holymoly.html [shots-dir]` loads the game under the app's exact security policy and address, and checks that the title draws, PLAY opens the stage picker, a microgame runs, the save survives a reload, and nothing touches the network.
