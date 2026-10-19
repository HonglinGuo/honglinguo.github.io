#!/usr/bin/env python3
"""汇总 ch1–ch10 的三问、易混辨析和公式卡，按 ch0.tpl.html 生成 ch0.html。
用法（在 src 目录下）：python3 rlmath-series/gen_ch0.py && python3 study_build.py rlmath-series all"""
import re, json, os
D = os.path.dirname(os.path.abspath(__file__))
cfg = {}
exec(open(os.path.join(D, 'series.py')).read(), cfg)
FULL = cfg['FULL']
chs, cf, fx = [], [], {}
for n in range(1, 11):
    s = open(os.path.join(D, 'ch%d.html' % n)).read()
    body = s.split('===BODY===')[1].split('===SCRIPT===')[0]
    q = re.findall(r'<li>(.*?)</li>', re.search(r'<div class="q3">.*?</ol>', body, re.S).group(0), re.S)[0]
    nav = re.search(r'^nav: (.*)$', s, re.M).group(1)
    tags = ' · '.join(x.split('|')[1] for x in nav.split(';') if not x.startswith('back'))
    h1 = re.sub('<.*?>', '', re.search(r'^h1: (.*)$', s, re.M).group(1))
    chs.append([n, FULL[str(n)], h1, q.strip(), tags])
    for sec in re.finditer(r'<section class="part" id="([^"]+)">(.*?)</section>', body, re.S):
        sid, txt = sec.group(1), sec.group(2)
        for m in re.finditer(r'<div class="confuse"><h4>(.*?)</h4>(.*?)</div>', txt, re.S):
            title = re.sub(r'^易混辨析[：:]?\s*', '', m.group(1)).strip() or '易混辨析'
            ps = [p.strip() for p in re.findall(r'<p>(.*?)</p>', m.group(2), re.S)]
            if ps: cf.append([n, sid, title, ps])
    m = re.search(r'<div class="fxc">(.*?)</div>\s*<div class="ask3">', body, re.S)
    if m: fx[n] = [f.strip() for f in re.findall(r'<div class="fx">(.*?)</div>', m.group(1), re.S)]
t = open(os.path.join(D, 'ch0.tpl.html')).read()
J = lambda o: json.dumps(o, ensure_ascii=False)
t = t.replace('__CHS__', J(chs)).replace('__CF__', J(cf)).replace('__FX__', J(fx))
open(os.path.join(D, 'ch0.html'), 'w').write(t)
print('chapters', len(chs), 'confuse groups', len(cf), 'items', sum(len(c[3]) for c in cf), 'formulas', sum(len(v) for v in fx.values()))
