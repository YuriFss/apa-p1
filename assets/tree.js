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

    const labelW = opts.levelLabel ? 150 : 0;
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

  window.TreeView = { render };
})();
