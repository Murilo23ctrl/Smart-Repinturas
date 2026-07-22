 /* ===========================================================
   SMART REPINTURAS — SCRIPT.JS
   Loader, menu mobile e formulário de contato
=========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader de página ---------- */
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 350);
  });
  /* fallback: some mesmo sem o evento load em tempo hábil */
  setTimeout(() => loader.classList.add('hidden'), 2500);

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');

  const closeMenu = () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  };

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  });

  /* ---------- Formulário de contato ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    const texto = `Olá! Meu nome é ${nome}.%0ATelefone: ${telefone}%0A%0A${mensagem}`;
    const whatsappURL = `https://wa.me/5516000000000?text=${texto}`;

    formNote.textContent = 'Redirecionando para o WhatsApp...';
    formNote.style.color = '#34c759';

    window.open(whatsappURL, '_blank', 'noopener');
    contactForm.reset();
  });

  /* ---------- Newsletter (rodapé) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      input.value = '';
      input.placeholder = 'Inscrição confirmada!';
      setTimeout(() => { input.placeholder = 'Seu e-mail'; }, 3000);
    });
  }

});
