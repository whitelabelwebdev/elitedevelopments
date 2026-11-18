(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Header: transparent over hero, solid after
  var hd = $('#hd');
  function onScroll() { hd.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Drawer menu
  var burger = $('.hd-burger');
  var drawer = $('#drawer');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) hd.classList.add('is-solid'); else onScroll();
  }
  burger.addEventListener('click', function () { setMenu(drawer.hidden); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1040 && !drawer.hidden) setMenu(false); });

  // Menu pages are not built yet
  document.addEventListener('click', function (e) { if (e.target.closest('[data-nolink]')) e.preventDefault(); });

  // Hero video
  var vid = $('.hero-vid');
  var pause = $('.hero-pause');
  function setPaused(p) {
    if (p) vid.pause(); else vid.play();
    pause.setAttribute('aria-pressed', String(p));
    pause.setAttribute('aria-label', p ? 'Play background video' : 'Pause background video');
  }
  if (reduce) { vid.removeAttribute('autoplay'); setPaused(true); }
  pause.addEventListener('click', function () { setPaused(!vid.paused); });

  // Stats count-up, runs on load and again each time the bar comes back into view
  var stats = $('[data-stats]');
  function countAll() {
    $$('[data-n]', stats).forEach(function (el) {
      var end = +el.getAttribute('data-n');
      if (reduce) { el.textContent = end; return; }
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1800, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) countAll(); }); }, { threshold: .4 }).observe(stats);
  } else { countAll(); }

  // Reveals
  var rs = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    rs.forEach(function (r) { r.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rs.forEach(function (r) { io.observe(r); });
  }

  // Developments slider
  var slides = $$('.dv-slide');
  var picks = $$('.dv-pick');
  var stEl = $('[data-dv-st]'), nameEl = $('[data-dv-name]'), addrEl = $('[data-dv-addr]'), iEl = $('[data-dv-i]');
  var labels = { progress: 'In progress', future: 'Future project', completed: 'Completed' };
  var cur = 0, timer = null, inView = false;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { var on = k === cur; s.classList.toggle('is-on', on); s.setAttribute('aria-hidden', String(!on)); });
    picks.forEach(function (p, k) { p.classList.toggle('is-on', k === cur); p.classList.remove('is-timing'); });
    var p = picks[cur];
    stEl.textContent = labels[p.dataset.st];
    stEl.className = 'dv-st st-' + p.dataset.st;
    nameEl.textContent = p.dataset.name;
    addrEl.textContent = p.dataset.addr;
    iEl.textContent = cur + 1;
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || !inView) return;
    var p = picks[cur];
    void p.offsetWidth;
    p.classList.add('is-timing');
    timer = setTimeout(function () { show(cur + 1); }, 6000);
  }
  picks.forEach(function (p, k) { p.addEventListener('click', function () { show(k); }); });
  $$('[data-dv]').forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.dataset.dv)); }); });
  var dv = $('.dv');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; if (inView) schedule(); else { clearTimeout(timer); picks[cur].classList.remove('is-timing'); } }); }, { threshold: .3 }).observe(dv);
  }
  show(0);

  // Portfolio rail
  var rail = $('[data-rail]');
  var bar = $('[data-rail-bar]');
  function updBar() {
    var max = rail.scrollWidth - rail.clientWidth;
    var w = Math.max(rail.clientWidth / rail.scrollWidth, .08);
    bar.style.width = (w * 100) + '%';
    bar.style.left = (max > 0 ? (rail.scrollLeft / max) * (1 - w) * 100 : 0) + '%';
  }
  rail.addEventListener('scroll', updBar, { passive: true });
  window.addEventListener('resize', updBar);
  $$('[data-rl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = $('.rl-card:not([hidden])', rail);
      var step = card ? card.getBoundingClientRect().width + 22 : 300;
      rail.scrollBy({ left: step * (+b.dataset.rl) * (window.innerWidth > 760 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  $$('.pf-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.pf-tabs button').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      var c = b.dataset.cat;
      $$('.rl-card', rail).forEach(function (card) { card.hidden = !(c === 'all' || card.dataset.cat === c); });
      rail.scrollLeft = 0;
      updBar();
    });
  });
  // Drag to scroll on desktop
  var down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
  window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', function () { if (!down) return; down = false; rail.style.scrollSnapType = ''; });
  rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
  updBar();

  // Inquiry form
  var form = $('.cform');
  var note = $('.cf-note', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.cf').classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please add your name and a valid email.'; return; }
    var topic = $('input[name="topic"]:checked', form).value;
    var body = 'Name: ' + form.elements.name.value + '\nEmail: ' + form.elements.email.value + '\nPhone: ' + form.elements.phone.value + '\n\n' + form.elements.message.value;
    window.location.href = 'mailto:info@elitedevelopments.ca?subject=' + encodeURIComponent('Website inquiry: ' + topic) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app. You can also call (780) 244-0021.';
  });

  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
