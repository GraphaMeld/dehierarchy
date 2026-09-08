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
    const isActive = target === id;
    if (isActive) {
      a.style.opacity = '1';
      a.style.color = 'var(--gold)';
      a.classList.add('active-nav-link');
      a.setAttribute('aria-current', 'page');
    } else {
      a.style.opacity = '0.72';
      a.style.color = '';
      a.classList.remove('active-nav-link');
      a.removeAttribute('aria-current');
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
    const href = a.getAttribute('href') || '';
    if (href.includes('.html') || href.startsWith('mailto:') || href.startsWith('tel:') || (href && !href.startsWith('#'))) {
      return;
    }
    ev.preventDefault();
    const section = a.dataset.section;
    if (!section) return;
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

// Mobile menu toggle
const navToggles = document.querySelectorAll('.nav-toggle');
navToggles.forEach(toggle => {
  const menu = toggle.closest('.nav-menu');
  const links = menu?.querySelector('.nav-links');
  if (!links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  });
});

// Move nav-menu into the hero title area on small screens
(function () {
  const movedFlag = 'data-nav-moved';
  function moveMenus() {
    const isMobile = window.innerWidth <= 900;
    document.querySelectorAll('.division-nav .nav-menu').forEach(menu => {
      const header = menu.closest('.division-page-header');
      if (!header) return;
      const hero = header.querySelector('.division-hero');
      if (!hero) return;
      if (isMobile && !menu.hasAttribute(movedFlag)) {
        // store original parent
        menu.dataset.originalParent = menu.parentNode ? Array.prototype.indexOf.call(menu.parentNode.children, menu) : '-1';
        menu._origParent = menu.parentNode;
        hero.appendChild(menu);
        menu.setAttribute(movedFlag, 'true');
      } else if (!isMobile && menu.hasAttribute(movedFlag)) {
        // move back
        if (menu._origParent) menu._origParent.appendChild(menu);
        menu.removeAttribute(movedFlag);
      }
    });
  }
  window.addEventListener('load', moveMenus);
  window.addEventListener('resize', () => {
    // debounce
    clearTimeout(window.__moveNavTimer);
    window.__moveNavTimer = setTimeout(moveMenus, 120);
  });
})();

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

    const emailRecipient = form.dataset.email;
    if (emailRecipient) {
      const subject = `Contact request from ${data.name || 'Website Visitor'}`;
      const body = [`Name: ${data.name || ''}`, `Email: ${data.email || ''}`, `Address: ${data.address || ''}`, `Phone: ${data.phone || ''}`, `Message: ${data.notes || ''}`].join('\n');
      const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    } else {
      const message = buildWhatsAppMessage(form, data);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    const success = form.querySelector('.order-success');
    if (success) success.style.display = 'block';
    form.reset();
  });
});

// Boutique gallery
document.querySelectorAll('.boutique-gallery').forEach(gallery => {
  const images = Array.from(gallery.querySelectorAll('.boutique-gallery__image'));
  const dots = Array.from(gallery.querySelectorAll('.boutique-gallery__dots button'));
  const previous = gallery.querySelector('.boutique-gallery__button--prev');
  const next = gallery.querySelector('.boutique-gallery__button--next');
  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === currentIndex));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  previous?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    showImage(currentIndex - 1);
  });

  next?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    showImage(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showImage(index);
    });
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
