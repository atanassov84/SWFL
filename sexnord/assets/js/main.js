/* =====================================================
   SEXNORD – main.js
   ===================================================== */

(function () {
  'use strict';

  // ---- Age Gate ----
  const ageGate = document.getElementById('age-gate');
  const btnEnter = document.getElementById('btn-enter');

  const verified = sessionStorage.getItem('age_verified');
  if (verified) {
    ageGate.classList.add('hidden');
    document.body.classList.add('age-verified');
  }

  if (btnEnter) {
    btnEnter.addEventListener('click', function () {
      sessionStorage.setItem('age_verified', '1');
      ageGate.classList.add('hidden');
      document.body.classList.add('age-verified');
    });
  }

  // ---- Mobile Menu ----
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  // ---- Range Slider Display ----
  const ageMin = document.getElementById('age-min');
  const ageMax = document.getElementById('age-max');
  const ageMinVal = document.getElementById('age-min-val');
  const ageMaxVal = document.getElementById('age-max-val');

  function updateRange() {
    const min = parseInt(ageMin.value);
    const max = parseInt(ageMax.value);
    if (min > max) {
      if (this === ageMin) ageMin.value = max;
      else ageMax.value = min;
    }
    ageMinVal.textContent = ageMin.value;
    ageMaxVal.textContent = ageMax.value;
  }

  if (ageMin && ageMax) {
    ageMin.addEventListener('input', updateRange);
    ageMax.addEventListener('input', updateRange);
  }

  // ---- Favourite Toggle ----
  document.querySelectorAll('.profile-card__fav').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const active = this.classList.toggle('active');
      this.textContent = active ? '♥' : '♡';
      this.style.color = active ? '#ff4444' : '';
    });
  });

  // ---- Sticky Header Shadow ----
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (siteHeader) {
      siteHeader.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(0,0,0,.7)'
        : '0 2px 8px rgba(0,0,0,.5)';
    }
  });

  // ---- View Toggle (grid / list) ----
  const viewBtns = document.querySelectorAll('.view-btn');
  const profilesGrid = document.getElementById('profiles-grid');

  viewBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      viewBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (profilesGrid) {
        if (idx === 1) {
          profilesGrid.style.gridTemplateColumns = '1fr';
        } else {
          profilesGrid.style.gridTemplateColumns = '';
        }
      }
    });
  });

  // ---- Pagination ----
  const pageBtns = document.querySelectorAll('.page-btn:not(.page-btn--prev):not(.page-btn--next)');
  const prevBtn = document.querySelector('.page-btn--prev');
  const nextBtn = document.querySelector('.page-btn--next');
  let currentPage = 1;

  pageBtns.forEach(function (btn) {
    if (!isNaN(parseInt(btn.textContent))) {
      btn.addEventListener('click', function () {
        pageBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        const page = parseInt(btn.textContent);
        if (!isNaN(page)) {
          currentPage = page;
          if (prevBtn) prevBtn.disabled = currentPage === 1;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Filter Apply (visual feedback only) ----
  const btnApply = document.querySelector('.btn-apply-filter');
  if (btnApply) {
    btnApply.addEventListener('click', function () {
      const orig = this.textContent;
      this.textContent = 'Wird angewendet…';
      this.disabled = true;
      setTimeout(() => {
        this.textContent = orig;
        this.disabled = false;
      }, 800);
    });
  }

  // ---- Reset Filter ----
  const btnReset = document.querySelector('.btn-reset-filter');
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      document.querySelectorAll('.filter-checkboxes input').forEach(function (inp) {
        if (inp.type === 'checkbox') {
          inp.checked = inp.closest('label')?.textContent.trim().startsWith('Alle');
        }
        if (inp.type === 'radio') {
          inp.checked = inp.closest('label')?.textContent.trim() === 'Damen';
        }
      });
      if (ageMin) { ageMin.value = 18; ageMinVal.textContent = '18'; }
      if (ageMax) { ageMax.value = 55; ageMaxVal.textContent = '55'; }
    });
  }

  // ---- Header search on mobile ----
  const searchInput = document.querySelector('.header-search__input');
  const searchBtn = document.querySelector('.header-search__btn');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      if (searchInput.value.trim()) {
        alert('Suche nach: ' + searchInput.value.trim());
      }
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        alert('Suche nach: ' + this.value.trim());
      }
    });
  }

})();
