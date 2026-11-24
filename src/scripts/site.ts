const header = document.querySelector<HTMLElement>('[data-site-header]');
if (header) { const sync = () => header.classList.toggle('is-scrolled', window.scrollY > 8); sync(); window.addEventListener('scroll', sync, { passive: true }); }
