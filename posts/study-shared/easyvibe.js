// Easy-Vibe 学习系列专用组件（只在本系列页面加载，依赖 series.js 的 S）
(function () {
  'use strict';
  var EV = {};
  var h = S.h, $$ = S.$$;
  EV.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  function copyText(txt, btn) {
    function ok() { var t = btn.textContent; btn.textContent = '已复制'; setTimeout(function () { btn.textContent = t; }, 1200); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, fallback); return; }
    } catch (e) { /* 走兜底 */ }
    fallback();
    function fallback() {
      var ta = h('textarea', { style: 'position:fixed;left:-9999px' }, document.body);
      ta.value = txt; ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { btn.textContent = '请手动复制'; }
      ta.remove();
    }
  }
  EV.copy = copyText;

  // 提示词卡：页面里写 <div class="pcard" data-t="标题" data-k="用途"><pre>正文</pre></div>，这里加复制按钮
  EV.pcards = function (scope) {
    $$('.pcard', scope || document).forEach(function (c) {
      if (c.querySelector('.pc-h')) return;
      var pre = c.querySelector('pre');
      var hd = h('div', { class: 'pc-h' });
      h('b', { text: c.getAttribute('data-t') || '提示词' }, hd);
      if (c.getAttribute('data-k')) h('small', { text: c.getAttribute('data-k') }, hd);
      var b = h('button', { class: 'btn', type: 'button', text: '复制' }, hd);
      b.addEventListener('click', function () { copyText(pre.textContent, b); });
      c.insertBefore(hd, pre);
    });
  };

  // 提示词进化：同一个需求的几版写法，切换查看，[[…]] 标出这一版新加的信息
  // o = {vers: [{t: 版本名, p: 提示词（可含 [[新增]]）, r: 结果/点评 html}]}
  EV.evolve = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ev-evo');
    var seg = h('div', { class: 'seg' }, root);
    var pre = h('pre', { class: 'ev-p' }, root);
    var out = h('div', { class: 'ev-r', 'aria-live': 'polite' }, root);
    o.vers.forEach(function (v, i) { h('button', { 'data-v': String(i), text: v.t, 'aria-pressed': i === 0 ? 'true' : 'false' }, seg); });
    function show(i) {
      var v = o.vers[i];
      pre.innerHTML = EV.esc(v.p).replace(/\[\[([\s\S]*?)\]\]/g, '<mark>$1</mark>');
      out.innerHTML = v.r;
    }
    S.seg(seg, function (v) { show(+v); });
    show(0);
  };

  // 模板填空器：填几个空，生成可复制的文本
  // o = {fields: [{k, t, ph, area}], render: function(vals) -> 文本, title}
  EV.tpl = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ev-tpl');
    var form = h('div', { class: 'ev-f' }, root);
    var vals = {};
    var inputs = o.fields.map(function (f) {
      var lb = h('label', null, form);
      h('span', { text: f.t }, lb);
      var inp = h(f.area ? 'textarea' : 'input', { placeholder: f.ph || '', rows: f.area ? '2' : null }, lb);
      if (f.v) inp.value = f.v;
      inp.addEventListener('input', upd);
      return [f.k, inp, f.ph];
    });
    var bar = h('div', { class: 'btnrow' }, root);
    var ex = h('button', { class: 'btn', type: 'button', text: '填入示例' }, bar);
    var cp = h('button', { class: 'btn pri', type: 'button', text: '复制结果' }, bar);
    var pre = h('pre', { class: 'ev-p' }, root);
    function upd() {
      inputs.forEach(function (x) { vals[x[0]] = x[1].value.trim() || '【' + (x[2] || x[0]) + '】'; });
      pre.textContent = o.render(vals);
    }
    ex.addEventListener('click', function () { inputs.forEach(function (x) { x[1].value = x[2] || ''; }); upd(); });
    cp.addEventListener('click', function () { copyText(pre.textContent, cp); });
    upd();
  };

  // 请求流：一排节点，逐步点亮“谁把什么交给谁”
  // o = {nodes: [{k, t, sub}], steps: [{a, b, m: 消息, d: 说明 html}]}
  EV.flow = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ev-flow');
    var ctl = h('div', null, root);
    var row = h('div', { class: 'ev-nodes', style: 'grid-template-columns:repeat(' + o.nodes.length + ',minmax(0,1fr))' }, root);
    var idx = {};
    o.nodes.forEach(function (n, i) {
      idx[n.k] = i;
      h('div', { class: 'ev-node', html: '<b>' + n.t + '</b>' + (n.sub ? '<small>' + n.sub + '</small>' : '') }, row);
    });
    var lane = h('div', { class: 'ev-lane' }, root);
    var info = h('div', { class: 'hb-info', 'aria-live': 'polite', style: 'margin-top:10px' }, root);
    var els = $$('.ev-node', row);
    S.stepper(ctl, o.steps.length, function (i) {
      var s = o.steps[i], a = idx[s.a], b = idx[s.b];
      els.forEach(function (e, k) { e.classList.toggle('on', k === a || k === b); e.classList.toggle('src', k === a); });
      var lo = Math.min(a, b), hi = Math.max(a, b), n = o.nodes.length;
      lane.innerHTML = '';
      var bar = h('div', { class: 'ev-arrow' + (b < a ? ' back' : '') + (a === b ? ' self' : ''), style: 'left:' + ((lo + 0.5) / n * 100) + '%;width:' + (Math.max(hi - lo, 0) / n * 100) + '%' }, lane);
      h('span', { text: s.m }, bar);
      info.innerHTML = '<b>' + o.nodes[a].t + (a === b ? ' 内部' : ' → ' + o.nodes[b].t) + '</b><span class="hb-tag">' + s.m + '</span><p>' + s.d + '</p>';
    });
  };

  // 动手清单：勾选状态只存在本机浏览器；总览页按 key 汇总进度
  // items = [{t, d}]
  EV.todo = function (root, key, items, title) {
    root.innerHTML = '';
    root.classList.add('ev-todo');
    h('h3', { text: title || '动手清单' }, root);
    h('p', { class: 'note', style: 'margin-top:0', text: '勾选记录只保存在你这台机器的浏览器里，系列总览页会汇总进度。' }, root);
    var k = 'easyvibe-todo-' + key, saved = {};
    try { saved = JSON.parse(S.store.get(k) || '{}') || {}; } catch (e) { saved = {}; }
    var ol = h('ol', null, root);
    items.forEach(function (it, i) {
      var li = h('li', null, ol);
      var lb = h('label', null, li);
      var cb = h('input', { type: 'checkbox' }, lb);
      cb.checked = !!saved[i];
      li.classList.toggle('done', cb.checked);
      h('span', { html: '<b>' + it.t + '</b>' + (it.d ? '<small>' + it.d + '</small>' : '') }, lb);
      cb.addEventListener('change', function () {
        saved[i] = cb.checked; saved.n = items.length; li.classList.toggle('done', cb.checked);
        S.store.set(k, JSON.stringify(saved));
      });
    });
    saved.n = items.length;
  };

  // 打分器：给一个方案在几个维度上打分，实时给结论
  // o = {dims: [{k, t, lo, hi}], verdict: function(vals) -> html, max: 5}
  EV.score = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ev-score');
    var max = o.max || 5, vals = {};
    var box = h('div', { class: 'ev-dims' }, root);
    var out = h('div', { class: 'hb-out', 'aria-live': 'polite' }, root);
    o.dims.forEach(function (d) {
      var row = h('div', { class: 'ev-dim' }, box);
      h('p', { html: '<b>' + d.t + '</b>' + (d.lo ? '<small>1 = ' + d.lo + '；' + max + ' = ' + d.hi + '</small>' : '') }, row);
      var seg = h('div', { class: 'seg' }, row);
      for (var i = 1; i <= max; i++) h('button', { 'data-v': String(i), text: String(i), 'aria-pressed': i === (d.v || 3) ? 'true' : 'false' }, seg);
      vals[d.k] = d.v || 3;
      S.seg(seg, function (v) { vals[d.k] = +v; upd(); });
    });
    function upd() { out.innerHTML = o.verdict(vals); }
    upd();
    return { vals: vals, upd: upd };
  };

  window.EV = EV;
})();
