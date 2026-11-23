/* Un Momentico preview v2: language, review markers, menu, local-only forms, clock. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'um-lang', RKEY = 'um-review';

  function setLang(l) {
    l = l === 'es' ? 'es' : 'en';
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === l ? 'true' : 'false');
    });
    document.querySelectorAll('option[data-en]').forEach(function (o) { o.textContent = o.getAttribute('data-' + l); });
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
  }
  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });
  setLang(root.getAttribute('data-lang'));

  function setReview(on) {
    root.classList.toggle('review', on);
    try { localStorage.setItem(RKEY, on ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('.review-toggle').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  document.querySelectorAll('.review-toggle').forEach(function (b) {
    b.addEventListener('click', function () { setReview(!root.classList.contains('review')); });
  });
  setReview(root.classList.contains('review'));

  var head = document.querySelector('.site-head');
  if (head) {
    var onScroll = function () { head.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }

  // Local-only forms: nothing is sent anywhere.
  document.querySelectorAll('form[data-local]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var ok = f.querySelector('.form-ok');
      if (ok) { ok.classList.add('show'); ok.setAttribute('tabindex', '-1'); ok.focus(); }
      f.querySelectorAll('input:not([type=hidden]),textarea').forEach(function (i) { if (i.type !== 'checkbox' && i.type !== 'radio') i.value = ''; });
    });
  });

  // The open clock draws once when it enters the viewport.
  var dial = document.querySelector('.dial');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (dial && !reduce && 'IntersectionObserver' in window) {
    dial.classList.add('armed');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { requestAnimationFrame(function () { dial.classList.add('go'); }); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(dial);
  }
})();
