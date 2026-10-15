// Quiz — perguntas de múltipla escolha com correção imediata.
//
// Quiz.mount(el, [
//   { q: 'enunciado (HTML/KaTeX)', options: ['a', 'b', 'c'], answer: 1, explain: 'por quê' },
// ]);
(function () {
  function mount(root, questions) {
    root.classList.add('quiz');
    let answered = 0, right = 0;
    const score = APA.el('div', { class: 'score' });
    questions.forEach((item, qi) => {
      const box = APA.el('div', { class: 'q' });
      box.append(APA.el('p', { class: 'stem', html: `${qi + 1}. ${item.q}` }));
      const buttons = item.options.map((opt, oi) => {
        const b = APA.el('button', { class: 'opt', type: 'button',
          html: `<span class="mark">${String.fromCharCode(97 + oi)})</span>${opt}` });
        b.addEventListener('click', () => {
          buttons.forEach((x) => (x.disabled = true));
          buttons[item.answer].classList.add('right');
          const ok = oi === item.answer;
          if (!ok) b.classList.add('wrong');
          answered++; if (ok) right++;
          const ex = APA.el('div', { class: 'explain',
            html: `<b>${ok ? '✔ Certo.' : '✘ Não.'}</b> ${item.explain || ''}` });
          box.append(ex);
          APA.renderMath(ex);
          if (answered === questions.length) {
            score.textContent = `Resultado: ${right} de ${questions.length}.` +
              (right === questions.length ? ' Pode seguir.' : ' Releia as seções das questões que errou.');
          }
        });
        box.append(b);
        return b;
      });
      root.append(box);
    });
    root.append(score);
    APA.renderMath(root);
  }
  window.Quiz = { mount };
})();
