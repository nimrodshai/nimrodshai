/* Atelier Noa — interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => motionQuery.matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion() ? 0 : ms));

  /* ------------------------------------------------------------------
     Project data (powers the case-study lightbox)
     ------------------------------------------------------------------ */
  const PROJECTS = [
    {
      title: 'Bialik Street Apartment',
      category: 'Residential',
      img: 'assets/hero.jpg',
      alt: 'Living room with a tall arched window, curved bouclé sofa, travertine block table and a long oak bench in low sun',
      lede: 'A 1934 apartment in the White City, opened back up to the afternoon.',
      facts: { Location: 'Bialik St, Tel Aviv', Year: '2025', Area: '142 m²', Scope: 'Renovation, interiors, joinery' },
      text: [
        'Decades of partitions had turned a generous Bauhaus flat into a corridor of small rooms. We removed four walls, reinstated the original arched opening to the balcony, and let a single long room run from street to garden.',
        'The palette is deliberately narrow: honed Turkish travertine underfoot, lime plaster in three hand-mixed tones, and solid white oak for the few pieces of furniture we designed — including a seven-metre bench that doubles as the library.'
      ]
    },
    {
      title: 'Hotel Kurkar',
      category: 'Hospitality',
      img: 'assets/hotel.jpg',
      alt: 'A hotel lobby of restored sandstone arches, a travertine reception desk, herringbone terracotta floor and linen lounge chairs',
      lede: 'Twenty-four rooms inside an Ottoman-era warehouse, a short walk from the Jaffa port.',
      facts: { Location: 'Jaffa, Tel Aviv-Yafo', Year: '2024', Area: '1,850 m²', Scope: 'Architecture, interiors, FF&E' },
      text: [
        'The building had been a citrus warehouse, a print shop and, for twenty years, nothing at all. Its kurkar sandstone arches were buried under cement render; we spent four months of the programme simply uncovering them.',
        'New interventions are kept honest and quiet: a monolithic travertine desk, terracotta laid in herringbone by a family workshop in Hebron, and steel-framed glazing that lets the sea air move through the lobby from morning until late.'
      ]
    },
    {
      title: 'Stone House, Zichron',
      category: 'Residential',
      img: 'assets/kitchen.jpg',
      alt: 'A kitchen with a monolithic limestone island, pale oak cabinetry, rush stools and a deep window onto olive trees',
      lede: 'A family house on the Carmel ridge, built around a kitchen that faces the olive grove.',
      facts: { Location: 'Zichron Ya’akov', Year: '2024', Area: '265 m²', Scope: 'New build, interiors' },
      text: [
        'The clients asked for a house that would feel old on the day they moved in. We answered with half-metre walls of local limestone, deep window reveals that hold the morning sun, and a plan that steps gently down the slope.',
        'The kitchen island is a single block of Jerusalem limestone, mitred by hand on site. Everything else — oak fronts with no handles, a long stone shelf, one ceramic pendant — stays out of its way.'
      ]
    },
    {
      title: 'The Stone Bath',
      category: 'Interiors',
      img: 'assets/bath.jpg',
      alt: 'A carved travertine basin on a floating stone slab, brass wall tap and an arched window casting a beam of sunlight',
      lede: 'One room, one material, and a window placed for exactly one hour of light.',
      facts: { Location: 'Herzliya Pituah', Year: '2025', Area: '38 m²', Scope: 'Interior architecture, custom stonework' },
      text: [
        'A principal bathroom conceived almost as a small chapel. The basin and its cantilevered slab were carved from one quarry block of unfilled travertine; the pores are left open, so the stone keeps changing as it is used.',
        'We moved the window twice in model form until the low winter sun would cross the basin at seven in the morning — the hour our client starts her day.'
      ]
    },
    {
      title: 'Florentin Flat',
      category: 'Interiors',
      img: 'assets/after.jpg',
      alt: 'A renovated living room with limewashed walls, a linen sofa beneath a tall black-framed window, an olive tree and oak shelving',
      lede: 'A 1970s rental, rescued for a young family on a careful budget.',
      facts: { Location: 'Florentin, Tel Aviv', Year: '2023', Area: '96 m²', Scope: 'Full renovation, joinery' },
      text: [
        'The before-and-after on this page is this apartment. We kept the window opening and the room\'s honest proportions, and replaced almost everything else: stained plaster, buckling terrazzo, a wall unit that ate a third of the room.',
        'Built-in oak shelving now does the work of four pieces of furniture. Budget went where hands touch — the floor, the joinery, the window frame — and nowhere else.'
      ]
    },
    {
      title: 'Ein Hod Guesthouse',
      category: 'Hospitality',
      img: 'assets/hotel.jpg',
      objectPosition: '85% 50%',
      alt: 'Stone arches and a travertine counter in the guesthouse common room, with olive branches in a clay vase',
      lede: 'Six suites in an artists\' village, run by two sisters and a very old fig tree.',
      facts: { Location: 'Ein Hod, Carmel', Year: '2022', Area: '480 m²', Scope: 'Conversion, interiors, branding support' },
      text: [
        'A pair of stone village houses joined by a shared courtyard. Each suite has its own entrance from the garden and a different view of the sea; none of them has a television.',
        'We worked with the owners from business plan to opening day — sizing the rooms against their occupancy targets, choosing materials that a two-person team can keep beautiful, and specifying every towel hook.'
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Hero load reveal
     ------------------------------------------------------------------ */
  const heroImg = $('[data-hero-media] img');
  let loaded = false;
  const markLoaded = () => {
    if (loaded) return;
    loaded = true;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));
  };
  if (heroImg) {
    if (heroImg.complete) markLoaded();
    else heroImg.addEventListener('load', markLoaded, { once: true });
    heroImg.addEventListener('error', markLoaded, { once: true });
  }
  setTimeout(markLoaded, 1600); // never hold the page hostage to a slow image

  /* ------------------------------------------------------------------
     Header: scrolled state + hide on scroll down
     ------------------------------------------------------------------ */
  const header = $('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = header.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 480 && y > lastY + 4);
    if (y < lastY - 4 || y < 480) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // keep header visible while keyboard users tab through it
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  /* Current-section highlight in nav */
  const navLinks = $$('.nav__list a');
  if ('IntersectionObserver' in window) {
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) sectionIO.observe(s); });
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const menuBtn = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  const setMenu = (open, { restoreFocus = true } = {}) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    header.classList.toggle('menu-open', open);
    header.classList.add('is-scrolled');
    document.body.classList.toggle('is-locked', open);
    if (open) {
      const first = $('a', menu);
      if (first) first.focus();
    } else {
      onScroll();
      if (restoreFocus) menuBtn.focus();
    }
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false, { restoreFocus: false })));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setMenu(false);
  });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) setMenu(false, { restoreFocus: false });
  });

  /* ------------------------------------------------------------------
     Scroll reveals (clip-path wipes for images, soft rise for text)
     ------------------------------------------------------------------ */
  const textTargets = '.section-head, .filters, .pull, .studio__body, .stats, .service, .press__list li, .press__title, .footer__big, .caption';
  $$(textTargets).forEach((el) => {
    if (el.closest('.hero')) return;
    el.classList.add('reveal');
  });
  // small stagger for lists
  $$('.services__list .service').forEach((el, i) => el.style.setProperty('--d', `${i * 0.08}s`));
  $$('.press__list li').forEach((el, i) => el.style.setProperty('--d', `${i * 0.06}s`));

  const revealEls = $$('.reveal-img, .reveal').filter((el) => !el.closest('.hero'));
  if ('IntersectionObserver' in window && !reduceMotion()) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    revealEls.forEach((el) => io.observe(el));
    // belt-and-braces: a cheap scroll sweep in case IO is throttled (background tabs, embedded webviews)
    let pending = revealEls.slice();
    let lastSweep = 0;
    const sweep = () => {
      const now = Date.now();
      if (now - lastSweep < 120 || !pending.length) return;
      lastSweep = now;
      const limit = window.innerHeight * 0.95;
      pending = pending.filter((el) => {
        if (el.classList.contains('is-in')) return false;
        const r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > -200) { el.classList.add('is-in'); io.unobserve(el); return false; }
        return true;
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('load', sweep);
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------
     Project filter (fade out → re-layout → staggered rise)
     ------------------------------------------------------------------ */
  const grid = $('[data-projects]');
  const cards = $$('.project', grid);
  const filterBtns = $$('[data-filter]');
  const filterStatus = $('[data-filter-status]');
  let filterBusy = false;

  const visibleCards = () => cards.filter((c) => c.classList.contains('is-shown'));

  async function applyFilter(filter) {
    if (filterBusy) return;
    filterBusy = true;
    const match = (c) => filter === 'all' || c.dataset.category === filter;
    const current = visibleCards();

    current.forEach((c) => c.classList.add('is-leaving'));
    await wait(360);

    cards.forEach((c) => {
      c.classList.remove('is-leaving');
      const show = match(c);
      c.hidden = !show;
      c.classList.toggle('is-shown', show);
      if (show) {
        c.classList.add('is-entering');
        $('.reveal-img', c)?.classList.add('is-in');
      }
    });

    const next = visibleCards();
    if (!reduceMotion()) {
      next.forEach((c, i) => {
        c.animate(
          [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }],
          { duration: 900, delay: i * 90, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }
        );
        const img = $('img', c);
        img?.animate(
          [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
          { duration: 1400, delay: i * 90, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
      });
    }
    next.forEach((c) => c.classList.remove('is-entering'));

    const label = filter === 'all' ? 'all' : filter;
    filterStatus.textContent = `Showing ${next.length} ${label === 'all' ? '' : label + ' '}project${next.length === 1 ? '' : 's'}.`;
    filterBusy = false;
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      applyFilter(btn.dataset.filter);
    });
  });

  /* ------------------------------------------------------------------
     Project lightbox / case study
     ------------------------------------------------------------------ */
  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]', lb);
  const lbContent = $('[data-lb-content]', lb);
  const lbEls = {
    count: $('[data-lb-count]', lb),
    cat: $('[data-lb-cat]', lb),
    title: $('[data-lb-title]', lb),
    lede: $('[data-lb-lede]', lb),
    facts: $('[data-lb-facts]', lb),
    text: $('[data-lb-text]', lb)
  };
  const inertTargets = [header, $('#main'), $('.site-footer')];
  let lbList = [];
  let lbPos = 0;
  let lastFocus = null;

  const pad = (n) => String(n).padStart(2, '0');

  function renderProject(animate) {
    const p = PROJECTS[lbList[lbPos]];
    lbImg.src = p.img;
    lbImg.alt = p.alt;
    lbImg.style.objectPosition = p.objectPosition || '';
    lbEls.count.textContent = `${pad(lbPos + 1)} / ${pad(lbList.length)}`;
    lbEls.cat.textContent = p.category;
    lbEls.title.textContent = p.title;
    lbEls.lede.textContent = p.lede;
    lbEls.facts.innerHTML = '';
    Object.entries(p.facts).forEach(([k, v]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v;
      row.append(dt, dd);
      lbEls.facts.append(row);
    });
    lbEls.text.innerHTML = '';
    p.text.forEach((t) => {
      const para = document.createElement('p');
      para.textContent = t;
      lbEls.text.append(para);
    });
    lbContent.scrollTop = 0;
    if (animate && !reduceMotion()) {
      [lbImg, lbContent].forEach((el) => {
        el.classList.remove('is-swapping');
        void el.offsetWidth; // restart animation
        el.classList.add('is-swapping');
      });
    }
    const single = lbList.length < 2;
    $('[data-lb-prev]', lb).disabled = single;
    $('[data-lb-next]', lb).disabled = single;
  }

  function openLightbox(projectIndex) {
    lbList = visibleCards().map((c) => Number(c.dataset.index));
    lbPos = Math.max(0, lbList.indexOf(projectIndex));
    lastFocus = document.activeElement;
    renderProject(false);
    lb.hidden = false;
    lb.classList.remove('is-closing');
    lb.classList.add('is-open');
    document.body.classList.add('is-locked');
    inertTargets.forEach((el) => el && el.setAttribute('inert', ''));
    $('[data-lb-close]', lb).focus();
  }

  async function closeLightbox() {
    if (lb.hidden || lb.classList.contains('is-closing')) return;
    lb.classList.remove('is-open');
    lb.classList.add('is-closing');
    inertTargets.forEach((el) => el && el.removeAttribute('inert'));
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    await wait(600);
    if (!lb.classList.contains('is-closing')) return; // reopened meanwhile
    lb.hidden = true;
    lb.classList.remove('is-closing');
  }

  const step = (dir) => {
    if (lbList.length < 2) return;
    lbPos = (lbPos + dir + lbList.length) % lbList.length;
    renderProject(true);
  };

  cards.forEach((card) => {
    $('.project__btn', card).addEventListener('click', () => openLightbox(Number(card.dataset.index)));
  });
  $('[data-lb-close]', lb).addEventListener('click', closeLightbox);
  $('[data-lb-prev]', lb).addEventListener('click', () => step(-1));
  $('[data-lb-next]', lb).addEventListener('click', () => step(1));

  lb.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
    if (e.key === 'Tab') {
      // focus trap
      const focusables = $$('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', lb)
        .filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe between projects on touch devices
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60 && e.target.closest('.lightbox__media')) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ------------------------------------------------------------------
     Before / after comparison
     ------------------------------------------------------------------ */
  const compare = $('[data-compare]');
  const range = $('[data-compare-range]');
  if (compare && range) {
    const setPos = (v) => {
      compare.style.setProperty('--pos', `${v}%`);
      range.setAttribute('aria-valuetext', `${Math.round(v)}% before, ${Math.round(100 - v)}% after`);
    };
    range.addEventListener('input', () => setPos(Number(range.value)));
    setPos(Number(range.value));

    // one gentle hint sweep when it first comes into view
    if ('IntersectionObserver' in window && !reduceMotion()) {
      const hintIO = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        hintIO.disconnect();
        let touched = false;
        range.addEventListener('pointerdown', () => { touched = true; }, { once: true });
        range.addEventListener('keydown', () => { touched = true; }, { once: true });
        const keys = [50, 68, 34, 50];
        const durations = [900, 1300, 1000];
        let i = 0;
        let start = null;
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const frame = (ts) => {
          if (touched) return;
          if (start === null) start = ts;
          const t = Math.min(1, (ts - start) / durations[i]);
          const v = keys[i] + (keys[i + 1] - keys[i]) * ease(t);
          range.value = String(Math.round(v));
          setPos(v);
          if (t < 1) requestAnimationFrame(frame);
          else if (++i < durations.length) { start = null; requestAnimationFrame(frame); }
        };
        setTimeout(() => requestAnimationFrame(frame), 700);
      }, { threshold: 0.6 });
      hintIO.observe(compare);
    }
  }

  /* ------------------------------------------------------------------
     Services accordion (click/keyboard; hover preview via CSS on desktop)
     ------------------------------------------------------------------ */
  $$('.service').forEach((svc) => {
    const btn = $('.service__head', svc);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      svc.classList.toggle('is-open', open);
    });
  });

  /* ------------------------------------------------------------------
     Multi-step inquiry with lead qualification
     ------------------------------------------------------------------ */
  const form = $('[data-form]');
  if (form) {
    const steps = $$('[data-step]', form);
    const total = steps.length;
    const prevBtn = $('[data-prev]', form);
    const nextBtn = $('[data-next]', form);
    const bar = $('[data-progress-bar]');
    const stepLabel = $('[data-step-label]');
    const progressItems = $$('[data-progress] li');
    const summary = $('[data-summary]');
    let current = 1;

    const errEl = (name) => $(`[data-error="${name}"]`, form);
    const setError = (name, msg) => {
      const el = errEl(name);
      if (el) el.textContent = msg || '';
      const input = form.elements[name];
      if (input && input.nodeType === 1 && !(input instanceof RadioNodeList)) {
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
      const group = $(`[data-required-group="${name}"]`, form);
      if (group) group.classList.toggle('has-error', !!msg);
    };

    const val = (name) => {
      const el = form.elements[name];
      return el ? String(el.value || '').trim() : '';
    };

    const validators = {
      1: () => {
        const ok = !!val('type');
        setError('type', ok ? '' : 'Please choose the kind of project.');
        return ok ? null : $('input[name="type"]', form);
      },
      2: () => {
        let firstBad = null;
        if (!val('budget')) { setError('budget', 'Please choose a budget range.'); firstBad = firstBad || $('input[name="budget"]', form); }
        else setError('budget', '');
        if (!val('timeline')) { setError('timeline', 'Please tell us roughly when you would like to start.'); firstBad = firstBad || $('input[name="timeline"]', form); }
        else setError('timeline', '');
        return firstBad;
      },
      3: () => {
        let firstBad = null;
        const size = Number(val('size'));
        if (!val('size') || !Number.isFinite(size) || size < 10 || size > 20000) {
          setError('size', 'Enter an approximate size between 10 and 20,000 m².');
          firstBad = form.elements.size;
        } else setError('size', '');
        if (val('location').length < 2) {
          setError('location', 'Let us know where the project is.');
          firstBad = firstBad || form.elements.location;
        } else setError('location', '');
        return firstBad;
      },
      4: () => {
        let firstBad = null;
        if (val('name').length < 2) { setError('name', 'Please enter your name.'); firstBad = form.elements.name; }
        else setError('name', '');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) {
          setError('email', 'Please enter a valid email address.');
          firstBad = firstBad || form.elements.email;
        } else setError('email', '');
        const phone = val('phone');
        if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
          setError('phone', 'That phone number looks incomplete.');
          firstBad = firstBad || form.elements.phone;
        } else setError('phone', '');
        return firstBad;
      }
    };

    // clear an error as soon as the user fixes it
    form.addEventListener('change', (e) => { if (e.target.name) setError(e.target.name, ''); });
    form.addEventListener('input', (e) => {
      if (e.target.name && e.target.getAttribute('aria-invalid') === 'true') setError(e.target.name, '');
    });

    function show(n, { focus = true } = {}) {
      current = n;
      steps.forEach((s) => {
        const active = Number(s.dataset.step) === n;
        s.hidden = !active;
        s.classList.toggle('is-active', active);
      });
      prevBtn.hidden = n === 1;
      nextBtn.innerHTML = n === total ? 'Send inquiry <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
      bar.style.width = `${(n / total) * 100}%`;
      stepLabel.textContent = `Step ${n} of ${total}`;
      progressItems.forEach((li, i) => {
        li.classList.toggle('is-done', i < n - 1);
        li.classList.toggle('is-current', i === n - 1);
        if (i === n - 1) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      if (focus) {
        const legend = $('.step__title', steps[n - 1]);
        const firstInput = $('input, select, textarea', steps[n - 1]);
        (firstInput || legend).focus({ preventScroll: true });
        const top = $('#inquire').getBoundingClientRect().top;
        if (top < 0 || window.innerWidth <= 1080) $('[data-inquiry]').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function qualify(data) {
      const budgetTier = Number($('input[name="budget"]:checked', form)?.dataset.tier || 1);
      const timeTier = Number($('input[name="timeline"]:checked', form)?.dataset.tier || 1);
      let score = budgetTier * 2 + timeTier;
      if (data.owned === 'Yes') score += 1;
      if (data.owned === 'Not yet') score -= 1;
      if (data.type === 'Hospitality' && budgetTier >= 3) score += 1;

      if (score >= 10) return {
        route: 'Priority · routed to Noa',
        msg: 'Your project sounds like a strong fit. Noa will call you personally within one business day to arrange a site visit.'
      };
      if (score >= 6) return {
        route: 'Studio review · 2 business days',
        msg: 'Thank you for the thoughtful brief. Our project lead will review it and reply within two business days to set up an introductory call.'
      };
      return {
        route: 'Design consultation',
        msg: 'For projects at this stage, our fixed-fee two-hour design consultation is often the best first step. We\'ve emailed you the details and available dates.'
      };
    }

    function finish() {
      const data = {
        type: val('type'), budget: val('budget'), timeline: val('timeline'), size: val('size'),
        location: val('location'), owned: val('owned'), name: val('name'), email: val('email'),
        phone: val('phone'), source: val('source'), notes: val('notes')
      };
      const result = qualify(data);
      $('[data-summary-route]', summary).textContent = result.route;
      $('[data-summary-name]', summary).textContent = data.name.split(/\s+/)[0];
      $('[data-summary-msg]', summary).textContent = result.msg;

      const rows = [
        ['Project', data.type],
        ['Budget', data.budget],
        ['Start', data.timeline],
        ['Size', `${Number(data.size).toLocaleString('en-US')} m²`],
        ['Location', data.location],
        ['Property owned', data.owned],
        ['Contact', [data.email, data.phone].filter(Boolean).join(' · ')]
      ];
      if (data.source) rows.push(['Found us via', data.source]);
      if (data.notes) rows.push(['Notes', data.notes]);
      const list = $('[data-summary-list]', summary);
      list.innerHTML = '';
      rows.forEach(([k, v]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = k; dd.textContent = v;
        row.append(dt, dd);
        list.append(row);
      });

      form.hidden = true;
      $('.inquiry__bar span').style.width = '100%';
      stepLabel.textContent = 'Inquiry complete';
      progressItems.forEach((li) => { li.classList.add('is-done'); li.classList.remove('is-current'); li.removeAttribute('aria-current'); });
      summary.hidden = false;
      summary.focus({ preventScroll: true });
      $('[data-inquiry]').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    }

    const goNext = () => {
      const bad = validators[current]();
      if (bad) { bad.focus(); return; }
      if (current < total) show(current + 1);
      else finish();
    };

    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', () => { if (current > 1) show(current - 1); });
    form.addEventListener('submit', (e) => { e.preventDefault(); goNext(); });
    // Enter in a single-line field advances the step
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input:not([type="radio"])')) { e.preventDefault(); goNext(); }
    });

    $('[data-restart]', summary).addEventListener('click', () => {
      form.reset();
      $$('[data-error]', form).forEach((el) => { el.textContent = ''; });
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      $$('.has-error', form).forEach((el) => el.classList.remove('has-error'));
      summary.hidden = true;
      form.hidden = false;
      show(1);
    });

    show(1, { focus: false });
  }
})();
