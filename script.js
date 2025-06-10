const stories = [
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800"
];

const avatar = document.getElementById('avatar');
const overlay = document.getElementById('storyOverlay');
const storyImg = document.getElementById('storyImg');
let index = 0;

avatar.addEventListener('click', () => {
  index = 0;
  storyImg.src = stories[index];
  overlay.style.display = 'flex';
});

overlay.addEventListener('click', () => {
  index++;
  if (index < stories.length) {
    storyImg.src = stories[index];
  } else {
    overlay.style.display = 'none';
  }
});
