import re,json,sys
sys.path.insert(0,'nndl-series')
FULL={'1':'绪论','2':'机器学习概述','3':'线性模型','4':'前馈神经网络','5':'卷积神经网络','6':'循环神经网络','7':'网络优化与正则化','8':'注意力机制与 Transformer','9':'图神经网络','10':'无监督学习','11':'模型独立的学习方式','12':'深度强化学习','13':'大语言模型与智能体','14':'概率图模型','15':'深度信念网络','16':'深度生成模型'}
chs=[];cf=[];fx={}
for n in range(1,17):
    s=open(f'nndl-series/ch{n}.html').read()
    body=s.split('===BODY===')[1].split('===SCRIPT===')[0]
    q=re.findall(r'<li>(.*?)</li>',re.search(r'<div class="q3">.*?</ol>',body,re.S).group(0),re.S)[0]
    nav=re.search(r'^nav: (.*)$',s,re.M).group(1)
    tags=' · '.join(x.split('|')[1] for x in nav.split(';') if not x.startswith('back'))
    h1=re.sub('<.*?>','',re.search(r'^h1: (.*)$',s,re.M).group(1))
    chs.append([n,FULL[str(n)],h1,q,tags])
    # confuse boxes with section ids
    for sec in re.finditer(r'<section class="part" id="([^"]+)">(.*?)</section>',body,re.S):
        sid,txt=sec.group(1),sec.group(2)
        for m in re.finditer(r'<div class="confuse"><h4>(.*?)</h4>(.*?)</div>',txt,re.S):
            title=re.sub(r'^易混辨析[：:]?\s*','',m.group(1)).strip() or '易混辨析'
            ps=[p.strip() for p in re.findall(r'<p>(.*?)</p>',m.group(2),re.S)]
            if ps: cf.append([n,sid,title,ps])
    m=re.search(r'<div class="fxc">(.*?)</div>\s*<div class="notes" id="n-back">',body,re.S)
    if m: fx[n]=[f.strip() for f in re.findall(r'<div class="fx">(.*?)</div>',m.group(1),re.S)]
t=open('nndl-series/ch0.tpl.html').read()
J=lambda o: json.dumps(o,ensure_ascii=False)
t=t.replace('__CHS__',J(chs)).replace('__CF__',J(cf)).replace('__FX__',J(fx))
open('nndl-series/ch0.html','w').write(t)
print('cf groups',len(cf),'items',sum(len(c[3]) for c in cf),'fx',sum(len(v) for v in fx.values()))
