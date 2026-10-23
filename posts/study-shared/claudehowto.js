// Claude How To 学习系列专用组件（只在本系列页面加载，依赖 series.js 的 S）
(function () {
  'use strict';
  var CH = {};
  var h = S.h, $$ = S.$$;

  // 分层架构图：点组件看说明
  // o = {layers: [{t, sub, cls, items: [{t, d, tag}]}], hint}
  CH.layers = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ch-layers');
    var info = null, cur = null;
    o.layers.forEach(function (L, li) {
      var row = h('div', { class: 'ch-layer ' + (L.cls || '') }, root);
      var hd = h('div', { class: 'ch-lh' }, row);
      h('b', { text: L.t }, hd);
      if (L.sub) h('small', { text: L.sub }, hd);
      var box = h('div', { class: 'ch-li' }, row);
      L.items.forEach(function (it) {
        var b = h('button', { type: 'button', class: 'ch-chip', html: it.t }, box);
        b.addEventListener('click', function () {
          if (cur) cur.setAttribute('aria-pressed', 'false');
          b.setAttribute('aria-pressed', 'true'); cur = b;
          info.innerHTML = '<b>' + it.t + '</b><span class="ch-tag">' + L.t + '</span>' + (it.tag ? '<span class="ch-tag alt">' + it.tag + '</span>' : '') + '<p>' + it.d + '</p>';
        });
      });
      void li;
    });
    info = h('div', { class: 'ch-info', 'aria-live': 'polite', html: '<p>' + (o.hint || '点一个组件，看它负责什么。') + '</p>' }, root);
  };

  // 对照翻牌：先看左列，自己想右列，再点开
  // o = {a, b, rows: [[维度, A, B]], hint}
  CH.vs = function (root, o) {
    root.innerHTML = '';
    var top = h('div', { class: 'btnrow' }, root);
    var all = h('button', { class: 'btn', type: 'button', text: '全部翻开' }, top);
    h('span', { class: 'note', style: 'margin:0', text: o.hint || '先想一想右列会怎么写，再点格子翻开。' }, top);
    var wrap = h('div', { class: 'tblw' }, root);
    var t = h('table', { class: 'cmpt ch-vs' }, wrap);
    var hr = h('tr', null, t);
    h('th', { text: o.k || '维度' }, hr); h('th', { html: o.a }, hr); h('th', { html: o.b }, hr);
    var cells = [];
    o.rows.forEach(function (r) {
      var tr = h('tr', null, t);
      h('td', { html: r[0] }, tr); h('td', { html: r[1] }, tr);
      var td = h('td', { class: 'ch-hide', tabindex: '0', html: '<span>' + r[2] + '</span>' }, tr);
      function flip() { td.classList.remove('ch-hide'); }
      td.addEventListener('click', flip);
      td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      cells.push(td);
    });
    var open = false;
    all.addEventListener('click', function () {
      open = !open;
      cells.forEach(function (c) { c.classList.toggle('ch-hide', !open); });
      all.textContent = open ? '全部盖上' : '全部翻开';
    });
  };

  // 缺失检查表：勾掉某项能力，看会出什么问题
  // o = {items: [{t, d, miss}], verdict: function(onCount, total, offList) -> html, title}
  CH.check = function (root, o) {
    root.innerHTML = '';
    var list = h('div', { class: 'ch-check' }, root);
    var out = h('div', { class: 'ch-out', 'aria-live': 'polite' }, root);
    var boxes = [];
    o.items.forEach(function (it, i) {
      var lb = h('label', { class: 'ch-ci' }, list);
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
      if (off.length) html += '<ul class="ch-miss">' + off.map(function (x) { return '<li><b>缺 ' + x.t + '：</b>' + x.miss + '</li>'; }).join('') + '</ul>';
      out.innerHTML = html;
    }
    upd();
    return { set: function (arr) { boxes.forEach(function (b, i) { b.checked = arr[i]; }); upd(); } };
  };

  // 问答式选型：每题一组按钮，答完实时给结论
  // o = {qs: [{id, q, opts: [[值, 标签]]}], decide: function(ans) -> html}
  CH.decide = function (root, o) {
    root.innerHTML = '';
    var ans = {};
    var qbox = h('div', { class: 'ch-qs' }, root);
    var out = h('div', { class: 'ch-out', 'aria-live': 'polite' }, root);
    o.qs.forEach(function (q) {
      var row = h('div', { class: 'ch-q' }, qbox);
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
  CH.pipe = function (root, o) {
    root.innerHTML = '';
    var ol = h('ol', { class: 'ch-pipe' }, root);
    var out = h('div', { class: 'ch-out', 'aria-live': 'polite' }, root);
    var on = o.steps.map(function () { return true; });
    var lis = o.steps.map(function (s, i) {
      var li = h('li', null, ol);
      h('div', { class: 'ch-pt', html: '<b>' + s.t + '</b><small>' + s.d + '</small>' }, li);
      var b = h('button', { class: 'btn', type: 'button', text: '拿掉' }, li);
      b.addEventListener('click', function () { on[i] = !on[i]; b.textContent = on[i] ? '拿掉' : '放回'; upd(); });
      return li;
    });
    function upd() {
      var off = [];
      lis.forEach(function (li, i) { li.classList.toggle('off', !on[i]); if (!on[i]) off.push(o.steps[i]); });
      out.innerHTML = off.length ? '<ul class="ch-miss">' + off.map(function (x) { return '<li><b>没有「' + x.t + '」：</b>' + x.miss + '</li>'; }).join('') + '</ul>'
        : '<p>' + (o.intro || '每一环都在。试着拿掉一环，看会发生什么。') + '</p>';
    }
    upd();
  };

  // 场景判定：每张卡选一个答案，给出解释（S.quiz 的卡片版，选项一致时更紧凑）
  // o = {opts: [标签], items: [{t, a: 下标, why}]}
  CH.cards = function (root, o) {
    root.innerHTML = '';
    var g = h('div', { class: 'ch-cards' }, root);
    var score = h('p', { class: 'note' }, root);
    var done = 0, right = 0;
    o.items.forEach(function (it) {
      var c = h('div', { class: 'ch-card' }, g);
      h('p', { class: 'ch-ct', html: it.t }, c);
      var ops = h('div', { class: 'opts' }, c);
      var fb = h('p', { class: 'ch-fb', 'aria-live': 'polite' }, c);
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


  // ---------- 以下为本系列新增组件 ----------

  // 带路径标题的配置块：返回 HTML 字符串。code 需已转义
  CH.file = function (path, code, note) {
    return '<div class="ch-file"><div class="ch-fp"><span>' + path + '</span>' + (note ? '<em>' + note + '</em>' : '') + '</div><pre>' + code + '</pre></div>';
  };
  CH.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  // 读配置猜行为：qs = [{path, code(未转义), q, opts:[…], a, why}]
  // 一题一页，顶部是题号按钮；先选再看解释
  CH.cfg = function (root, qs) {
    root.innerHTML = '';
    root.classList.add('ch-cfg');
    var tabs = h('div', { class: 'ch-tabs', role: 'tablist' }, root);
    var body = h('div', null, root);
    var score = h('p', { class: 'note' }, root);
    var state = qs.map(function () { return null; });
    var cur = 0;
    var tbs = qs.map(function (q, i) {
      var b = h('button', { type: 'button', class: 'ch-tab', text: '第 ' + (i + 1) + ' 段' }, tabs);
      b.addEventListener('click', function () { show(i); });
      return b;
    });
    function tally() {
      var done = state.filter(function (x) { return x !== null; }).length;
      var ok = state.filter(function (x) { return x === true; }).length;
      score.textContent = '已猜 ' + done + ' / ' + qs.length + '，第一次就猜对 ' + ok + ' 个。';
    }
    function show(i) {
      cur = i;
      tbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); b.classList.toggle('ok', state[k] === true); b.classList.toggle('bad', state[k] === false); });
      var q = qs[i];
      body.innerHTML = CH.file(q.path, CH.esc(q.code), q.note);
      h('p', { class: 'ch-q', html: '<b>先猜：</b>' + q.q }, body);
      var ops = h('div', { class: 'opts' }, body);
      var fb = h('div', { class: 'ch-fb2', 'aria-live': 'polite' }, body);
      q.opts.forEach(function (t, k) {
        var b = h('button', { class: 'opt', type: 'button', html: t }, ops);
        b.addEventListener('click', function () {
          $$('.opt', ops).forEach(function (x) { x.classList.remove('right', 'wrong'); });
          var ok = k === q.a;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) $$('.opt', ops)[q.a].classList.add('right');
          if (state[i] === null) { state[i] = ok; tally(); }
          tbs[i].classList.toggle('ok', state[i] === true); tbs[i].classList.toggle('bad', state[i] === false);
          fb.innerHTML = '<p><b class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '猜对了。' : '答案是「' + q.opts[q.a].replace(/<[^>]+>/g, '') + '」。') + '</b>' + q.why + '</p>' +
            (i < qs.length - 1 ? '' : '<p class="note">这是最后一段。</p>');
          if (i < qs.length - 1) {
            var nx = h('button', { class: 'btn', type: 'button', text: '下一段' }, fb);
            nx.addEventListener('click', function () { show(i + 1); });
          }
        });
      });
    }
    tally();
    show(0);
  };

  // 终端回放：steps = [{cmd, out, note}]；一步步把命令和输出“打”出来
  CH.term = function (root, steps, labels) {
    root.innerHTML = '';
    var ctl = h('div', null, root);
    var scr = h('pre', { class: 'ch-term', 'aria-live': 'polite' }, root);
    var note = h('div', { class: 'ch-info', style: 'margin-top:10px' }, root);
    S.stepper(ctl, steps.length, function (i) {
      var html = '';
      for (var k = 0; k <= i; k++) {
        var s = steps[k];
        var cls = k === i ? ' class="cur"' : '';
        if (s.cmd) html += '<span' + cls + '><i class="pr">' + (s.p || '$') + '</i> ' + CH.esc(s.cmd) + '</span>\n';
        if (s.out) html += '<span class="o' + (k === i ? ' cur' : '') + '">' + CH.esc(s.out) + '</span>\n';
      }
      scr.innerHTML = html;
      scr.scrollTop = scr.scrollHeight;
      note.innerHTML = steps[i].note || '';
    }, labels);
  };

  // 今天就能试：带勾选的清单，勾选状态只存在本机浏览器
  // items = [{t, d}]
  CH.tryNow = function (root, key, items) {
    root.innerHTML = '';
    root.classList.add('ch-try');
    h('h3', { text: '今天就能在自己项目里试' }, root);
    h('p', { class: 'note', style: 'margin-top:0', text: '勾选记录只保存在你这台机器的浏览器里。' }, root);
    var k = 'claudehowto-try-' + key, saved = {};
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
        saved[i] = cb.checked; li.classList.toggle('done', cb.checked);
        S.store.set(k, JSON.stringify(saved));
      });
    });
  };

  // 上下文账本：rows = [{t, v(示意 token 数), cls: 'always'|'demand'|'iso', d}]
  // 画成一条横向堆叠条 + 图例列表；返回 draw(rows)
  CH.ledger = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ch-ledger');
    var bar = h('div', { class: 'ch-lbar' }, root);
    var tot = h('p', { class: 'note' }, root);
    var list = h('div', { class: 'ch-llist' }, root);
    function draw(rows) {
      bar.innerHTML = ''; list.innerHTML = '';
      var inMain = rows.filter(function (r) { return r.cls !== 'iso' && r.on !== false; });
      var sum = inMain.reduce(function (a, r) { return a + r.v; }, 0);
      var cap = o.cap || Math.max(sum, 1);
      inMain.forEach(function (r) {
        h('span', { class: 'seg ' + r.cls, style: 'width:' + Math.max(0.6, r.v / cap * 100) + '%', title: r.t }, bar);
      });
      rows.forEach(function (r) {
        var d = h('div', { class: 'it ' + r.cls + (r.on === false ? ' off' : '') }, list);
        d.innerHTML = '<i></i><b>' + r.t + '</b><span class="n">' + (r.on === false ? '未加载' : (r.cls === 'iso' ? (r.tag || '另开窗口') + ' ' : '') + '约 ' + r.v.toLocaleString() + ' tokens') + '</span><small>' + (r.d || '') + '</small>';
      });
      tot.innerHTML = (o.label || '主对话里常驻 + 已加载') + '：约 <b>' + sum.toLocaleString() + '</b> tokens' + (o.cap ? '（条长按 ' + o.cap.toLocaleString() + ' 计）' : '') + '。数值为示意。';
    }
    return draw;
  };

  window.CH = CH;
})();
