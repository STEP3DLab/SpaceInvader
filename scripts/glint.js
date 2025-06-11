const medals = document.querySelectorAll('#awards svg.medal');
medals.forEach(svg => {
  const light = svg.querySelector('fePointLight');
  svg.addEventListener('pointermove', e => {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    light?.setAttribute('x', x);
    light?.setAttribute('y', y);
  });
});
