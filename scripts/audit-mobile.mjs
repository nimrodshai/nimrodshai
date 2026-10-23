// Run inside cua_repl with the selected tab and browser viewport capability.
// await auditMobile({ tab, viewport, baseUrl, outputDir });
import { mkdir, writeFile } from 'node:fs/promises';

export function measureTextLayout() {
  const issues = [];
  const viewport = document.documentElement.clientWidth;
  const ignored = '.marquee, .hero-glow, .brand-name, .skip, [inert], [aria-hidden="true"]';
  const label = el => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : el.className ? `.${String(el.className).trim().split(/\s+/).join('.')}` : ''}`;
  let textNodes = 0;
  const selectors = 'h1,h2,h3,h4,p,li,a,button,.hero-name,.hero-words>.is-cur,.btn span,.stat-big,.stat-label,.more-tag,.footer>span';
  for (const el of document.querySelectorAll(selectors)) {
    const rect = el.getBoundingClientRect();
    if (!el.textContent.trim() || el.closest(ignored) || !rect.width || !rect.height || getComputedStyle(el).opacity === '0') continue;
    textNodes++;
    if (rect.left < -1 || rect.right > viewport + 1) issues.push({ type: 'text outside screen', element: label(el), text: el.textContent.trim(), left: rect.left, right: rect.right });
    if (el.clientWidth && el.scrollWidth > el.clientWidth + 1) issues.push({ type: 'text overflows box', element: label(el), text: el.textContent.trim(), width: el.clientWidth, scrollWidth: el.scrollWidth });
  }
  for (const row of document.querySelectorAll('.topbar-inner,.project-actions,.contact-links')) {
    const box = row.getBoundingClientRect();
    for (const el of row.children) {
      const rect = el.getBoundingClientRect();
      if (rect.width && (rect.left < box.left - 1 || rect.right > box.right + 1)) {
        issues.push({ type: 'control outside container', element: label(el), text: el.textContent.trim() });
      }
    }
  }
  for (const svg of document.querySelectorAll('a svg,button svg')) {
    const width = Number(svg.getAttribute('width'));
    const rect = svg.getBoundingClientRect();
    if (rect.height && rect.width < width - 1) issues.push({ type: 'squeezed icon', element: label(svg.parentElement), width: rect.width, expected: width });
  }
  return { lang: document.documentElement.lang, dir: document.documentElement.dir, width: viewport, pageWidth: document.documentElement.scrollWidth, textNodes, issues };
}

export async function auditMobile({ tab, viewport, baseUrl, outputDir, sizes = [{width:320,height:740},{width:360,height:800},{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:844,height:390}] }) {
  await mkdir(outputDir, { recursive: true });
  const results = [];
  for (const lang of ['en', 'he']) {
    const url = new URL(baseUrl);
    url.searchParams.set('lang', lang);
    await tab.goto(url.href);
    await tab.playwright.waitForLoadState({state:'load'});
    for (const selector of ['.behind-toggle', '.faq-q']) {
      for (const control of await tab.playwright.locator(selector).all()) {
        if (await control.getAttribute('aria-expanded') === 'false') await control.click();
        if (await control.getAttribute('aria-expanded') !== 'true') throw new Error(`Panel did not expand: ${selector}`);
      }
    }
    for (const size of sizes) {
      await viewport.set(size);
      await tab.getAXState({emit:false});
      const result = await tab.playwright.evaluate(measureTextLayout);
      results.push({ ...result, height: size.height });
    }
  }
  await writeFile(`${outputDir}/layout-results.json`, JSON.stringify(results, null, 2));
  return results;
}
