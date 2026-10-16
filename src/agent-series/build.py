#!/usr/bin/env python3
"""把本目录下的 chN.html 片段拼成 posts/2026-10-16-agent*/index.html。
用法：python3 build.py 0 1 2 …（0 是系列总览）。片段格式：
---
key: value（title, desc, kicker, h1, lead, nav=id|标签;id|标签）
---
<style>…</style>   （可选，放进 head）
===BODY===
正文 section
===SCRIPT===
页面脚本
"""
import os, re, sys
SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(SRC, '..', '..', 'posts'))
SHARED = '2026-10-16-agent-shared'
PARTS = [
    ('', '总览', '系列目录'),
    ('1', '01', 'Agent 入门'), ('2', '02', '上下文工程'), ('3', '03', '记忆与知识库'),
    ('4', '04', '工具'), ('5', '05', 'Coding Agent'), ('6', '06', '交互扩展'),
    ('7', '07', '评估'), ('8', '08', '后训练'), ('9', '09', '持续进化'), ('10', '10', '多 Agent'),
]
FULL = {
    '1': 'AI Agent 入门', '2': '上下文工程', '3': '用户记忆和知识库', '4': '工具', '5': 'Coding Agent 与通用 Agent',
    '6': '交互：观察与动作空间的扩展', '7': 'Agent 的评估', '8': '模型后训练', '9': 'Agent 的持续进化', '10': '多 Agent 协作',
}
REPO = 'https://github.com/bojieli/ai-agent-book'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='5' y='2' width='14' height='20' rx='3' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Crect x='7' y='9' width='10' height='11' rx='1.5' fill='%232340D6'/%3E%3C/svg%3E"

def slug(n): return '2026-10-16-agent' + ('-' + n if n else '')

def series_nav(cur):
    out = ['<nav class="series" aria-label="系列目录">']
    for n, b, t in PARTS:
        attrs = ' aria-current="page"' if n == cur else ''
        if n: attrs += ' data-part="%s"' % n
        out.append('  <a href="../%s/"%s><b>%s</b>%s</a>' % (slug(n), attrs, b, t))
    out.append('</nav>')
    return '\n'.join(out)

def pager(cur):
    idx = [p[0] for p in PARTS].index(cur)
    links = []
    if idx > 0:
        n, b, t = PARTS[idx - 1]
        links.append('<a href="../%s/"><small>上一篇</small><span>%s</span></a>' % (slug(n), (b + ' · ' + FULL[n]) if n else '系列总览'))
    if idx < len(PARTS) - 1:
        n, b, t = PARTS[idx + 1]
        links.append('<a class="nx" href="../%s/"><small>下一篇</small><span>%s · %s</span></a>' % (slug(n), b, FULL[n]))
    return '<nav class="pager" aria-label="翻页">' + ''.join(links) + '</nav>'

def build(n):
    raw = open(os.path.join(SRC, 'ch%s.html' % (n or '0'))).read()
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    meta = {}
    for line in m.group(1).split('\n'):
        k, _, v = line.partition(':')
        meta[k.strip()] = v.strip()
    rest = m.group(2)
    head_extra, _, rest = rest.partition('===BODY===')
    body, _, script = rest.partition('===SCRIPT===')
    nav = ''
    if meta.get('nav'):
        nav = '<nav class="secnav" aria-label="本篇小节">\n  <div class="wrap">' + ''.join(
            '<a href="#%s">%s</a>' % tuple(x.split('|')) for x in meta['nav'].split(';')) + '</div>\n</nav>'
    kicker = meta.get('kicker', '')
    credit = ('<p class="credit">本系列是开源书《<a href="%s" rel="noopener">深入理解 AI Agent：设计原理与工程实践</a>》（李博杰 著，Apache-2.0 协议）的学习笔记。%s</p>' %
              (REPO, meta.get('credit', '不逐段复述原书，而是用自己的话把关键概念讲一遍，配上能动手点的小实验；原书的实验代码和思考题推荐对照阅读。')))
    html = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{icon}">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../{shared}/series.css">
<script src="../../assets/site.js"></script>
<script src="../{shared}/series.js"></script>
{head_extra}
</head>
<body{bodyattr}>

<header class="site-head">
  <div class="wrap">
    <a class="brand" href="../../">
      <svg class="brand-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="9" width="10" height="11" rx="1.5" fill="var(--s1)"/></svg>
      AI 观察笔记
    </a>
    <nav class="site-nav">
      <a href="../../">全部文章</a>
      <button class="theme-btn" type="button">深色</button>
    </nav>
  </div>
</header>

<main>
<section class="hero wrap">
  <p class="kicker">{kicker}</p>
  <h1>{h1}</h1>
  <p class="lead">{lead}</p>
  {credit}
{series}
</section>

{nav}
<div class="wrap">
{body}
{pager}
</div>
</main>

<footer class="site-foot">
  <div class="wrap">
    <span>AI 观察笔记</span>
    <span>学习笔记 · 原书：<a href="{repo}" rel="noopener">bojieli/ai-agent-book</a></span>
  </div>
</footer>
<script>
(function () {{
'use strict';
var $ = S.$, $$ = S.$$, h = S.h;
{script}
}})();
</script>
</body>
</html>
'''.format(title=meta['title'], desc=meta['desc'], icon=ICON, shared=SHARED, head_extra=head_extra.strip(),
           bodyattr=(' data-part="%s"' % n) if n else '', kicker=kicker, h1=meta['h1'], lead=meta['lead'],
           credit=credit, series=series_nav(n), nav=nav, body=body.strip(), pager=pager(n), repo=REPO, script=script.strip())
    d = os.path.join(OUT, slug(n))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w').write(html)
    print('built', slug(n), len(html))

if __name__ == '__main__':
    for a in sys.argv[1:]:
        build('' if a == '0' else a)
