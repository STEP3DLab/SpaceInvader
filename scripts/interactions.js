// ES module for interactive elements
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== stories slider =====
const stories = [
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
];
const avatar = document.getElementById('avatar');
const overlay = document.getElementById('storyOverlay');
const storyTrack = document.getElementById('storyTrack');
const closeBtn = document.getElementById('closeOverlay');
let currentStory = 0;

if (storyTrack) {
  const altText = overlay.dataset.alt || '';
  stories.forEach(src => {
    const slide = document.createElement('div');
    slide.className = 'story-slide';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    img.alt = altText;
    slide.appendChild(img);
    storyTrack.appendChild(slide);
  });

  const slides = Array.from(storyTrack.children);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentStory = slides.indexOf(entry.target);
      }
    });
  }, { root: storyTrack, threshold: 0.5 });
  slides.forEach(slide => observer.observe(slide));

  function openOverlay() {
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    slides[0].scrollIntoView();
    closeBtn?.focus();
  }

  function closeOverlay() {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }

  avatar?.addEventListener('click', openOverlay);
  closeBtn?.addEventListener('click', e => { e.stopPropagation(); closeOverlay(); });
  overlay.addEventListener('click', () => {
    if (currentStory < slides.length - 1) {
      slides[currentStory + 1].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else {
      closeOverlay();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeOverlay();
    }
  });
}

// ===== expert carousel =====
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
const carousel = document.getElementById('expertCarousel');
const track = document.getElementById('expertTrack');
const nextBtn = document.getElementById('expertNext');
const prevBtn = document.getElementById('expertPrev');
let activeSlide = 0;

if (track) {
  expertPhotos.forEach(src => {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    img.alt = 'Экспертное фото';
    img.className = 'carousel-slide';
    track.appendChild(img);
  });

  const slides = Array.from(track.children);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSlide = slides.indexOf(entry.target);
      }
    });
  }, { root: track, threshold: 0.5 });
  slides.forEach(s => obs.observe(s));

  function scrollToSlide(index) {
    slides[index].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', inline: 'center' });
  }

  nextBtn?.addEventListener('click', () => {
    const i = Math.min(activeSlide + 1, slides.length - 1);
    scrollToSlide(i);
  });
  prevBtn?.addEventListener('click', () => {
    const i = Math.max(activeSlide - 1, 0);
    scrollToSlide(i);
  });
}

// ===== highlight active nav link =====
const navLinks = document.querySelectorAll('.top-nav a');
const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(section => navObserver.observe(section));
