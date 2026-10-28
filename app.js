(function () {
  const C = window.CONTENT;

  // Most visitors come from Hebrew ads, so Hebrew is the default unless the browser says otherwise.
  let lang = /^he|^iw/i.test(navigator.language || "") ? "he" : "en";
  try { lang = localStorage.getItem("ns-lang") || lang; } catch (e) {}
  const qLang = new URLSearchParams(location.search).get("lang");
  if (qLang === "he" || qLang === "en") lang = qLang;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const arrow = (size) => `<svg class="arrow flip" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>`;
  const chev = `<svg class="chev" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
  // Projects with langShots have one screenshot per language (id-en.jpg, id-he.jpg).
  const shot = (p) => `assets/shots/${p.langShots ? `${p.id}-${lang}` : p.id}.jpg?v=6`;
  // Local demos open in the same language as the portfolio.
  const demoUrl = (url) => url.startsWith("http") ? url : `${url}?lang=${lang}`;
  const pad = (n) => String(n).padStart(2, "0");

  function renderProjects(t) {
    return C.projects.map((p, i) => {
      const d = p[lang];
      return `
      <article class="project" id="p-${p.id}">
        <figure class="project-visual">
          <img src="${shot(p)}" width="1200" height="750" loading="lazy" alt="${esc(t.shotAlt.replace("{name}", d.name))}">
        </figure>
        <div class="project-info">
          <div class="meta">
            <span class="num">${pad(i + 1)}</span>
            <span class="kicker">${esc(d.kicker)}</span>
            <span class="status">${esc(d.status)}</span>
          </div>
          <h3>${esc(d.name)}</h3>
          <p class="tagline">${esc(d.tagline)}</p>
          <p class="desc">${esc(d.desc)}</p>
          <div class="behind" id="behind-${p.id}" inert>
            <div class="behind-inner">
              <ul>${d.behind.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
              <ul class="chips">${p.tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            </div>
          </div>
          <div class="project-actions">
            <a class="btn btn-light" href="${demoUrl(p.url)}" target="_blank" rel="noopener">${p.url.startsWith("http") ? t.visit : t.demo} ${arrow(15)}</a>
            <button type="button" class="btn btn-ghost behind-toggle" aria-expanded="false" aria-controls="behind-${p.id}"><span class="label-full">${t.behind}</span><span class="label-short">${t.behindShort}</span>${chev}</button>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  // The hero cycles through heroWords; only the current word is exposed to screen readers.
  let wordIndex = 0;
  function showWord() {
    const words = document.getElementById("heroWords").children;
    const cur = wordIndex % words.length;
    const prev = (cur - 1 + words.length) % words.length;
    Array.from(words).forEach((el, i) => {
      el.className = i === cur ? "is-cur" : i === prev ? "is-prev" : "";
      el.setAttribute("aria-hidden", String(i !== cur));
    });
  }
  setInterval(() => { wordIndex++; showWord(); }, 2400);

  function render() {
    const t = C.ui[lang];
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "he" ? "rtl" : "ltr";
    document.title = t.title;
    document.querySelector('meta[name="description"]').content = t.description;
    document.querySelector('meta[property="og:title"]').content = t.title;
    document.querySelector('meta[property="og:description"]').content = t.description;
    document.querySelector('meta[property="og:image:alt"]').content = t.ogImageAlt;
    document.querySelector(".nav").setAttribute("aria-label", t.navLabel);
    document.getElementById("langToggle").setAttribute("aria-label", t.languageSwitchLabel);

    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => { el.alt = t[el.dataset.i18nAlt]; });
    document.getElementById("langLabel").textContent = t.langLabel;

    // One section: each outcome names the services that deliver it, numbered 01-06 across both.
    // The mini title: the pillar's name set huge and outlined behind the card top, like a watermark,
    // with the same word on a lime highlighter in front.
    let n = 0;
    document.getElementById("valueList").innerHTML = t.values.map((v) =>
      `<article class="value">
        <span class="value-ghost" aria-hidden="true">${esc(v.kicker)}</span>
        <div class="value-head">
          <span class="value-kicker">${esc(v.kicker)}</span>
          <h3>${esc(v.title)}</h3>
          <p>${esc(v.body)}</p>
        </div>
        <ul class="value-items">${v.items.map((x) =>
          `<li><span class="value-n" aria-hidden="true">${pad(++n)}</span><div><h4>${esc(x.title)}</h4><p>${esc(x.body)}</p></div></li>`
        ).join("")}</ul>
        <div class="value-foot">
          <span class="value-label">${esc(v.examplesLabel)}</span>
          <ul class="examples">${v.examples.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
      </article>`
    ).join("");

    document.getElementById("stepList").innerHTML = t.steps.map((x, i) =>
      `<li class="step"><span class="step-n">${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></li>`
    ).join("");

    document.getElementById("faqList").innerHTML = t.faq.map((x, i) =>
      `<div class="faq-item"><h3><button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-${i}">${esc(x.q)}${chev}</button></h3>
        <div class="faq-a" id="faq-${i}" inert><div class="faq-a-inner"><p>${esc(x.a)}</p></div></div></div>`
    ).join("");

    document.getElementById("stats").innerHTML = t.stats.map((s) =>
      `<div class="stat"><span class="stat-big">${esc(s.big)}</span><span class="stat-label">${esc(s.label)}</span></div>`
    ).join("");

    document.getElementById("aboutList").innerHTML = t.heroBody.map((para, i) =>
      `<div class="about-item"><span class="about-n">${pad(i + 1)}</span><h3>${esc(t.aboutTitles[i])}</h3><p>${esc(para)}</p></div>`
    ).join("");

    document.getElementById("waLink").href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t.waText)}`;

    document.getElementById("heroWords").innerHTML = t.heroWords.map((w) => `<span>${esc(w)}</span>`).join("");
    showWord();

    document.getElementById("projectList").innerHTML = renderProjects(t);

    // The marquee repeats the shots twice so the -50% loop is seamless.
    document.getElementById("marquee").innerHTML = C.projects.concat(C.projects).map((p) =>
      `<img src="${shot(p)}" width="1200" height="750" alt="" draggable="false">`
    ).join("");

    document.getElementById("moreList").innerHTML = C.more.map((m) => {
      const href = m.url;
      const inner = `<span class="more-tag">${esc(m.tag)}</span><h4>${esc(m.name)}${href ? " " + arrow(16) : ""}</h4><p>${esc(m[lang])}</p>`;
      return href ? `<a class="more-card" href="${href}" target="_blank" rel="noopener">${inner}</a>` : `<div class="more-card">${inner}</div>`;
    }).join("");
  }

  // Project "How it's built" panels and FAQ answers expand the same way.
  function toggle(btn) {
    const open = btn.getAttribute("aria-expanded") !== "true";
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("open", open);
    panel.inert = !open;
  }
  document.getElementById("projectList").addEventListener("click", (e) => {
    const btn = e.target.closest(".behind-toggle");
    if (btn) toggle(btn);
  });
  document.getElementById("faqList").addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-q");
    if (btn) toggle(btn);
  });

  document.getElementById("langToggle").addEventListener("click", () => {
    lang = lang === "en" ? "he" : "en";
    try { localStorage.setItem("ns-lang", lang); } catch (e) {}
    render();
  });

  render();

  // The tilted strip drifts on its own. Drag it, swipe it or flick it sideways on a trackpad
  // and it takes the speed you give it, then eases back to its usual drift.
  (function marquee() {
    const tilt = document.querySelector(".marquee-tilt");
    const track = document.getElementById("marquee");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const small = matchMedia("(max-width: 640px)");
    const clamp = (n) => Math.max(-6000, Math.min(6000, n));
    let x = 0, v = 0, last = performance.now(), period = 0, drag = null;

    // The shots are repeated twice, so one loop is the distance to the first repeated shot.
    function measure() {
      const n = track.children.length / 2;
      period = n ? track.children[n].offsetLeft - track.children[0].offsetLeft : 0;
    }
    const cruise = () => reduce.matches ? 0 : -period / (small.matches ? 50 : 70);

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!period) measure();
      if (!drag) {
        const c = cruise();
        v = c + (v - c) * Math.exp(-dt / 0.8);
        x += v * dt;
      }
      if (period) { x %= period; if (x > 0) x -= period; }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      requestAnimationFrame(frame);
    }
    track.style.animation = "none";
    addEventListener("resize", () => { period = 0; });
    requestAnimationFrame(frame);

    tilt.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, px: e.clientX, t: e.timeStamp, v: 0 };
      try { tilt.setPointerCapture(e.pointerId); } catch (err) {}
      tilt.classList.add("dragging");
    });
    tilt.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.px, dt = (e.timeStamp - drag.t) / 1000;
      x += dx;
      if (dt > 0) drag.v = drag.v * 0.3 + (dx / dt) * 0.7;
      drag.px = e.clientX;
      drag.t = e.timeStamp;
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      // Holding still before letting go means no fling.
      v = e.type === "pointerup" && e.timeStamp - drag.t < 100 ? clamp(drag.v) : 0;
      drag = null;
      tilt.classList.remove("dragging");
    };
    tilt.addEventListener("pointerup", release);
    tilt.addEventListener("pointercancel", release);

    // Sideways trackpad swipes steer it; vertical wheel still scrolls the page.
    tilt.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      v = clamp(-e.deltaX * (e.deltaMode ? 16 : 1) * 60);
    }, { passive: false });
  })();
})();
