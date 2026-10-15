// LineChart — gráfico de linhas em SVG para comparar funções de n.
//
// const c = LineChart.mount(el, {
//   series: [{ name: 'n²', f: (n) => n * n, color: 'var(--series-1)' }, ...],
//   xMin: 1, xMax: 20,          // domínio (inteiro)
//   xLabel: 'n', yLabel: 'operações',
//   log: false,                 // escala log no eixo y
//   tableXs: [5, 10, 20],       // valores de n na tabela acessível
// });
// c.update({ xMax: 30, log: true })
// Clique na legenda para esconder/mostrar uma série (o eixo y se reajusta).
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    return e;
  };
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function fmt(v) {
    if (!isFinite(v)) return '∞';
    if (Math.abs(v) < 1e6) return (Math.round(v * 100) / 100).toLocaleString('pt-BR');
    const [m, e] = v.toExponential(2).split('e');
    return m.replace('.', ',') + ' × 10' + String(Number(e)).split('').map((c) => SUP[c]).join('');
  }
  function niceTicks(max, count = 5) {
    if (max <= 0) return [0, 1];
    const raw = max / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const ticks = [];
    for (let t = 0; t <= max + step * 0.001; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
    return ticks;
  }

  function mount(root, cfg) {
    root.classList.add('chart');
    root.style.position = 'relative';
    const W = 720, H = 370, m = { l: 84, r: 16, t: 26, b: 42 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const hidden = new Set();
    const legend = APA.el('div', { class: 'legend' });
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    const tip = APA.el('div', { class: 'tip' }); tip.style.display = 'none';
    const table = APA.el('details', {}, APA.el('summary', {}, 'Ver valores em tabela'));
    root.append(legend, svg, tip, table);

    function draw() {
      const { xMin, xMax, log } = cfg;
      const xs = [];
      for (let x = xMin; x <= xMax; x++) xs.push(x);
      const vis = cfg.series.filter((s) => !hidden.has(s.name));
      const vals = new Map(cfg.series.map((s) => [s.name, xs.map((x) => s.f(x))]));
      let yMax = 1;
      for (const s of vis) for (const v of vals.get(s.name)) if (isFinite(v)) yMax = Math.max(yMax, v);

      let yTicks, Y;
      if (log) {
        const top = Math.ceil(Math.log10(yMax)) || 1;
        const every = Math.max(1, Math.ceil(top / 8));
        yTicks = []; for (let d = 0; d <= top; d += every) yTicks.push(Math.pow(10, d));
        const lt = Math.log10(yTicks[yTicks.length - 1]) || 1;
        Y = (v) => m.t + ph - (Math.log10(Math.max(v, 1)) / lt) * ph;
      } else {
        yTicks = niceTicks(yMax);
        const top = yTicks[yTicks.length - 1];
        Y = (v) => m.t + ph - (v / top) * ph;
      }
      const X = (x) => m.l + ((x - xMin) / Math.max(1, xMax - xMin)) * pw;

      svg.replaceChildren();
      const grid = mk('g', { class: 'grid' }), axis = mk('g', { class: 'axis' });
      for (const t of yTicks) {
        grid.append(mk('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t) }));
        svg.append(mk('text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }, fmt(t)));
      }
      const xTicks = niceTicks(xMax - xMin, 8).map((t) => t + xMin).filter((t) => t <= xMax);
      for (const t of xTicks) svg.append(mk('text', { x: X(t), y: H - m.b + 18, 'text-anchor': 'middle' }, fmt(t)));
      axis.append(mk('line', { x1: m.l, x2: W - m.r, y1: m.t + ph, y2: m.t + ph }));
      svg.append(grid, axis);
      svg.append(mk('text', { x: W - m.r, y: H - 6, 'text-anchor': 'end' }, cfg.xLabel || 'n'));
      if (cfg.yLabel) svg.append(mk('text', { x: 4, y: 12, 'text-anchor': 'start' }, cfg.yLabel + (log ? ' (escala log)' : '')));

      const clipId = 'clip' + Math.random().toString(36).slice(2);
      const defs = mk('defs'); const cp = mk('clipPath', { id: clipId });
      cp.append(mk('rect', { x: m.l, y: m.t - 2, width: pw, height: ph + 4 })); defs.append(cp); svg.append(defs);
      const lines = mk('g', { class: 'series', 'clip-path': `url(#${clipId})` });
      for (const s of vis) {
        const v = vals.get(s.name);
        const d = xs.map((x, k) => `${k ? 'L' : 'M'}${X(x).toFixed(1)},${Y(isFinite(v[k]) ? v[k] : 1e308).toFixed(1)}`).join('');
        lines.append(mk('path', { d, stroke: s.color }));
      }
      svg.append(lines);

      // camada de hover: linha vertical + pontos + tooltip
      const hover = mk('g', { class: 'hover' }); hover.style.display = 'none';
      const vline = mk('line', { y1: m.t, y2: m.t + ph }); hover.append(vline);
      const dots = vis.map((s) => { const c = mk('circle', { r: 4.5, fill: s.color }); hover.append(c); return c; });
      svg.append(hover);
      const hit = mk('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent' });
      svg.append(hit);
      hit.addEventListener('pointermove', (e) => {
        const box = svg.getBoundingClientRect();
        const sx = ((e.clientX - box.left) / box.width) * W;
        const x = Math.round(xMin + ((sx - m.l) / pw) * (xMax - xMin));
        const k = Math.max(0, Math.min(xs.length - 1, x - xMin));
        hover.style.display = '';
        vline.setAttribute('x1', X(xs[k])); vline.setAttribute('x2', X(xs[k]));
        vis.forEach((s, j) => {
          const v = vals.get(s.name)[k];
          dots[j].setAttribute('cx', X(xs[k]));
          dots[j].setAttribute('cy', Math.max(m.t, Y(isFinite(v) ? v : 1e308)));
        });
        tip.innerHTML = `<div class="row"><b>${cfg.xLabel || 'n'} = ${xs[k]}</b></div>` + vis
          .map((s) => ({ s, v: vals.get(s.name)[k] }))
          .sort((a, b) => b.v - a.v)
          .map(({ s, v }) => `<div class="row"><i style="background:${s.color}"></i>${s.name}: <b>${fmt(v)}</b></div>`).join('');
        tip.style.display = '';
        const rb = root.getBoundingClientRect();
        let left = e.clientX - rb.left + 14;
        if (left + tip.offsetWidth > rb.width) left = e.clientX - rb.left - tip.offsetWidth - 14;
        tip.style.left = Math.max(0, left) + 'px';
        tip.style.top = (e.clientY - rb.top + 10) + 'px';
      });
      hit.addEventListener('pointerleave', () => { hover.style.display = 'none'; tip.style.display = 'none'; });

      legend.replaceChildren();
      for (const s of cfg.series) {
        const off = hidden.has(s.name);
        const b = APA.el('button', { class: 'btn' + (off ? '' : ' on'), type: 'button', 'aria-pressed': String(!off),
          title: off ? 'mostrar' : 'esconder' });
        b.innerHTML = `<i style="background:${s.color}"></i>${s.name}`;
        b.onclick = () => { off ? hidden.delete(s.name) : hidden.add(s.name); draw(); };
        legend.append(b);
      }

      const tx = (cfg.tableXs || [xMin, Math.round((xMin + xMax) / 2), xMax]).filter((x) => x >= xMin && x <= xMax);
      const tb = APA.el('table');
      tb.append(APA.el('tr', {}, APA.el('th', {}, cfg.xLabel || 'n'), ...cfg.series.map((s) => APA.el('th', { class: 'num' }, s.name))));
      for (const x of tx) tb.append(APA.el('tr', {}, APA.el('td', { class: 'num' }, String(x)),
        ...cfg.series.map((s) => APA.el('td', { class: 'num' }, fmt(s.f(x))))));
      table.replaceChildren(table.firstChild, APA.el('div', { class: 'table-wrap' }, tb));
    }

    draw();
    return { update(o) { Object.assign(cfg, o); draw(); }, fmt };
  }

  window.LineChart = { mount, fmt };
})();
