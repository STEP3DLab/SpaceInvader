const metaMap = {
  '': {
    title: 'Владимир Ганьшин — визитка',
    description: 'Визитка Владимира Ганьшина',
    image: 'Avatar_Ganshin.jpg'
  },
  '#portfolio': {
    title: 'Портфолио — Владимир Ганьшин',
    description: 'Примеры работ Владимира Ганьшина',
    image: 'Avatar_Ganshin.jpg'
  }
};

function updateMeta(hash) {
  const data = metaMap[hash] || metaMap[''];
  document.querySelector('meta[property="og:title"]').setAttribute('content', data.title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', data.description);
  document.querySelector('meta[property="og:image"]').setAttribute('content', data.image);
  document.querySelector('meta[name="twitter:title"]').setAttribute('content', data.title);
  document.querySelector('meta[name="twitter:description"]').setAttribute('content', data.description);
  document.querySelector('meta[name="twitter:image"]').setAttribute('content', data.image);
}

window.addEventListener('hashchange', () => updateMeta(location.hash));
updateMeta(location.hash);

// breadcrumbs
function buildBreadcrumbs() {
  const links = document.querySelectorAll('.top-nav a');
  const items = Array.from(links).map((link, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: link.textContent.trim(),
    item: link.href
  }));
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
  const el = document.getElementById('breadcrumbsJson');
  if (el) {
    el.textContent = JSON.stringify(json);
  }
}

document.addEventListener('DOMContentLoaded', buildBreadcrumbs);
