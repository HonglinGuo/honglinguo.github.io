// 《强化学习的数学原理》学习系列（rlmath-series）专用：网格世界环境、动态规划/采样算法与 SVG 绘图。
// 只被 rlmath 系列页面引用，依赖 series.js 里的 S。约定与原书一致：
//   动作 a1..a5 = 上、右、下、左、原地；撞边界弹回原格并得 r_boundary；
//   禁区可以进入但得 r_forbidden；进入（或停在）目标得 r_target；其余 r_other。
(function () {
  'use strict';
  var S = window.S;
  var RL = {};
  RL.ACT = [[-1, 0], [0, 1], [1, 0], [0, -1], [0, 0]];
  RL.AN = ['↑', '→', '↓', '←', '○'];
  RL.ANAME = ['上', '右', '下', '左', '原地'];

  // ---------- 环境 ----------
  // o = {rows, cols, forbid:[[r,c]] (0 起), target:[[r,c]], rb, rf, rt, ro, gamma, terminal, slip}
  RL.env = function (o) {
    var E = {
      rows: o.rows, cols: o.cols, n: o.rows * o.cols,
      rb: o.rb == null ? -1 : o.rb, rf: o.rf == null ? -1 : o.rf, rt: o.rt == null ? 1 : o.rt, ro: o.ro || 0,
      gamma: o.gamma == null ? 0.9 : o.gamma, terminal: !!o.terminal, slip: o.slip || 0, type: []
    };
    for (var i = 0; i < E.n; i++) E.type.push('n');
    (o.forbid || []).forEach(function (p) { E.type[p[0] * E.cols + p[1]] = 'f'; });
    (o.target || []).forEach(function (p) { E.type[p[0] * E.cols + p[1]] = 't'; });
    E.idx = function (r, c) { return r * E.cols + c; };
    E.rc = function (s) { return [Math.floor(s / E.cols), s % E.cols]; };
    E.label = function (s) { var p = E.rc(s); return '(' + (p[0] + 1) + ',' + (p[1] + 1) + ')'; };
    E.isT = function (s) { return E.type[s] === 't'; };
    // 确定性的一步
    E.move = function (s, a) {
      var p = E.rc(s), r = p[0] + RL.ACT[a][0], c = p[1] + RL.ACT[a][1];
      if (r < 0 || c < 0 || r >= E.rows || c >= E.cols) return [s, E.rb];
      var s2 = E.idx(r, c), t = E.type[s2];
      return [s2, t === 'f' ? E.rf : t === 't' ? E.rt : E.ro];
    };
    // 模型：[[概率, s′, r]]
    E.trans = function (s, a) {
      if (E.terminal && E.isT(s)) return [[1, s, 0]];
      if (!E.slip) { var m = E.move(s, a); return [[1, m[0], m[1]]]; }
      var out = [], mm = E.move(s, a);
      out.push([1 - E.slip, mm[0], mm[1]]);
      for (var b = 0; b < 5; b++) if (b !== a) { var x = E.move(s, b); out.push([E.slip / 4, x[0], x[1]]); }
      return out;
    };
    // 采样一步（与环境交互）
    E.sample = function (s, a, rnd) {
      var tr = E.trans(s, a), u = rnd(), acc = 0;
      for (var i = 0; i < tr.length; i++) { acc += tr[i][0]; if (u < acc) return [tr[i][1], tr[i][2]]; }
      var l = tr[tr.length - 1]; return [l[1], l[2]];
    };
    return E;
  };
  // 原书反复使用的 5×5 网格：禁区 (2,2)(2,3)(3,3)(4,2)(4,4)(5,2)，目标 (4,3)（行, 列，从 1 数）
  RL.BOOK5 = { rows: 5, cols: 5, forbid: [[1, 1], [1, 2], [2, 2], [3, 1], [3, 3], [4, 1]], target: [[3, 2]] };
  RL.book5 = function (o) {
    var c = {}, k;
    for (k in RL.BOOK5) c[k] = RL.BOOK5[k];
    for (k in (o || {})) c[k] = o[k];
    return RL.env(c);
  };

  // ---------- 策略 ----------
  RL.uniform = function (n) { var p = []; for (var i = 0; i < n; i++) p.push([0.2, 0.2, 0.2, 0.2, 0.2]); return p; };
  RL.det = function (acts) { return acts.map(function (a) { var r = [0, 0, 0, 0, 0]; r[a] = 1; return r; }); };
  RL.argmax = function (xs) { var b = 0; for (var i = 1; i < xs.length; i++) if (xs[i] > xs[b] + 1e-12) b = i; return b; };
  // 贪心 / ε-贪心（原书 5.4.1 的形式：最优动作 1 − ε(|A|−1)/|A|，其余 ε/|A|）
  RL.greedy = function (q, eps) {
    eps = eps || 0;
    return q.map(function (row) {
      var b = RL.argmax(row), p = [];
      for (var a = 0; a < 5; a++) p.push(a === b ? 1 - eps * 4 / 5 : eps / 5);
      return p;
    });
  };
  RL.sampleA = function (p, rnd) {
    var u = rnd(), acc = 0;
    for (var a = 0; a < 5; a++) { acc += p[a]; if (u < acc) return a; }
    return 4;
  };

  // ---------- 模型已知时的计算 ----------
  // q(s,a) = Σ p(s′,r|s,a)[r + γ v(s′)]
  RL.qFromV = function (E, v) {
    var q = [];
    for (var s = 0; s < E.n; s++) {
      var row = [];
      for (var a = 0; a < 5; a++) {
        var x = 0;
        E.trans(s, a).forEach(function (t) { x += t[0] * (t[2] + E.gamma * v[t[1]]); });
        row.push(x);
      }
      q.push(row);
    }
    return q;
  };
  RL.vFromQ = function (q, pi) { return q.map(function (row, s) { var x = 0; for (var a = 0; a < 5; a++) x += pi[s][a] * row[a]; return x; }); };
  // r_π 与 P_π
  RL.rP = function (E, pi) {
    var r = [], P = [];
    for (var s = 0; s < E.n; s++) {
      var rs = 0, row = new Array(E.n).fill(0);
      for (var a = 0; a < 5; a++) {
        if (!pi[s][a]) continue;
        E.trans(s, a).forEach(function (t) { rs += pi[s][a] * t[0] * t[2]; row[t[1]] += pi[s][a] * t[0]; });
      }
      r.push(rs); P.push(row);
    }
    return { r: r, P: P };
  };
  // 一次贝尔曼更新 v ← r_π + γ P_π v
  RL.bellman = function (E, pi, v) { return RL.vFromQ(RL.qFromV(E, v), pi); };
  // 迭代式策略评估 j 次
  RL.evalIter = function (E, pi, v0, j) {
    var v = v0 ? v0.slice() : new Array(E.n).fill(0);
    for (var k = 0; k < j; k++) v = RL.bellman(E, pi, v);
    return v;
  };
  // 线性方程组求解（高斯消元，部分主元）
  RL.solveLin = function (A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.slice().concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      var d = M[c][c];
      if (Math.abs(d) < 1e-14) continue;
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 === c) continue;
        var f = M[r2][c] / d;
        if (!f) continue;
        for (var k = c; k <= n; k++) M[r2][k] -= f * M[c][k];
      }
    }
    return M.map(function (r, i) { return r[n] / r[i]; });
  };
  // 闭式解 v_π = (I − γP_π)^{-1} r_π
  RL.evalExact = function (E, pi) {
    var m = RL.rP(E, pi), A = m.P.map(function (row, i) { return row.map(function (x, j) { return (i === j ? 1 : 0) - E.gamma * x; }); });
    return RL.solveLin(A, m.r);
  };
  // 值迭代：返回每一步的 {v, pi}（pi 是由 v_k 得到的贪心策略 π_{k+1}）
  RL.valueIter = function (E, K, v0) {
    var v = v0 ? v0.slice() : new Array(E.n).fill(0), hist = [{ v: v.slice(), pi: null }];
    for (var k = 0; k < K; k++) {
      var q = RL.qFromV(E, v), pi = RL.greedy(q);
      v = q.map(function (row) { return Math.max.apply(null, row); });
      hist.push({ v: v.slice(), pi: pi, q: q });
    }
    return hist;
  };
  RL.vStar = function (E) {
    var v = new Array(E.n).fill(0);
    for (var k = 0; k < 3000; k++) {
      var q = RL.qFromV(E, v), nv = q.map(function (row) { return Math.max.apply(null, row); });
      var d = 0; for (var i = 0; i < E.n; i++) d = Math.max(d, Math.abs(nv[i] - v[i]));
      v = nv; if (d < 1e-10) break;
    }
    return v;
  };
  RL.maxAbs = function (a, b) { var d = 0; for (var i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i])); return d; };
  RL.rmse = function (a, b) { var d = 0; for (var i = 0; i < a.length; i++) d += (a[i] - b[i]) * (a[i] - b[i]); return Math.sqrt(d / a.length); };
  // 并列最优的动作（用于显示“最优策略不唯一”）
  RL.ties = function (q, tol) {
    tol = tol || 1e-6;
    return q.map(function (row) {
      var m = Math.max.apply(null, row), c = row.filter(function (x) { return x > m - tol; }).length;
      return row.map(function (x) { return x > m - tol ? 1 / c : 0; });
    });
  };

  // ---------- 小工具 ----------
  RL.fmt = function (x, d) { return S.f(x, d == null ? 1 : d); };
  RL.sum = function (a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; };

  // 手算对答案：RL.check(root, {q, ans, tol, why, unit})
  RL.check = function (root, o) {
    root.classList.add('rl-check');
    root.innerHTML = '';
    S.h('p', { class: 'cq', html: o.q }, root);
    var row = S.h('div', { class: 'grow' }, root);
    var inp = S.h('input', { type: 'number', step: 'any', inputmode: 'decimal', 'aria-label': '你的答案', placeholder: o.hint || '你的答案' }, row);
    if (o.unit) S.h('span', { class: 'gu', text: o.unit }, row);
    var go = S.h('button', { class: 'btn pri', type: 'button', text: '对答案' }, row);
    var out = S.h('div', { class: 'cout', 'aria-live': 'polite' }, root);
    function reveal() {
      var g = parseFloat(inp.value), a = typeof o.ans === 'function' ? o.ans() : o.ans, tol = o.tol == null ? 0.051 : o.tol;
      var ok = isFinite(g) && Math.abs(g - a) <= tol;
      var html = '<p class="ca">答案：<b>' + S.f(a, o.d == null ? 2 : o.d) + '</b>' + (inp.value === '' ? '' : ok ? '　<span class="ok">你算对了。</span>' : '　<span class="bad">你填的是 ' + S.f(g, 2) + '，差 ' + S.f(g - a, 2) + '。</span>') + '</p>';
      if (o.why) html += '<p class="cw">' + (typeof o.why === 'function' ? o.why() : o.why) + '</p>';
      out.innerHTML = html;
    }
    go.addEventListener('click', reveal);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') reveal(); });
  };

  // ---------- 网格绘制 ----------
  // RL.grid(box, E, opt) 返回 draw(state)；state = {v, pi, path, agent, hl:{s:cls}, note:{s:文字}, showV, showPi}
  // opt = {cell(最大格宽), onCell(s), dec, heat:[lo,hi], labels(行列号), minCell}
  RL.grid = function (box, E, opt) {
    opt = opt || {};
    box.classList.add('rlg');
    var st = {};
    var render = S.fit(box, function (w) { return size(w).H; }, function (svg, w) { paint(svg, w); }, 200);
    function size(w) {
      var lab = opt.labels ? 22 : 0;
      var cs = Math.floor(Math.min(opt.cell || 76, (w - lab - 2) / E.cols));
      cs = Math.max(cs, opt.minCell || 44);
      return { cs: cs, lab: lab, H: lab + cs * E.rows + 2, W: lab + cs * E.cols + 2 };
    }
    function paint(svg, w) {
      var z = size(w), cs = z.cs, ox = z.lab + 1, oy = z.lab + 1;
      svg.setAttribute('width', Math.max(w, z.W)); svg.setAttribute('viewBox', '0 0 ' + Math.max(w, z.W) + ' ' + z.H);
      var v = st.v, pi = st.pi, dec = opt.dec == null ? 1 : opt.dec;
      var hlo = opt.heat ? opt.heat[0] : null, hhi = opt.heat ? opt.heat[1] : null;
      if (v && !opt.heat) {
        var mx = 0; v.forEach(function (x) { if (isFinite(x)) mx = Math.max(mx, Math.abs(x)); });
        hlo = -mx; hhi = mx;
      }
      var defs = S.svg('defs', null, svg);
      var pid = 'hz' + Math.random().toString(36).slice(2, 7);
      var pat = S.svg('pattern', { id: pid, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      S.svg('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'rlg-hz' }, pat);
      if (opt.labels) {
        for (var c0 = 0; c0 < E.cols; c0++) S.svg('text', { x: ox + c0 * cs + cs / 2, y: 16, 'text-anchor': 'middle', class: 'rlg-lab', text: c0 + 1 }, svg);
        for (var r0 = 0; r0 < E.rows; r0++) S.svg('text', { x: 8, y: oy + r0 * cs + cs / 2 + 5, 'text-anchor': 'middle', class: 'rlg-lab', text: r0 + 1 }, svg);
      }
      for (var s = 0; s < E.n; s++) {
        var p = E.rc(s), x = ox + p[1] * cs, y = oy + p[0] * cs, t = E.type[s];
        var g = S.svg('g', { class: 'rlg-c' + (opt.onCell ? ' clk' : ''), 'data-s': s }, svg);
        if (opt.onCell) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', '格子 ' + E.label(s)); }
        S.svg('rect', { x: x, y: y, width: cs, height: cs, class: 'rlg-bg' }, g);
        if (t === 'f') S.svg('rect', { x: x, y: y, width: cs, height: cs, class: 'rlg-f' }, g);
        if (t === 'f') S.svg('rect', { x: x, y: y, width: cs, height: cs, fill: 'url(#' + pid + ')' }, g);
        if (t === 't') S.svg('rect', { x: x, y: y, width: cs, height: cs, class: 'rlg-t' }, g);
        if (v && isFinite(v[s]) && st.showV !== false) {
          var a = v[s] >= 0 ? (hhi > 0 ? v[s] / hhi : 0) : (hlo < 0 ? v[s] / hlo : 0);
          a = S.clamp(a, 0, 1);
          if (a > 0.01) S.svg('rect', { x: x, y: y, width: cs, height: cs, class: v[s] >= 0 ? 'rlg-hp' : 'rlg-hn', 'fill-opacity': (0.08 + 0.42 * a).toFixed(3) }, g);
        }
        if (st.hl && st.hl[s]) S.svg('rect', { x: x + 2, y: y + 2, width: cs - 4, height: cs - 4, class: 'rlg-hl ' + st.hl[s] }, g);
        if (t === 't') S.svg('rect', { x: x + 1.5, y: y + 1.5, width: cs - 3, height: cs - 3, class: 'rlg-tb' }, g);
        var hasV = v && st.showV !== false && v[s] != null;
        if (hasV) S.svg('text', { x: x + cs / 2, y: y + (pi && st.showPi !== false ? 18 : cs / 2 + 6), 'text-anchor': 'middle', class: 'rlg-v', text: typeof v[s] === 'string' ? v[s] : RL.fmt(v[s], dec) }, g);
        if (st.note && st.note[s] != null) S.svg('text', { x: x + cs / 2, y: y + cs - 6, 'text-anchor': 'middle', class: 'rlg-note', text: st.note[s] }, g);
        if (pi && st.showPi !== false && pi[s]) {
          var cx = x + cs / 2, cy = y + (hasV ? cs / 2 + 9 : cs / 2), L = cs * (hasV ? 0.27 : 0.36);
          for (var k = 0; k < 5; k++) {
            var pr = pi[s][k];
            if (pr < 0.05) continue;
            if (k === 4) { S.svg('circle', { cx: cx, cy: cy, r: Math.max(3, L * (0.1 + 0.4 * pr)), class: 'rlg-stay' }, g); continue; }
            var len = L * (0.25 + 0.75 * pr), dx = RL.ACT[k][1], dy = RL.ACT[k][0];
            var ex = cx + dx * len, ey = cy + dy * len, hw = 4 + 2 * pr;
            S.svg('line', { x1: cx, y1: cy, x2: ex - dx * hw, y2: ey - dy * hw, class: 'rlg-ar', 'stroke-opacity': (0.35 + 0.65 * pr).toFixed(2) }, g);
            S.svg('path', { d: 'M' + ex + ' ' + ey + 'L' + (ex - dx * hw * 1.6 - dy * hw) + ' ' + (ey - dy * hw * 1.6 - dx * hw) + 'L' + (ex - dx * hw * 1.6 + dy * hw) + ' ' + (ey - dy * hw * 1.6 + dx * hw) + 'Z', class: 'rlg-ah', 'fill-opacity': (0.35 + 0.65 * pr).toFixed(2) }, g);
          }
        }
        if (opt.onCell) (function (s, g) {
          g.addEventListener('click', function () { opt.onCell(s); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.onCell(s); } });
        })(s, g);
      }
      // 网格线
      for (var i = 0; i <= E.rows; i++) S.svg('line', { x1: ox, x2: ox + E.cols * cs, y1: oy + i * cs, y2: oy + i * cs, class: 'rlg-ln' }, svg);
      for (var j = 0; j <= E.cols; j++) S.svg('line', { y1: oy, y2: oy + E.rows * cs, x1: ox + j * cs, x2: ox + j * cs, class: 'rlg-ln' }, svg);
      // 轨迹
      if (st.path && st.path.length > 1) {
        var pts = st.path.map(function (s, i) { var p = E.rc(s), jit = ((i * 7) % 5 - 2) * cs * 0.025; return [ox + p[1] * cs + cs / 2 + jit, oy + p[0] * cs + cs / 2 + jit]; });
        S.svg('path', { d: S.path(pts), class: 'rlg-path' }, svg);
      }
      if (st.agent != null) {
        var pa = E.rc(st.agent);
        S.svg('circle', { cx: ox + pa[1] * cs + cs / 2, cy: oy + pa[0] * cs + cs / 2, r: Math.max(7, cs * 0.14), class: 'rlg-agent' }, svg);
      }
    }
    S.onTheme(function () { render(); });
    return function (s2) { if (s2) for (var k in s2) st[k] = s2[k]; render(); };
  };

  // 图例
  RL.legend = function (root) {
    root.classList.add('legend2', 'rl-leg');
    root.innerHTML = '<span><i class="lf"></i>禁区（可进入，受罚）</span><span><i class="lt"></i>目标</span><span><i class="lp"></i>值为正（越深越大）</span><span><i class="ln"></i>值为负</span><span>箭头长短 = 动作概率（小于 0.05 不画），圆圈 = 原地不动</span>';
  };

  window.RL = RL;
})();
