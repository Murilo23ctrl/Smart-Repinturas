/* ===========================================================
   SMART REPINTURAS — SCROLL.JS
   Header inteligente + animações de revelação no scroll
=========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header inteligente ---------- */
  const header = document.getElementById('siteHeader');
  const toggleHeader = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  /* ---------- Delay em cascata para grids ---------- */
  const cascadeGroups = document.querySelectorAll('.diff-grid, .product-grid, .blog-grid');
  cascadeGroups.forEach(group => {
    const items = group.querySelectorAll('.reveal-up');
    items.forEach((item, i) => {
      item.style.setProperty('--d', `${(i % 8) * 0.08}s`);
    });
  });

  /* ---------- Intersection Observer: fade/slide up ---------- */
  const revealEls = document.querySelectorAll('.reveal-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ---------- Marca ano corrente no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Ativa link do menu conforme seção visível ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => navObserver.observe(sec));

});
