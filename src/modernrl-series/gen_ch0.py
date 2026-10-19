#!/usr/bin/env python3
"""汇总各篇的三问、易混辨析、公式卡和算法卡，填进 ch0.tpl.html 生成 ch0.html。
用法：cd src && python3 modernrl-series/gen_ch0.py && python3 study_build.py modernrl-series all"""
import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = {}
exec(open(os.path.join(HERE, 'series.py')).read(), cfg)
FULL = cfg['FULL']
chs, cf, fx, algo = [], [], {}, []
for n in range(1, 13):
    s = open(os.path.join(HERE, 'ch%d.html' % n)).read()
    body = s.split('===BODY===')[1].split('===SCRIPT===')[0]
    ask = re.search(r'<div class="ask3">.*?<ol>(.*?)</ol>', body, re.S).group(1)
    qs = [re.sub(r'<.*?>', '', q).strip() for q in re.findall(r'<li>(.*?)</li>', ask, re.S)]
    nav = re.search(r'^nav: (.*)$', s, re.M).group(1)
    tags = ' · '.join(x.split('|')[1] for x in nav.split(';') if not x.startswith('back'))
    h1 = re.sub(r'<.*?>', '', re.search(r'^h1: (.*)$', s, re.M).group(1))
    chs.append([n, FULL[str(n)], h1, qs, tags])
    for sec in re.finditer(r'<section class="part" id="([^"]+)">(.*?)</section>', body, re.S):
        sid, txt = sec.group(1), sec.group(2)
        for m in re.finditer(r'<div class="confuse"><h4>(.*?)</h4>(.*?)</div>', txt, re.S):
            title = re.sub(r'^易混辨析[：:]?\s*', '', m.group(1)).strip() or '易混辨析'
            ps = [p.strip() for p in re.findall(r'<p>(.*?)</p>', m.group(2), re.S)]
            if ps:
                cf.append([n, sid, title, ps])
        for m in re.finditer(r'<div class="card2 algo" data-algo="([^"]+)">\s*<h3>(.*?)</h3><p class="en">(.*?)</p>\s*<dl>(.*?)</dl>', txt, re.S):
            dl = dict((re.sub(r'<.*?>', '', k).strip(), v.strip()) for k, v in re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', m.group(4), re.S))
            algo.append({'n': n, 'sid': sid, 'name': m.group(1), 'en': m.group(3), 'prob': dl.get('解决什么问题', ''), 'how': dl.get('核心做法', ''),
                         'fx': dl.get('关键公式', ''), 'when': dl.get('何时用', ''), 'cost': dl.get('代价与坑', '')})
    m = re.search(r'<section class="part" id="back">.*?<div class="fxc">(.*?)</div>\s*<div class="ask3"', body, re.S)
    if m:
        fx[n] = [f.strip() for f in re.findall(r'<div class="fx">(.*?)</div>', m.group(1), re.S)]
t = open(os.path.join(HERE, 'ch0.tpl.html')).read()
J = lambda o: json.dumps(o, ensure_ascii=False)
t = t.replace('__CHS__', J(chs)).replace('__CF__', J(cf)).replace('__FX__', J(fx)).replace('__ALGO__', J(algo))
open(os.path.join(HERE, 'ch0.html'), 'w').write(t)
print('chapters', len(chs), 'confuse groups', len(cf), 'items', sum(len(c[3]) for c in cf), 'formulas', sum(len(v) for v in fx.values()), 'algo cards', len(algo))
