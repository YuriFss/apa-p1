// StepPlayer — animação passo a passo de pseudocódigo com estado do array,
// variáveis e (opcional) a tabela "# op / # exec" sendo preenchida.
//
// const p = StepPlayer.mount(el, {
//   code:  ['SomaVetor(A, n)', 'soma = 0', 'for i = 0 to n − 1:', ...], // code[0] = assinatura, code[k] = linha k
//   ops:   { 1: 1, 2: 2, 3: 3, 5: 1 },        // opcional: # op de cada linha
//   steps: [ {                                 // um passo = uma execução de linha
//     line: 2,
//     skip: false,                             // true = executa, mas a convenção não conta
//     arrays: [{ name: 'A', values: [...], marks: { 0: 'cur' }, ptrs: { 0: 'i' } }],
//     vars: { soma: 0, i: 0 },
//     note: 'texto (aceita HTML e $KaTeX$)',
//   }, ...],
//   extra: (step, el) => {},                   // opcional: desenha algo além do array (árvore, matriz...)
// });
// p.load(novosSteps)  — troca a entrada sem recriar o player.
(function () {
  const KW = /\b(for|to|while|and|or|not|if|else|return|then|do|downto|repita|para|faça|se|então|senão|retorna|fim)\b/g;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hl = (s) => esc(s).replace(KW, '<span class="kw">$1</span>');

  function renderArray(a) {
    const box = APA.el('div', { class: 'arr' });
    if (a.name) box.append(APA.el('span', { class: 'name' }, a.name));
    a.values.forEach((v, i) => {
      const cls = (a.marks && a.marks[i]) || '';
      box.append(APA.el('div', { class: 'slot' },
        APA.el('span', { class: 'idx' }, String((a.base || 0) + i)),
        APA.el('div', { class: 'cell ' + cls }, v === null || v === undefined ? '' : String(v)),
        APA.el('span', { class: 'ptr' }, (a.ptrs && a.ptrs[i]) || '')));
    });
    return box;
  }

  function mount(root, cfg) {
    root.classList.add('player');
    if (cfg.stack) root.classList.add('stack'); // código em cima, estado embaixo (largura total)
    root.tabIndex = 0;
    const codeEl = APA.el('div', { class: 'code' });
    // item da lista de código: 'texto' (numerado pelo índice), ['rótulo', 'texto'] ou { h: 'cabeçalho' }
    const lines = cfg.code.map((item, k) => {
      const head = k === 0 || (item && item.h !== undefined);
      const txt = head ? (item.h ?? item) : Array.isArray(item) ? item[1] : item;
      const lab = head ? '' : Array.isArray(item) ? item[0] : k + '.';
      const ln = APA.el('div', { class: 'ln' },
        APA.el('span', { class: 'no' }, lab),
        APA.el('span', { html: head ? '<span class="fn">' + esc(txt) + '</span>' : hl(txt) }));
      codeEl.append(ln);
      return ln;
    });
    const state = APA.el('div', { class: 'state' });
    const note = APA.el('div', { class: 'note' });
    const prev = APA.el('button', { class: 'btn' }, '◀ anterior');
    const next = APA.el('button', { class: 'btn primary' }, 'próximo ▶');
    const play = APA.el('button', { class: 'btn' }, '▶▶ auto');
    const reset = APA.el('button', { class: 'btn' }, '⟲ início');
    const end = APA.el('button', { class: 'btn' }, 'fim ⏭');
    const pos = APA.el('span', { class: 'pos' });
    root.append(codeEl, state, note, APA.el('div', { class: 'bar' }, reset, prev, next, play, end, pos));

    let steps = [], i = 0, timer = null, execAt = [];

    function precompute() {
      // execAt[s][linha] = execuções contadas até o passo s (inclusive)
      execAt = [];
      const acc = {};
      steps.forEach((st, s) => {
        if (!st.skip && st.line != null) acc[st.line] = (acc[st.line] || 0) + 1;
        execAt[s] = { ...acc };
      });
    }

    function opsTable(s) {
      const ex = execAt[s] || {};
      const t = APA.el('table', { class: 'opstable' });
      t.append(APA.el('tr', {}, APA.el('th', {}, 'linha'), APA.el('th', { class: 'num' }, '# op'),
        APA.el('th', { class: 'num' }, '# exec'), APA.el('th', { class: 'num' }, 'op × exec')));
      let total = 0;
      for (const ln of Object.keys(cfg.ops).map(Number).sort((a, b) => a - b)) {
        const e = ex[ln] || 0, sub = e * cfg.ops[ln];
        total += sub;
        const hot = steps[s] && steps[s].line === ln && !steps[s].skip;
        const lab = Array.isArray(cfg.code[ln]) ? cfg.code[ln][0] : ln + '.';
        t.append(APA.el('tr', { class: hot ? 'hot' : '' }, APA.el('td', {}, lab),
          APA.el('td', { class: 'num' }, String(cfg.ops[ln])), APA.el('td', { class: 'num' }, String(e)),
          APA.el('td', { class: 'num' }, String(sub))));
      }
      t.append(APA.el('tr', { class: 'total' }, APA.el('td', { colspan: '3' }, 'total de operações até aqui'),
        APA.el('td', { class: 'num' }, String(total))));
      return t;
    }

    function show() {
      const st = steps[i] || {};
      lines.forEach((ln, k) => {
        ln.classList.toggle('active', k === st.line);
        ln.classList.toggle('skip', k === st.line && !!st.skip);
      });
      state.replaceChildren();
      for (const a of st.arrays || []) state.append(renderArray(a));
      if (st.vars) {
        const before = (steps[i - 1] && steps[i - 1].vars) || {};
        const vs = APA.el('div', { class: 'vars' });
        for (const [k, v] of Object.entries(st.vars)) {
          const changed = i > 0 && before[k] !== v;
          vs.append(APA.el('span', { class: 'v' + (changed ? ' changed' : '') }, k + ' = ' + v));
        }
        state.append(APA.el('div', { class: 'sect-title' }, 'variáveis'), vs);
      }
      if (cfg.extra) { const box = APA.el('div'); cfg.extra(st, box, i); state.append(box); }
      if (cfg.ops) state.append(APA.el('div', { class: 'sect-title' }, 'contagem'), opsTable(i));
      note.className = 'note' + (st.skip ? ' skip' : '');
      note.innerHTML = (st.skip ? '<b>Não conta:</b> ' : '') + (st.note || '');
      APA.renderMath(note);
      pos.textContent = steps.length ? `passo ${i + 1} / ${steps.length}` : '';
      prev.disabled = reset.disabled = i === 0;
      next.disabled = end.disabled = i >= steps.length - 1;
      if (next.disabled) stop();
    }

    function go(k) { i = Math.max(0, Math.min(steps.length - 1, k)); show(); }
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶▶ auto'; play.classList.remove('on'); }
    prev.onclick = () => { stop(); go(i - 1); };
    next.onclick = () => { stop(); go(i + 1); };
    reset.onclick = () => { stop(); go(0); };
    end.onclick = () => { stop(); go(steps.length - 1); };
    play.onclick = () => {
      if (timer) return stop();
      if (i >= steps.length - 1) go(0);
      play.textContent = '❚❚ pausar'; play.classList.add('on');
      timer = setInterval(() => go(i + 1), cfg.speed || 900);
    };
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.onclick(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.onclick(); }
    });

    function load(newSteps) { stop(); steps = newSteps; precompute(); go(0); }
    load(cfg.steps || []);
    return { load, go };
  }

  window.StepPlayer = { mount };
})();
