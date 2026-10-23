/* Olive & Ember — interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = function () { return reduceMotionQuery.matches; };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     Sticky header: solid on scroll, hides on scroll down, shows on up
     ------------------------------------------------------------------ */
  var header = $(".site-header");
  var lastY = window.scrollY;
  var ticking = false;
  var menuOpen = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    if (!menuOpen) {
      var goingDown = y > lastY;
      header.classList.toggle("is-hidden", goingDown && y > window.innerHeight * 0.6);
    }
    lastY = y;
    updateParallax(y);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Reveal the header whenever something inside it receives keyboard focus
  header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });

  /* ------------------------------------------------------------------
     Hero parallax
     ------------------------------------------------------------------ */
  var heroMedia = $(".hero__media");
  var heroEl = $(".hero");

  function updateParallax(y) {
    if (!heroMedia || prefersReducedMotion()) return;
    var h = heroEl.offsetHeight;
    if (y > h) return;
    heroMedia.style.transform = "translate3d(0," + (y * 0.25).toFixed(1) + "px,0)";
  }

  /* ------------------------------------------------------------------
     Floating embers in the hero
     ------------------------------------------------------------------ */
  var embers = $(".hero__embers");
  if (embers && !prefersReducedMotion()) {
    var count = window.innerWidth < 640 ? 10 : 18;
    for (var i = 0; i < count; i++) {
      var e = document.createElement("span");
      e.className = "ember";
      e.style.left = (45 + Math.random() * 50).toFixed(1) + "%";
      e.style.setProperty("--size", (1.5 + Math.random() * 2.5).toFixed(1) + "px");
      e.style.setProperty("--dur", (7 + Math.random() * 8).toFixed(1) + "s");
      e.style.setProperty("--delay", (Math.random() * 10).toFixed(1) + "s");
      e.style.setProperty("--drift", (-60 + Math.random() * 120).toFixed(0) + "px");
      embers.appendChild(e);
    }
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var toggle = $(".nav__toggle");
  var mobileMenu = $("#mobile-menu");
  var toggleLabel = toggle ? $(".sr-only", toggle) : null;
  var closeTimer;

  function openMenu() {
    menuOpen = true;
    clearTimeout(closeTimer);
    header.classList.remove("is-hidden");
    mobileMenu.hidden = false;
    // force reflow so the transition runs
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Close menu";
    document.body.classList.add("menu-open");
    var first = $("a", mobileMenu);
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    mobileMenu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Open menu";
    document.body.classList.remove("menu-open");
    closeTimer = setTimeout(function () { mobileMenu.hidden = true; }, prefersReducedMotion() ? 0 : 450);
    if (returnFocus) toggle.focus();
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      menuOpen ? closeMenu(false) : openMenu();
    });

    mobileMenu.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (ev) {
      if (!menuOpen) return;
      if (ev.key === "Escape") {
        closeMenu(true);
        return;
      }
      // simple focus trap: toggle button + links inside the menu
      if (ev.key === "Tab") {
        var focusables = [toggle].concat($$("a, button", mobileMenu));
        var firstEl = focusables[0];
        var lastEl = focusables[focusables.length - 1];
        if (ev.shiftKey && document.activeElement === firstEl) {
          ev.preventDefault();
          lastEl.focus();
        } else if (!ev.shiftKey && document.activeElement === lastEl) {
          ev.preventDefault();
          firstEl.focus();
        }
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    // stagger siblings that reveal together
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var siblings = $$(":scope > .reveal", parent);
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty("--reveal-delay", Math.min(idx * 0.09, 0.45) + "s");
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------
     Active nav link by section
     ------------------------------------------------------------------ */
  var navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        } else if (link.getAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) sectionObserver.observe(s);
    });
  }

  /* ------------------------------------------------------------------
     Menu tabs (WAI-ARIA tabs pattern, automatic activation)
     ------------------------------------------------------------------ */
  var tablist = $(".tabs");
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist);
    var indicator = $(".tabs__indicator", tablist);

    function moveIndicator(tab) {
      // align the bar to the label text, not the button padding
      var cs = window.getComputedStyle(tab);
      var pl = parseFloat(cs.paddingLeft) || 0;
      var pr = parseFloat(cs.paddingRight) || 0;
      indicator.style.setProperty("--x", (tab.offsetLeft + pl) + "px");
      indicator.style.setProperty("--w", (tab.offsetWidth - pl - pr) + "px");
    }

    function selectTab(tab, setFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (selected) {
          panel.hidden = false;
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        } else {
          panel.hidden = true;
        }
      });
      moveIndicator(tab);
      if (setFocus) tab.focus();
      // keep the active tab visible on small screens
      if (tablist.scrollWidth > tablist.clientWidth) {
        tablist.scrollTo({ left: tab.offsetLeft - 16, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (ev) {
        var next = null;
        if (ev.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (ev.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (ev.key === "Home") next = tabs[0];
        else if (ev.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          ev.preventDefault();
          selectTab(next, true);
        }
      });
    });

    var syncIndicator = function () {
      var active = $('[aria-selected="true"]', tablist);
      if (active) moveIndicator(active);
    };
    syncIndicator();
    window.addEventListener("resize", syncIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncIndicator);
  }

  /* ------------------------------------------------------------------
     Gallery: prev / next controls for the horizontal track
     ------------------------------------------------------------------ */
  var track = $("#gallery-track");
  if (track) {
    var prevBtn = $('[data-gallery="prev"]');
    var nextBtn = $('[data-gallery="next"]');

    var updateButtons = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max;
    };

    var step = function (dir) {
      var item = $(".gallery__item", track);
      var amount = item ? item.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * amount, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    };

    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(updateButtons); }, { passive: true });
    track.addEventListener("keydown", function (ev) {
      if (ev.target !== track) return;
      if (ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
      if (ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
    });
    window.addEventListener("resize", updateButtons);
    window.addEventListener("load", updateButtons);
    updateButtons();
  }

  /* ------------------------------------------------------------------
     Opening hours: highlight today + live open/closed status
     (computed in Israel time, Asia/Jerusalem)
     ------------------------------------------------------------------ */
  // minutes from midnight; end > 1440 means after midnight
  var SCHEDULE = {
    0: [[1080, 1410]],               // Sun 18:00–23:30
    1: [[1080, 1410]],
    2: [[1080, 1410]],
    3: [[1080, 1410]],
    4: [[1080, 1500]],               // Thu 18:00–01:00
    5: [[750, 960], [1170, 1500]],   // Fri 12:30–16:00, 19:30–01:00
    6: [[750, 1410]]                 // Sat 12:30–23:30
  };
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function israelNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jerusalem", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
      if (day < 0) throw new Error("weekday");
      return { day: day, mins: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(mins) {
    mins = mins % 1440;
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function openStatus(now) {
    // still open from yesterday's late session?
    var yesterday = (now.day + 6) % 7;
    var late = SCHEDULE[yesterday].filter(function (r) { return r[1] > 1440 && now.mins < r[1] - 1440; })[0];
    if (late) return { open: true, text: "Open now · until " + fmt(late[1]) };

    var today = SCHEDULE[now.day];
    for (var i = 0; i < today.length; i++) {
      if (now.mins >= today[i][0] && now.mins < today[i][1]) {
        return { open: true, text: "Open now · until " + fmt(today[i][1]) };
      }
      if (now.mins < today[i][0]) {
        return { open: false, text: "Closed now · opens today at " + fmt(today[i][0]) };
      }
    }
    var tomorrow = (now.day + 1) % 7;
    return { open: false, text: "Closed now · opens " + DAY_NAMES[tomorrow] + " at " + fmt(SCHEDULE[tomorrow][0][0]) };
  }

  var now = israelNow();
  var status = openStatus(now);
  var statusEl = $("[data-open-status]");
  if (statusEl) {
    statusEl.textContent = status.text;
    var dot = $(".status-dot");
    if (dot) dot.classList.toggle("is-closed", !status.open);
  }
  $$(".hours tr[data-days]").forEach(function (row) {
    var days = row.getAttribute("data-days").split(",").map(Number);
    if (days.indexOf(now.day) !== -1) row.classList.add("is-today");
  });

  /* ------------------------------------------------------------------
     Reservation form: validation + confirmation state (no submission)
     ------------------------------------------------------------------ */
  var form = $("#reserve-form");
  var confirmBox = $("#reserve-confirm");

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseISO(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function normalisePhone(v) {
    var digits = String(v).replace(/[\s\-().]/g, "");
    if (digits.indexOf("+972") === 0) digits = "0" + digits.slice(4);
    else if (digits.indexOf("972") === 0) digits = "0" + digits.slice(3);
    return digits;
  }

  if (form && confirmBox) {
    var fields = {
      date: $("#r-date"),
      time: $("#r-time"),
      guests: $("#r-guests"),
      name: $("#r-name"),
      phone: $("#r-phone")
    };

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);
    fields.date.min = isoDate(today);
    fields.date.max = isoDate(maxDate);

    var validators = {
      date: function (v) {
        if (!v) return "Please choose a date.";
        var d = parseISO(v);
        if (!d) return "Please use a valid date.";
        if (d < today) return "That date has already passed.";
        if (d > maxDate) return "We take bookings up to 60 days ahead.";
        return "";
      },
      time: function (v) {
        if (!v) return "Please choose a time.";
        var d = parseISO(fields.date.value);
        if (d && d.getDay() === 5 && v < "19:30") return "On Fridays, dinner seating starts at 19:30.";
        if (d && d.getTime() === today.getTime()) {
          var n = new Date();
          var mins = n.getHours() * 60 + n.getMinutes();
          var parts = v.split(":");
          if (+parts[0] * 60 + +parts[1] <= mins + 30) return "Please pick a time at least 30 minutes from now.";
        }
        return "";
      },
      guests: function (v) { return v ? "" : "How many guests?"; },
      name: function (v) {
        v = v.trim();
        if (!v) return "Please tell us your name.";
        if (v.length < 2) return "That name looks a little short.";
        return "";
      },
      phone: function (v) {
        if (!v.trim()) return "We need a phone number to confirm.";
        if (!/^0\d{8,9}$/.test(normalisePhone(v))) return "Please enter a valid Israeli number, e.g. 050-123-4567.";
        return "";
      }
    };

    function setError(name, message) {
      var input = fields[name];
      var field = input.closest(".field");
      var err = document.getElementById(input.id + "-error");
      err.textContent = message;
      field.classList.toggle("is-invalid", !!message);
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }

    function validate(name) {
      var msg = validators[name](fields[name].value);
      setError(name, msg);
      return !msg;
    }

    Object.keys(fields).forEach(function (name) {
      var input = fields[name];
      var evt = input.tagName === "SELECT" || input.type === "date" ? "change" : "blur";
      input.addEventListener(evt, function () {
        validate(name);
        if (name === "date" && fields.time.value) validate("time");
      });
      // clear the error as soon as the user fixes it
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) validate(name);
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var firstInvalid = null;
      Object.keys(fields).forEach(function (name) {
        var field = fields[name].closest(".field");
        field.classList.remove("is-invalid");
        void field.offsetWidth; // restart shake animation
        if (!validate(name) && !firstInvalid) firstInvalid = fields[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      form.classList.add("is-loading");
      $(".btn__label", form).textContent = "Holding your table…";

      setTimeout(function () {
        var d = parseISO(fields.date.value);
        var guests = +fields.guests.value;
        var ref = "OE-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        var set = function (key, val) { $('[data-confirm="' + key + '"]', confirmBox).textContent = val; };

        set("first", fields.name.value.trim().split(/\s+/)[0]);
        set("date", d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
        set("time", fields.time.value);
        set("guests", guests + (guests === 1 ? " guest" : " guests"));
        set("ref", ref);
        set("phone", fields.phone.value.trim());

        form.hidden = true;
        form.classList.remove("is-loading");
        $(".btn__label", form).textContent = "Request table";
        confirmBox.hidden = false;
        $("#confirm-title").focus();
      }, prefersReducedMotion() ? 200 : 1100);
    });

    $("[data-reserve-again]").addEventListener("click", function () {
      form.reset();
      Object.keys(fields).forEach(function (name) { setError(name, ""); });
      confirmBox.hidden = true;
      form.hidden = false;
      fields.date.focus();
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // initial state
  onScroll();
})();
