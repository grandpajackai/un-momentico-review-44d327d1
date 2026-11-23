(function () {
  'use strict';

  var TASK_KEY = 'un_momentico_cc_tasks_v1';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadDoneMap() {
    try {
      var raw = localStorage.getItem(TASK_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveDoneMap(map) {
    try {
      localStorage.setItem(TASK_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function buildSparkline(values, label) {
    var w = 118;
    var h = 36;
    var pad = 4;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = max - min || 1;
    var pts = values.map(function (v, idx) {
      var x = pad + (idx / Math.max(values.length - 1, 1)) * (w - pad * 2);
      var y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    });
    var lineD = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]; }).join(' ');
    var areaD = lineD + ' L' + pts[pts.length - 1][0] + ',' + (h - pad) + ' L' + pts[0][0] + ',' + (h - pad) + ' Z';
    var last = pts[pts.length - 1];
    return (
      '<svg class="sparkline" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label) + ' trend">' +
        '<path d="' + areaD + '" fill="rgba(47, 79, 70, 0.14)"></path>' +
        '<path d="' + lineD + '" fill="none" stroke="#1E3A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' +
        '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3" fill="#B8864B"></circle>' +
      '</svg>'
    );
  }

  function renderToday(tasks) {
    var listEl = document.getElementById('today-list');
    var countEl = document.getElementById('today-count');
    var resetBtn = document.getElementById('reset-tasks');
    if (!listEl) return;

    var doneMap = loadDoneMap();

    function draw() {
      var doneCount = 0;
      listEl.innerHTML = tasks.map(function (t) {
        var isDone = !!doneMap[t.id];
        if (isDone) doneCount += 1;
        return (
          '<div class="task-row' + (isDone ? ' is-done' : '') + '" data-task-id="' + esc(t.id) + '">' +
            '<button type="button" class="task-tap" aria-pressed="' + (isDone ? 'true' : 'false') + '" data-toggle="' + esc(t.id) + '">' +
              (isDone ? '&#10003; Done' : 'Mark done') +
            '</button>' +
            '<div>' +
              '<span class="task-title">' + esc(t.title) + '</span>' +
              '<span class="task-detail">' + esc(t.detail) + '</span>' +
            '</div>' +
            '<div class="task-meta">' +
              '<span class="task-due">Due ' + esc(t.due) + '</span>' +
              '<span class="task-cat">' + esc(t.category) + '</span>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      if (countEl) {
        countEl.textContent = doneCount + ' of ' + tasks.length + ' done';
      }

      var heroDone = document.getElementById('hero-tasks-open');
      if (heroDone) {
        heroDone.textContent = String(tasks.length - doneCount);
      }

      listEl.querySelectorAll('[data-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-toggle');
          doneMap[id] = !doneMap[id];
          saveDoneMap(doneMap);
          draw();
        });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        doneMap = {};
        saveDoneMap(doneMap);
        draw();
      });
    }

    draw();
  }

  function statusClass(key) {
    if (key === 'active') return 'is-active';
    if (key === 'waiting') return 'is-waiting';
    if (key === 'paused') return 'is-paused';
    return 'is-disconnected';
  }

  function renderOperations(ops) {
    var el = document.getElementById('ops-grid');
    if (!el) return;
    el.innerHTML = ops.map(function (op) {
      var flowHtml = op.stages.map(function (st, idx) {
        var cls = st.state === 'done' ? ' is-done' : (st.state === 'current' ? ' is-current' : '');
        var node = '<div class="flow-node' + cls + '"><strong>' + esc(st.label) + '</strong><span>' + esc(st.note) + '</span></div>';
        return idx < op.stages.length - 1 ? node + '<span class="flow-arrow" aria-hidden="true">&rarr;</span>' : node;
      }).join('');

      return (
        '<div class="ops-row">' +
          '<div class="ops-info">' +
            '<div class="ops-info-top">' +
              '<h3>' + esc(op.name) + '</h3>' +
              '<span class="status-chip ' + statusClass(op.statusKey) + '">' + esc(op.status) + '</span>' +
            '</div>' +
            '<p>' + esc(op.summary) + '</p>' +
          '</div>' +
          '<div class="ops-flow" aria-label="' + esc(op.name) + ' pipeline">' + flowHtml + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderPlatforms(platforms) {
    var el = document.getElementById('platform-grid');
    if (!el) return;
    el.innerHTML = platforms.map(function (p) {
      return (
        '<article class="plat-card">' +
          '<div class="plat-top">' +
            '<div>' +
              '<div class="plat-name">' + esc(p.name) + '</div>' +
              '<span class="plat-handle">' + esc(p.handle) + '</span>' +
            '</div>' +
            '<span class="sample-tag">Sample</span>' +
          '</div>' +
          '<div class="plat-metrics">' +
            '<div class="plat-m"><span>' + esc(p.metricLabel) + '</span><strong>' + esc(p.followers) + '</strong></div>' +
            '<div class="plat-m"><span>' + esc(p.reachLabel) + '</span><strong>' + esc(p.reach) + '</strong></div>' +
            '<div class="plat-m"><span>' + esc(p.engLabel) + '</span><strong>' + esc(p.engagement) + '</strong></div>' +
          '</div>' +
          '<div class="plat-spark-wrap">' +
            '<span class="plat-note">' + esc(p.note) + ' &middot; ' + esc(p.delta) + '</span>' +
            buildSparkline(p.spark, p.name) +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWebsiteSearch(ws) {
    var visitsEl = document.getElementById('ws-visits');
    var visitsDeltaEl = document.getElementById('ws-visits-delta');
    var convEl = document.getElementById('ws-conv');
    var convSubEl = document.getElementById('ws-conv-sub');
    var aiStatusEl = document.getElementById('ws-ai-status');
    var pagesEl = document.getElementById('ws-pages');
    var queriesEl = document.getElementById('ws-queries');
    var aiDetailEl = document.getElementById('ws-ai-detail');
    var aiChecksEl = document.getElementById('ws-ai-checks');

    if (visitsEl) visitsEl.textContent = ws.visits;
    if (visitsDeltaEl) visitsDeltaEl.textContent = ws.visitsDelta;
    if (convEl) convEl.textContent = ws.conversionRate;
    if (convSubEl) convSubEl.textContent = ws.bookingConversions + ' inquiries from ' + ws.bookingVisits + ' booking-page visits';
    if (aiStatusEl) aiStatusEl.textContent = ws.aiAnswers.status;

    if (pagesEl) {
      pagesEl.innerHTML = ws.topPages.map(function (r) {
        return '<tr><td>' + esc(r.page) + '</td><td class="num">' + esc(r.views) + '</td></tr>';
      }).join('');
    }
    if (queriesEl) {
      queriesEl.innerHTML = ws.searchQueries.map(function (q) {
        return '<tr><td>' + esc(q.query) + '</td><td class="num">' + esc(q.clicks) + '</td><td class="num">' + esc(q.pos) + '</td></tr>';
      }).join('');
    }
    if (aiDetailEl) aiDetailEl.textContent = ws.aiAnswers.detail;
    if (aiChecksEl) {
      aiChecksEl.innerHTML = ws.aiAnswers.checks.map(function (c) {
        return '<span class="ai-pill"><strong>' + esc(c.engine) + ':</strong> ' + esc(c.state) + '</span>';
      }).join('');
    }
  }

  function renderLeadsBookings(lb) {
    var funnelEl = document.getElementById('lb-funnel');
    var sourcesEl = document.getElementById('lb-sources');
    var langBarEl = document.getElementById('lb-lang-bar');
    var langLegendEl = document.getElementById('lb-lang-legend');

    var maxFunnel = lb.funnel[0] ? lb.funnel[0].count : 1;
    if (funnelEl) {
      funnelEl.innerHTML = lb.funnel.map(function (f) {
        var pct = Math.max(12, Math.round((f.count / maxFunnel) * 100));
        return (
          '<div class="funnel-row">' +
            '<div class="funnel-meta"><strong>' + esc(f.stage) + '</strong><span>' + esc(f.count) + ' <small class="funnel-note">(' + esc(f.note) + ')</small></span></div>' +
            '<div class="funnel-track"><div class="funnel-fill" style="width:' + pct + '%"></div></div>' +
          '</div>'
        );
      }).join('');
    }

    var maxSource = lb.sources[0] ? lb.sources[0].count : 1;
    if (sourcesEl) {
      sourcesEl.innerHTML = lb.sources.map(function (s) {
        var pct = Math.max(10, Math.round((s.count / maxSource) * 100));
        return (
          '<div class="funnel-row">' +
            '<div class="funnel-meta"><span>' + esc(s.source) + '</span><strong>' + esc(s.count) + '</strong></div>' +
            '<div class="funnel-track"><div class="funnel-fill" style="width:' + pct + '%;background:linear-gradient(90deg,#7A511D 0%,#B8864B 100%)"></div></div>' +
          '</div>'
        );
      }).join('');
    }

    if (langBarEl) {
      langBarEl.innerHTML =
        '<div class="lang-en" style="width:' + lb.languageSplit.enPct + '%" title="English ' + lb.languageSplit.enPct + '%"></div>' +
        '<div class="lang-es" style="width:' + lb.languageSplit.esPct + '%" title="Spanish ' + lb.languageSplit.esPct + '%"></div>';
    }
    if (langLegendEl) {
      langLegendEl.innerHTML =
        '<span><span class="swatch" style="background:#1E3A32"></span>English: <strong>' + lb.languageSplit.enCount + '</strong> (' + lb.languageSplit.enPct + '%)</span>' +
        '<span><span class="swatch" style="background:#B8864B"></span>Espa&ntilde;ol: <strong>' + lb.languageSplit.esCount + '</strong> (' + lb.languageSplit.esPct + '%)</span>';
    }
  }

  function renderSales(sales) {
    var paidEl = document.getElementById('sales-paid');
    var repeatEl = document.getElementById('sales-repeat');
    var trendEl = document.getElementById('sales-trend-lbl');
    var discEl = document.getElementById('sales-disclaimer');
    var chartEl = document.getElementById('sales-chart');

    if (paidEl) paidEl.textContent = String(sales.sessionsPaid30d);
    if (repeatEl) repeatEl.textContent = String(sales.repeatClients);
    if (trendEl) trendEl.textContent = sales.trendLabel;
    if (discEl) discEl.textContent = sales.disclaimer;

    if (!chartEl || !sales.series || !sales.series.length) return;
    var W = 560;
    var H = 190;
    var padL = 36;
    var padR = 20;
    var padT = 22;
    var padB = 34;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxIdx = Math.max.apply(null, sales.series.map(function (d) { return d.index; })) || 100;
    var maxSess = Math.max.apply(null, sales.series.map(function (d) { return d.sessions; })) || 1;

    var barW = Math.min(34, plotW / sales.series.length * 0.44);
    var pts = sales.series.map(function (d, i) {
      var x = padL + (i + 0.5) * (plotW / sales.series.length);
      var yLine = padT + plotH - (d.index / (maxIdx * 1.12)) * plotH;
      var barH = (d.sessions / (maxSess * 1.25)) * (plotH * 0.65);
      var yBar = padT + plotH - barH;
      return { x: Math.round(x * 10) / 10, yLine: Math.round(yLine * 10) / 10, yBar: Math.round(yBar * 10) / 10, barH: Math.round(barH * 10) / 10, period: d.period, sessions: d.sessions, index: d.index };
    });

    var lineD = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.yLine; }).join(' ');
    var areaD = lineD + ' L' + pts[pts.length - 1].x + ',' + (padT + plotH) + ' L' + pts[0].x + ',' + (padT + plotH) + ' Z';

    var gridSvg = [0.25, 0.5, 0.75, 1].map(function (f) {
      var y = Math.round((padT + plotH * (1 - f)) * 10) / 10;
      return '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="rgba(29,26,22,0.1)" stroke-dasharray="3 4"></line>';
    }).join('');

    var barsSvg = pts.map(function (p) {
      return (
        '<rect x="' + (p.x - barW / 2) + '" y="' + p.yBar + '" width="' + barW + '" height="' + p.barH + '" rx="4" fill="#9DBDB0" fill-opacity="0.72"></rect>' +
        '<text x="' + p.x + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11.5" fill="#5A5147">' + esc(p.period) + '</text>' +
        '<text x="' + p.x + '" y="' + (p.yBar - 6) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#1E3A32">' + esc(p.sessions) + 's</text>'
      );
    }).join('');

    var dotsSvg = pts.map(function (p) {
      return '<circle cx="' + p.x + '" cy="' + p.yLine + '" r="4.2" fill="#B8864B" stroke="#F9F5EC" stroke-width="1.5"></circle>';
    }).join('');

    chartEl.innerHTML =
      '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sample sessions paid and relative revenue trend">' +
        gridSvg +
        '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="rgba(29,26,22,0.22)"></line>' +
        '<path d="' + areaD + '" fill="rgba(184, 134, 75, 0.14)"></path>' +
        barsSvg +
        '<path d="' + lineD + '" fill="none" stroke="#1E3A32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
        dotsSvg +
      '</svg>';
  }

  function renderNewsletterShow(nl) {
    var subsEl = document.getElementById('nl-subs');
    var openEl = document.getElementById('nl-open');
    var repEl = document.getElementById('nl-replies');
    var issueEl = document.getElementById('nl-issue');

    var epsEl = document.getElementById('lf-episodes');
    var avgEl = document.getElementById('lf-avg');
    var totEl = document.getElementById('lf-total');
    var clipsEl = document.getElementById('lf-clips');
    var topClipEl = document.getElementById('lf-topclip');

    if (subsEl) subsEl.textContent = String(nl.newsletter.subscribers);
    if (openEl) openEl.textContent = nl.newsletter.openRate;
    if (repEl) repEl.textContent = String(nl.newsletter.replies);
    if (issueEl) issueEl.textContent = nl.newsletter.lastIssue;

    if (epsEl) epsEl.textContent = String(nl.longForm.episodes);
    if (avgEl) avgEl.textContent = nl.longForm.avgWatchTime;
    if (totEl) totEl.textContent = nl.longForm.totalWatchHours;
    if (clipsEl) clipsEl.textContent = String(nl.longForm.clipsPerEpisode);
    if (topClipEl) topClipEl.textContent = nl.longForm.topClip;
  }

  function renderOutreach(out) {
    var el = document.getElementById('outreach-grid');
    if (!el) return;
    el.innerHTML =
      '<div class="subcard">' +
        '<div class="subcard-head"><h3>Podcasts</h3><span class="sample-tag">Sample</span></div>' +
        '<div class="plat-metrics" style="border-top:0;padding-top:0;margin-bottom:8px">' +
          '<div class="plat-m"><span>Pitched</span><strong>' + esc(out.podcasts.pitched) + '</strong></div>' +
          '<div class="plat-m"><span>Booked</span><strong>' + esc(out.podcasts.booked) + '</strong></div>' +
          '<div class="plat-m"><span>Aired</span><strong>' + esc(out.podcasts.aired) + '</strong></div>' +
        '</div>' +
        '<p class="sec-sub" style="margin:0">' + esc(out.podcasts.note) + '</p>' +
      '</div>' +
      '<div class="subcard">' +
        '<div class="subcard-head"><h3>Partner conversations</h3><span class="sample-tag">Sample</span></div>' +
        '<div class="kpi-tile" style="padding:10px 12px;margin-bottom:8px">' +
          '<span>Active conversations</span><strong>' + esc(out.partners.conversations) + '</strong>' +
        '</div>' +
        '<p class="sec-sub" style="margin:0">' + esc(out.partners.note) + '</p>' +
      '</div>' +
      '<div class="subcard">' +
        '<div class="subcard-head"><h3>Directory listings</h3><span class="sample-tag">Sample</span></div>' +
        '<div class="plat-metrics" style="border-top:0;padding-top:0;margin-bottom:8px;grid-template-columns:1fr 1fr">' +
          '<div class="plat-m"><span>Live</span><strong>' + esc(out.directories.live) + '</strong></div>' +
          '<div class="plat-m"><span>Pending</span><strong>' + esc(out.directories.pending) + '</strong></div>' +
        '</div>' +
        '<p class="sec-sub" style="margin:0">' + esc(out.directories.note) + '</p>' +
      '</div>';
  }

  function renderGoals(goals) {
    var tbody = document.getElementById('goals-body');
    if (!tbody) return;
    tbody.innerHTML = goals.map(function (g) {
      return (
        '<tr>' +
          '<td><strong>' + esc(g.channel) + '</strong><br><small style="color:var(--muted)">' + esc(g.metric) + '</small></td>' +
          '<td>' + esc(g.baseline) + '</td>' +
          '<td><em>' + esc(g.target30) + '</em></td>' +
          '<td><em>' + esc(g.target90) + '</em></td>' +
          '<td><span class="goal-track" aria-hidden="true"><span class="goal-fill" style="width:' + esc(g.progressPct) + '%"></span></span><small style="color:var(--muted)">Activates once set</small></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderWeeklySummary(ws) {
    var lblEl = document.getElementById('weekly-label');
    var listEl = document.getElementById('weekly-bullets');
    if (lblEl) lblEl.textContent = ws.weekLabel;
    if (listEl) {
      listEl.innerHTML = ws.bullets.map(function (b) {
        return '<li>' + esc(b) + '</li>';
      }).join('');
    }
  }

  function renderConnections(conns) {
    var tbody = document.getElementById('connections-body');
    if (!tbody) return;
    tbody.innerHTML = conns.map(function (c) {
      return (
        '<tr>' +
          '<td><strong>' + esc(c.source) + '</strong></td>' +
          '<td><span class="status-chip is-disconnected">' + esc(c.status) + '</span></td>' +
          '<td>' + esc(c.feeds) + '</td>' +
          '<td>' + esc(c.how) + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  fetch('data/sample.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('Could not load sample data');
      return r.json();
    })
    .then(function (data) {
      var bannerText = document.getElementById('sample-banner-text');
      if (bannerText && data.meta && data.meta.notice) {
        bannerText.textContent = data.meta.notice;
      }
      renderToday(data.todayTasks || []);
      renderOperations(data.operations || []);
      renderPlatforms(data.platforms || []);
      renderWebsiteSearch(data.websiteSearch || {});
      renderLeadsBookings(data.leadsBookings || {});
      renderSales(data.sales || {});
      renderNewsletterShow(data.newsletterLongForm || {});
      renderOutreach(data.outreach || {});
      renderGoals(data.goals || []);
      renderWeeklySummary(data.weeklySummary || {});
      renderConnections(data.connections || []);
    })
    .catch(function (err) {
      var wrap = document.querySelector('.cc-wrap');
      if (wrap) {
        var note = document.createElement('div');
        note.className = 'cc-section';
        note.innerHTML = '<h2>Sample data unavailable</h2><p>Could not load <code>data/sample.json</code> (' + esc(err.message) + '). Open this page through the local preview server.</p>';
        wrap.prepend(note);
      }
    });
})();
