#!/usr/bin/env python3
"""汇总各篇的三问与答案、易混辨析、提示词卡、动手清单、“记下来”速记，填进 ch0.tpl.html 生成 ch0.html。
用法：cd src && python3 easyvibe-series/gen_ch0.py && python3 study_build.py easyvibe-series all"""
import re, json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = {}
exec(open(os.path.join(HERE, 'series.py')).read(), cfg)
FULL = cfg['FULL']
N = len(cfg['PARTS']) - 1


def strip(s):
    return re.sub(r'\s+', ' ', re.sub(r'<.*?>', '', s)).strip()


def js_pairs(block):
    return [[a, b] for a, b in re.findall(r"\[\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]", block)]


chs, cards, cf, notes, prompts, todos = [], [], [], [], [], []
for n in range(1, N + 1):
    s = open(os.path.join(HERE, 'ch%d.html' % n)).read()
    body = s.split('===BODY===')[1].split('===SCRIPT===')[0]
    script = s.split('===SCRIPT===')[1]
    h1 = strip(re.search(r'^h1: (.*)$', s, re.M).group(1))
    kicker = re.search(r'^kicker: (.*)$', s, re.M).group(1)
    src = strip(re.findall(r'<span>(.*?)</span>', kicker)[2])
    nav = re.search(r'^nav: (.*)$', s, re.M).group(1)
    tags = ' · '.join(x.split('|')[1] for x in nav.split(';') if not x.startswith('recap'))
    ask = re.search(r'<div class="ask3">.*?<ol>(.*?)</ol>', body, re.S).group(1)
    qs = [strip(q) for q in re.findall(r'<li>(.*?)</li>', ask, re.S)]
    chs.append([n, FULL[str(n)], h1, qs, tags, src])
    for q, a in re.findall(r'<details><summary>(.*?)</summary><p class="ans">(.*?)</p></details>', body, re.S):
        cards.append([n, re.sub(r'^\d+\.\s*', '', strip(q)), strip(a)])
    for sec in re.finditer(r'<section class="part" id="([^"]+)">(.*?)</section>', body, re.S):
        sid, txt = sec.group(1), sec.group(2)
        for m in re.finditer(r'<div class="confuse">\s*<h4>(.*?)</h4>(.*?)</div>', txt, re.S):
            title = re.sub(r'^易混辨析[：:]?\s*', '', strip(m.group(1)))
            ps = [p.strip() for p in re.findall(r'<p>(.*?)</p>', m.group(2), re.S)]
            if ps:
                cf.append([n, sid, title, ps])
        for m in re.finditer(r'<div class="pcard" data-t="([^"]*)"(?: data-k="([^"]*)")?><pre>(.*?)</pre></div>', txt, re.S):
            prompts.append([n, sid, m.group(1), m.group(2) or '', html.unescape(m.group(3))])
    blocks = re.findall(r"S\.notes\(\$\('#n-[^']+'\), \{(.*?)\n\}\);", script, re.S)
    c, p = [], []
    for b in blocks:
        cpart, _, ppart = b.partition('p: [')
        c += js_pairs(cpart)
        p += js_pairs(ppart)
    notes.append([n, c, p])
    tm = re.search(r"EV\.todo\(\$\('#todo'\), '(\d+)', \[(.*?)\n\]\);", script, re.S)
    items = re.findall(r"\{ t: '((?:[^'\\]|\\.)*)'", tm.group(2)) if tm else []
    todos.append([n, items])

t = open(os.path.join(HERE, 'ch0.tpl.html')).read()
J = lambda o: json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
t = (t.replace('__CHS__', J(chs)).replace('__CARDS__', J(cards)).replace('__CF__', J(cf))
      .replace('__NOTES__', J(notes)).replace('__PROMPTS__', J(prompts)).replace('__TODOS__', J(todos)))
open(os.path.join(HERE, 'ch0.html'), 'w').write(t)
print('chapters', len(chs), 'cards', len(cards), 'confuse', len(cf), 'prompts', len(prompts),
      'todos', sum(len(x[1]) for x in todos), 'notes', sum(len(x[1]) + len(x[2]) for x in notes))
