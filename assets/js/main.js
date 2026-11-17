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

  /* Hero video: pause/play control, respects reduced motion */
  var video = document.querySelector('.hero-video');
  var vt = document.querySelector('.vid-toggle');
  if (video && vt) {
    var setPaused = function (p) {
      if (p) video.pause(); else video.play().catch(function () {});
      vt.setAttribute('aria-pressed', String(p));
      vt.setAttribute('aria-label', p ? 'Play background video' : 'Pause background video');
      vt.querySelector('.vt-label').textContent = p ? 'Play film' : 'Pause film';
    };
    if (reduce) setPaused(true);
    vt.addEventListener('click', function () { setPaused(!video.paused ? true : false); });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Fast facts count up when visible */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute('data-count'), t0 = performance.now();
        (function tick(now) {
          var p = Math.min((now - t0) / 1700, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { c.textContent = '0'; cio.observe(c); });
  }

  /* Developments filter (same groups as the live site) */
  var fbtns = document.querySelectorAll('.filter button');
  var dcards = document.querySelectorAll('.dcard');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fbtns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      dcards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-status') === f;
        c.classList.toggle('is-hidden', !show);
        c.classList.remove('is-new');
        if (show) { void c.offsetWidth; c.classList.add('is-new'); }
      });
    });
  });

  /* Portfolio slider with counter */
  var track = document.querySelector('[data-track]');
  if (track) {
    var items = track.querySelectorAll('.place');
    var cur = document.querySelector('[data-cur]');
    var prev = document.querySelector('[data-prev]');
    var next = document.querySelector('[data-next]');
    var step = function () { return items[0].getBoundingClientRect().width + 14; };
    var update = function () {
      var i = Math.round(track.scrollLeft / step());
      cur.textContent = Math.min(items.length, i + 1);
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* CTA image parallax */
  var ctaImg = document.querySelector('.cta-img img');
  if (ctaImg && !reduce) {
    var cta = document.querySelector('.cta'), ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var r = cta.getBoundingClientRect();
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        if (p > -0.1 && p < 1.1) ctaImg.style.transform = 'translateY(' + (-p * 16) + '%)';
        ticking = false;
      });
    }, { passive: true });
  }

  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
