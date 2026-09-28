/* ===========================================================
   SMART REPINTURAS — SLIDER.JS
   Slider automático de depoimentos
=========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Carrossel de fundo do Hero ---------- */
  const heroMedia = document.getElementById('heroMedia');
  const heroDotsWrap = document.getElementById('heroDots');

  if (heroMedia && heroDotsWrap) {
    const slides = Array.from(heroMedia.querySelectorAll('.hero-slide'));
    let heroCurrent = 0;
    const HERO_INTERVAL = 6000;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir para imagem ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToHeroSlide(i, true));
      heroDotsWrap.appendChild(dot);
    });
    const heroDots = Array.from(heroDotsWrap.children);

    function goToHeroSlide(index, manual) {
      slides[heroCurrent].classList.remove('active');
      heroDots[heroCurrent].classList.remove('active');
      heroCurrent = (index + slides.length) % slides.length;
      slides[heroCurrent].classList.add('active');
      heroDots[heroCurrent].classList.add('active');
      if (manual) restartHeroAuto();
    }

    let heroTimer = setInterval(() => goToHeroSlide(heroCurrent + 1), HERO_INTERVAL);
    function restartHeroAuto() {
      clearInterval(heroTimer);
      heroTimer = setInterval(() => goToHeroSlide(heroCurrent + 1), HERO_INTERVAL);
    }
  }

  /* ---------- Slider de depoimentos ---------- */
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  let current = 0;
  let autoTimer = null;
  const AUTO_INTERVAL = 5500;

  /* cria os dots */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index, manual) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (manual) restartAuto();
  }

  function next() { goTo(current + 1); }

  function startAuto() {
    autoTimer = setInterval(next, AUTO_INTERVAL);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  /* pausa ao passar o mouse */
  const slider = document.getElementById('testiSlider');
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('mouseleave', startAuto);

  /* suporte a swipe no mobile */
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current - 1, true) : goTo(current + 1, true);
    }
  }, { passive: true });

});
