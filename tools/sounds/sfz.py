"""Flatten an SFZ file into a list of regions (dicts of opcodes), following
#include and #define, <control> default_path, and inheritance from <global>,
<master> and <group> headers. Enough of SFZ for picking samples; not a player."""
import os
import re

HEADER = re.compile(r'<(\w+)>')


def _read(path, defines, root=None):
    root = root or os.path.dirname(path)
    text = open(path, encoding='utf-8', errors='replace').read()
    text = re.sub(r'/\*.*?\*/', ' ', text, flags=re.S)
    out = []
    for line in text.splitlines():
        line = line.split('//')[0]
        m = re.match(r'\s*#define\s+(\$\w+)\s+(.*\S)', line)
        if m:
            defines[m.group(1)] = m.group(2)
            continue
        for k in sorted(defines, key=len, reverse=True):
            line = line.replace(k, defines[k])
        m = re.match(r'\s*#include\s+"([^"]+)"', line)
        if m:
            # #include paths are relative to the top-level .sfz file
            inc = os.path.join(root, m.group(1))
            if os.path.exists(inc):
                out.extend(_read(inc, defines, root))
            continue
        out.append(line)
    return out


def _opcodes(chunk):
    # opcode=value pairs; values may contain spaces (sample paths), so split on the next "name="
    ops = {}
    parts = re.split(r'(\b[A-Za-z_][\w]*=)', chunk)
    key = None
    for p in parts:
        if re.fullmatch(r'[A-Za-z_][\w]*=', p):
            key = p[:-1]
        elif key:
            ops[key] = p.strip()
            key = None
    return ops


NOTE = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}


def midi_of(v):
    v = str(v).strip().lower()
    if re.fullmatch(r'-?\d+', v):
        return int(v)
    m = re.fullmatch(r'([a-g])(#|b)?(-?\d)', v)
    if not m:
        return None
    return 12 * (int(m.group(3)) + 1) + NOTE[m.group(1)] + (1 if m.group(2) == '#' else -1 if m.group(2) == 'b' else 0)


def regions(path):
    lines = _read(path, {})
    text = '\n'.join(lines)
    tokens = HEADER.split(text)
    levels = {'global': {}, 'master': {}, 'group': {}, 'control': {}}
    out = []
    i = 1
    while i < len(tokens):
        head, body = tokens[i], tokens[i + 1]
        ops = _opcodes(body)
        if head == 'control':
            levels['control'].update(ops)
        elif head == 'global':
            levels['global'] = ops; levels['master'] = {}; levels['group'] = {}
        elif head == 'master':
            levels['master'] = ops; levels['group'] = {}
        elif head == 'group':
            levels['group'] = ops
        elif head == 'region':
            r = {**levels['global'], **levels['master'], **levels['group'], **ops}
            if 'sample' in r:
                base = os.path.dirname(path)
                r['sample'] = os.path.normpath(os.path.join(base, levels['control'].get('default_path', '').replace('\\', '/'), r['sample'].replace('\\', '/')))
                if 'key' in r:
                    k = midi_of(r['key']); r.setdefault('lokey', k); r.setdefault('hikey', k); r.setdefault('pitch_keycenter', k)
                for o in ('lokey', 'hikey', 'pitch_keycenter'):
                    if o in r:
                        r[o] = midi_of(r[o])
                for o in ('lovel', 'hivel', 'seq_position', 'seq_length'):
                    if o in r:
                        r[o] = int(float(r[o]))
                out.append(r)
        i += 2
    return out
