(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shadow on scroll */
  var hdr = document.querySelector('.hdr');
  var setH = function () { document.documentElement.style.setProperty('--hdr-h', hdr.getBoundingClientRect().height + 'px'); };
  var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 40); setH(); };
  window.addEventListener('resize', setH);
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

  /* Ledger: numbers roll up each time the panel comes into view */
  var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  var ledger = document.querySelector('.ledger');
  var running = false;
  function rollAll(delay) {
    if (reduce || running) return;
    running = true;
    if (ledger) { ledger.classList.remove('is-live'); void ledger.offsetWidth; ledger.classList.add('is-live'); }
    nums.forEach(function (el, i) {
      var end = +el.getAttribute('data-count');
      el.textContent = '0';
      setTimeout(function () {
        var t0 = performance.now();
        (function tick(now) {
          var p = Math.min((now - t0) / 2000, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(tick);
          else if (i === nums.length - 1) running = false;
        })(t0);
      }, delay + i * 160);
    });
  }
  if (ledger) {
    rollAll(700);
    if ('IntersectionObserver' in window) {
      var first = true;
      new IntersectionObserver(function (en) {
        if (first) { first = false; return; }
        if (en[0].isIntersecting) rollAll(0);
      }, { threshold: 0.15 }).observe(ledger);
    }
  }

  /* Scroll spy: highlight the menu item for the section in view */
  var spyLinks = document.querySelectorAll('[data-spy]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-spy') === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'leadership', 'portfolio', 'developments', 'group', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }

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

  /* Developments filter */
  var pfGrid = document.querySelector('[data-pf]');
  if (pfGrid) {
    var pfBtns = document.querySelectorAll('.pf-filter button');
    var pfs = pfGrid.querySelectorAll('.pf');
    pfBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        pfBtns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
        pfGrid.classList.toggle('is-filtered', f !== 'all');
        pfs.forEach(function (p) {
          var show = f === 'all' || p.getAttribute('data-status') === f;
          p.classList.toggle('is-hidden', !show);
          p.classList.remove('is-new');
          if (show) { void p.offsetWidth; p.classList.add('is-new'); }
        });
      });
    });
  }

  /* Portfolio spotlight: tabs, arrows, thumbnails, auto-advance */
  var spot = document.querySelector('.spot');
  if (spot) {
    var thumbs = Array.prototype.slice.call(spot.querySelectorAll('.sp-thumb'));
    var img = spot.querySelector('[data-sp-img]');
    var sName = spot.querySelector('[data-sp-name]'), sAddr = spot.querySelector('[data-sp-addr]'), sCity = spot.querySelector('[data-sp-city]');
    var sCur = spot.querySelector('[data-sp-cur]'), sTot = spot.querySelector('[data-sp-total]');
    var timer = spot.querySelector('.spot-timer');
    var strip = spot.querySelector('[data-sp-strip]');
    var cat = 'all', list = thumbs.slice(), idx = 0, tmo = null, inView = false, hover = false, DUR = 5000;
    spot.style.setProperty('--sp-dur', DUR + 'ms');
    var show = function (i) {
      idx = (i + list.length) % list.length;
      var t = list[idx];
      thumbs.forEach(function (x) { x.classList.toggle('is-on', x === t); });
      sName.textContent = t.getAttribute('data-name');
      sAddr.textContent = t.getAttribute('data-addr');
      sCity.textContent = t.getAttribute('data-city');
      sCur.textContent = idx + 1; sTot.textContent = list.length;
      img.classList.add('is-swap'); img.classList.remove('is-in');
      setTimeout(function () {
        img.src = t.getAttribute('data-img');
        img.alt = t.getAttribute('data-name') + ', ' + t.getAttribute('data-addr');
        var done = function () { img.classList.remove('is-swap'); void img.offsetWidth; img.classList.add('is-in'); };
        if (img.complete) done(); else img.onload = done;
      }, 220);
      var li = t.parentNode;
      strip.scrollTo({ left: li.offsetLeft - strip.clientWidth / 2 + li.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      schedule();
    };
    var schedule = function () {
      clearTimeout(tmo);
      timer.classList.remove('is-run'); void timer.offsetWidth;
      if (reduce || !inView || hover) return;
      timer.classList.add('is-run');
      tmo = setTimeout(function () { show(idx + 1); }, DUR);
    };
    thumbs.forEach(function (t) { t.addEventListener('click', function () { show(list.indexOf(t)); }); });
    spot.querySelector('[data-sp-prev]').addEventListener('click', function () { show(idx - 1); });
    spot.querySelector('[data-sp-next]').addEventListener('click', function () { show(idx + 1); });
    spot.querySelectorAll('.spot-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-cat');
        spot.querySelectorAll('.spot-tabs button').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
        list = thumbs.filter(function (t) { var ok = cat === 'all' || t.getAttribute('data-cat') === cat; t.parentNode.classList.toggle('is-hidden', !ok); return ok; });
        show(0);
      });
    });
    var stage = spot.querySelector('.spot-stage');
    stage.addEventListener('mouseenter', function () { hover = true; spot.classList.add('is-paused'); clearTimeout(tmo); });
    stage.addEventListener('mouseleave', function () { hover = false; spot.classList.remove('is-paused'); schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.3 }).observe(stage);
    }
    img.classList.add('is-in');
  }

  /* Contact form: validate, then open the visitor's email app */
  var cform = document.querySelector('.cform');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = cform.querySelector('.cnote');
      var n = cform.elements.name, em = cform.elements.email, ok = true;
      [n, em].forEach(function (f) { f.closest('.cf').classList.remove('has-error'); });
      if (!n.value.trim()) { n.closest('.cf').classList.add('has-error'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.closest('.cf').classList.add('has-error'); ok = false; }
      if (!ok) { note.textContent = 'Please add your name and a valid email address.'; return; }
      var topic = cform.elements.topic.value;
      var body = 'Name: ' + n.value + '\nPhone: ' + cform.elements.phone.value + '\nEmail: ' + em.value + '\nInterested in: ' + topic + '\n\n' + cform.elements.message.value;
      window.location.href = 'mailto:info@elitedevelopments.ca?subject=' + encodeURIComponent('Website inquiry: ' + topic) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Thanks. Your email app should open with your message ready to send.';
    });
  }

  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
