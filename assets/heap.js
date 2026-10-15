// HeapView — desenha um heap (array indexado a partir de 0) como árvore e como array, lado a lado.
//
// HeapView.render(valores, {
//   size: tamanho_heap,          // posições >= size aparecem esmaecidas (fora do heap / já ordenadas)
//   marks: { 3: 'hot' | 'cold' | 'ok' },
//   onPick: (i) => {},           // opcional: clique num nó ou célula
// }) -> elemento
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (txt != null) e.textContent = txt; return e; };

  function tree(vals, o) {
    const n = vals.length, depth = Math.max(1, Math.floor(Math.log2(Math.max(1, n))) + 1);
    const W = Math.max(320, 2 ** (depth - 1) * 44), levelH = 62, r = 18, H = depth * levelH + 10;
    const pos = (i) => { const d = Math.floor(Math.log2(i + 1)), p = i + 1 - 2 ** d; return [((p + 0.5) * W) / 2 ** d, d * levelH + r + 14]; };
    const svg = mk('svg', { class: 'tree heaptree', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Heap desenhado como árvore' });
    for (let i = 1; i < n; i++) {
      const [x1, y1] = pos(Math.floor((i - 1) / 2)), [x2, y2] = pos(i);
      svg.append(mk('line', { x1, y1, x2, y2, class: i >= o.size ? 'out' : '' }));
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i);
      const cls = [(o.marks && o.marks[i]) || '', i >= o.size ? 'dim' : ''].join(' ');
      const g = mk('g', { class: cls });
      g.append(mk('circle', { cx: x, cy: y, r }));
      g.append(mk('text', { x, y }, String(vals[i])));
      g.append(mk('text', { x: x + r + 2, y: y - r + 2, class: 'idx' }, String(i)));
      if (o.onPick) { g.style.cursor = 'pointer'; g.addEventListener('click', () => o.onPick(i)); }
      svg.append(g);
    }
    return svg;
  }

  function array(vals, o) {
    const box = APA.el('div', { class: 'arr' });
    box.append(APA.el('span', { class: 'name' }, 'A'));
    vals.forEach((v, i) => {
      const cls = [(o.marks && o.marks[i]) ? ({ hot: 'cmp', cold: 'cur', ok: 'ok' }[o.marks[i]] || o.marks[i]) : '', i >= o.size ? 'dim' : ''].join(' ');
      const cell = APA.el('div', { class: 'cell ' + cls }, String(v));
      if (o.onPick) { cell.style.cursor = 'pointer'; cell.addEventListener('click', () => o.onPick(i)); }
      box.append(APA.el('div', { class: 'slot' }, APA.el('span', { class: 'idx' }, String(i)), cell,
        APA.el('span', { class: 'ptr' }, i === o.size && i < vals.length ? '↑ fora do heap' : '')));
    });
    return box;
  }

  function render(vals, o = {}) {
    o = { size: vals.length, ...o };
    const wrap = APA.el('div', { class: 'heapview' });
    const t = APA.el('div', { class: 'hv-tree' }, tree(vals, o));
    const a = APA.el('div', { class: 'hv-arr' }, array(vals, o));
    wrap.append(t, a);
    return wrap;
  }

  // Executa MaxHeapify(A, i) em A (modifica A) chamando snap(linha 1..10, nota, marks) a cada passo.
  // Usa L < size (índices a partir de 0). Retorna o número de trocas.
  function heapify(A, i, size, snap) {
    let swaps = 0;
    for (;;) {
      const L = 2 * i + 1, R = 2 * i + 2;
      snap(1, `MaxHeapify(A, ${i}): L = FilhoEsquerdo(${i}) = 2·${i} + 1 = ${L}.`, { [i]: 'cold' });
      snap(2, `R = FilhoDireito(${i}) = 2·${i} + 2 = ${R}.`, { [i]: 'cold' });
      let maior = i;
      snap(3, `maior ← ${i} (valor ${A[i]}).`, { [i]: 'cold' });
      const okL = L < size && A[L] > A[maior];
      snap(4, L < size ? `L = ${L} está no heap e A[${L}] = ${A[L]} &gt; A[maior] = ${A[maior]}? <b>${okL ? 'Sim' : 'Não'}</b>.`
        : `L = ${L} está fora do heap (tamanho ${size}): ${i} é folha.`, L < size ? { [i]: 'cold', [L]: 'hot' } : { [i]: 'cold' });
      if (okL) { maior = L; snap(5, `maior ← ${L}.`, { [i]: 'cold', [L]: 'hot' }); }
      const okR = R < size && A[R] > A[maior];
      snap(6, R < size ? `R = ${R} está no heap e A[${R}] = ${A[R]} &gt; A[maior] = ${A[maior]}? <b>${okR ? 'Sim' : 'Não'}</b>.`
        : `R = ${R} está fora do heap.`, R < size ? { [i]: 'cold', [R]: 'hot', [maior]: maior === i ? 'cold' : 'hot' } : { [i]: 'cold', [maior]: maior === i ? 'cold' : 'hot' });
      if (okR) { maior = R; snap(7, `maior ← ${R}.`, { [i]: 'cold', [R]: 'hot' }); }
      if (maior === i) { snap(8, `maior = i = ${i}: A[${i}] = ${A[i]} já é ≥ que os filhos. Para aqui.`, { [i]: 'ok' }); return swaps; }
      snap(8, `maior = ${maior} ≠ i = ${i}: o pai é menor que um filho.`, { [i]: 'cold', [maior]: 'hot' });
      [A[i], A[maior]] = [A[maior], A[i]]; swaps++;
      snap(9, `trocar(A[${i}], A[${maior}]): agora A[${i}] = ${A[i]} e A[${maior}] = ${A[maior]}.`, { [i]: 'ok', [maior]: 'cold' });
      snap(10, `Chama MaxHeapify(A, ${maior}): o ${A[maior]} continua "flutuando" para baixo.`, { [maior]: 'cold' });
      i = maior;
    }
  }

  window.HeapView = { render, heapify };
})();
