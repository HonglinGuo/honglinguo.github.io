// 「动手拆一个大语言模型」系列共用脚本：小工具函数、章节导航高亮、阅读记录
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
  var READ_KEY = 'llm-series-read';
  S.readList = function () {
    try { var a = JSON.parse(S.store.get(READ_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  };
  S.markRead = function (n) {
    var a = S.readList();
    if (a.indexOf(n) < 0) { a.push(n); S.store.set(READ_KEY, JSON.stringify(a)); }
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 系列目录条：标出读过的篇目
    var read = S.readList();
    S.$$('.series a[data-part]').forEach(function (a) {
      if (read.indexOf(a.getAttribute('data-part')) >= 0 && a.getAttribute('aria-current') !== 'page') a.classList.add('done');
    });
    // 记下来：自测模式（遮住解释，点一条显示一条）
    (function () {
      var btns = S.$$('.quiz-btn'), KEY = 'llm-series-notes-quiz';
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
