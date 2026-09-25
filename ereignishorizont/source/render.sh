#!/usr/bin/env bash
# Rendert ereignishorizont (V2) komplett neu: Soundfonts + Impulsantworten laden, Stems rendern, mischen, mastern.
set -euo pipefail
cd "$(dirname "$0")"
command -v fluidsynth >/dev/null || { echo "Bitte fluidsynth und ffmpeg installieren (z.B. apt install fluidsynth ffmpeg)"; exit 1; }
pip install numpy scipy soundfile mido pedalboard pyloudnorm matplotlib numba
mkdir -p soundfonts ir
BASE=https://ftp.osuosl.org/pub/musescore/soundfont
[ -f soundfonts/MuseScore_General.sf2 ] || curl -L -o soundfonts/MuseScore_General.sf2 "$BASE/MuseScore_General/MuseScore_General.sf2"
if [ ! -f soundfonts/Sonatina_Symphonic_Orchestra.sf2 ]; then
  curl -L -o soundfonts/sso.zip "$BASE/Sonatina_Symphonic_Orchestra_SF2.zip" && unzip -o -q soundfonts/sso.zip -d soundfonts && rm soundfonts/sso.zip
fi
# Aegean Symphonic Orchestra v2.5 (HED-Sounds, basiert auf Virtual Playing Orchestra 2)
if [ ! -f soundfonts/aegean/AegeanSymphonicOrchestra-v2_5-universal.sf2 ]; then
  curl -L -o soundfonts/aegean.zip "https://drive.usercontent.google.com/download?id=17z0U-463nsXEwadrWycBUmZKslugT_tN&export=download&confirm=t"
  unzip -o -q soundfonts/aegean.zip -d soundfonts/aegean && rm soundfonts/aegean.zip
fi
# EchoThief impulse responses (real concert-hall early reflections for the hybrid reverb)
if [ ! -d ir/EchoThiefImpulseResponseLibrary ]; then
  curl -L -o ir/et.zip "https://www.echothief.com/wp-content/uploads/2024/07/EchoThiefImpulseResponseLibrary.zip" && unzip -o -q ir/et.zip -d ir && rm ir/et.zip
fi
python3 mixer.py ereignishorizont_v2 ereignishorizont
ffmpeg -y -loglevel error -i build/out/ereignishorizont.wav -codec:a libmp3lame -b:a 320k build/out/ereignishorizont.mp3
python3 analyze2.py ereignishorizont_v2 build/out/ereignishorizont.wav build/out/analyse.png
echo "Fertig: build/out/ereignishorizont.wav / .mp3"
