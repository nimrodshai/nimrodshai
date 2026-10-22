(function () {
  const C = window.CONTENT;

  let lang = "en";
  try { lang = localStorage.getItem("ns-lang") || "en"; } catch (e) {}
  if (new URLSearchParams(location.search).get("lang") === "he") lang = "he";

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const arrow = (size) => `<svg class="arrow flip" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>`;
  const chev = `<svg class="chev" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
  // Projects with langShots have one screenshot per language (id-en.jpg, id-he.jpg).
  const shot = (p) => `assets/shots/${p.langShots ? `${p.id}-${lang}` : p.id}.jpg?v=5`;
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
          <ul class="chips">${p.tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="behind" id="behind-${p.id}" inert>
            <div class="behind-inner">
              <ul>${d.behind.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
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

  function render() {
    const t = C.ui[lang];
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "he" ? "rtl" : "ltr";
    document.title = lang === "he" ? "נמרוד שי | מוצרי AI, אפליקציות ואתרים" : "Nimrod Shai | AI Products, Apps & Websites";

    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => { el.alt = t[el.dataset.i18nAlt]; });
    document.getElementById("langLabel").textContent = t.langLabel;
    document.getElementById("about").setAttribute("aria-label", t.aboutLabel);

    document.getElementById("stats").innerHTML = t.stats.map((s) =>
      `<div class="stat"><span class="stat-big">${esc(s.big)}</span><span class="stat-label">${esc(s.label)}</span></div>`
    ).join("");

    document.getElementById("aboutList").innerHTML = t.heroBody.map((para, i) =>
      `<div class="about-item"><span class="about-n">${pad(i + 1)}</span><h2>${esc(t.aboutTitles[i])}</h2><p>${esc(para)}</p></div>`
    ).join("");

    document.getElementById("waLink").href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t.waText)}`;

    document.getElementById("projectList").innerHTML = renderProjects(t);

    // The marquee repeats the shots twice so the -50% loop is seamless.
    document.getElementById("marquee").innerHTML = C.projects.concat(C.projects).map((p) =>
      `<img src="${shot(p)}" width="1200" height="750" alt="">`
    ).join("");

    document.getElementById("moreList").innerHTML = C.more.map((m) => {
      const href = m.url;
      const inner = `<span class="more-tag">${esc(m.tag)}</span><h4>${esc(m.name)}${href ? " " + arrow(16) : ""}</h4><p>${esc(m[lang])}</p>`;
      return href ? `<a class="more-card" href="${href}" target="_blank" rel="noopener">${inner}</a>` : `<div class="more-card">${inner}</div>`;
    }).join("");
  }

  document.getElementById("projectList").addEventListener("click", (e) => {
    const btn = e.target.closest(".behind-toggle");
    if (!btn) return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("open", open);
    panel.inert = !open;
  });

  document.getElementById("langToggle").addEventListener("click", () => {
    lang = lang === "en" ? "he" : "en";
    try { localStorage.setItem("ns-lang", lang); } catch (e) {}
    render();
  });

  render();
})();
