const btn = document.getElementById('openStories');
const dlg = document.getElementById('storiesLightbox');
let playlist = [];
let videos = [];
let current = 0;

async function load() {
  if (playlist.length) return;
  const res = await fetch('stories.json');
  playlist = await res.json();
  playlist.forEach(item => {
    const v = document.createElement('video');
    v.src = item.src;
    v.setAttribute('preload', 'none');
    v.setAttribute('loading', 'lazy');
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.style.display = 'none';
    v.style.width = '100%';
    v.style.aspectRatio = '9/16';
    dlg.appendChild(v);
    videos.push(v);
  });
}

function showVideo(i) {
  videos.forEach((v, idx) => {
    if (idx === i) {
      v.style.display = 'block';
      v.play();
    } else {
      v.pause();
      v.style.display = 'none';
    }
  });
}

btn?.addEventListener('click', async () => {
  await load();
  dlg.showModal();
  current = 0;
  showVideo(current);
});

dlg?.addEventListener('close', () => {
  videos.forEach(v => v.pause());
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos[current]?.pause();
  else videos[current]?.play();
});

let startY = 0;
dlg?.addEventListener('touchstart', e => {
  startY = e.touches[0].clientY;
});
dlg?.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - startY;
  if (dy < -40) {
    current = Math.min(current + 1, videos.length - 1);
    showVideo(current);
  } else if (dy > 40) {
    current = Math.max(current - 1, 0);
    showVideo(current);
  }
});
