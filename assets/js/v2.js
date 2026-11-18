(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Masthead border once scrolled
  var mast = document.querySelector('.mast');
  function onScroll() { mast.classList.toggle('is-stuck', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.querySelector('.mast-burger');
  var mmenu = document.getElementById('mmenu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('span').textContent = open ? 'Close' : 'Menu';
    mmenu.hidden = !open;
  }
  burger.addEventListener('click', function () { setMenu(mmenu.hidden); });
  mmenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1040) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mmenu.hidden) { setMenu(false); burger.focus(); } });

  // Menu pages are not built yet
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-nolink]')) e.preventDefault();
  });

  // Film pause
  var film = document.querySelector('.film');
  var filmBtn = document.querySelector('.film-btn');
  var chipVid = document.querySelector('.chip-round video');
  if (reduce) { [film, chipVid].forEach(function (v) { if (v) { v.removeAttribute('autoplay'); v.pause(); } }); filmBtn.textContent = 'Play'; filmBtn.setAttribute('aria-pressed', 'true'); }
  filmBtn.addEventListener('click', function () {
    var paused = film.paused;
    [film, chipVid].forEach(function (v) { if (v) { if (paused) v.play(); else v.pause(); } });
    filmBtn.textContent = paused ? 'Pause' : 'Play';
    filmBtn.setAttribute('aria-pressed', String(!paused));
  });

  // Tally count-up
  function count(el) {
    var end = +el.getAttribute('data-n');
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  var tally = document.querySelector('[data-tally]');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) tally.querySelectorAll('[data-n]').forEach(count); });
    }, { threshold: .3 }).observe(tally);
  }

  // Reveals
  var rs = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    rs.forEach(function (r) { r.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rs.forEach(function (r) { io.observe(r); });
  }

  // Full property list
  var pbtn = document.querySelector('[data-plist-btn]');
  var plist = document.getElementById('plist');
  pbtn.addEventListener('click', function () {
    var open = plist.hidden;
    plist.hidden = !open;
    pbtn.setAttribute('aria-expanded', String(open));
    pbtn.textContent = open ? 'Hide the list' : 'See all 30 properties';
    if (open) plist.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  // Inquiry form
  var form = document.querySelector('.talk-form');
  var note = form.querySelector('.tf-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.tf').classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please add your name and a valid email.'; return; }
    var topic = form.querySelector('input[name="topic"]:checked').value;
    var body = 'Name: ' + form.elements.name.value + '\nEmail: ' + form.elements.email.value + '\nPhone: ' + form.elements.phone.value + '\n\n' + form.elements.message.value;
    window.location.href = 'mailto:info@elitedevelopments.ca?subject=' + encodeURIComponent('Website inquiry: ' + topic) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app. You can also call (780) 244-0021.';
  });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
