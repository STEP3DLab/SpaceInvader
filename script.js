document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.style.scrollBehavior = 'smooth';
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
