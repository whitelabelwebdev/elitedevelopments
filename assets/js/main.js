(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shadow on scroll */
  var hdr = document.querySelector('.hdr');
  var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && !a.hasAttribute('data-nolink')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  document.querySelectorAll('[data-nolink]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Hero film: pause/play, paused for reduced motion */
  var video = document.querySelector('.hero-video');
  var vt = document.querySelector('.vid-toggle');
  if (video && vt) {
    var setPaused = function (p) {
      if (p) video.pause(); else video.play().catch(function () {});
      vt.setAttribute('aria-pressed', String(p));
      vt.setAttribute('aria-label', p ? 'Play background video' : 'Pause background video');
    };
    if (reduce) setPaused(true);
    vt.addEventListener('click', function () { setPaused(!video.paused); });
  }

  /* Ledger count up */
  document.querySelectorAll('[data-count]').forEach(function (el, i) {
    var end = +el.getAttribute('data-count');
    if (reduce) return;
    el.textContent = '0';
    setTimeout(function () {
      var t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / 1600, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, 800 + i * 120);
  });

  /* Reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Portfolio directory: hover a property to preview its photo */
  var view = document.querySelector('[data-dir-img]');
  var cap = document.querySelector('[data-dir-cap]');
  if (view) {
    var t = null;
    document.querySelectorAll('.dgroup li[data-img]').forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        var src = li.getAttribute('data-img');
        cap.textContent = li.querySelector('.dn').textContent;
        if (view.getAttribute('src') === src) return;
        view.classList.add('is-swap');
        clearTimeout(t);
        t = setTimeout(function () { view.src = src; view.onload = function () { view.classList.remove('is-swap'); }; }, 160);
      });
    });
  }

  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
