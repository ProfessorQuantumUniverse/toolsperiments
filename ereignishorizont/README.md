# 🕳️ EREIGNISHORIZONT – Ein Epos in fünf Sätzen

Ein epischer Soundtrack, der vom *Kornfeld* über das *Andockmanöver* bis zur *Zeit* reist, im Geist von Hans Zimmer (*Interstellar*, *Inception*) und Scott Buckley.
**Alle Themen sind Originalkompositionen.** Es wird nichts zitiert, der Stil ist eine Hommage.

▶️ **Anhören:** [`ereignishorizont.mp3`](./ereignishorizont.mp3) (6:45, 320 kbps) oder im Player [`index.html`](./index.html) mit Kapiteln und Visualisierung.

## Aufbau

| Zeit | Satz | Was passiert |
|---|---|---|
| 0:00 | **I · Staub** | Eine Uhr tickt im Nichts. Das 16'-Orgelpedal legt das Fundament, ein gedämpftes Klavier stellt das Hauptthema vor, dann singen die Celli. |
| 0:51 | **II · Kornfeld** | Die Verfolgungsjagd. Orgel-Ostinato in Sechzehntel-**Dreiergruppen** gegen **Zweiergruppen** der linken Hand, dazu wandernde Akzente. Spiccato-Streicher, Taikos im 3+3+2-Rhythmus, die Hörner tragen das Thema augmentiert. |
| 2:08 | **III · Andocken** | Unerbittliches Achtel-Ostinato über einem chromatisch steigenden Bass (D, B♭, C, D, E♭, E, F, G, A). Die Uhr geht in Sechzehntel über, ein Shepard-Ton steigt endlos, dazu Braams und Chor. Höhepunkt in d-Moll mit Trompetenfanfare, dann folgt bei 3:25 der **harte Schnitt**. |
| 3:29 | **IV · Zeit** | Ein einziger 8-Takt-Zyklus, fünfmal, jedes Mal mit neuen Schichten: Klavier und Herzschlag, Streicher, dann Hörner mit Thema und Geigen mit dem Zeit-Motiv im Kontrapunkt, das Tutti in Moll. Bei **5:32 wendet sich alles nach D-Dur**. |
| 6:03 | **V · Tesserakt** | Coda. Das Klavier erinnert sich an das Thema in Dur, die Uhr kehrt zurück, läuft aus und bleibt stehen. |

## Wie es gemacht ist

Jede Note ist Python-Code (`source/composition.py`). Die Produktion läuft komplett im Rechner:

- **Additive Pfeifenorgel** (`engine.py`): Register von Contra 32' über Bourdon 16', Prinzipal 8', Oktave 4' und Quinte 2⅔' bis zur Mixtur mit Repetition und Trompete 8'. Dazu kommen Pfeifen-Chiff, langsame Winddrift, leicht verstimmte Register und die Aufstellung der Pfeifen auf C- und Cis-Seite im Stereobild.
- **Synthese**: Uhr (auf E und D gestimmt, passend zur Tonart), Impacts, Braams mit sich öffnendem Filter, Riser mit Shepard-Risset-Glissando, Whooshes, Sub-Bass, Supersaw-Pads, Herzschlag und Weltraum-Atmosphäre.
- **Orchester**: *Sonatina Symphonic Orchestra* (CC Sampling+) und die *MuseScore-General*-Soundfont (MIT), über FluidSynth gerendert. Das ergibt 48 Einzelspuren mit Expression-Automation (CC11), Humanisierung und Voice-Leading-Algorithmus für die Akkorde.
- **Mix**: automatisches Gain-Staging pro Stem, orchestrale Sitzordnung im Stereobild, zwei berechnete Hallräume (Kathedrale RT60 6,5 s, Saal 2,6 s, frequenzabhängig) und eine Makro-Dynamikkurve über das ganze Stück.
- **Mastering**: Kompressor, sanfte Sättigung und Limiter auf −16 LUFS integriert, True-Peak unter −1 dBTP.
- **Qualitätskontrolle ohne Ohren**: Lautheitsverlauf, Spektrogramm und Bandenergie pro Satz (`analyse.png`), eine Chroma-Analyse, die jeden Takt gegen die geplante Harmonie prüft, und ein Klick-Detektor.

![Analyse](./analyse.png)

## Selbst rendern

```bash
cd source
./render.sh          # lädt die Soundfonts (~630 MB), rendert ~5 min, schreibt build/out/
```

Benötigt Python 3.10+, `fluidsynth` und `ffmpeg`.
