const btn = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');
if (stored) {
  document.documentElement.dataset.theme = stored;
}
btn?.addEventListener('click', () => {
  const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
});
