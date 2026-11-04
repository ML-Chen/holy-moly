#!/usr/bin/env bash
# Assembles the GitHub Pages site for a game build, including the SIGNED update the Android app downloads.
#
#   tools/publish_pages.sh dist/holymoly.html OUTDIR
#
# OUTDIR gets: index.html (the game), .nojekyll, and, when the signing key is available, update/index.html
# (same game), update/manifest.json (app, version, size, SHA-256) and update/manifest.sig (ECDSA P-256 signature
# over manifest.json, base64 DER).
#
# The signing key comes from the HOLYMOLY_UPDATE_KEY environment variable (a PEM private key). In GitHub it is an
# Actions secret, so only this repository's own workflow on the main branch can sign. Forks and pull requests never
# see it. Without the key, the update/ folder is left out: the web game is still published, and phones keep the
# build they already have (they find no update and try again later).
set -euo pipefail
GAME="$1"; OUT="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(git -C "$ROOT" log -1 --format=%ct -- src 2>/dev/null || true)"
[ -n "$VERSION" ] || { echo "could not read the commit time of src/ (is this a git checkout with history?)" >&2; exit 1; }
mkdir -p "$OUT"
cp "$GAME" "$OUT/index.html"
touch "$OUT/.nojekyll"
if [ -n "${HOLYMOLY_UPDATE_KEY:-}" ]; then
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  printf '%s\n' "$HOLYMOLY_UPDATE_KEY" > "$TMP/key.pem"
  # The app compiles in the public half of this same key (android/build.sh derives it), so check it is P-256.
  PUB_B64="$(openssl pkey -in "$TMP/key.pem" -pubout -outform DER | base64 -w0)" \
    || { echo "HOLYMOLY_UPDATE_KEY is not a readable PEM private key" >&2; exit 1; }
  case "$PUB_B64" in
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE*) ;;
    *) echo "HOLYMOLY_UPDATE_KEY is not an ECDSA P-256 (prime256v1) key; see docs/ANDROID.md" >&2; exit 1 ;;
  esac
  mkdir -p "$OUT/update"
  cp "$GAME" "$OUT/update/index.html"
  python3 "$ROOT/tools/update_manifest.py" "$GAME" --version "$VERSION" > "$OUT/update/manifest.json"
  openssl dgst -sha256 -sign "$TMP/key.pem" "$OUT/update/manifest.json" | base64 -w0 > "$OUT/update/manifest.sig"
  # Check the signature the same way the app will, so a broken signing step fails here and not on phones.
  openssl pkey -in "$TMP/key.pem" -pubout -out "$TMP/pub.pem"
  base64 -d "$OUT/update/manifest.sig" > "$TMP/sig.der"
  openssl dgst -sha256 -verify "$TMP/pub.pem" -signature "$TMP/sig.der" "$OUT/update/manifest.json" >/dev/null
  echo "signed update version $VERSION (public key ${PUB_B64:36:12}...)"
else
  echo "HOLYMOLY_UPDATE_KEY not set: published the web game only, with no update/ folder for the Android app" >&2
fi
