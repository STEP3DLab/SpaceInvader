const stories = [
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800"
];

const avatar = document.getElementById('avatar');
const overlay = document.getElementById('storyOverlay');
const storyImg = document.getElementById('storyImg');
const closeBtn = document.getElementById('closeOverlay');
let index = 0;

avatar.addEventListener('click', () => {
  index = 0;
  storyImg.src = stories[index];
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  closeBtn.focus();
});

overlay.addEventListener('click', () => {
  index++;
  if (index < stories.length) {
    storyImg.src = stories[index];
  } else {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
});

function closeOverlay() {
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
}

if (closeBtn) {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.style.display === 'flex') {
    closeOverlay();
  }
});

// ===== Карусель с фотографиями экспертиз =====
const expertPhotos = [
  'https://source.unsplash.com/random/400x250?sig=1',
  'https://source.unsplash.com/random/400x250?sig=2',
  'https://source.unsplash.com/random/400x250?sig=3',
  'https://source.unsplash.com/random/400x250?sig=4',
  'https://source.unsplash.com/random/400x250?sig=5',
  'https://source.unsplash.com/random/400x250?sig=6',
  'https://source.unsplash.com/random/400x250?sig=7',
  'https://source.unsplash.com/random/400x250?sig=8',
  'https://source.unsplash.com/random/400x250?sig=9',
  'https://source.unsplash.com/random/400x250?sig=10'
];

let expertIndex = 0;
const expertImg = document.getElementById('expertImg');
const nextBtn = document.getElementById('expertNext');
const prevBtn = document.getElementById('expertPrev');

function updateExpert() {
  expertImg.src = expertPhotos[expertIndex];
}

if (expertImg) {
  updateExpert();
  nextBtn.addEventListener('click', () => {
    expertIndex = (expertIndex + 1) % expertPhotos.length;
    updateExpert();
  });
  prevBtn.addEventListener('click', () => {
    expertIndex = (expertIndex - 1 + expertPhotos.length) % expertPhotos.length;
    updateExpert();
  });
}

// ===== Подсветка активной ссылки в навигации =====
const navLinks = document.querySelectorAll('.top-nav a');
const sections = Array.from(navLinks).map(link => {
  const id = link.getAttribute('href');
  return document.querySelector(id);
}).filter(Boolean);

const observerOptions = {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));
