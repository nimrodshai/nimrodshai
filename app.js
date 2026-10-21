(function () {
  const C = window.CONTENT;

  let lang = "en";
  try { lang = localStorage.getItem("ns-lang") || "en"; } catch (e) {}
  if (new URLSearchParams(location.search).get("lang") === "he") lang = "he";

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const arrow = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" class="flip"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M9 7h8v8"/></svg>`;

  function renderProjects(t) {
    return C.projects.map((p, i) => {
      const d = p[lang];
      const links = [
        p.url ? `<a class="btn btn-sm btn-primary" href="${p.url}" target="_blank" rel="noopener">${p.url.startsWith("http") ? t.visit : t.demo} ${arrow}</a>` : "",
      ].join("");
      return `
      <article class="project" id="p-${p.id}">
        <div class="project-info">
          <div class="meta">
            <span class="num">${String(i + 1).padStart(2, "0")}</span>
            <span class="kicker">${esc(d.kicker)}</span>
            <span class="status">${esc(d.status)}</span>
          </div>
          <h3>${esc(d.name)}</h3>
          <p class="tagline">${esc(d.tagline)}</p>
          <p class="desc">${esc(d.desc)}</p>
          <ul class="chips">${p.tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="project-actions">
            <button type="button" class="btn btn-sm btn-ghost behind-toggle" aria-expanded="false" aria-controls="behind-${p.id}">${t.behind}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 9l6 6 6-6"/></svg></button>
            ${links}
          </div>
          <div class="behind" id="behind-${p.id}" inert>
            <div class="behind-inner">
              <ul>${d.behind.map((b, j) => `<li style="--i:${j}">${esc(b)}</li>`).join("")}</ul>
            </div>
          </div>
        </div>
        <figure class="project-visual">
          <div class="shot">
            <div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(p.label)}</span></div>
            <img src="assets/shots/${p.id}.jpg?v=4" width="1200" height="750" loading="lazy" alt="${esc(t.shotAlt.replace("{name}", d.name))}">
          </div>
        </figure>
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
    document.getElementById("heroBody").innerHTML = t.heroBody.map((p) => `<p>${esc(p)}</p>`).join("");

    document.getElementById("waLink").href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t.waText)}`;

    document.getElementById("projectList").innerHTML = renderProjects(t);

    document.getElementById("moreList").innerHTML = C.more.map((m) => {
      const href = m.url;
      const inner = `<span class="more-tag">${esc(m.tag)}</span><h4>${esc(m.name)}${href ? " " + arrow : ""}</h4><p>${esc(m[lang])}</p>`;
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
