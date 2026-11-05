#!/bin/sh
set -e
LIB="/c/Users/NEXT NOUT/lemo-opuscar"
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs  "$HERE" --size 1080x1920 --fps 24 --workers 1 --out "$HERE/out/video.mp4"
# The library's mixer wants its voice and music tiers; this film already has a
# measured narration track, so the mix is just that against a quiet bed.
ffmpeg -y -v error -i "$HERE/out/video.mp4" -i "$HERE/audio/voice.mp3" -i "$HERE/audio/bed.wav" \
  -filter_complex "[1:a]volume=1.0[v];[2:a]volume=0.5,atrim=0:40[b];[v][b]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$HERE/out/photo-picto.mp4"
echo "$HERE/out/photo-picto.mp4"
