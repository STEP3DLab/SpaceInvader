const canvas = document.getElementById('bgParticles');
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 || navigator.connection?.saveData;

if (lowPower) {
  canvas.style.display = 'none';
  document.body.classList.add('bg-gradient-css');
} else {
  import('https://cdn.jsdelivr.net/npm/tsparticles-engine@2.12.0/tsparticles.engine.min.js').then(({ tsParticles }) => {
    import('https://cdn.jsdelivr.net/npm/tsparticles-slim@2.12.0/tsparticles.slim.min.js').then(({ loadSlim }) => {
      loadSlim(tsParticles);
      tsParticles.load('bgParticles', {
        fullScreen: false,
        particles: {
          number: { value: 60 },
          color: { value: { h: 0, s: 100, l: 50 } },
          move: { speed: 0.3 }
        },
        background: { color: 'transparent' }
      }).then(container => {
        let hue = 0;
        setInterval(() => {
          hue = (hue + 45) % 360;
          container.options.particles.color.value.h = hue;
          container.refresh();
        }, 8000);
      });
    });
  });
}
