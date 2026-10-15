// Utilidades comuns: renderização KaTeX e alternância de tema.
// Carregue depois de katex.min.js e auto-render.min.js (todos com defer).
window.APA = window.APA || {};

APA.renderMath = function (el) {
  if (!window.renderMathInElement) return;
  renderMathInElement(el || document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '$', right: '$', display: false },
    ],
    ignoredClasses: ['code', 'panel', 'no-math'],
    throwOnError: false,
  });
};

APA.el = function (tag, attrs, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) e.append(c);
  return e;
};

(function theme() {
  let saved = null;
  try { saved = localStorage.getItem('apa-theme'); } catch (_) {}
  if (saved) document.documentElement.dataset.theme = saved;
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.theme-btn');
    if (!btn) return;
    const current = () => document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const label = () => { btn.textContent = current() === 'dark' ? '☀ claro' : '☾ escuro'; };
    label();
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('apa-theme', next); } catch (_) {}
      label();
      document.dispatchEvent(new Event('apa-theme'));
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => APA.renderMath());
