export async function initCMS(lang = document.documentElement.lang || 'ru') {
  const url = `content/${lang}/profile.json`;
  let data;
  const cached = sessionStorage.getItem(url);
  if (cached) {
    data = JSON.parse(cached);
  } else {
    const res = await fetch(url);
    data = await res.json();
    sessionStorage.setItem(url, JSON.stringify(data));
  }
  mapContent(data);
}

function mapContent(data) {
  const mappers = {
    tagline(el) {
      el.textContent = data.tagline;
    },
    contacts(el) {
      el.innerHTML = `
        <a href="mailto:${data.contacts.email}" itemprop="email">${data.contacts.email}</a><br />
        <a href="tel:${data.contacts.phone}" itemprop="telephone">${data.contacts.phone}</a><br />
        Telegram / LinkedIn: <a href="${data.contacts.telegram}" itemprop="sameAs">t.me/yourhandle</a> | <a href="${data.contacts.linkedin}" itemprop="sameAs">linkedin.com/in/ganjshin</a>
      `;
    },
    about(el) {
      el.innerHTML = `
        <summary><strong>${data.about.title}</strong></summary>
        <video class="about-video" src="${data.about.video}" controls aria-label="${data.about.videoLabel}">
          <track kind="captions" src="about_captions.vtt" srclang="ru" lang="ru" label="Русские субтитры" default>
        </video>
        <p>${data.about.description}</p>
        <h4>${data.about.factsTitle}</h4>
        <ul>${data.about.facts.map(f => `<li>${f}</li>`).join('')}</ul>
      `;
    },
    positions(el) {
      el.innerHTML = `
        <summary><strong>${data.positions.title}</strong></summary>
        <ul class="cards">${data.positions.items.map(i => `<li class="card"><strong>${i.period}</strong><span itemprop="jobTitle">${i.title}</span><br /><span>${i.place}</span></li>`).join('')}</ul>
      `;
    },
    skills(el) {
      el.innerHTML = `
        <summary><strong>${data.skills.title}</strong></summary>
        <h4>${data.skills.keyTitle}</h4>
        <ul>${data.skills.key.map(s => `<li>${s}</li>`).join('')}</ul>
        <h4>${data.skills.stackTitle}</h4>
        <p><strong>CAD:</strong></p>
        <ul class="tech-list">${data.skills.cad.map(t => `<li>${t}</li>`).join('')}</ul>
        <p><strong>3D‑печать:</strong></p>
        <ul class="tech-list">${data.skills.print.map(t => `<li>${t}</li>`).join('')}</ul>
        <p><strong>3D‑сканирование:</strong></p>
        <ul class="tech-list">${data.skills.scan.map(t => `<li>${t}</li>`).join('')}</ul>
        <p><strong>Код:</strong></p>
        <ul class="tech-list">${data.skills.code.map(t => `<li>${t}</li>`).join('')}</ul>
      `;
    },
    education(el) {
      el.innerHTML = `
        <summary><strong>${data.education.title}</strong></summary>
        <ul class="cards">${data.education.degrees.map(d => `<li class="card"><strong>${d.period}</strong><span itemprop="alumniOf">${d.inst}</span><br /><span>${d.desc}</span></li>`).join('')}</ul>
        <hr class="period-separator" />
        <h4>${data.education.upgradeTitle}</h4>
        <ul>${data.education.upgrade.map(u => `<li>${u}</li>`).join('')}</ul>
      `;
    },
    experience(el) {
      el.innerHTML = `
        <summary><strong>${data.experience.title}</strong></summary>
        <ul class="cards">${data.experience.positions.map(p => `<li class="card"><strong>${p.period}</strong><span>${p.org}</span><br /><span>${p.role}</span></li>`).join('')}</ul>
        <hr class="period-separator" />
        <h4>${data.experience.coursesTitle}</h4>
        <ul>${data.experience.courses.map(c => `<li>${c}</li>`).join('')}</ul>
      `;
    },
    awards(el) {
      el.innerHTML = `
        <summary><strong>${data.awards.title}</strong></summary>
        <h4>${data.awards.coachTitle}</h4>
        <ul><li>${data.awards.coach[0]}<ul>${data.awards.coach.slice(1).map(a => `<li>${a}</li>`).join('')}</ul></li><li>${data.awards.coachSummary}</li></ul>
        <h4>${data.awards.personalTitle}</h4>
        <ul>${data.awards.personal.map(a => `<li>${a}</li>`).join('')}</ul>
        <h4>${data.awards.teamTitle}</h4>
        <ul>${data.awards.team.map(t => `<li>${t}</li>`).join('')}</ul>
      `;
    },
    expert(el) {
      el.innerHTML = `
        <summary><strong>${data.expert.title}</strong></summary>
        <div class="carousel" id="expertCarousel"><button class="prev" id="expertPrev" aria-label="Предыдущее фото">&#10094;</button><div class="carousel-track" id="expertTrack"></div><button class="next" id="expertNext" aria-label="Следующее фото">&#10095;</button></div>
        <ul>${data.expert.list.map(e => `<li>${e}</li>`).join('')}</ul>
      `;
    },
    publications(el) {
      el.innerHTML = `
        <summary><strong>${data.publications.title}</strong></summary>
        <div class="lectures-grid">${data.publications.items.map(p => `<figure><img loading="lazy" src="${p.img}" alt="${p.title}" /><figcaption>${p.title}</figcaption></figure>`).join('')}</div>
      `;
    },
    portfolio(el) {
      el.innerHTML = `
        <summary><strong>${data.portfolio.title}</strong></summary>
        <div class="portfolio-grid">${data.portfolio.items.map(i => `<div class="portfolio-item"><lottie-player src="${i.src}" loop></lottie-player><p>${i.title}</p></div>`).join('')}</div>
      `;
    },
    interests(el) {
      el.innerHTML = `
        <summary><strong>${data.interests.title}</strong></summary>
        <p>${data.interests.text}</p>
      `;
    }
  };

  for (const [key, fn] of Object.entries(mappers)) {
    const el = document.querySelector(`[data-cms="${key}"]`);
    if (el) fn(el);
  }
}

if (!window.__cmsLoaded) {
  window.__cmsLoaded = true;
  initCMS();
}
