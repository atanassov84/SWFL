// =============================================
// NAVBAR SCROLL
// =============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// =============================================
// MOBILE MENU
// =============================================
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// =============================================
// LANGUAGE TOGGLE
// =============================================
let currentLang = 'de';

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('[data-de][data-en]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (val !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('[data-placeholder-de][data-placeholder-en]').forEach(el => {
    el.placeholder = el.getAttribute('data-placeholder-' + lang);
  });

  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = lang === 'de' ? 'EN' : 'DE';
  });

  document.documentElement.lang = lang;
}

document.querySelectorAll('.lang-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLang(currentLang === 'de' ? 'en' : 'de');
  });
});

// =============================================
// SCROLL ANIMATIONS
// =============================================
const fadeEls = document.querySelectorAll(
  '.service-card, .stat, .about-inner, .contact-inner, .hero-content, .hero-visual, .section-header'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// =============================================
// CONTACT FORM (demo)
// =============================================
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

form?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = currentLang === 'de' ? 'Wird gesendet…' : 'Sending…';

  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.textContent = currentLang === 'de' ? 'Nachricht senden' : 'Send message';
    formSuccess.textContent = formSuccess.getAttribute('data-' + currentLang);
    formSuccess.classList.add('visible');
    setTimeout(() => formSuccess.classList.remove('visible'), 5000);
  }, 1200);
});
