// js/ui.js
document.addEventListener('DOMContentLoaded', () => {
  // page fade-in
  document.body.style.opacity = 0;
  requestAnimationFrame(()=> {
    document.body.style.transition = 'opacity .35s ease';
    document.body.style.opacity = 1;
  });

  // intercept internal links for fade-out then navigate
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const to = href;
      document.body.style.opacity = 0;
      setTimeout(()=> window.location.href = to, 260);
    });
  });
});
