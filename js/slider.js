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

/* ---------- Roda giratória de produtos (arraste com mouse ou dedo) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const wheel = document.querySelector('.product-grid');
  if (!wheel) return;
  /* quem prefere menos movimento continua vendo a grade normal */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = Array.from(wheel.querySelectorAll('.product-card'));
  if (cards.length < 3) return;

  /* cada card entra num "slot" que é quem gira; o card mantém
     a animação de entrada (reveal-up) e o hover originais */
  const slots = cards.map(card => {
    const slot = document.createElement('div');
    slot.className = 'pw-slot';
    card.parentNode.insertBefore(slot, card);
    slot.appendChild(card);
    return slot;
  });

  wheel.classList.add('pw-on');
  wheel.setAttribute('tabindex', '0');
  wheel.setAttribute('aria-label', 'Produtos: arraste ou use as setas do teclado para girar');

  const hint = document.createElement('p');
  hint.className = 'pw-hint';
  hint.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    'Arraste para girar' +
    '<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  wheel.insertAdjacentElement('afterend', hint);

  const STEP = 0.15;                     /* ângulo entre cards (~8,6°) */
  const period = STEP * slots.length;    /* volta completa da roda */
  const half = period / 2;
  let R = 1;                             /* raio da roda, calculado pelo tamanho do card */
  let rotation = -2 * STEP;              /* começa com os cards em ordem de leitura */
  let velocity = 0, target = null;
  let dragging = false, pointerId = null, lastX = 0, lastT = 0, moved = 0, downSlot = null;
  let raf = null, lastFrame = 0;

  function measure() {
    const cardW = slots[0].offsetWidth;
    const cardH = slots[0].offsetHeight;
    R = (cardW * 1.1) / STEP;
    const visible = Math.min(half, Math.asin(Math.min(1, (wheel.clientWidth / 2) / R)));
    const drop = R * (1 - Math.cos(visible));
    wheel.style.height = Math.round(24 + cardH + drop + 6) + 'px';
  }

  function render() {
    let best = null, bestA = Infinity;
    slots.forEach((slot, i) => {
      let a = rotation + i * STEP;
      a = ((a + half) % period + period) % period - half;   /* mantém a roda infinita */
      const t = Math.abs(a) / half;                           /* 0 no centro, 1 na borda */
      const x = R * Math.sin(a);
      const y = R * (1 - Math.cos(a));
      const scale = 1 - 0.14 * t;
      const opacity = t < 0.72 ? 1 : Math.max(0, 1 - (t - 0.72) / 0.28);
      const light = 1 - 0.45 * Math.min(1, t * 1.6);
      slot.style.transform = `translate(-50%,0) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${a.toFixed(4)}rad) scale(${scale.toFixed(4)})`;
      slot.style.opacity = opacity.toFixed(3);
      slot.style.filter = `brightness(${light.toFixed(3)})`;
      slot.style.zIndex = String(1000 - Math.round(t * 1000));
      slot.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      if (Math.abs(a) < bestA) { bestA = Math.abs(a); best = slot; }
    });
    slots.forEach(slot => slot.classList.toggle('is-center', slot === best));
  }

  /* inércia depois de soltar + encaixe suave no card mais próximo */
  function loop(now) {
    const dt = lastFrame ? Math.min(48, now - lastFrame) : 16;
    lastFrame = now;
    raf = null;
    if (dragging) return;

    if (target === null) {
      if (Math.abs(velocity) > 0.00004) {
        rotation += velocity * dt;
        velocity *= Math.pow(0.94, dt / 16);
        render();
        raf = requestAnimationFrame(loop);
        return;
      }
      target = Math.round(rotation / STEP) * STEP;
    }

    const d = target - rotation;
    if (Math.abs(d) < 0.0003) {
      rotation = target; target = null; velocity = 0; lastFrame = 0;
      render();
      return;
    }
    rotation += d * (1 - Math.pow(0.84, dt / 16));
    render();
    raf = requestAnimationFrame(loop);
  }

  function kick() {
    if (!raf) { lastFrame = 0; raf = requestAnimationFrame(loop); }
  }

  /* leva um card específico para o centro */
  function goTo(index) {
    const k = Math.round((rotation + index * STEP) / period);
    target = -index * STEP + k * period;
    velocity = 0;
    kick();
  }

  wheel.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    lastX = e.clientX;
    lastT = performance.now();
    moved = 0; velocity = 0; target = null;
    downSlot = e.target.closest('.pw-slot');
    wheel.classList.add('is-dragging');
    wheel.setPointerCapture(e.pointerId);
  });

  wheel.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(1, now - lastT);
    moved += Math.abs(dx);
    rotation += dx / R;
    velocity = velocity * 0.6 + (dx / R / dt) * 0.4;
    lastX = e.clientX;
    lastT = now;
    render();
  });

  function release(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    wheel.classList.remove('is-dragging');
    if (performance.now() - lastT > 90) velocity = 0;   /* parou antes de soltar */
    if (moved < 6 && downSlot) goTo(slots.indexOf(downSlot));   /* clique num card: centraliza */
    else kick();
  }
  wheel.addEventListener('pointerup', release);
  wheel.addEventListener('pointercancel', release);

  wheel.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const base = target !== null ? target : Math.round(rotation / STEP) * STEP;
    target = base + (e.key === 'ArrowRight' ? -STEP : STEP);
    velocity = 0;
    kick();
  });

  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = null; measure(); render(); });
  });

  measure();
  render();

  /* cursor "ARRASTE" que segue o mouse (só em computador) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'pw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span>Arraste</span>';
    document.body.appendChild(cursor);
    wheel.classList.add('has-cursor');

    let cx = 0, cy = 0, tx = 0, ty = 0, cScale = 0, over = false, cRaf = null;
    const follow = () => {
      cx += (tx - cx) * 0.3;
      cy += (ty - cy) * 0.3;
      const goal = !over ? 0 : dragging ? 0.72 : 1;
      cScale += (goal - cScale) * 0.2;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) scale(${cScale.toFixed(3)})`;
      if (!over && cScale < 0.01) { cRaf = null; cursor.style.opacity = '0'; return; }
      cRaf = requestAnimationFrame(follow);
    };

    wheel.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      over = true;
      tx = e.clientX; ty = e.clientY;
      if (!cRaf) { cx = tx; cy = ty; cRaf = requestAnimationFrame(follow); }
      cursor.style.opacity = '1';
    });
    wheel.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
    });
    wheel.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      over = false;
    });
  }
});
