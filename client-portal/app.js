(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  var STORAGE_KEY = 'un_momentico_danny_feedback_v3';
  var STEP_META = [
    { id: 'step-0', num: '0', title: 'Welcome' },
    { id: 'step-1', num: '1', title: 'The vision' },
    { id: 'step-2', num: '2', title: 'Your brand' },
    { id: 'step-3', num: '3', title: 'Your website' },
    { id: 'step-4', num: '4', title: 'Your content' },
    { id: 'step-5', num: '5', title: 'The rollout plan' },
    { id: 'step-6', num: '6', title: 'Getting set up' },
    { id: 'step-7', num: '7', title: 'Tracking and reporting' },
    { id: 'step-8', num: '8', title: 'What we need from you' }
  ];
  var LABELS = {
    love: 'Love it',
    change: 'Change something',
    question: 'Question'
  };

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  var state = loadStore();
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-shown');
    }, 4200);
  }

  function updateProgressUI() {
    var reviewed = 0;
    STEP_META.forEach(function (step) {
      var entry = state[step.id] || {};
      var hasReaction = !!(entry.reaction && LABELS[entry.reaction]);
      var hasNote = !!(entry.note && entry.note.trim());
      if (hasReaction || hasNote) reviewed += 1;

      var dot = document.querySelector('.rail-dot[data-step-dot="' + step.id + '"]');
      if (dot) {
        if (hasReaction) {
          dot.setAttribute('data-state', entry.reaction);
        } else {
          dot.removeAttribute('data-state');
        }
      }
    });

    var pill = document.getElementById('top-progress');
    if (pill) pill.textContent = reviewed + ' / ' + STEP_META.length + ' reviewed';

    var railCount = document.getElementById('rail-reviewed-count');
    if (railCount) railCount.textContent = reviewed + ' of ' + STEP_META.length;

    var fill = document.getElementById('rail-bar-fill');
    if (fill) fill.style.width = Math.round((reviewed / STEP_META.length) * 100) + '%';
  }

  // Bind feedback boxes
  var cards = [].slice.call(document.querySelectorAll('.step-card[data-step-id]'));
  cards.forEach(function (card) {
    var stepId = card.getAttribute('data-step-id');
    var entry = state[stepId] || { reaction: '', note: '' };
    var btns = [].slice.call(card.querySelectorAll('.react-btn'));
    var textarea = card.querySelector('.feedback-note');
    var statusEl = card.querySelector('.save-status');

    function syncCard() {
      btns.forEach(function (btn) {
        var r = btn.getAttribute('data-react');
        btn.setAttribute('aria-pressed', entry.reaction === r ? 'true' : 'false');
      });
      if (textarea && textarea.value !== (entry.note || '')) {
        textarea.value = entry.note || '';
      }
      if (statusEl) {
        if (entry.reaction || (entry.note && entry.note.trim())) {
          statusEl.textContent = 'Saved in this browser';
        } else {
          statusEl.textContent = 'Saves automatically on this device';
        }
      }
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = btn.getAttribute('data-react');
        entry.reaction = entry.reaction === r ? '' : r;
        entry.updatedAt = new Date().toISOString();
        state[stepId] = entry;
        saveStore(state);
        syncCard();
        updateProgressUI();
      });
    });

    if (textarea) {
      textarea.addEventListener('input', function () {
        entry.note = textarea.value;
        entry.updatedAt = new Date().toISOString();
        state[stepId] = entry;
        saveStore(state);
        if (statusEl) statusEl.textContent = 'Saved in this browser';
        updateProgressUI();
      });
    }

    syncCard();
  });

  updateProgressUI();

  // Export feedback as clean Markdown
  function exportFeedback() {
    var now = new Date();
    var lines = [
      '# Un Momentico Coaching Group — Danny Cabrera Walkthrough Feedback',
      '',
      'Exported: ' + now.toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET',
      'Send or share this file with Brandon at brandon@gil.marketing whenever you are ready.',
      ''
    ];

    STEP_META.forEach(function (step) {
      var entry = state[step.id] || {};
      var reactionLabel = entry.reaction && LABELS[entry.reaction] ? LABELS[entry.reaction] : 'Not marked yet';
      var note = (entry.note || '').trim();
      lines.push('## Step ' + step.num + ' — ' + step.title);
      lines.push('- **Status:** ' + reactionLabel);
      lines.push('- **Notes:** ' + (note ? note : '(none)'));
      lines.push('');
    });

    var blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'un-momentico-danny-feedback.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast('Feedback downloaded (un-momentico-danny-feedback.md).');
  }

  ['export-feedback-top', 'export-feedback-rail', 'export-feedback-bottom'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', exportFeedback);
  });

  var resetBtn = document.getElementById('reset-feedback');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state = {};
      saveStore(state);
      cards.forEach(function (card) {
        card.querySelectorAll('.react-btn').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        var ta = card.querySelector('.feedback-note');
        if (ta) ta.value = '';
        var st = card.querySelector('.save-status');
        if (st) st.textContent = 'Saves automatically on this device';
      });
      updateProgressUI();
      showToast('Local feedback cleared on this browser.');
    });
  }

  // Active step highlighting in progress rail
  var railLinks = [].slice.call(document.querySelectorAll('.rail-link'));
  function setActiveRail(id) {
    railLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', match);
      if (match) {
        link.setAttribute('aria-current', 'step');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var activeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          setActiveRail(en.target.id);
        }
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0.01 });

    cards.forEach(function (c) { activeObs.observe(c); });
  }

  // Gentle scroll reveal (respects reduced motion)
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.classList.add('is-visible'); });
  } else {
    cards.forEach(function (c, idx) {
      if (idx > 0) c.classList.add('will-reveal');
    });
    var revealObs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          observer.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (c, idx) {
      if (idx > 0) revealObs.observe(c);
    });
  }
})();
