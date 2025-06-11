const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && window.lottie) {
  document.querySelectorAll('.skill-icon').forEach(el => {
    const anim = lottie.loadAnimation({
      container: el,
      path: `/assets/lottie/${el.dataset.lottie}`,
      renderer: 'svg',
      loop: false,
      autoplay: false
    });
    el.addEventListener('mouseenter', () => anim.goToAndPlay(0, true));
    el.addEventListener('focus', () => anim.goToAndPlay(0, true));
  });

  document.querySelectorAll('.cta[data-lottie]').forEach(btn => {
    const anim = lottie.loadAnimation({
      container: btn,
      path: `/assets/lottie/${btn.dataset.lottie}`,
      renderer: 'svg',
      loop: false,
      autoplay: false
    });
    const play = () => anim.goToAndPlay(0, true);
    btn.addEventListener('pointerenter', play);
    btn.addEventListener('focus', play);
  });
}
