# Manas Kumar Mishra — Portfolio

Built from your `port1.zip` (cinematic intro) plus the best parts of your two portfolio drafts.

## Pages
- `index.html` — cinematic intro with voice (your original), links to the portfolio
- `portfolio.html` — the main portfolio (hero, about, skills, projects, journey, highlights, résumé, contact)

## Files
- `js/data.js` — **edit all your content here** (projects, skills, journey, résumé, hero, about, contact). Both pages read from it.
- `css/styles.css` — intro styles; `css/portfolio.css` — portfolio styles (colour tokens at top)
- `js/app.js`, `js/voice.js`, `js/tailwind-config.js` — intro logic
- `js/portfolio.js` — portfolio logic (filters, case-study sheet, contact form, theme, menu)
- `assets/portrait.png` — the intro portrait, stored locally so it can never expire
- `tools/check.js` — static sanity checks, see below

## Contact details
Live in `js/data.js` only (`contact` and `githubUrl`). The contact card and footer
render from there, so there is a single copy to update.

- Email: `manaskumarmishraofficial@gmail.com`
- GitHub: https://github.com/manaskumarmishra-MKM
- LinkedIn: https://www.linkedin.com/in/manas-kumar-mishra-m-k-m/

## Checks
```bash
node tools/check.js
```
Verifies every file parses, that every element the scripts query actually exists,
that no element has two click handlers bound, that contact details are not
duplicated into the HTML, and that no CSS rule has gone unused.

## TODO before publishing
1. Add real `link` URLs to the projects in `data.js` (they fall back to GitHub until then).
2. Skill percentages in `data.js` are placeholders; the portfolio page shows skills as tags only. The intro's Skills popup still shows the bars.
3. Put `Manas_Kumar_Mishra_Resume.pdf` next to `portfolio.html`.
4. ~~External portrait URL~~ — done: the photo is now `assets/portrait.png`.
5. Contact form posts to Formspree (`xbjvedwq`); falls back to a pre-filled `mailto:`.

Run locally: `python3 -m http.server` then open http://localhost:8000
Deploy: drag the folder to Netlify Drop, or use GitHub Pages / Vercel.
