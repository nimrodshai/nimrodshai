#!/usr/bin/env node
// Run from any directory: node scripts/check-content.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");
for (const file of ["content.js", "app.js"]) {
  execFileSync(process.execPath, ["--check", fileURLToPath(new URL(file, root))]);
}

const context = { window: {} };
runInNewContext(read("content.js"), context);
const content = context.window.CONTENT;
const html = read("index.html");

// Compare leaf paths to catch missing fields or untranslated array entries.
function paths(value, prefix = "") {
  if (typeof value === "string") {
    assert.ok(value.trim(), `Empty copy: ${prefix}`);
    return [prefix];
  }
  assert.ok(value && typeof value === "object", `Invalid copy: ${prefix}`);
  return Object.keys(value).flatMap((key) => paths(value[key], `${prefix}.${key}`)).sort();
}

assert.deepEqual(paths(content.ui.en), paths(content.ui.he), "UI translations differ in structure");
let fieldCount = 0;
for (const lang of ["en", "he"]) {
  const t = content.ui[lang];
  fieldCount += paths(t).length;
  for (const match of html.matchAll(/data-i18n(?:-alt)?="([^"]+)"/g)) {
    assert.equal(typeof t[match[1]], "string", `Missing ${lang} UI field: ${match[1]}`);
  }
  assert.equal(t.aboutTitles.length, t.heroBody.length, `${lang} bio headings and paragraphs differ`);
  assert.ok(t.heroWords.length, `${lang} needs a headline`);
  assert.ok(t.description.length <= 160, `${lang} search description exceeds 160 characters`);
}
for (const project of content.projects) {
  assert.deepEqual(paths(project.en), paths(project.he), `Project translations differ: ${project.id}`);
  for (const lang of ["en", "he"]) fieldCount += paths(project[lang]).length;
}
for (const item of content.more) {
  assert.ok(item.en?.trim() && item.he?.trim(), `Missing tool description: ${item.name}`);
  fieldCount += 2;
}

const escape = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
assert.ok(html.includes(`<title>${escape(content.ui.en.title)}</title>`), "Static title is out of date");
for (const key of ['name="description"', 'property="og:description"']) {
  assert.ok(html.includes(`${key} content="${escape(content.ui.en.description)}"`), `Static ${key} is out of date`);
}
assert.ok(html.includes(`property="og:title" content="${escape(content.ui.en.title)}"`), "Share title is out of date");
assert.ok(html.includes(`property="og:image:alt" content="${escape(content.ui.en.ogImageAlt)}"`), "Share image description is out of date");

console.log(`Copy checks passed: ${fieldCount} localized fields, ${content.projects.length} projects, ${content.ui.en.faq.length} FAQs per language.`);
console.log("JavaScript syntax, translation coverage, and default search/share text are consistent.");
