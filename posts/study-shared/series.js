// 学习系列共用脚本：按 <body data-series> 区分各系列的已读记录：小工具函数、章节导航高亮、阅读记录
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var S = {};
  S.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.$ = function (s, r) { return (r || document).querySelector(s); };
  S.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function setAttrs(e, attrs, isSvg) {
    if (!attrs) return;
    for (var k in attrs) {
      var v = attrs[k];
      if (v == null) continue;
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'class' && !isSvg) e.className = v;
      else e.setAttribute(k, v);
    }
  }
  S.svg = function (tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    setAttrs(e, attrs, true);
    if (parent) parent.appendChild(e);
    return e;
  };
  S.h = function (tag, attrs, parent) {
    var e = document.createElement(tag);
    setAttrs(e, attrs, false);
    if (parent) parent.appendChild(e);
    return e;
  };

  S.softmax = function (xs, T) {
    T = T || 1;
    var m = Math.max.apply(null, xs);
    var e = xs.map(function (x) { return Math.exp((x - m) / T); });
    var s = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (x) { return x / s; });
  };
  S.log2 = function (x) { return Math.log(x) / Math.LN2; };
  S.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  // 数字格式：负号用全角减号，便于阅读
  S.f = function (x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    var s = x.toFixed(d == null ? 2 : d);
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    return s.replace('-', '−');
  };
  S.pct = function (x, d) { return S.f(x * 100, d == null ? 1 : d) + '%'; };
  // 大数：用“万 / 亿 / 万亿”
  S.big = function (x) {
    var a = Math.abs(x);
    if (a >= 1e12) return S.f(x / 1e12, a >= 1e14 ? 0 : 1) + ' 万亿';
    if (a >= 1e8) return S.f(x / 1e8, a >= 1e10 ? 0 : 1) + ' 亿';
    if (a >= 1e4) return S.f(x / 1e4, a >= 1e6 ? 0 : 1) + ' 万';
    return S.f(x, 0);
  };
  S.sci = function (x, d) {
    if (x === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(x)));
    var m = x / Math.pow(10, e);
    var sup = String(e).replace('-', '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
    return S.f(m, d == null ? 2 : d) + ' × 10' + sup;
  };

  // 按容器实际宽度画 SVG：1 个坐标单位 = 1 像素，保证文字不会被缩小到 15px 以下
  S.fit = function (box, height, draw, minW) {
    var last = -1;
    function render(force) {
      var w = Math.max(minW || 280, Math.floor(box.clientWidth));
      if (!force && w === last) return;
      last = w;
      var H = typeof height === 'function' ? height(w) : height;
      box.textContent = '';
      var s = S.svg('svg', { viewBox: '0 0 ' + w + ' ' + H, width: w, height: H }, box);
      draw(s, w, H);
    }
    // 首次绘制由调用方触发（等它的数据准备好），之后随窗口宽度自动重画
    var t, drawn = false;
    addEventListener('resize', function () { if (!drawn) return; clearTimeout(t); t = setTimeout(function () { render(false); }, 120); });
    return function () { drawn = true; render(true); };
  };

  // 分段按钮
  S.seg = function (root, cb) {
    var bs = S.$$('button', root);
    bs.forEach(function (b) {
      b.type = 'button';
      if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cb(b.getAttribute('data-v'), b);
      });
    });
  };

  // 横条列表：rows = [{label, value(0~1), text, cls, cut}]
  S.bars = function (root, rows, opt) {
    opt = opt || {};
    root.textContent = '';
    root.classList.add('bars');
    rows.forEach(function (r, i) {
      var g = S.h('div', { style: 'display:contents', class: r.cut ? 'cut' : '' }, root);
      var lb;
      if (opt.onPick) {
        lb = S.h('button', { class: 'lb', type: 'button', text: r.label }, g);
        lb.addEventListener('click', function () { opt.onPick(i); });
      } else lb = S.h('span', { class: 'lb', text: r.label }, g);
      var tr = S.h('span', { class: 'tr' }, g);
      S.h('span', { class: 'fl ' + (r.cls || ''), style: 'width:' + S.clamp(r.value, 0, 1) * 100 + '%' }, tr);
      S.h('span', { class: 'nv', text: r.text }, g);
    });
  };

  // 线性比例尺
  S.scale = function (d0, d1, r0, r1) {
    var f = function (x) { return r0 + (x - d0) / (d1 - d0) * (r1 - r0); };
    return f;
  };
  S.path = function (pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
  };

  // 可复现的伪随机数
  S.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  };

  // 本地存储，读不到就当没有
  S.store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function READ_KEY_() { return (document.body && document.body.getAttribute('data-series') || 'study') + '-read'; }
  S.readList = function () {
    try { var a = JSON.parse(S.store.get(READ_KEY_()) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  };
  S.markRead = function (n) {
    var a = S.readList();
    if (a.indexOf(n) < 0) { a.push(n); S.store.set(READ_KEY_(), JSON.stringify(a)); }
  };


  // ---------- Agent 系列通用互动组件 ----------

  // 记下来：S.notes(el, {c: [[概念, 解释]], p: [[要点, 说明]], ph: '要点'})
  S.notes = function (el, o) {
    function list(rows, cmd) {
      return '<dl>' + rows.map(function (r) {
        return '<div class="it' + (cmd ? ' cmd' : '') + '" tabindex="0"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
      }).join('') + '</dl>';
    }
    el.className = 'notes';
    el.innerHTML = '<div class="notes-head"><h3>记下来</h3><button class="btn quiz-btn" type="button" aria-pressed="false">自测：遮住解释</button></div>' +
      '<div class="notes-grid"><div><h4>概念</h4>' + list(o.c, false) + '</div><div><h4>' + (o.ph || '要点') + '</h4>' + list(o.p, true) + '</div></div>';
  };

  // 分类小游戏：先点卡片，再点要放进的类别
  // o = {bins: [{k, t}], items: [{t, k, why}]}
  S.sortGame = function (root, o) {
    root.innerHTML = '';
    var pool = S.h('div', { class: 'sort-items' }, root);
    var binsBox = S.h('div', { class: 'sort-bins' }, root);
    var cap = S.h('p', { class: 'cap', 'aria-live': 'polite', text: '先点一张卡片，再点它该去的类别。' }, root);
    var tally = S.h('p', { class: 'note' }, root);
    var picked = null, right = 0, done = 0;
    var bins = {};
    o.bins.forEach(function (b) {
      var d = S.h('div', null, binsBox);
      var hb = S.h('button', { class: 'btn', type: 'button', html: b.t, style: 'width:100%;text-align:left;margin-bottom:6px' }, d);
      var lst = S.h('div', { class: 'chipset' }, d);
      bins[b.k] = lst;
      hb.addEventListener('click', function () {
        if (!picked) { cap.textContent = '先选一张卡片。'; return; }
        var it = picked.it, ok = it.k === b.k;
        picked.el.remove();
        var c = S.h('span', { class: 'chip2 ' + (ok ? 'ok' : 'bad'), text: it.t }, bins[it.k]);
        done++; if (ok) right++;
        cap.innerHTML = (ok ? '<b>对了。</b>' : '<b style="color:var(--alert)">不对</b>，应放在「' + o.bins.filter(function (x) { return x.k === it.k; })[0].t + '」。') + ' ' + it.why;
        tally.textContent = '已完成 ' + done + ' / ' + o.items.length + '，答对 ' + right + ' 个。';
        picked = null;
        void c;
      });
    });
    o.items.forEach(function (it) {
      var b = S.h('button', { class: 'chip2', type: 'button', text: it.t }, pool);
      b.addEventListener('click', function () {
        S.$$('.chip2', pool).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        picked = { el: b, it: it };
        cap.textContent = '已选：' + it.t + '。它属于哪一类？';
      });
    });
    var reset = S.h('button', { class: 'btn', type: 'button', text: '重来', style: 'margin-top:8px' }, root);
    reset.addEventListener('click', function () { S.sortGame(root, o); });
  };

  // 选择题：qs = [{q, o: [选项], a: 正确下标, why}]
  S.quiz = function (root, qs) {
    root.innerHTML = '';
    var ol = S.h('ol', { class: 'quiz' }, root);
    qs.forEach(function (q) {
      var li = S.h('li', null, ol);
      S.h('p', { class: 'q', html: q.q }, li);
      var ops = S.h('div', { class: 'opts' }, li);
      var fb = S.h('p', { class: 'fb', 'aria-live': 'polite' }, li);
      q.o.forEach(function (t, i) {
        var b = S.h('button', { class: 'opt', type: 'button', html: t }, ops);
        b.addEventListener('click', function () {
          S.$$('.opt', ops).forEach(function (x) { x.classList.remove('right', 'wrong'); });
          var ok = i === q.a;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) S.$$('.opt', ops)[q.a].classList.add('right');
          fb.className = 'fb' + (ok ? '' : ' bad');
          fb.innerHTML = '<b>' + (ok ? '对。' : '再想想。') + '</b>' + q.why;
        });
      });
    });
  };

  // 分步演示：render(i) 负责画第 i 步；返回 go(i)
  S.stepper = function (root, n, render, labels) {
    var bar = S.h('div', { class: 'stepper' }, root);
    var prev = S.h('button', { class: 'btn', type: 'button', text: '上一步' }, bar);
    var next = S.h('button', { class: 'btn pri', type: 'button', text: '下一步' }, bar);
    var cnt = S.h('span', { class: 'cnt' }, bar);
    var i = 0;
    function go(k) {
      i = S.clamp(k, 0, n - 1);
      prev.disabled = i === 0;
      next.textContent = i === n - 1 ? '从头再来' : '下一步';
      cnt.textContent = (i + 1) + ' / ' + n + (labels ? ' · ' + labels[i] : '');
      render(i);
    }
    prev.addEventListener('click', function () { go(i - 1); });
    next.addEventListener('click', function () { go(i === n - 1 ? 0 : i + 1); });
    go(0);
    return go;
  };

  // 消息气泡：m = {r: 'sys'|'user'|'asst'|'tool', t, b: 标题}
  S.msg = function (parent, m, fresh) {
    var names = { sys: '系统提示词', user: '用户', asst: '模型', tool: '工具结果' };
    return S.h('div', { class: 'msgb ' + m.r + (fresh ? ' new' : ''), html: '<b>' + (m.b || names[m.r]) + '</b>' + m.t }, parent);
  };


  // ---------- AI Infra 系列追加组件（不影响已有组件） ----------

  // 先估再算：S.guess(root, {q, unit, ans, fmt, why, hint})
  // 读者先填自己的估计，再揭晓答案、误差倍数和原书结论
  S.guess = function (root, o) {
    root.classList.add('guess');
    root.innerHTML = '';
    S.h('p', { class: 'gq', html: '<b>先估一下：</b>' + o.q }, root);
    var row = S.h('div', { class: 'grow' }, root);
    var inp = S.h('input', { type: 'number', step: 'any', inputmode: 'decimal', 'aria-label': '你的估计', placeholder: o.hint || '你的估计' }, row);
    if (o.unit) S.h('span', { class: 'gu', text: o.unit }, row);
    var go = S.h('button', { class: 'btn pri', type: 'button', text: '揭晓' }, row);
    var out = S.h('div', { class: 'gout', 'aria-live': 'polite' }, root);
    var fmt = o.fmt || function (x) { return S.f(x, Math.abs(x) >= 100 ? 0 : 2); };
    function reveal() {
      var g = parseFloat(inp.value), a = typeof o.ans === 'function' ? o.ans() : o.ans;
      var html = '<p class="ga">答案：<b>' + fmt(a) + (o.unit ? ' ' + o.unit : '') + '</b></p>';
      if (isFinite(g) && g > 0 && a > 0) {
        var r = g / a, k = r >= 1 ? r : 1 / r;
        var tag = k <= 1.5 ? '很准' : k <= 3 ? '数量级对了' : k <= 10 ? '差了几倍' : '差了一个数量级以上';
        html += '<p class="ge ' + (k <= 3 ? 'ok' : 'bad') + '">你的估计 ' + fmt(g) + '，是答案的 ' + S.f(r, r >= 10 || r < 0.1 ? 1 : 2) + ' 倍（' + tag + '）。</p>';
      } else if (inp.value !== '') {
        html += '<p class="ge bad">估计值需要是正数。</p>';
      } else {
        html += '<p class="ge">没填估计也可以，下次先写一个数再点。</p>';
      }
      if (o.why) html += '<p class="gw">' + (typeof o.why === 'function' ? o.why() : o.why) + '</p>';
      out.innerHTML = html;
    }
    go.addEventListener('click', reveal);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') reveal(); });
    return { reset: function () { out.innerHTML = ''; inp.value = ''; } };
  };

  // 数量级对比条：S.magbars(root, [{label, v, text, cls}], {log: true})
  S.magbars = function (root, rows, opt) {
    opt = opt || {};
    var vs = rows.map(function (r) { return r.v; });
    var mx = Math.max.apply(null, vs), mn = Math.min.apply(null, vs);
    S.bars(root, rows.map(function (r) {
      var val = opt.log ? (Math.log10(r.v) - Math.log10(mn) + 0.3) / (Math.log10(mx) - Math.log10(mn) + 0.3) : r.v / mx;
      return { label: r.label, value: val, text: r.text, cls: r.cls };
    }));
  };


  // ---------- 神经网络与深度学习系列追加组件（不影响已有组件） ----------

  // 读 CSS 变量（深浅色切换后要重读）
  S.css = function (name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'; };
  S.onTheme = function (fn) {
    document.addEventListener('themechange', function () { setTimeout(fn, 30); });
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { setTimeout(fn, 30); }); } catch (e) {}
  };

  // 函数曲线图：S.chart(box, o) 返回 draw(o2)，o2 会合并进 o
  // o = {h, x:[x0,x1], y:[y0,y1], xl, yl, xt:[刻度], yt:[刻度], curves:[{f|pts, c:'c1'|'c2'|'c3'|'ok'|'dim', dash, w, label}],
  //      dots:[{x,y,c,r,label}], vl:[{x,c,label}], hl:[{y,c,label}], area:[{f, c}], extra: function(svg, X, Y, w, h)}
  S.chart = function (box, o) {
    function tk(t) { var d = Math.abs(t) < 10 && t % 1 ? Math.min(2, (String(t).split('.')[1] || '').length) : 0; return S.f(t, d); }
    box.classList.add('nchart');
    var cur = o;
    function draw(svg, w, H) {
      var o = cur, ml = o.ml == null ? 46 : o.ml, mr = 14, mt = 12, mb = o.xl ? 46 : 30;
      // 图例放在绘图区上方，先排版算出占几行
      var lg = (o.curves || []).filter(function (c) { return c.label; }), lgPos = [];
      if (lg.length) {
        var lx = ml, ly = 4;
        lg.forEach(function (c) {
          var tw = 0; for (var i = 0; i < c.label.length; i++) tw += c.label.charCodeAt(i) > 255 ? 15 : 8.5;
          if (lx + 30 + tw > w - mr && lx > ml) { lx = ml; ly += 22; }
          lgPos.push([lx, ly]); lx += 30 + tw + 16;
        });
        mt = ly + 30;
      }
      if (o.yl) mt = lg.length ? mt + 20 : Math.max(mt, 28);
      var X = S.scale(o.x[0], o.x[1], ml, w - mr), Y = S.scale(o.y[0], o.y[1], H - mb, mt);
      var g = S.svg('g', null, svg);
      (o.yt || []).forEach(function (t) {
        S.svg('line', { x1: ml, x2: w - mr, y1: Y(t), y2: Y(t), class: 'gl' }, g);
        S.svg('text', { x: ml - 6, y: Y(t) + 5, 'text-anchor': 'end', text: typeof t === 'number' ? tk(t) : t }, g);
      });
      (o.xt || []).forEach(function (t) {
        S.svg('line', { x1: X(t), x2: X(t), y1: mt, y2: H - mb, class: 'gl' }, g);
        var edge = X(t) > w - mr - 16;
        S.svg('text', { x: edge ? X(t) + mr - 2 : X(t), y: H - mb + 20, 'text-anchor': edge ? 'end' : 'middle', text: typeof t === 'number' ? tk(t) : t }, g);
      });
      if (o.y[0] < 0 && o.y[1] > 0) S.svg('line', { x1: ml, x2: w - mr, y1: Y(0), y2: Y(0), class: 'ax' }, g);
      if (o.x[0] < 0 && o.x[1] > 0) S.svg('line', { x1: X(0), x2: X(0), y1: mt, y2: H - mb, class: 'ax' }, g);
      S.svg('line', { x1: ml, x2: w - mr, y1: H - mb, y2: H - mb, class: 'ax' }, g);
      if (o.xl) S.svg('text', { x: (ml + w - mr) / 2, y: H - 6, 'text-anchor': 'middle', text: o.xl, class: 'axl' }, g);
      if (o.yl) S.svg('text', { x: 4, y: mt - 10, 'text-anchor': 'start', text: o.yl, class: 'axl' }, g);
      var clip = 'cl' + Math.random().toString(36).slice(2, 8);
      var defs = S.svg('defs', null, svg);
      var cp = S.svg('clipPath', { id: clip }, defs);
      S.svg('rect', { x: ml, y: mt, width: w - ml - mr, height: H - mt - mb }, cp);
      var pg = S.svg('g', { 'clip-path': 'url(#' + clip + ')' }, svg);
      function sample(f) {
        var pts = [], n = Math.max(80, Math.floor((w - ml - mr) / 2));
        for (var i = 0; i <= n; i++) {
          var x = o.x[0] + (o.x[1] - o.x[0]) * i / n, y = f(x);
          if (isFinite(y)) pts.push([X(x), Y(S.clamp(y, o.y[0] - (o.y[1] - o.y[0]), o.y[1] + (o.y[1] - o.y[0])))]);
        }
        return pts;
      }
      (o.area || []).forEach(function (a) {
        var pts = sample(a.f);
        if (!pts.length) return;
        var d = S.path(pts) + 'L' + pts[pts.length - 1][0] + ' ' + Y(Math.max(o.y[0], 0)) + 'L' + pts[0][0] + ' ' + Y(Math.max(o.y[0], 0)) + 'Z';
        S.svg('path', { d: d, class: 'ar ' + (a.c || 'c1') }, pg);
      });
      (o.curves || []).forEach(function (c) {
        var pts = c.pts ? c.pts.map(function (p) { return [X(p[0]), Y(p[1])]; }) : sample(c.f);
        S.svg('path', { d: S.path(pts), class: 'cv ' + (c.c || 'c1') + (c.dash ? ' dash' : ''), 'stroke-width': c.w || 2.5 }, pg);
      });
      (o.vl || []).forEach(function (v) {
        S.svg('line', { x1: X(v.x), x2: X(v.x), y1: mt, y2: H - mb, class: 'rl ' + (v.c || 'dim') }, pg);
        if (v.label) S.svg('text', { x: X(v.x) + 5, y: mt + 16, text: v.label, class: 'lbl ' + (v.c || 'dim') }, svg);
      });
      (o.hl || []).forEach(function (v) {
        S.svg('line', { x1: ml, x2: w - mr, y1: Y(v.y), y2: Y(v.y), class: 'rl ' + (v.c || 'dim') }, pg);
        if (v.label) S.svg('text', { x: w - mr - 4, y: Y(v.y) - 6, 'text-anchor': 'end', text: v.label, class: 'lbl ' + (v.c || 'dim') }, svg);
      });
      (o.dots || []).forEach(function (d) {
        S.svg('circle', { cx: X(d.x), cy: Y(d.y), r: d.r || 5, class: 'dt ' + (d.c || 'c1') }, pg);
        if (d.label) S.svg('text', { x: X(d.x) + 8, y: Y(d.y) - 8, text: d.label, class: 'lbl ' + (d.c || 'c1') }, svg);
      });
      lg.forEach(function (c, i) {
        var p = lgPos[i];
        S.svg('line', { x1: p[0], x2: p[0] + 22, y1: p[1] + 9, y2: p[1] + 9, class: 'cv ' + (c.c || 'c1') + (c.dash ? ' dash' : ''), 'stroke-width': 2.5 }, svg);
        S.svg('text', { x: p[0] + 28, y: p[1] + 14, text: c.label, class: 'lbl' }, svg);
      });
      if (o.extra) o.extra(svg, X, Y, w, H);
    }
    var r = S.fit(box, function () { return cur.h || 260; }, draw, 260);
    S.onTheme(function () { r(); });
    return function (o2) { if (o2) for (var k in o2) cur[k] = o2[k]; r(); };
  };

  // 二维平面上的分类场：S.field(box, o) 返回 draw(o2)
  // o = {xr:[a,b], yr:[a,b], f:(x,y)->[0,1] 概率 或 null, pts:[[x,y,类别0/1/2]], lines:[[w1,w2,b, c]], size, onClick(x,y)}
  S.field = function (box, o) {
    var cur = o;
    box.classList.add('nfield');
    var cv = S.h('canvas', null, box);
    var ctx = cv.getContext('2d');
    var cols;
    function hex(c) {
      c = c.replace('#', '');
      if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
      return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
    }
    function readCols() {
      cols = { a: hex(S.css('--s1')), b: hex(S.css('--s2')), c: hex(S.css('--ok')), d: hex(S.css('--dim')), e: hex(S.css('--s3')), bg: hex(S.css('--panel')), ink: S.css('--ink'), panel: S.css('--panel') };
    }
    function draw() {
      var o = cur;
      if (!cols) readCols();
      var W = Math.min(o.size || 380, Math.max(220, box.clientWidth)), H = W;
      var dpr = window.devicePixelRatio || 1;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var X = S.scale(o.xr[0], o.xr[1], 0, W), Y = S.scale(o.yr[0], o.yr[1], H, 0);
      var ix = S.scale(0, W, o.xr[0], o.xr[1]), iy = S.scale(H, 0, o.yr[0], o.yr[1]);
      ctx.fillStyle = cols.panel; ctx.fillRect(0, 0, W, H);
      if (o.f) {
        var n = o.res || 60;
        var off = document.createElement('canvas'); off.width = n; off.height = n;
        var oc = off.getContext('2d'), img = oc.createImageData(n, n);
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var p = o.f(ix((i + 0.5) * W / n), iy((j + 0.5) * H / n));
          var col, al;
          if (Array.isArray(p)) { // 多类：[类别, 置信度]
            col = [cols.a, cols.b, cols.c, cols.d, cols.e][p[0]]; al = 0.12 + 0.38 * p[1];
          } else {
            col = p >= 0.5 ? cols.b : cols.a; al = 0.08 + 0.5 * Math.abs(p - 0.5) * 2 * 0.75;
          }
          var k = (j * n + i) * 4;
          img.data[k] = Math.round(cols.bg[0] * (1 - al) + col[0] * al);
          img.data[k + 1] = Math.round(cols.bg[1] * (1 - al) + col[1] * al);
          img.data[k + 2] = Math.round(cols.bg[2] * (1 - al) + col[2] * al);
          img.data[k + 3] = 255;
        }
        oc.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = o.smooth !== false;
        ctx.drawImage(off, 0, 0, W, H);
      }
      // 坐标轴
      ctx.strokeStyle = 'rgba(128,128,128,.45)'; ctx.lineWidth = 1;
      if (o.xr[0] < 0 && o.xr[1] > 0) { ctx.beginPath(); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), H); ctx.stroke(); }
      if (o.yr[0] < 0 && o.yr[1] > 0) { ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.stroke(); }
      (o.lines || []).forEach(function (L) { // w1 x + w2 y + b = 0
        var w1 = L[0], w2 = L[1], b = L[2];
        ctx.strokeStyle = L[3] ? S.css(L[3]) : cols.ink; ctx.lineWidth = L[4] || 2; ctx.setLineDash(L[5] || []);
        ctx.beginPath();
        if (Math.abs(w2) > 1e-9) { ctx.moveTo(0, Y(-(w1 * o.xr[0] + b) / w2)); ctx.lineTo(W, Y(-(w1 * o.xr[1] + b) / w2)); }
        else if (Math.abs(w1) > 1e-9) { ctx.moveTo(X(-b / w1), 0); ctx.lineTo(X(-b / w1), H); }
        ctx.stroke(); ctx.setLineDash([]);
      });
      (o.pts || []).forEach(function (p) {
        var c = [cols.a, cols.b, cols.c][p[2]] || cols.a;
        ctx.beginPath();
        if (p[2] === 1) ctx.rect(X(p[0]) - 4.5, Y(p[1]) - 4.5, 9, 9); else if (p[2] === 2) { ctx.moveTo(X(p[0]), Y(p[1]) - 6); ctx.lineTo(X(p[0]) + 5.5, Y(p[1]) + 4); ctx.lineTo(X(p[0]) - 5.5, Y(p[1]) + 4); ctx.closePath(); }
        else ctx.arc(X(p[0]), Y(p[1]), 5, 0, 7);
        ctx.fillStyle = 'rgb(' + c.join(',') + ')'; ctx.fill();
        ctx.lineWidth = p[3] ? 3 : 1.5; ctx.strokeStyle = p[3] ? cols.ink : cols.panel; ctx.stroke();
      });
      if (o.overlay) o.overlay(ctx, X, Y, W, H);
    }
    cv.addEventListener('click', function (e) {
      if (!cur.onClick) return;
      var r = cv.getBoundingClientRect();
      var ix = S.scale(0, r.width, cur.xr[0], cur.xr[1]), iy = S.scale(r.height, 0, cur.yr[0], cur.yr[1]);
      cur.onClick(ix(e.clientX - r.left), iy(e.clientY - r.top), e);
    });
    var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(draw, 150); });
    S.onTheme(function () { readCols(); draw(); });
    return function (o2) { if (o2) for (var k in o2) cur[k] = o2[k]; draw(); };
  };

  // 矩阵 / 网格：S.grid(root, M, {fmt, heat:[lo,hi], hi:[[i,j]], rl:[行名], cl:[列名], cls(i,j,v)})
  S.grid = function (root, M, o) {
    o = o || {};
    root.textContent = '';
    var t = S.h('table', { class: 'mgx' }, root);
    if (o.cl) {
      var hr = S.h('tr', null, t);
      if (o.rl) S.h('th', null, hr);
      o.cl.forEach(function (c) { S.h('th', { html: c }, hr); });
    }
    M.forEach(function (row, i) {
      var tr = S.h('tr', null, t);
      if (o.rl) S.h('th', { html: o.rl[i] }, tr);
      row.forEach(function (v, j) {
        var td = S.h('td', { text: o.fmt ? o.fmt(v, i, j) : (typeof v === 'number' ? S.f(v, 2) : v) }, tr);
        if (o.heat && typeof v === 'number') {
          var a = S.clamp((v - o.heat[0]) / (o.heat[1] - o.heat[0]), 0, 1);
          td.style.background = 'color-mix(in srgb, var(--s1) ' + Math.round(a * 70) + '%, transparent)';
          if (a > 0.55) td.style.color = '#fff';
        }
        if (o.hi && o.hi.some(function (p) { return p[0] === i && p[1] === j; })) td.classList.add('on');
        if (o.cls) { var c = o.cls(i, j, v); if (c) td.classList.add(c); }
      });
    });
    return t;
  };

  // 高斯随机数
  S.randn = function (r) {
    var u = 1 - r(), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  S.sigmoid = function (x) { return 1 / (1 + Math.exp(-x)); };

  document.addEventListener('DOMContentLoaded', function () {
    // 系列目录条：标出读过的篇目
    var read = S.readList();
    S.$$('.series a[data-part]').forEach(function (a) {
      if (read.indexOf(a.getAttribute('data-part')) >= 0 && a.getAttribute('aria-current') !== 'page') a.classList.add('done');
    });
    // 记下来：自测模式（遮住解释，点一条显示一条）
    (function () {
      var btns = S.$$('.quiz-btn'), KEY = 'study-notes-quiz';
      if (!btns.length) return;
      function set(on) {
        document.body.classList.toggle('notes-quiz', on);
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '显示全部解释' : '自测：遮住解释'; });
        S.$$('.notes .it.show').forEach(function (it) { it.classList.remove('show'); });
        S.store.set(KEY, on ? '1' : '');
      }
      btns.forEach(function (b) { b.addEventListener('click', function () { set(!document.body.classList.contains('notes-quiz')); }); });
      S.$$('.notes .it').forEach(function (it) {
        function flip() { if (document.body.classList.contains('notes-quiz')) it.classList.toggle('show'); }
        it.addEventListener('click', flip);
        it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      });
      set(S.store.get(KEY) === '1');
    })();
    // 读到页尾，记为已读
    var me = document.body.getAttribute('data-part');
    var pager = S.$('.pager');
    if (me && pager && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { S.markRead(me); io.disconnect(); }
      });
      io.observe(pager);
    }
    // 章节导航高亮
    var links = S.$$('.secnav a');
    if (!links.length) return;
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function upd() {
      var y = scrollY + 140, cur = -1;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    }
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });

  window.S = S;
})();
