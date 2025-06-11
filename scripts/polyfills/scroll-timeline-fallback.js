if (!CSS.supports('animation-timeline: auto')) {
  const targets = document.querySelectorAll('.cards .card, .skills-icons img, .portfolio-item');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  targets.forEach(t => {
    t.style.opacity = '0';
    io.observe(t);
  });
  const style = document.createElement('style');
  style.textContent = '.visible{opacity:1;transition:opacity .6s ease-out;}';
  document.head.append(style);
}
