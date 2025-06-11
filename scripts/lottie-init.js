function initPortfolioLottie() {
  const players = document.querySelectorAll('.portfolio-item lottie-player');
  if (!players.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.play();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  players.forEach(p => io.observe(p));
}

window.addEventListener('DOMContentLoaded', initPortfolioLottie);
