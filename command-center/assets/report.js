(function () {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  fetch('data/sample.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var mr = data.monthlyReport || {};
      var lbl = document.getElementById('rep-month-label');
      var head = document.getElementById('rep-headline');
      var hi = document.getElementById('rep-highlights');
      var worked = document.getElementById('rep-worked');
      var next = document.getElementById('rep-next');
      var plat = document.getElementById('rep-platforms');

      if (lbl && mr.monthLabel) lbl.textContent = mr.monthLabel;
      if (head && mr.headline) head.textContent = mr.headline;

      if (hi && mr.highlights) {
        hi.innerHTML = mr.highlights.map(function (h) {
          return (
            '<div class="kpi-tile">' +
              '<span>' + esc(h.label) + '</span>' +
              '<strong>' + esc(h.value) + '</strong>' +
              '<small>' + esc(h.sub) + '</small>' +
            '</div>'
          );
        }).join('');
      }

      if (worked && mr.whatWorked) {
        worked.innerHTML = mr.whatWorked.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('');
      }

      if (next && mr.nextMonth) {
        next.innerHTML = mr.nextMonth.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
      }

      if (plat && data.platforms) {
        plat.innerHTML = data.platforms.map(function (p) {
          return (
            '<tr>' +
              '<td><strong>' + esc(p.name) + '</strong></td>' +
              '<td>' + esc(p.handle) + '</td>' +
              '<td class="num">' + esc(p.followers) + '</td>' +
              '<td class="num">' + esc(p.reach) + '</td>' +
              '<td class="num">' + esc(p.engagement) + '</td>' +
            '</tr>'
          );
        }).join('');
      }
    });
})();
