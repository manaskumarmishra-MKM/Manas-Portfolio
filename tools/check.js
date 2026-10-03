#!/usr/bin/env node
/* Static sanity checks for the portfolio site.
   Usage: node tools/check.js
   No dependencies — the site itself has none, and the checks should match that. */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

// ---------------------------------------------------------------- 1. syntax
for (const file of ["js/data.js", "js/app.js", "js/voice.js", "js/portfolio.js", "js/tailwind-config.js"]) {
  try {
    new (require("vm").Script)(read(file), { filename: file });
  } catch (err) {
    fail(`syntax error in ${file}: ${err.message}`);
  }
}

// ------------------------------------------- 2. every queried id exists in HTML
// A `$("#typo")` that matches nothing returns null, and the next property
// access throws at runtime. This is the cheapest crash in the codebase.
//
// Ids created by JS (inside innerHTML template strings) count as declared, so
// scan the scripts too before reporting a miss.
{
  const scripts = ["js/portfolio.js", "js/app.js"].map(read).join("\n");
  const madeByJs = new Set([...scripts.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

  for (const [js, html] of [
    ["js/portfolio.js", "portfolio.html"],
    ["js/app.js", "index.html"],
  ]) {
    const source = read(js);
    const declared = new Set([...read(html).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const id of madeByJs) declared.add(id);

    for (const m of source.matchAll(/\$\("#([A-Za-z0-9_-]+)"/g)) {
      if (!declared.has(m[1])) fail(`${js} queries #${m[1]} but nothing creates an element with that id`);
    }
    if (js === "js/app.js") {
      for (const m of source.matchAll(/\$\("([A-Za-z0-9_-]+)"\)/g)) {
        if (!declared.has(m[1])) fail(`${js} calls getElementById("${m[1]}") but nothing creates that element`);
      }
    }
  }
}

// --------------------------------- 3. no element gets two click handlers bound
// The old portfolio.js bound #theme and #menu twice; the second silently won.
for (const file of ["js/portfolio.js", "js/app.js"]) {
  const source = read(file);
  const counts = new Map();
  for (const m of source.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)\.onclick/g)) {
    counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  }
  for (const [id, n] of counts) {
    if (n > 1) fail(`${file} binds #${id} .onclick ${n} times — the later one silently wins`);
  }
}

// ------------------------- 4. form fields read through .elements, not the form
// NOTE, not a failure. HTMLFormElement carries [LegacyOverrideBuiltIns], so in
// real browsers a control named "name"/"email"/"subject" shadows the form's own
// IDL attribute and `cf.name.value` does resolve to the input. It reads as a
// latent trap though, and jsdom (below) does not implement the override, so
// anything tested there sees a string. `.elements.<field>` is unambiguous and
// behaves identically everywhere, so we use it throughout.
{
  const source = read("js/portfolio.js");
  const form = read("portfolio.html");
  const fieldNames = new Set([...form.matchAll(/<(?:input|textarea)[^>]*\bname="([^"]+)"/g)].map((m) => m[1]));

  for (const m of source.matchAll(/\bcf\.([A-Za-z0-9_]+)\.value/g)) {
    const field = m[1];
    if (!fieldNames.has(field)) {
      fail(`portfolio.js reads cf.${field}.value but the form has no field named "${field}"`);
      continue;
    }
    if (!["action", "method", "elements"].includes(field)) {
      notes.push(`portfolio.js uses cf.${field}.value — works, but cf.elements.${field}.value is safer to read`);
    }
  }
}

// ------------------------------------------------ 5. no dead CSS class rules
// A rule nothing references is maintenance cost with no payoff. Only HTML and
// JS count as consumers here — the stylesheet itself must not, or every rule
// would "reference" its own name.
{
  const css = read("css/portfolio.css");
  const used = read("portfolio.html") + "\n" + read("js/portfolio.js") + "\n" + read("js/app.js");
  const rules = new Set([...css.matchAll(/^\.([A-Za-z][A-Za-z0-9_-]*)\s*[,{]/gm)].map((m) => m[1]));

  for (const rule of rules) {
    // The class may sit anywhere inside a class attribute, or appear alone in a
    // quoted selector string. Boundaries are whitespace, so `.tag` does not
    // count as a use of `.tags`.
    const boundary = "(?:^|[\\s\"'`])";
    const asClassAttr = new RegExp(`class="[^"]*${boundary}${rule}(?=[\\s"'])`);
    const asQuoted = new RegExp(`["'\`][^"'\`]*${boundary}${rule}(?=[\\s"'\`])`);
    if (!asClassAttr.test(used) && !asQuoted.test(used)) notes.push(`css/portfolio.css: .${rule} is never used`);
  }
}

// ------------------------------------------------- 6. contact details not
//                                                     duplicated in markup
// Addresses should exist in exactly one place: data.js. A hardcoded copy in the
// HTML silently goes stale the moment the real details change.
{
  const data = read("js/data.js");
  const html = read("portfolio.html");

  const inData = new Set([
    ...(data.match(/https?:\/\/[^\s",]+/g) || []),
    ...(data.match(/[^\s"]+@[^\s"]+\.[a-z]+/gi) || []),
  ]);
  // Only personal addresses matter here — a CDN or a font host is legitimately
  // static markup and has nothing to do with data.js.
  const isPersonal = (url) => /mailto:|linkedin\.com|github\.com/i.test(url);
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+|mailto:[^"]+)"/g)) {
    if (isPersonal(m[1]) && !inData.has(m[1])) fail(`portfolio.html hardcodes ${m[1]} — move it into data.js`);
  }

  // Placeholders a script is expected to fill. If the script stops filling one,
  // the visitor gets an empty link, so assert each is actually referenced.
  const scripts = read("js/portfolio.js");
  for (const id of ["emailLink", "linkedinLink", "githubLink", "footerEmail", "footerGitHub", "footerLinkedIn", "mt"]) {
    if (html.includes(`id="${id}"`) && !scripts.includes(`"#${id}"`)) {
      fail(`portfolio.html has #${id} but portfolio.js never populates it`);
    }
  }
}

// -------------------------------------------------------------------- report
for (const n of notes) console.log(`note:  ${n}`);
for (const f of failures) console.log(`FAIL:  ${f}`);

if (failures.length) {
  console.log(`\n${failures.length} failure(s), ${notes.length} note(s).`);
  process.exit(1);
}
console.log(`\nAll checks passed (${notes.length} note(s)).`);
