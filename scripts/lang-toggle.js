import { initCMS } from './cms.js';

function setLang(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
  initCMS(lang);
}

export function initLangToggle() {
  const saved = localStorage.getItem('lang');
  if (saved && saved !== document.documentElement.lang) {
    setLang(saved);
  } else {
    initCMS(document.documentElement.lang);
  }
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.lang === 'ru' ? 'en' : 'ru';
      setLang(current);
    });
  }
}

initLangToggle();
