/* Un Momentico preview v3 motion: reveal, glass lighting, progress-aware header, section label, parallax, sticky CTA.
   Everything here is skipped or softened when the visitor prefers reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var lang = function () { return root.getAttribute('data-lang') === 'es' ? 'es' : 'en'; };
  if (!reduce && hasIO) root.classList.add('js-motion');

  if (!reduce && hasIO) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { rio.observe(el); });
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); fio.unobserve(e.target); } });
    }, { threshold: 0.25 });
    document.querySelectorAll('.scrollfan').forEach(function (el) { fio.observe(el); });
  }

  // Glass tiles light up while they cross the middle of the screen, so touch screens get the effect too.
  var tiles = document.querySelectorAll('.tile');
  if (tiles.length && hasIO) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('lit', e.isIntersecting); });
    }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
    tiles.forEach(function (t) { tio.observe(t); });
  }

  var head = document.querySelector('.site-head');
  var segs = head ? head.querySelectorAll('.progress i') : [];
  var where = document.querySelector('.where');
  var labelled = Array.prototype.slice.call(document.querySelectorAll('[data-label-en]'));
  var sublinks = Array.prototype.slice.call(document.querySelectorAll('.subnav a'));
  var img = document.querySelector('.hero-door .panel img');
  var mcta = document.querySelector('.mcta');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
    for (var i = 0; i < segs.length; i++) {
      var v = Math.min(1, Math.max(0, p * segs.length - i));
      segs[i].style.transform = 'scaleX(' + v.toFixed(3) + ')';
    }
    var probe = window.innerHeight * 0.3, cur = null;
    labelled.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) cur = s; });
    if (where) {
      var show = cur && y > window.innerHeight * 0.5;
      if (show) where.textContent = cur.getAttribute('data-label-' + lang());
      where.classList.toggle('on', !!show);
    }
    if (sublinks.length) {
      var id = cur && cur.id;
      sublinks.forEach(function (a) { a.classList.toggle('on', !!id && a.getAttribute('href') === '#' + id); });
    }
    if (img && !reduce && y < window.innerHeight * 1.2) {
      img.style.transform = 'translateY(' + (y * 0.07).toFixed(1) + 'px) scale(1.14)';
    }
    if (mcta) mcta.classList.toggle('show', y > window.innerHeight * 0.55);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();
