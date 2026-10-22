// AI Agent Handbook 学习系列专用组件（只在本系列页面加载，依赖 series.js 的 S）
(function () {
  'use strict';
  var HB = {};
  var h = S.h, $$ = S.$$;

  // 分层架构图：点组件看说明
  // o = {layers: [{t, sub, cls, items: [{t, d, tag}]}], hint}
  HB.layers = function (root, o) {
    root.innerHTML = '';
    root.classList.add('hb-layers');
    var info = null, cur = null;
    o.layers.forEach(function (L, li) {
      var row = h('div', { class: 'hb-layer ' + (L.cls || '') }, root);
      var hd = h('div', { class: 'hb-lh' }, row);
      h('b', { text: L.t }, hd);
      if (L.sub) h('small', { text: L.sub }, hd);
      var box = h('div', { class: 'hb-li' }, row);
      L.items.forEach(function (it) {
        var b = h('button', { type: 'button', class: 'hb-chip', html: it.t }, box);
        b.addEventListener('click', function () {
          if (cur) cur.setAttribute('aria-pressed', 'false');
          b.setAttribute('aria-pressed', 'true'); cur = b;
          info.innerHTML = '<b>' + it.t + '</b><span class="hb-tag">' + L.t + '</span>' + (it.tag ? '<span class="hb-tag alt">' + it.tag + '</span>' : '') + '<p>' + it.d + '</p>';
        });
      });
      void li;
    });
    info = h('div', { class: 'hb-info', 'aria-live': 'polite', html: '<p>' + (o.hint || '点一个组件，看它负责什么。') + '</p>' }, root);
  };

  // 对照翻牌：先看左列，自己想右列，再点开
  // o = {a, b, rows: [[维度, A, B]], hint}
  HB.vs = function (root, o) {
    root.innerHTML = '';
    var top = h('div', { class: 'btnrow' }, root);
    var all = h('button', { class: 'btn', type: 'button', text: '全部翻开' }, top);
    h('span', { class: 'note', style: 'margin:0', text: o.hint || '先想一想右列会怎么写，再点格子翻开。' }, top);
    var wrap = h('div', { class: 'tblw' }, root);
    var t = h('table', { class: 'cmpt hb-vs' }, wrap);
    var hr = h('tr', null, t);
    h('th', { text: o.k || '维度' }, hr); h('th', { html: o.a }, hr); h('th', { html: o.b }, hr);
    var cells = [];
    o.rows.forEach(function (r) {
      var tr = h('tr', null, t);
      h('td', { html: r[0] }, tr); h('td', { html: r[1] }, tr);
      var td = h('td', { class: 'hb-hide', tabindex: '0', html: '<span>' + r[2] + '</span>' }, tr);
      function flip() { td.classList.remove('hb-hide'); }
      td.addEventListener('click', flip);
      td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      cells.push(td);
    });
    var open = false;
    all.addEventListener('click', function () {
      open = !open;
      cells.forEach(function (c) { c.classList.toggle('hb-hide', !open); });
      all.textContent = open ? '全部盖上' : '全部翻开';
    });
  };

  // 缺失检查表：勾掉某项能力，看会出什么问题
  // o = {items: [{t, d, miss}], verdict: function(onCount, total, offList) -> html, title}
  HB.check = function (root, o) {
    root.innerHTML = '';
    var list = h('div', { class: 'hb-check' }, root);
    var out = h('div', { class: 'hb-out', 'aria-live': 'polite' }, root);
    var boxes = [];
    o.items.forEach(function (it, i) {
      var lb = h('label', { class: 'hb-ci' }, list);
      var cb = h('input', { type: 'checkbox' }, lb);
      cb.checked = it.on !== false;
      h('span', { html: '<b>' + it.t + '</b>' + (it.d ? '<small>' + it.d + '</small>' : '') }, lb);
      cb.addEventListener('change', upd);
      boxes.push(cb);
      void i;
    });
    function upd() {
      var off = [];
      boxes.forEach(function (b, i) { b.parentNode.classList.toggle('off', !b.checked); if (!b.checked) off.push(o.items[i]); });
      var html = o.verdict ? o.verdict(boxes.length - off.length, boxes.length, off) : '';
      if (off.length) html += '<ul class="hb-miss">' + off.map(function (x) { return '<li><b>缺 ' + x.t + '：</b>' + x.miss + '</li>'; }).join('') + '</ul>';
      out.innerHTML = html;
    }
    upd();
    return { set: function (arr) { boxes.forEach(function (b, i) { b.checked = arr[i]; }); upd(); } };
  };

  // 问答式选型：每题一组按钮，答完实时给结论
  // o = {qs: [{id, q, opts: [[值, 标签]]}], decide: function(ans) -> html}
  HB.decide = function (root, o) {
    root.innerHTML = '';
    var ans = {};
    var qbox = h('div', { class: 'hb-qs' }, root);
    var out = h('div', { class: 'hb-out', 'aria-live': 'polite' }, root);
    o.qs.forEach(function (q) {
      var row = h('div', { class: 'hb-q' }, qbox);
      h('p', { html: q.q }, row);
      var seg = h('div', { class: 'seg' }, row);
      q.opts.forEach(function (op) {
        var b = h('button', { 'data-v': op[0], html: op[1] }, seg);
        if (q.def === op[0]) { b.setAttribute('aria-pressed', 'true'); ans[q.id] = op[0]; }
      });
      S.seg(seg, function (v) { ans[q.id] = v; upd(); });
    });
    function upd() { out.innerHTML = o.decide(ans); }
    upd();
    return { ans: ans, upd: upd };
  };

  // 流程走查：逐步点亮，每步可以“拿掉”，看后果
  // o = {steps: [{t, d, miss}], intro}
  HB.pipe = function (root, o) {
    root.innerHTML = '';
    var ol = h('ol', { class: 'hb-pipe' }, root);
    var out = h('div', { class: 'hb-out', 'aria-live': 'polite' }, root);
    var on = o.steps.map(function () { return true; });
    var lis = o.steps.map(function (s, i) {
      var li = h('li', null, ol);
      h('div', { class: 'hb-pt', html: '<b>' + s.t + '</b><small>' + s.d + '</small>' }, li);
      var b = h('button', { class: 'btn', type: 'button', text: '拿掉' }, li);
      b.addEventListener('click', function () { on[i] = !on[i]; b.textContent = on[i] ? '拿掉' : '放回'; upd(); });
      return li;
    });
    function upd() {
      var off = [];
      lis.forEach(function (li, i) { li.classList.toggle('off', !on[i]); if (!on[i]) off.push(o.steps[i]); });
      out.innerHTML = off.length ? '<ul class="hb-miss">' + off.map(function (x) { return '<li><b>没有「' + x.t + '」：</b>' + x.miss + '</li>'; }).join('') + '</ul>'
        : '<p>' + (o.intro || '每一环都在。试着拿掉一环，看会发生什么。') + '</p>';
    }
    upd();
  };

  // 场景判定：每张卡选一个答案，给出解释（S.quiz 的卡片版，选项一致时更紧凑）
  // o = {opts: [标签], items: [{t, a: 下标, why}]}
  HB.cards = function (root, o) {
    root.innerHTML = '';
    var g = h('div', { class: 'hb-cards' }, root);
    var score = h('p', { class: 'note' }, root);
    var done = 0, right = 0;
    o.items.forEach(function (it) {
      var c = h('div', { class: 'hb-card' }, g);
      h('p', { class: 'hb-ct', html: it.t }, c);
      var ops = h('div', { class: 'opts' }, c);
      var fb = h('p', { class: 'hb-fb', 'aria-live': 'polite' }, c);
      var answered = false;
      o.opts.forEach(function (t, i) {
        var b = h('button', { class: 'opt', type: 'button', html: t }, ops);
        b.addEventListener('click', function () {
          $$('.opt', ops).forEach(function (x) { x.classList.remove('right', 'wrong'); });
          var ok = i === it.a;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) $$('.opt', ops)[it.a].classList.add('right');
          fb.innerHTML = '<b class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '对。' : '应是「' + o.opts[it.a] + '」。') + '</b>' + it.why;
          if (!answered) { answered = true; done++; if (ok) right++; score.textContent = '已答 ' + done + ' / ' + o.items.length + '，第一次就答对 ' + right + ' 个。'; }
        });
      });
    });
  };

  window.HB = HB;
})();
