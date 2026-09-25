#!/usr/bin/env bash
# Rendert "Ereignishorizont" komplett neu: Soundfonts laden, Stems rendern, mischen, mastern.
set -euo pipefail
cd "$(dirname "$0")"
command -v fluidsynth >/dev/null || { echo "Bitte fluidsynth installieren (z.B. apt install fluidsynth ffmpeg)"; exit 1; }
pip install numpy scipy soundfile mido pedalboard pyloudnorm matplotlib
mkdir -p soundfonts
BASE=https://ftp.osuosl.org/pub/musescore/soundfont
[ -f soundfonts/MuseScore_General.sf2 ] || curl -L -o soundfonts/MuseScore_General.sf2 "$BASE/MuseScore_General/MuseScore_General.sf2"
if [ ! -f soundfonts/Sonatina_Symphonic_Orchestra.sf2 ]; then
  curl -L -o soundfonts/sso.zip "$BASE/Sonatina_Symphonic_Orchestra_SF2.zip"
  unzip -o -q soundfonts/sso.zip -d soundfonts && rm soundfonts/sso.zip
fi
python3 mix.py build/out
ffmpeg -y -loglevel error -i build/out/ereignishorizont.wav -codec:a libmp3lame -b:a 320k build/out/ereignishorizont.mp3
python3 analyze.py build/out/ereignishorizont.wav build/out/analyse.png
echo "Fertig: build/out/ereignishorizont.wav / .mp3"
