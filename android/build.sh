#!/usr/bin/env bash
# Builds the Holy Moly! Android app (an APK) from the current game build, without Gradle.
# Normally this runs in GitHub Actions (.github/workflows/android.yml); see docs/ANDROID.md.
#
#   android/build.sh [game.html] [out.apk]
#
# Needs: a JDK 17+ (javac), openssl, python3, zip, and the Android SDK build-tools and a platform.
#   ANDROID_BUILD_TOOLS  folder with aapt2, d8, zipalign, apksigner (default: newest in $ANDROID_HOME/build-tools)
#   ANDROID_PLATFORM     folder with android.jar                     (default: newest in $ANDROID_HOME/platforms)
# Update key (the app only installs game updates signed by it):
#   HOLYMOLY_UPDATE_KEY  the PEM private key. Only its PUBLIC half goes into the app: it is derived here and
#                        written into UpdateCheck.java in a temporary copy of the sources.
# Signing (the same keystore must sign every future version, or Android refuses to install it over the old one):
#   ANDROID_KEYSTORE, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS (default holymoly)
# The game file goes inside the APK, so the app works offline. Its version number is the commit time of src/,
# the same number the signed web updates use, so the app knows whether a downloaded update is newer.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
GAME="${1:-$ROOT/dist/holymoly.html}"
OUT="${2:-$ROOT/dist/holymoly.apk}"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
# Newest stable build-tools (e.g. 36.0.0, not 36.0.0-rc1) and newest numbered platform (android-36, not android-36-ext19).
BT="${ANDROID_BUILD_TOOLS:-$(ls -d "$SDK"/build-tools/* 2>/dev/null | grep -E '/[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1 || true)}"
PLATFORM="${ANDROID_PLATFORM:-$(ls -d "$SDK"/platforms/* 2>/dev/null | grep -E '/android-[0-9]+$' | sort -V | tail -1 || true)}"
ANDROID_JAR="$PLATFORM/android.jar"
ALIAS="${ANDROID_KEY_ALIAS:-holymoly}"
for f in "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" "$ANDROID_JAR" "$GAME"; do
  [ -e "$f" ] || { echo "missing: $f (set ANDROID_HOME, or ANDROID_BUILD_TOOLS and ANDROID_PLATFORM)" >&2; exit 1; }
done
: "${HOLYMOLY_UPDATE_KEY:?set HOLYMOLY_UPDATE_KEY to the update signing key (PEM private key); see docs/ANDROID.md}"
: "${ANDROID_KEYSTORE:?set ANDROID_KEYSTORE to the release keystore}"
: "${ANDROID_KEYSTORE_PASSWORD:?set ANDROID_KEYSTORE_PASSWORD}"
echo "build-tools: $BT"
echo "platform:    $PLATFORM"

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src 2>/dev/null || true)"; VERSION="${VERSION:-$(date +%s)}"
# The app's own version (for Android's "is this an update?" check) also moves when only the Android code changes.
APP_VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src android 2>/dev/null || true)"; APP_VERSION="${APP_VERSION:-$(date +%s)}"

# 1. The update public key, derived from the private key and written into a copy of the Java sources.
printf '%s\n' "$HOLYMOLY_UPDATE_KEY" > "$WORK/update_key.pem"
PUB_B64="$(openssl pkey -in "$WORK/update_key.pem" -pubout -outform DER | base64 -w0)" \
  || { echo "HOLYMOLY_UPDATE_KEY is not a readable PEM private key" >&2; exit 1; }
rm -f "$WORK/update_key.pem"
case "$PUB_B64" in
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE*) ;; # SubjectPublicKeyInfo header of an EC prime256v1 key
  *) echo "HOLYMOLY_UPDATE_KEY is not an ECDSA P-256 (prime256v1) key; see docs/ANDROID.md" >&2; exit 1 ;;
esac
mkdir -p "$WORK/src"
cp -R "$HERE/src/." "$WORK/src/"
CHECK="$WORK/src/app/holymoly/UpdateCheck.java"
grep -q '@@UPDATE_PUBKEY_B64@@' "$CHECK" || { echo "placeholder @@UPDATE_PUBKEY_B64@@ not found in UpdateCheck.java" >&2; exit 1; }
sed -i "s|@@UPDATE_PUBKEY_B64@@|$PUB_B64|" "$CHECK"
if grep -rq '@@UPDATE_PUBKEY_B64@@' "$WORK/src"; then echo "the update key placeholder survived; refusing to build" >&2; exit 1; fi
echo "update key:  ${PUB_B64:36:12}... (public half, compiled into UpdateCheck)"

# 2. The game, as an asset, with a small manifest giving its version and hash.
mkdir -p "$WORK/assets/game"
cp "$GAME" "$WORK/assets/game/index.html"
python3 "$ROOT/tools/update_manifest.py" "$WORK/assets/game/index.html" --version "$VERSION" > "$WORK/assets/game/manifest.json"

# 3. Resources (the launcher icons) and the manifest, compiled with aapt2.
"$BT/aapt2" compile --dir "$HERE/res" -o "$WORK/res.zip"
"$BT/aapt2" link -o "$WORK/unsigned.apk" -I "$ANDROID_JAR" --manifest "$HERE/AndroidManifest.xml" \
  --version-code "$(( (APP_VERSION - 1700000000) / 60 ))" --version-name "$(date -u -d "@$APP_VERSION" +%Y.%m.%d.%H%M)" \
  -A "$WORK/assets" "$WORK/res.zip" --auto-add-overlay

# 4. Java -> class files -> Android bytecode (classes.dex).
mkdir -p "$WORK/classes"
javac -nowarn --release 11 -classpath "$ANDROID_JAR" -d "$WORK/classes" $(find "$WORK/src" -name '*.java')
"$BT/d8" --release --min-api 24 --lib "$ANDROID_JAR" --output "$WORK" $(find "$WORK/classes" -name '*.class')
(cd "$WORK" && zip -q -j unsigned.apk classes.dex)

# 5. Align and sign.
mkdir -p "$(dirname "$OUT")"
"$BT/zipalign" -f -p 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"
"$BT/apksigner" sign --ks "$ANDROID_KEYSTORE" --ks-key-alias "$ALIAS" \
  --ks-pass env:ANDROID_KEYSTORE_PASSWORD --key-pass env:ANDROID_KEYSTORE_PASSWORD \
  --out "$OUT" "$WORK/aligned.apk"
"$BT/apksigner" verify --print-certs "$OUT" | head -3
echo "built $OUT ($(du -h "$OUT" | cut -f1)), game version $VERSION"
