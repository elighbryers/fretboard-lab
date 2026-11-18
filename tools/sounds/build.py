"""Build the small web sound sets in sounds/ from raw SFZ sample libraries.

    python3 tools/sounds/build.py [set-id ...]      # default: every set below

Raw libraries live outside the repo, in ~/sound-samples/<folder> (one folder per
download). Only CC0 or public-domain sets are listed here; each set's licence was
read in its own LICENSE / readme file. For each set this:
  1. flattens the .sfz mapping (tools/sounds/sfz.py),
  2. picks the regions that sound for a note (or drum piece) at a velocity, with the
     library's default controller settings (so multi-mic kits mix their mics as designed),
  3. mixes them to mono, trims the silence, fades the tail and normalises the whole set
     together (so soft layers stay softer and the kick stays louder than the hi-hat),
  4. encodes 96 kbps mono MP3 with lame, and writes set.json and LICENSE.txt.
Notes: one sample every 3 semitones across the instrument's range (each file is saved at
its own pitch, which set.json records; the player repitches). Drums: each kit piece.

Needs: macOS afconvert (decoding WAV/FLAC), lame (brew install lame), Python 3.9-3.12 (audioop).
"""
import audioop
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave

sys.path.insert(0, os.path.dirname(__file__))
import sfz  # noqa: E402
from pitch import midi_of_file, read_mono  # noqa: E402
from collections import Counter  # noqa: E402

RAW = os.path.expanduser('~/sound-samples')
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'sounds')
SR = 44100
CC0 = 'CC0 1.0 (public domain dedication)'

BASS = dict(instrument='bass', range=(23, 70), vels=[80, 118], maxlen=2.2)
PIANO = dict(instrument='piano', range=(21, 108), vels=[80], maxlen=3.0)
# Drum pieces (js/drumkit.js) -> (key, controller overrides, longest length in seconds).
# CC 4 is the hi-hat pedal: 0 closed, 127 open.
GM = {'kick': (36, {}, 0.8), 'rim': (37, {}, 0.4), 'snare': (38, {}, 0.8), 'hat': (42, {4: 0}, 0.4), 'phat': (44, {4: 0}, 0.4),
      'ohat': (46, {4: 127}, 1.3), 'crash': (49, {}, 2.4), 'ride': (51, {}, 1.8), 'bell': (53, {}, 1.6)}
DRUMS = dict(instrument='drums', vels=[85, 120])

SETS = {
    'growlybass': dict(BASS, folder='growlybass', sfz='growlybass_clean.sfz', name='Growlybass', about='Squier Jazz bass, both pickups, bright and round', source='Karoryfer Samples', licence=CC0),
    'swagbass': dict(BASS, folder='swagbass', sfz='swagbass_clean.sfz', name='Swagbass', about='Old flatwound strings: dull and warm', source='Karoryfer Samples', licence=CC0),
    'fashionbass': dict(BASS, folder='fashionbass', sfz='fashionbass_clean.sfz', name='Fashionbass', about='A Jazz bass in an odd body: classic and punchy', source='Karoryfer Samples', licence=CC0),
    'pastabass': dict(BASS, folder='pastabass', sfz='spaghetti.sfz', name='Pastabass', about='Squier Bass VI: six strings, a lighter tone', source='Karoryfer Samples', licence=CC0),
    'black-and-blue': dict(BASS, folder='black-and-blue-basses', sfz='Programs/05-darkblack_pluck.sfz', name='Black and Blue (5-string)', about='Five-string bass, plucked', source='Karoryfer Samples', licence=CC0),
    'upright-bass': dict(BASS, folder='vsco-2-ce', sfz='ContrabassPizz.sfz', name='Upright bass (pizzicato)', about='Solo double bass, plucked', source='Versilian Studios, VSCO 2 Community Edition', licence=CC0),
    'splendid': dict(PIANO, folder='splendid-grand-piano', sfz='Splendid Grand Piano.sfz', name='Splendid Grand', about='Steinway grand, four dynamics', source='AKAI (SFZ mapping by kinwie)', licence='Public domain'),
    'upright-piano': dict(PIANO, folder='vsco-2-ce', sfz='UprightPiano.sfz', name='Upright piano', about='Upright piano, three dynamics', source='Versilian Studios, VSCO 2 Community Edition', licence=CC0),
    'big-rusty': dict(DRUMS, folder='big-rusty-drums', sfz='Programs/02-basic.sfz', name='Big Rusty', about='Oversized 1980s Polish kit', source='Karoryfer Samples', licence=CC0,
                      pieces=dict(GM, tom1=(47, {}, 1.2), tom2=(45, {}, 1.3), tom3=(43, {}, 1.5))),
    'unruly': dict(DRUMS, folder='unruly-drums', sfz='Programs/03-kit-complete.sfz', name='Unruly', about='Every drum, even the kick, is a snare', source='Karoryfer Samples', licence=CC0,
                   pieces=dict(GM, tom1=(47, {}, 1.0), tom2=(45, {}, 1.1), tom3=(41, {}, 1.3))),
    'swirly': dict(DRUMS, folder='swirly-drums', sfz='Programs/Full_kit.sfz', name='Swirly', about='Punk and indie kit, played with brushes', source='Karoryfer Samples', licence=CC0,
                   pieces={**{k: v for k, v in GM.items() if k not in ('rim', 'bell')}, 'tom1': (48, {}, 1.0), 'tom2': (45, {}, 1.1), 'tom3': (41, {}, 1.3)}),
    'gogodze': dict(DRUMS, folder='gogodze-phu-vol-ii', sfz='Programs/Kit.sfz', name='Gogodze Phu', about='1970s-style kit: kick, snare, toms and hi-hat (synth cymbals)', source='Karoryfer Samples', licence=CC0,
                    pieces={**{k: v for k, v in GM.items() if k in ('kick', 'rim', 'snare', 'hat', 'phat', 'ohat')}, 'tom1': (45, {}, 1.0), 'tom2': (43, {}, 1.1), 'tom3': (41, {}, 1.3)}),
}


def cc_defaults(path):
    text = '\n'.join(sfz._read(path, {}))  # with #define names (set_cc$KICKVOL=100) resolved
    return {int(n): float(v) for n, v in re.findall(r'set_cc(\d+)=(-?[\d.]+)', text)}


def active(r, key, vel, cc):
    if r.get('trigger', 'attack') not in ('attack', 'first') or r['sample'].endswith('*silence') or '*' in os.path.basename(r['sample']):
        return False
    if not (r.get('lokey', 0) <= key <= r.get('hikey', 127)) or not (r.get('lovel', 1) <= vel <= r.get('hivel', 127)):
        return False
    if r.get('seq_position', 1) != 1 or not (float(r.get('lorand', 0)) <= 0 < float(r.get('hirand', 1))):
        return False
    if 'sw_last' in r and sfz.midi_of(r['sw_last']) != sfz.midi_of(r.get('sw_default', r['sw_last'])):
        return False
    for op, v in r.items():
        m = re.fullmatch(r'(lo|hi)cc(\d+)', op)
        if m:
            c = cc.get(int(m.group(2)), 0)
            if (m.group(1) == 'lo' and c < float(v)) or (m.group(1) == 'hi' and c > float(v)):
                return False
    return True


def gain(r, cc):
    g = 10 ** (float(r.get('volume', 0)) / 20) * float(r.get('amplitude', 100)) / 100
    for op, v in r.items():
        m = re.fullmatch(r'amplitude_(?:on)?cc(\d+)', op)
        if m:
            g *= float(v) / 100 * cc.get(int(m.group(1)), 0) / 127
    return g


_decoded = {}


def decode(path, seconds, offset=0):
    """Mono 32-bit PCM at 44.1 kHz, at most `seconds` long."""
    key = (path, seconds, offset)
    if key in _decoded:
        return _decoded[key]
    frames = read_mono(path, SR, seconds, offset)
    _decoded[key] = audioop.lin2lin(frames, 2, 4)
    return _decoded[key]


def render(regions, seconds):
    """Mix the regions' samples (32-bit mono) with their gains."""
    mix = b''
    for r, g in regions:
        if g <= 0:
            continue
        x = audioop.mul(decode(r['sample'], seconds, int(float(r.get('offset', 0)))), 4, g * 0.25)
        if len(x) > len(mix):
            mix += b'\0' * (len(x) - len(mix))
        elif len(x) < len(mix):
            x += b'\0' * (len(mix) - len(x))
        mix = audioop.add(mix, x, 4)
    return mix


WIN = 441 * 4  # 10 ms of 32-bit mono
STEP = 220 * 4  # 5 ms


def trim(x, maxlen):
    """Cut the silence before the onset and after the tail (or at maxlen), and fade out."""
    if not x:
        return x
    peak = audioop.max(x, 4) or 1
    wins = [audioop.max(x[i:i + WIN], 4) for i in range(0, len(x), WIN)]
    start = next((i for i, m in enumerate(wins) if m > peak * 0.02), 0)
    start = max(0, start - 1) * WIN
    # (WIN is a whole number of 4-byte frames, so start and end stay frame-aligned)
    end = max((i for i, m in enumerate(wins) if m > peak * 0.004), default=len(wins) - 1) + 1
    end = min(end * WIN, start + int(maxlen * SR) * 4, len(x))
    x = x[start:end]
    # fade the last 20% (at most 250 ms) in 5 ms steps
    x = x[:len(x) // 4 * 4]
    n = min(len(x) // 5, int(0.25 * SR) * 4) // STEP * STEP
    if n:
        head, tail = x[:-n], x[-n:]
        steps = n // STEP
        tail = b''.join(audioop.mul(tail[i * STEP:(i + 1) * STEP], 4, (1 - (i + 1) / steps) ** 2) for i in range(steps))
        x = head + tail
    return x


def encode(x, scale, path):
    pcm = audioop.lin2lin(audioop.mul(x, 4, scale), 4, 2)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'x.wav')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)
        subprocess.run(['lame', '--quiet', '-b', '96', '-m', 'm', '--noreplaygain', wav, path], check=True)


def licence_text(s):
    raw = os.path.join(RAW, s['folder'])
    for name in ('LICENSE', 'license', 'LICENSE.txt', 'License.txt'):
        if os.path.exists(os.path.join(raw, name)):
            return open(os.path.join(raw, name), encoding='utf-8', errors='replace').read()
    for name in ('README.md', 'readme.txt', 'Readme.txt'):
        if os.path.exists(os.path.join(raw, name)):
            return open(os.path.join(raw, name), encoding='utf-8', errors='replace').read()
    return ''


def octave_shift(regs, cc0, vel):
    """Many bass libraries are mapped an octave above the pitch they sound (bass is written an
    octave up). Measure a few mid-range samples and return the shift to their real pitch."""
    centres = sorted({r['pitch_keycenter'] for r in regs if r.get('pitch_keycenter') is not None and active(r, r['pitch_keycenter'], vel, cc0)})
    mid = centres[len(centres) // 3: len(centres) // 3 + 4] or centres[:4]
    votes = Counter()
    for k in mid:
        r = next(r for r in regs if r.get('pitch_keycenter') == k and active(r, k, vel, cc0))
        votes[round((midi_of_file(r['sample']) - k) / 12) * 12] += 1
    shift = votes.most_common(1)[0][0]
    print(f'  measured pitch: mapped notes sound {shift:+d} semitones ({dict(votes)})')
    return shift


def build(sid):
    s = SETS[sid]
    path = os.path.join(RAW, s['folder'], s['sfz'])
    regs, cc0 = sfz.regions(path), cc_defaults(path)
    out = os.path.join(OUT, s['instrument'], sid)
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(out)
    clips = []  # (name, entry, pcm32)
    if 'pieces' in s:
        for piece, (key, ccs, maxlen) in s['pieces'].items():
            for layer, vel in enumerate(s['vels']):
                cc = {**cc0, **ccs}
                rs = [(r, gain(r, cc)) for r in regs if active(r, key, vel, cc)]
                if not rs:
                    print(f'  {sid}: no {piece} at velocity {vel}')
                    continue
                clips.append((f'{piece}-{layer}.mp3', {'piece': piece, 'layer': layer}, trim(render(rs, maxlen + 0.3), maxlen)))
    else:
        lo, hi = s['range']
        shift = octave_shift(regs, cc0, s['vels'][0])
        done = set()
        for real in range(lo, hi + 1, 3):
            target = real - shift  # the key in the library's own mapping
            for layer, vel in enumerate(s['vels']):
                rs = [r for r in regs if active(r, target, vel, cc0)]
                if not rs:
                    continue
                # the sample(s) whose own pitch is nearest the target note
                centre = min({r.get('pitch_keycenter', target) for r in rs}, key=lambda k: (abs(k - target), k))
                if (centre, layer) in done:
                    continue
                done.add((centre, layer))
                pick = [(r, gain(r, cc0)) for r in rs if r.get('pitch_keycenter', target) == centre]
                clips.append((f'n{centre + shift}-{layer}.mp3', {'midi': centre + shift, 'layer': layer}, trim(render(pick, s['maxlen'] + 0.3), s['maxlen'])))
    peak = max(audioop.max(c, 4) for _, _, c in clips if c) or 1
    scale = 0.89 * 32767 * 65536 / peak  # the loudest clip of the set at -1 dBFS
    entries = []
    for name, entry, pcm in clips:
        if not pcm:
            continue
        encode(pcm, scale, os.path.join(out, name))
        entries.append({**entry, 'file': name})
    meta = {k: s[k] for k in ('name', 'about', 'source', 'licence', 'instrument')}
    meta.update(id=sid, layers=s['vels'], files=entries)
    json.dump(meta, open(os.path.join(out, 'set.json'), 'w'), indent=1)
    with open(os.path.join(out, 'LICENSE.txt'), 'w') as f:
        f.write(f"{s['name']} ({s['about']}) by {s['source']}. Licence: {s['licence']}.\n"
                f"Web subset made by tools/sounds/build.py from the raw library ({s['folder']}): mono, trimmed, 96 kbps MP3.\n"
                f"The library's own licence or readme follows.\n\n{licence_text(s)}")
    size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f'{sid}: {len(entries)} files, {size / 1024:.0f} KB')


def catalogue():
    """js/sound-sets.js: every built set, so the Sound pickers can list them without a download."""
    out = {}
    for sid, s in SETS.items():
        meta = os.path.join(OUT, s['instrument'], sid, 'set.json')
        if os.path.exists(meta):
            m = json.load(open(meta))
            out.setdefault(s['instrument'], []).append({k: m[k] for k in ('id', 'name', 'about', 'source', 'licence')})
    path = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'sound-sets.js')
    with open(path, 'w') as f:
        f.write('// Written by tools/sounds/build.py: the sample sets in sounds/<instrument>/<id>/ (set.json lists the files).\n'
                '// Every set is CC0 or public domain; each folder has its LICENSE.txt.\n'
                f'export const SOUND_SETS = {json.dumps(out, indent=2, ensure_ascii=False)};\n')


if __name__ == '__main__':
    for sid in sys.argv[1:] or SETS:
        build(sid)
    catalogue()
