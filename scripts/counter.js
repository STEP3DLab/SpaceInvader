const counters = document.querySelectorAll('[data-counter]');
const opts = { threshold: 0.3 };

function animate(el) {
  if (el.dataset.played) return;
  const end = parseInt(el.dataset.counter, 10);
  const suffix = el.textContent.replace(/\d+/g, '');
  let startTime;
  const step = now => {
    if (!startTime) startTime = now;
    const progress = Math.min((now - startTime) / 1600, 1);
    const value = Math.floor(progress * end);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  el.dataset.played = 'true';
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animate(entry.target);
  });
}, opts);

counters.forEach(el => observer.observe(el));
