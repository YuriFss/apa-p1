// TreeView — desenha árvores (recursão, heap...) em SVG.
//
// TreeView.render(raiz, opts) -> <svg>
//   raiz = { label: 'f(5)', cls: 'hot' | 'cold' | 'ok' | '', children: [nó, ...] }
//   um filho { empty: true } reserva espaço sem desenhar nada (filho ausente).
//   opts: { gap: 46, levelH: 62, r: 19, levelLabel: (profundidade) => 'texto à direita' }
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    return e;
  };

  // largura reservada para os rótulos de nível (~7 px por caractere em 12 px)
  function labelWidth(fn, depthMax) {
    let m = 0;
    for (let d = 0; d <= depthMax; d++) m = Math.max(m, String(fn(d) || '').length);
    return m * 7 + 20;
  }

  function render(root, opts = {}) {
    const gap = opts.gap || 46, levelH = opts.levelH || 62, r = opts.r || 19;
    let leaf = 0, depthMax = 0;
    (function place(n, d) {
      n._d = d; depthMax = Math.max(depthMax, d);
      const kids = n.children || [];
      if (!kids.length) { n._x = leaf++ * gap; return; }
      kids.forEach((c) => place(c, d + 1));
      n._x = (kids[0]._x + kids[kids.length - 1]._x) / 2;
    })(root, 0);

    const labelW = opts.levelLabel ? labelWidth(opts.levelLabel, depthMax) : 0;
    const pad = r + 6;
    const w = Math.max(1, leaf - 1) * gap + 2 * pad + labelW;
    const h = depthMax * levelH + 2 * pad;
    const svg = mk('svg', { class: 'tree', viewBox: `0 0 ${w} ${h}`, width: w, role: 'img' });
    if (opts.title) svg.append(mk('title', {}, opts.title));
    const X = (n) => n._x + pad, Y = (n) => n._d * levelH + pad;
    const edges = mk('g'), nodes = mk('g');
    (function draw(n) {
      if (n.empty) return;
      for (const c of n.children || []) {
        if (c.empty) continue;
        edges.append(mk('line', { x1: X(n), y1: Y(n), x2: X(c), y2: Y(c) }));
        draw(c);
      }
      const g = mk('g', { class: n.cls || '' });
      g.append(mk('circle', { cx: X(n), cy: Y(n), r: n.r || r }));
      g.append(mk('text', { x: X(n), y: Y(n) }, n.label));
      if (n.title) g.append(mk('title', {}, n.title));
      nodes.append(g);
    })(root);
    svg.append(edges, nodes);
    if (opts.levelLabel) {
      for (let d = 0; d <= depthMax; d++) {
        const t = opts.levelLabel(d);
        if (t) svg.append(mk('text', { class: 'lvl', x: w - labelW + 12, y: d * levelH + pad }, t));
      }
    }
    return svg;
  }

  // TreeView.arrays(raiz, opts) -> <svg>: árvore cujos nós são vetores (divisão e conquista).
  //   raiz = { arr: [5, 2, 4], marks: { 1: 'hot' | 'ok' | 'cold' }, label: 'cn', children: [...] }
  //   opts: { cell: 28, gapX: 14, levelH: 64, levelLabel: (profundidade) => 'texto' }
  function arrays(root, opts = {}) {
    const cell = opts.cell || 28, gapX = opts.gapX || 14, levelH = opts.levelH || 64, ch = cell;
    let depthMax = 0;
    (function size(n, d) {
      n._d = d; depthMax = Math.max(depthMax, d);
      const kids = n.children || [];
      kids.forEach((c) => size(c, d + 1));
      const own = n.arr.length * cell;
      const sub = kids.reduce((s, c) => s + c._w, 0) + gapX * Math.max(0, kids.length - 1);
      n._w = Math.max(own, sub);
    })(root, 0);
    (function place(n, x0) {
      n._x = x0 + n._w / 2; // centro
      let x = x0 + (n._w - ((n.children || []).reduce((s, c) => s + c._w, 0) + gapX * Math.max(0, (n.children || []).length - 1))) / 2;
      for (const c of n.children || []) { place(c, x); x += c._w + gapX; }
    })(root, 0);
    const labelW = opts.levelLabel ? labelWidth(opts.levelLabel, depthMax) : 0, pad = 6;
    const W = root._w + 2 * pad + labelW, H = depthMax * levelH + ch + 2 * pad;
    const svg = mk('svg', { class: 'tree', viewBox: `0 0 ${W} ${H}`, width: W, role: 'img' });
    if (opts.title) svg.append(mk('title', {}, opts.title));
    const Y = (n) => n._d * levelH + pad;
    const g = mk('g');
    (function draw(n) {
      const left = n._x - (n.arr.length * cell) / 2 + pad;
      for (const c of n.children || []) {
        g.append(mk('line', { x1: n._x + pad, y1: Y(n) + ch, x2: c._x + pad, y2: Y(c) }));
        draw(c);
      }
      n.arr.forEach((v, i) => {
        const cl = (n.marks && n.marks[i]) || '';
        const cg = mk('g', { class: cl });
        cg.append(mk('rect', { x: left + i * cell, y: Y(n), width: cell, height: ch, rx: 3, class: 'cellbox' }));
        cg.append(mk('text', { x: left + i * cell + cell / 2, y: Y(n) + ch / 2 }, String(v)));
        g.append(cg);
      });
    })(root);
    svg.append(g);
    if (opts.levelLabel) for (let d = 0; d <= depthMax; d++) {
      const t = opts.levelLabel(d);
      if (t) svg.append(mk('text', { class: 'lvl', x: W - labelW + 10, y: d * levelH + pad + ch / 2 }, t));
    }
    return svg;
  }

  window.TreeView = { render, arrays };
})();
