// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
reveals.forEach(el => observer.observe(el));

// SPA-style navigation: update path like /Boutique without reloading
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a, .hero-pill, .div-cta');

function updateActiveNavById(id) {
  navLinks.forEach(a => {
    const target = a.dataset.section || a.getAttribute('href').replace('#','');
    if (target === id) {
      a.style.opacity = '1';
      a.style.color = 'var(--gold)';
    } else {
      a.style.opacity = '0.72';
      a.style.color = '';
    }
  });
}

function navigateTo(sectionId, path, push = true) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (push) history.pushState({ section: sectionId }, '', path);
  updateActiveNavById(sectionId);
}

// Attach click handlers to links that have data-section / data-path
document.querySelectorAll('[data-section]').forEach(a => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    const section = a.dataset.section;
    const path = a.dataset.path || ('/' + section.charAt(0).toUpperCase() + section.slice(1));
    navigateTo(section, path);
  });
});

// Handle back/forward
window.addEventListener('popstate', (ev) => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (!path) return;
  const match = Array.from(sections).find(s => s.id.toLowerCase() === path);
  if (match) match.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateActiveNavById(path);
});

// On load, respect pathname (e.g., /Boutique)
window.addEventListener('load', () => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    setTimeout(() => heroLogo.classList.add('visible'), 180);
  }
  if (path) {
    const match = Array.from(sections).find(s => s.id.toLowerCase() === path);
    if (match) setTimeout(() => { match.scrollIntoView({ behavior: 'smooth' }) }, 50);
    updateActiveNavById(path);
  }
});

function buildWhatsAppMessage(form, data) {
  const labels = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    notes: 'Notes',
    stockType: 'Stock requested',
    projectSize: 'Project size',
    interest: 'Interest',
    category: 'Category',
    projectType: 'Project type',
    focus: 'Focus'
  };

  const lines = ['New inquiry from De Hierarchy'];
  const division = data.division || form.dataset.division || 'General';
  lines.push(`Division: ${division}`);

  Object.entries(data).forEach(([key, value]) => {
    if (!value) return;
    const label = labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
    lines.push(`${label}: ${value}`);
  });

  return lines.join('\n');
}

// Order form handling: send inquiries to WhatsApp
const whatsappNumber = '2349056791476';
document.querySelectorAll('.order-form').forEach(form => {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.division = form.dataset.division || '';

    const message = buildWhatsAppMessage(form, data);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    const success = form.querySelector('.order-success');
    if (success) success.style.display = 'block';
    form.reset();
  });
});

// Hide header when footer is visible (dynamic)
(function () {
  const footerEl = document.querySelector('footer');
  const navEl = document.querySelector('nav');
  if (!footerEl || !navEl) return;
  const fo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) navEl.classList.add('nav-hidden');
      else navEl.classList.remove('nav-hidden');
    });
  }, { threshold: 0.05 });
  fo.observe(footerEl);
})();
