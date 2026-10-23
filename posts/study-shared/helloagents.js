// Hello-Agents 学习系列专用组件（只在本系列页面加载，依赖 series.js 的 S）
(function () {
  'use strict';
  var HA = {};
  var h = S.h, $$ = S.$$;
  var IV_KEY = 'helloagents-iv';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // 极简 Python 着色：注释、字符串、关键字
  function hl(line) {
    var out = '', i = 0, m;
    var re = /(#.*$)|("""|'''|f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|\b(def|class|return|for|in|if|elif|else|while|import|from|as|try|except|with|break|continue|not|and|or|None|True|False|self|lambda|yield|async|await|pass)\b/g;
    while ((m = re.exec(line))) {
      out += esc(line.slice(i, m.index));
      if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
      else out += '<span class="k">' + esc(m[3]) + '</span>';
      i = re.lastIndex;
    }
    return out + esc(line.slice(i));
  }
  HA.hl = hl;

  // 代码 + 运行状态逐步走读
  // o = {code: '多行源码', title, steps: [{l: [行号…] 或 [起, 止] 用 '-' 字符串 '3-8', t: 步骤名, s: 右栏 html}]}
  HA.trace = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ha-trace');
    var lines = o.code.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
    var grid = h('div', { class: 'ha-tg' }, root);
    var pre = h('pre', { class: 'ha-code' }, grid);
    var rows = lines.map(function (ln, i) {
      return h('span', { class: 'ln', html: '<i>' + (i + 1) + '</i>' + (hl(ln) || ' ') }, pre);
    });
    var side = h('div', { class: 'ha-state', 'aria-live': 'polite' }, grid);
    function parse(l) {
      var set = {};
      (l || []).forEach(function (x) {
        var p = String(x).split('-');
        for (var k = +p[0]; k <= +(p[1] || p[0]); k++) set[k] = 1;
      });
      return set;
    }
    var stepBox = h('div', null, root);
    root.insertBefore(stepBox, grid);
    S.stepper(stepBox, o.steps.length, function (i) {
      var st = o.steps[i], set = parse(st.l), first = null;
      rows.forEach(function (r, k) { var on = !!set[k + 1]; r.classList.toggle('on', on); if (on && first === null) first = r; });
      side.innerHTML = st.s;
      if (first && pre.scrollHeight > pre.clientHeight) pre.scrollTop = Math.max(0, first.offsetTop - pre.offsetTop - 40);
    }, o.steps.map(function (s) { return s.t; }));
  };

  // 代码填空：源码里用 [[答案]] 标出要回忆的部分
  HA.blank = function (root, o) {
    root.innerHTML = '';
    root.classList.add('ha-blank');
    var top = h('div', { class: 'btnrow' }, root);
    var all = h('button', { class: 'btn', type: 'button', text: '全部揭晓' }, top);
    h('span', { class: 'note', style: 'margin:0', text: o.hint || '先想想空格里该写什么，再点开核对。' }, top);
    var pre = h('pre', { class: 'ha-code' }, root);
    var code = o.code.replace(/^\n/, '').replace(/\s+$/, '');
    var parts = code.split(/\[\[([\s\S]*?)\]\](?!\])/);
    var html = '';
    parts.forEach(function (p, i) {
      if (i % 2) html += '<button type="button" class="ha-b" data-a="' + esc(p).replace(/"/g, '&quot;') + '" style="min-width:' + Math.max(3, p.length * 0.62) + 'em">？</button>';
      else html += p.split('\n').map(hl).join('\n');
    });
    pre.innerHTML = html;
    var bs = $$('.ha-b', pre);
    function show(b, on) { b.classList.toggle('open', on); b.innerHTML = on ? b.getAttribute('data-a') : '？'; }
    bs.forEach(function (b) { b.addEventListener('click', function () { show(b, !b.classList.contains('open')); }); });
    var open = false;
    all.addEventListener('click', function () {
      open = !open;
      bs.forEach(function (b) { show(b, open); });
      all.textContent = open ? '全部盖上' : '全部揭晓';
    });
  };

  // 面试题演练：页面里的 <div class="iv" data-id> 结构，增强成“先答再看 + 自评”
  function ivGet() { try { var o = JSON.parse(S.store.get(IV_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function ivSet(id, v) { var o = ivGet(); if (v) o[id] = v; else delete o[id]; S.store.set(IV_KEY, JSON.stringify(o)); }
  HA.ivGet = ivGet;
  HA.ivSet = ivSet;
  HA.interview = function (scope) {
    var marks = ivGet();
    $$('.iv', scope || document).forEach(function (card) {
      if (card.getAttribute('data-ready')) return;
      card.setAttribute('data-ready', '1');
      var id = card.getAttribute('data-id');
      var ans = card.querySelector('.iv-a');
      ans.hidden = true;
      var bar = h('div', { class: 'iv-bar' }, card);
      var open = h('button', { class: 'btn pri', type: 'button', text: '先在心里答一遍，再看要点' }, bar);
      var seg = h('div', { class: 'seg iv-rate' }, bar);
      [['ok', '能讲清'], ['fuzzy', '有点模糊'], ['no', '讲不出']].forEach(function (x) {
        var b = h('button', { 'data-v': x[0], text: x[1] }, seg);
        b.setAttribute('aria-pressed', marks[id] === x[0] ? 'true' : 'false');
      });
      S.seg(seg, function (v) { ivSet(id, v); card.setAttribute('data-mark', v); });
      if (marks[id]) card.setAttribute('data-mark', marks[id]);
      open.addEventListener('click', function () {
        ans.hidden = !ans.hidden;
        open.textContent = ans.hidden ? '先在心里答一遍，再看要点' : '收起要点';
      });
    });
  };

  // 消息列表（上下文 / 提示词拼装演示）：items = [{r: 'sys'|'user'|'asst'|'tool'|'mem'|'rag', b: 标题, t: html, tok: 数字}]
  HA.ctx = function (root, items, opt) {
    opt = opt || {};
    root.innerHTML = '';
    root.classList.add('ha-ctx');
    var total = 0;
    items.forEach(function (m) {
      total += m.tok || 0;
      h('div', { class: 'ha-m ' + m.r + (m.off ? ' off' : ''), html: '<b>' + m.b + (m.tok ? '<small>' + m.tok + ' tok</small>' : '') + '</b><div>' + m.t + '</div>' }, root);
    });
    if (opt.budget) {
      var p = h('div', { class: 'ha-budget' }, root);
      var used = Math.min(1, total / opt.budget);
      h('span', { class: 'bar' + (total > opt.budget ? ' over' : ''), style: 'width:' + used * 100 + '%' }, h('span', { class: 'track' }, p));
      h('span', { class: 'txt', text: '合计约 ' + total + ' / ' + opt.budget + ' tok' + (total > opt.budget ? '（超出预算）' : '') }, p);
    }
  };

  document.addEventListener('DOMContentLoaded', function () { HA.interview(document); });
  window.HA = HA;
})();
