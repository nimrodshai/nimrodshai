/* =========================================================
   PULSE — interactions
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var prefersReduced = function () { return reduceMotion.matches; };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Sticky nav + active link ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var navLinks = $$('.nav__links a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['classes', 'schedule', 'coaches', 'pricing', 'trial'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('#nav-toggle');
  var menu = $('#nav-menu');
  var toggleLabel = $('.sr-only', toggle);
  var setMenu = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Close menu' : 'Open menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { var first = $('a', menu); if (first) first.focus(); }
  };
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860 && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  // stagger siblings inside grids
  $$('.class-grid, .coach-grid, .plans, .stats__grid').forEach(function (grid) {
    $$('.reveal', grid).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.08) + 's'); });
  });
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced()) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Number tween helper ---------- */
  var easeOutExpo = function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
  var fmt = function (n, decimals) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };
  function tween(el, from, to, duration, decimals) {
    decimals = decimals || 0;
    if (prefersReduced() || duration <= 0) { el.textContent = fmt(to, decimals); return; }
    if (el._raf) cancelAnimationFrame(el._raf);
    var start = null;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = fmt(from + (to - from) * easeOutExpo(p), decimals);
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- Stat counters ---------- */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    tween(el, 0, target, 2000, dec);
  };
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); countObs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.decimals || '0', 10)); });
  }

  /* =========================================================
     Schedule
     ========================================================= */
  var COACHES = {
    noa:  { name: 'Noa Levi', initials: 'NL', img: 'assets/coach.jpg' },
    amit: { name: 'Amit Ben-David', initials: 'AB' },
    maya: { name: 'Maya Katz', initials: 'MK' },
    yoni: { name: 'Yoni Orr', initials: 'YO' },
    tal:  { name: 'Tal Mizrahi', initials: 'TM' },
    dana: { name: 'Dana Shapiro', initials: 'DS' }
  };
  var TYPES = { hiit: 'HIIT', ride: 'Ride', strength: 'Strength', mobility: 'Mobility' };
  var LEVELS = { 1: 'Low', 2: 'Mid', 3: 'High' };

  // [time, name, type, level, coach, minutes, capacity]
  var WEEKDAY_A = [
    ['06:00', 'Sunrise HIIT', 'hiit', 3, 'noa', 45, 22],
    ['07:15', 'Rhythm Ride', 'ride', 2, 'amit', 45, 28],
    ['09:30', 'Morning Mobility', 'mobility', 1, 'maya', 60, 18],
    ['12:30', 'Lunch Express HIIT', 'hiit', 2, 'tal', 30, 22],
    ['17:30', 'Barbell Club', 'strength', 3, 'yoni', 55, 16],
    ['18:45', 'Climb & Sprint', 'ride', 3, 'amit', 50, 28],
    ['20:00', 'Deep Stretch', 'mobility', 1, 'dana', 45, 18]
  ];
  var WEEKDAY_B = [
    ['06:00', 'Power Ride', 'ride', 3, 'amit', 45, 28],
    ['07:15', 'Kettlebell Strength', 'strength', 2, 'yoni', 50, 16],
    ['09:30', 'Flow & Breathe', 'mobility', 1, 'maya', 60, 18],
    ['12:30', 'Core Burn', 'hiit', 2, 'noa', 30, 22],
    ['17:30', 'Bootcamp', 'hiit', 3, 'tal', 45, 22],
    ['18:45', 'Lower Body Strength', 'strength', 3, 'noa', 55, 16],
    ['20:00', 'Rhythm Ride', 'ride', 2, 'dana', 45, 28]
  ];
  var FRIDAY = [
    ['07:00', 'Friday Fire Ride', 'ride', 3, 'amit', 50, 28],
    ['08:30', 'Full Body Strength', 'strength', 2, 'yoni', 55, 16],
    ['10:00', 'Team HIIT', 'hiit', 3, 'noa', 45, 22],
    ['12:00', 'Weekend Mobility', 'mobility', 1, 'maya', 60, 18]
  ];
  var SATURDAY = [
    ['08:30', 'Shabbat Slow Flow', 'mobility', 1, 'dana', 60, 18],
    ['10:00', 'Partner HIIT', 'hiit', 2, 'tal', 45, 22],
    ['11:30', 'Recovery Ride', 'ride', 1, 'amit', 40, 28]
  ];
  var WEEK = [WEEKDAY_A, WEEKDAY_B, WEEKDAY_A, WEEKDAY_B, WEEKDAY_A, FRIDAY, SATURDAY];
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // deterministic pseudo-random so the "booked" numbers stay stable per visit
  var seed = 7;
  var rand = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  var schedule = WEEK.map(function (day, d) {
    return day.map(function (c, i) {
      var cap = c[6];
      // evenings & early ride fill up; make a few full
      var heat = rand();
      var booked = Math.round(cap * (0.35 + heat * 0.65));
      if ((d === 5 && i === 0) || (d === 1 && i === 4)) booked = cap; // sold-out classes
      return {
        id: d + '-' + i, time: c[0], name: c[1], type: c[2], level: c[3],
        coach: c[4], minutes: c[5], cap: cap, left: Math.max(0, cap - booked), reserved: false
      };
    });
  });

  var today = new Date();
  var todayIdx = today.getDay(); // 0 = Sunday, matches Israeli week
  var sunday = new Date(today); sunday.setDate(today.getDate() - todayIdx);

  var state = { day: todayIdx, type: 'all', level: 'all' };

  var dayTabs = $('#day-tabs');
  var list = $('#sched-list');
  var empty = $('#sched-empty');
  var panel = $('#sched-panel');
  var live = $('#sched-live');
  var summary = $('#sched-summary');

  // build day tabs
  DAY_NAMES.forEach(function (name, i) {
    var date = new Date(sunday); date.setDate(sunday.getDate() + i);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-tab';
    btn.id = 'tab-' + i;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'sched-panel');
    btn.setAttribute('aria-label', DAY_FULL[i] + ' ' + date.getDate() + '/' + (date.getMonth() + 1) + (i === todayIdx ? ', today' : ''));
    btn.dataset.day = i;
    btn.innerHTML =
      '<span class="day-tab__name">' + name + '</span>' +
      '<span class="day-tab__date">' + String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '</span>' +
      (i === todayIdx ? '<span class="day-tab__today" aria-hidden="true"></span>' : '');
    dayTabs.appendChild(btn);
  });
  var tabs = $$('.day-tab', dayTabs);

  function selectDay(i, focus) {
    state.day = i;
    tabs.forEach(function (t, idx) {
      var on = idx === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'tab-' + i);
    if (focus) tabs[i].focus();
    // keep active tab visible on the mobile scroll strip without moving the page
    var strip = dayTabs, t = tabs[i];
    if (strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: prefersReduced() ? 'auto' : 'smooth' });
    }
    render();
  }

  dayTabs.addEventListener('click', function (e) {
    var t = e.target.closest('.day-tab');
    if (t) selectDay(parseInt(t.dataset.day, 10), false);
  });
  dayTabs.addEventListener('keydown', function (e) {
    var i = state.day, n = tabs.length, next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % n;
    else if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next !== null) { e.preventDefault(); selectDay(next, true); }
  });

  // filter chips
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key = chip.dataset.filter;
      state[key] = chip.dataset.value;
      $$('.chip[data-filter="' + key + '"]').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      render();
    });
  });

  function levelMarkup(level) {
    var bars = '';
    for (var k = 1; k <= 3; k++) bars += '<i' + (k <= level ? ' class="on"' : '') + '></i>';
    return '<span class="level" aria-label="Intensity: ' + LEVELS[level] + '">' + bars + '<span aria-hidden="true">' + LEVELS[level] + '</span></span>';
  }

  function spotsMarkup(c) {
    var low = c.left <= 3;
    var pct = c.cap ? (c.cap - c.left) / c.cap : 1;
    var label = c.left === 0 ? 'Fully booked' : (low ? 'Only ' : '') + '<strong>' + c.left + '</strong> of ' + c.cap + ' left';
    return '<div class="slot__spots-label' + (low ? ' is-low' : '') + '"><span>' + label + '</span></div>' +
      '<div class="bar" role="progressbar" aria-label="Spots booked" aria-valuemin="0" aria-valuemax="' + c.cap + '" aria-valuenow="' + (c.cap - c.left) + '" aria-valuetext="' + c.left + ' of ' + c.cap + ' spots left">' +
      '<div class="bar__fill' + (low ? ' is-low' : '') + '" style="transform:scaleX(' + pct.toFixed(3) + ')"></div></div>';
  }

  function buttonState(btn, c) {
    btn.setAttribute('aria-pressed', String(c.reserved));
    btn.disabled = c.left === 0 && !c.reserved;
    btn.textContent = c.reserved ? 'Reserved ✓' : (c.left === 0 ? 'Full' : 'Reserve');
    btn.setAttribute('aria-label', (c.reserved ? 'Reserved: ' : (c.left === 0 ? 'Full: ' : 'Reserve ')) + c.name + ' at ' + c.time + (c.reserved ? '. Press to cancel' : ''));
  }

  function render() {
    var day = schedule[state.day];
    var items = day.filter(function (c) {
      return (state.type === 'all' || c.type === state.type) &&
             (state.level === 'all' || String(c.level) === state.level);
    });
    list.innerHTML = '';
    items.forEach(function (c, idx) {
      var coach = COACHES[c.coach];
      var li = document.createElement('li');
      li.className = 'slot' + (c.reserved ? ' is-reserved' : '');
      li.dataset.id = c.id;
      if (!prefersReduced()) li.style.animationDelay = (idx * 0.05) + 's';
      li.innerHTML =
        '<div class="slot__time">' + c.time + '<small>' + c.minutes + ' min</small></div>' +
        '<div class="slot__class"><span class="slot__name">' + c.name + '</span>' +
          '<span class="slot__meta"><span class="type-pill type-pill--' + c.type + '">' + TYPES[c.type] + '</span>' + levelMarkup(c.level) + '</span></div>' +
        '<div class="slot__coach"><span class="slot__avatar" aria-hidden="true">' +
          (coach.img ? '<img src="' + coach.img + '" alt="">' : coach.initials) +
          '</span><span>' + coach.name + '</span></div>' +
        '<div class="slot__spots">' + spotsMarkup(c) + '</div>' +
        '<div class="slot__btn"><button type="button" class="reserve"></button></div>';
      buttonState($('.reserve', li), c);
      list.appendChild(li);
    });
    empty.hidden = items.length > 0;
    updateSummary();
  }

  function updateSummary() {
    var total = 0;
    schedule.forEach(function (d) { d.forEach(function (c) { if (c.reserved) total++; }); });
    summary.innerHTML = total
      ? 'You have <strong>' + total + '</strong> class' + (total > 1 ? 'es' : '') + ' reserved this week. See you on the floor.'
      : 'No classes reserved yet — tap Reserve to grab a spot.';
  }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.reserve');
    if (!btn || btn.disabled) return;
    var li = btn.closest('.slot');
    var id = li.dataset.id.split('-');
    var c = schedule[+id[0]][+id[1]];
    if (c.reserved) { c.reserved = false; c.left += 1; }
    else if (c.left > 0) { c.reserved = true; c.left -= 1; }
    li.classList.toggle('is-reserved', c.reserved);
    $('.slot__spots', li).innerHTML = spotsMarkup(c);
    buttonState(btn, c);
    btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
    live.textContent = c.reserved
      ? 'Reserved ' + c.name + ' at ' + c.time + ' on ' + DAY_FULL[state.day] + '. ' + c.left + ' spots left.'
      : 'Cancelled ' + c.name + ' at ' + c.time + '.';
    updateSummary();
  });

  selectDay(state.day, false);

  /* =========================================================
     Pricing toggle
     ========================================================= */
  var billing = $('#billing-toggle');
  var lblM = $('#lbl-monthly'), lblA = $('#lbl-annual');
  var setBilling = function (annual) {
    billing.setAttribute('aria-pressed', String(annual));
    lblM.classList.toggle('is-on', !annual);
    lblA.classList.toggle('is-on', annual);
    $$('.plan').forEach(function (plan) {
      var amt = $('.amount', plan);
      var note = $('.plan__note', plan);
      var from = parseInt(amt.textContent.replace(/[^\d]/g, ''), 10) || 0;
      var to = parseInt(annual ? amt.dataset.annual : amt.dataset.monthly, 10);
      tween(amt, from, to, 700, 0);
      note.textContent = annual ? note.dataset.annualNote : note.dataset.monthlyNote;
      if (!prefersReduced()) { amt.classList.remove('is-flipping'); void amt.offsetWidth; amt.classList.add('is-flipping'); }
    });
  };
  billing.addEventListener('click', function () { setBilling(billing.getAttribute('aria-pressed') !== 'true'); });
  lblM.addEventListener('click', function () { setBilling(false); });
  lblA.addEventListener('click', function () { setBilling(true); });
  lblM.classList.add('is-on');

  /* =========================================================
     Trial form
     ========================================================= */
  var form = $('#trial-form');
  var success = $('#trial-success');
  var fields = {
    name: { el: $('#f-name'), err: $('#e-name'), check: function (v) {
      v = v.trim();
      if (!v) return 'Tell us what to call you.';
      if (v.length < 2) return 'That name looks a little short.';
      return '';
    } },
    email: { el: $('#f-email'), err: $('#e-email'), check: function (v) {
      v = v.trim();
      if (!v) return 'We need an email to send your booking.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'That email doesn\'t look right — check for typos.';
      return '';
    } },
    phone: { el: $('#f-phone'), err: $('#e-phone'), check: function (v) {
      var d = v.replace(/[^\d+]/g, '');
      if (!d) return 'Add a phone number so a coach can reach you.';
      if (!/^(?:\+9725\d{8}|05\d{8})$/.test(d)) return 'Use an Israeli mobile, e.g. 052-123-4567.';
      return '';
    } },
    terms: { el: $('#f-terms'), err: $('#e-terms'), check: function (_v, el) {
      return el.checked ? '' : 'Please confirm before we book you in.';
    } }
  };

  function validate(key) {
    var f = fields[key];
    var msg = f.check(f.el.value, f.el);
    var wrap = f.el.closest('.field');
    wrap.classList.toggle('is-invalid', !!msg);
    wrap.classList.toggle('is-valid', !msg && f.el.type !== 'checkbox');
    f.el.setAttribute('aria-invalid', String(!!msg));
    f.err.textContent = msg;
    return !msg;
  }

  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    var evt = f.el.type === 'checkbox' ? 'change' : 'blur';
    f.el.addEventListener(evt, function () {
      if (f.el.type !== 'checkbox' && !f.el.value && !f.el.closest('.field').classList.contains('is-invalid')) return;
      validate(key);
    });
    f.el.addEventListener('input', function () {
      if (f.el.closest('.field').classList.contains('is-invalid')) validate(key);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(fields).forEach(function (key) {
      if (!validate(key) && !firstBad) firstBad = fields[key].el;
    });
    if (firstBad) { firstBad.focus(); return; }

    var submit = $('button[type="submit"]', form);
    submit.setAttribute('aria-busy', 'true');
    submit.firstChild.textContent = 'Booking… ';
    setTimeout(function () {
      var first = fields.name.el.value.trim().split(/\s+/)[0];
      var cls = (form.querySelector('input[name="class"]:checked') || {}).value || 'HIIT';
      $('#success-name').textContent = first;
      $('#success-class').textContent = cls;
      form.hidden = true;
      success.hidden = false;
      success.focus();
      submit.removeAttribute('aria-busy');
      submit.firstChild.textContent = 'Book my free class ';
    }, prefersReduced() ? 200 : 900);
  });

  $('#trial-reset').addEventListener('click', function () {
    form.reset();
    $$('.field', form).forEach(function (f) { f.classList.remove('is-valid', 'is-invalid'); });
    $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
    $$('.field__error', form).forEach(function (el) { el.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    fields.name.el.focus();
  });

  // plan buttons preselect nothing sensitive — just nudge focus into the form after scroll
  $$('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () {
      setTimeout(function () { if (!form.hidden) fields.name.el.focus({ preventScroll: true }); }, prefersReduced() ? 0 : 700);
    });
  });

  /* =========================================================
     Custom cursor + magnetic buttons (desktop, motion OK)
     ========================================================= */
  var cursorEnabled = false;
  function initPointerFx() {
    if (cursorEnabled || !finePointer.matches || prefersReduced()) return;
    cursorEnabled = true;
    root.classList.add('has-cursor');

    var cursor = $('.cursor');
    var dot = $('.cursor__dot'), ring = $('.cursor__ring');
    var mx = -100, my = -100, rx = -100, ry = -100;
    var running = false;

    var loop = function () {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) requestAnimationFrame(loop);
      else running = false;
    };
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('is-hidden');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseover', function (e) {
      var interactive = e.target.closest('a, button, .class-card, label, .chip');
      cursor.classList.toggle('is-hover', !!interactive);
      var field = e.target.closest('input[type="text"], input[type="email"], input[type="tel"], select, textarea');
      cursor.classList.toggle('is-hidden', !!field);
    });

    // magnetic
    $$('[data-magnetic]').forEach(function (el) {
      var strength = 0.32;
      el.addEventListener('mousemove', function (e) {
        if (!root.classList.contains('has-cursor')) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * strength).toFixed(1) + 'px,' + (y * strength * 1.2).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }
  function teardownPointerFx() {
    if (!cursorEnabled) return;
    root.classList.remove('has-cursor');
    $$('[data-magnetic]').forEach(function (el) { el.style.transform = ''; });
  }
  initPointerFx();
  var mqListen = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };
  mqListen(reduceMotion, function () {
    if (prefersReduced()) teardownPointerFx();
    else if (cursorEnabled) root.classList.add('has-cursor');
    else initPointerFx();
  });
})();
