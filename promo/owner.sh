#!/usr/bin/env bash
# Upscales the owner's photos 2x (lanczos + gentle unsharp) for the UHD film.
#   Put originals in promo/captures/owner/src/<name>.jpg, then: bash promo/owner.sh
# The photos arrived WhatsApp-compressed (~1 MP); this keeps edges crisp at 4K rather
# than leaving the browser to upscale them bilinearly. Originals from the camera need none of it.
set -euo pipefail
cd "$(dirname "$0")/captures/owner"
for f in src/*.jpg; do
  out="$(basename "$f")"
  ffmpeg -v error -y -i "$f" -vf "scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.6:5:5:0.0" -q:v 2 "$out"
  echo "  $out"
done
