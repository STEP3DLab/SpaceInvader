const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const pieces = [
  { src: 'game/parts/part1.png', target: { x: 100, y: 80 } },
  { src: 'game/parts/part2.png', target: { x: 250, y: 80 } },
  { src: 'game/parts/part3.png', target: { x: 100, y: 220 } },
  { src: 'game/parts/part4.png', target: { x: 250, y: 220 } }
];

let loaded = 0;
pieces.forEach(p => {
  const img = new Image();
  img.src = p.src;
  p.img = img;
  img.onload = () => {
    p.x = Math.random() * (canvas.width - img.width);
    p.y = Math.random() * (canvas.height - img.height);
    loaded++;
    if (loaded === pieces.length) draw();
  };
});

let dragging = null;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (!p.placed && x > p.x && x < p.x + p.img.width && y > p.y && y < p.y + p.img.height) {
      dragging = p;
      offsetX = x - p.x;
      offsetY = y - p.y;
      break;
    }
  }
});

canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  dragging.x = e.clientX - rect.left - offsetX;
  dragging.y = e.clientY - rect.top - offsetY;
  draw();
});

canvas.addEventListener('pointerup', () => {
  if (!dragging) return;
  const dx = dragging.x + dragging.img.width / 2 - dragging.target.x;
  const dy = dragging.y + dragging.img.height / 2 - dragging.target.y;
  if (Math.hypot(dx, dy) < 20) {
    dragging.x = dragging.target.x - dragging.img.width / 2;
    dragging.y = dragging.target.y - dragging.img.height / 2;
    dragging.placed = true;
    checkComplete();
  }
  dragging = null;
  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    if (p.img.complete) ctx.drawImage(p.img, p.x, p.y);
  });
}

function checkComplete() {
  if (pieces.every(p => p.placed)) {
    const msg = document.getElementById('gameMessage');
    msg.innerHTML = '🎉 Готово! <button id="shareBtn">Поделиться</button>';
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        await navigator.share({ title: 'Прототип собран!', url: location.href });
      }
    });
  }
}
