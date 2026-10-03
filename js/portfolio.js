/* portfolio.js — builds the portfolio page from the data in data.js.
 *
 * Nothing here hard-codes content: every heading, project and link comes from
 * window.SITE, so editing data.js is enough to update the page.
 *
 * The script tag is `defer`, so this runs once the DOM is ready. Each section
 * below renders its markup and then wires up its own listeners, keeping the
 * wiring next to the markup it depends on.
 */
(() => {
  "use strict";

  const SITE = window.SITE;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Three accent colours, cycled so neighbouring cards never look identical.
  const ACCENTS = ["var(--cy)", "var(--vi)", "var(--go)"];

  // Content is author-supplied, but it still reaches innerHTML, so escape it
  // rather than trusting it.
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
    );

  /** Builds a row of tag chips from a list of strings. */
  const renderTags = (tags) => tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  /* ------------------------------------------------------------------ toasts */
  /* Small transient messages in the bottom-right corner. */
  const showToast = (message) => {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    $("#toasts").appendChild(node);
    setTimeout(() => node.remove(), 3200);
  };

  /* ------------------------------------------------------------- static copy */
  /* Header, hero and rotating job titles. */

  $("#yr").textContent = new Date().getFullYear();
  $("#lead").textContent = SITE.hero.lead;

  $("#stats").innerHTML = SITE.hero.stats
    .map(([value, label]) => `<div class="stat"><b>${escapeHtml(value)}</b><small>${escapeHtml(label)}</small></div>`)
    .join("");

  // Rotating job titles in the hero. Left static under prefers-reduced-motion:
  // the titles are all shown at once instead of cycling.
  const roles = SITE.hero.roles;
  const rolesEl = $("#roles");
  if (roles.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let roleIndex = 0;
    setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      rolesEl.textContent = roles[roleIndex];
    }, 2400);
  } else {
    rolesEl.textContent = roles.join(" · ");
  }

  /* ------------------------------------------------------------------- about */
  $("#aboutG").innerHTML = `
    <div class="rv">
      <p style="font-size:17px">${escapeHtml(SITE.about.intro)}</p>
      <p>${escapeHtml(SITE.about.body)}</p>
    </div>
    <div class="grid">
      ${SITE.about.pillars
        .map(
          (pillar, i) => `
            <div class="card rv">
              <span class="mono" style="color:${ACCENTS[i % ACCENTS.length]}">${escapeHtml(pillar.tag)}</span>
              <h3>${escapeHtml(pillar.title)}</h3>
              <p>${escapeHtml(pillar.text)}</p>
            </div>`
        )
        .join("")}
    </div>`;

  /* ------------------------------------------------------------------ skills */
  // Levels live in data.js, but this grid shows chips only. The animated bars
  // are the intro page's Skills popup.
  $("#skillGrid").innerHTML = SITE.skills
    .map(
      (group, i) => `
        <div class="card rv">
          <h3 style="color:${ACCENTS[i % ACCENTS.length]};font-size:18px">${escapeHtml(group.group)}</h3>
          <div class="tags">${renderTags(group.items.map(([name]) => name))}</div>
        </div>`
    )
    .join("");

  /* ----------------------------------------------------------------- journey */
  // --c is read by the CSS to colour the timeline dot, so the marker and the
  // phase label stay the same colour.
  $("#tl").innerHTML = SITE.journey
    .map(
      (entry, i) => `
        <div class="rv" style="--c:${ACCENTS[i % ACCENTS.length]}">
          <span class="mono" style="color:${ACCENTS[i % ACCENTS.length]}">${escapeHtml(entry.phase)}</span>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.text)}</p>
        </div>`
    )
    .join("");

  /* ------------------------------------------------------------ achievements */
  $("#ach").innerHTML = SITE.achievements
    .map(
      (item, i) => `
        <div class="card rv">
          <span class="mono" style="color:${ACCENTS[i % ACCENTS.length]}">${escapeHtml(item.tag)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>`
    )
    .join("");

  /* ------------------------------------------------------------------ resume */
  const resume = SITE.resume;
  const bulletList = (items) =>
    `<ul style="padding-left:18px;margin-top:6px">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  $("#resumeCard").innerHTML = `
    <h3>${escapeHtml(resume.title)}</h3>
    <p class="mono" style="color:var(--mute);margin:4px 0 12px">${escapeHtml(resume.sub)}</p>
    <p style="max-width:68ch">${escapeHtml(resume.objective)}</p>
    <div class="grid g3" style="margin-top:16px">
      <div><span class="mono eyebrow">Core stack</span>${bulletList(resume.stack)}</div>
      <div><span class="mono" style="color:var(--vi)">Highlights</span>${bulletList(resume.highlights)}</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
      <a class="btn pri" href="Manas_Kumar_Mishra_Resume.pdf" download>Download PDF</a>
      <button type="button" class="btn" id="copy-summary">Copy summary</button>
      <button type="button" class="btn" id="print-resume">Print</button>
      <a class="btn" href="${escapeHtml(SITE.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>`;

  // The clipboard API rejects on insecure origins, so surface a toast rather
  // than letting an unhandled rejection sit in the console.
  $("#copy-summary").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resume.copyText);
      showToast("Summary copied.");
    } catch {
      showToast("Copy is not available in this browser.");
    }
  });

  // print() is a global, so call it through window explicitly.
  $("#print-resume").addEventListener("click", () => window.print());

  /* ---------------------------------------------------------------- projects */
  const projects = SITE.projects;

  // A project's `cat` is a space-separated list ("web ai"), so a project can
  // show up under more than one filter.
  const hasCategory = (project, category) => project.cat.split(/\s+/).includes(category);

  // Only offer filters for categories at least one project actually uses, so
  // the row never shows a tab that leads to an empty grid.
  const CATEGORY_LABELS = [
    ["web", "Web"],
    ["android", "Android"],
    ["ai", "AI"],
    ["game", "Game"],
  ];
  const usedCategories = CATEGORY_LABELS.filter(([key]) => projects.some((project) => hasCategory(project, key)));

  $("#filters").innerHTML = [["all", `All (${projects.length})`], ...usedCategories]
    .map(
      ([key, label], i) => `
        <button type="button" data-filter="${key}" class="${i === 0 ? "on" : ""}"
                aria-pressed="${i === 0}">${label}</button>`
    )
    .join("");

  const projectGrid = $("#projGrid");
  projectGrid.innerHTML = projects
    .map((project, i) => {
      // Projects with no real link yet fall back to the GitHub profile, so the
      // link is never a dead end.
      const href = project.link || SITE.githubUrl;
      return `
        <article class="card proj rv" data-cat="${escapeHtml(project.cat)}">
          <div>
            <span class="mono eyebrow">${escapeHtml(project.status)}</span>
            <h3>${escapeHtml(project.name)}</h3>
            <p>${escapeHtml(project.desc)}</p>
            <div class="tags">${renderTags(project.tags)}</div>
          </div>
          <div class="foot">
            <button type="button" class="link" data-index="${i}">View details +</button>
            <a class="link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
              ${project.link ? "Open" : "GitHub"} ↗
            </a>
          </div>
        </article>`;
    })
    .join("");

  // Delegated off the container so it survives the grid being re-rendered.
  $("#filters").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;

    $$("#filters button").forEach((each) => {
      const isActive = each === button;
      each.classList.toggle("on", isActive);
      each.setAttribute("aria-pressed", String(isActive));
    });

    const active = button.dataset.filter;
    $$(".proj", projectGrid).forEach((card) => {
      card.hidden = !(active === "all" || card.dataset.cat.split(/\s+/).includes(active));
    });
  });

  /* ------------------------------------------------------- case study modal */
  const modal = $("#modal");
  let lastFocused = null;

  const openCaseStudy = (project) => {
    $("#mm").textContent = project.status;
    $("#mt1").textContent = project.name;
    $("#mp").textContent = project.problem;
    $("#ms").textContent = project.solution;
    $("#mr").textContent = project.desc;
    $("#mg").innerHTML = renderTags(project.tags);

    // Remember the trigger so closing can hand focus back to it.
    lastFocused = document.activeElement;
    modal.classList.add("open");
    document.body.style.overflow = "hidden"; // stop the page scrolling behind
    $("#mx").focus();
  };

  const closeCaseStudy = () => {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  projectGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-index]");
    if (!trigger) return;
    openCaseStudy(projects[Number(trigger.dataset.index)]);
  });

  $("#mx").addEventListener("click", closeCaseStudy);
  // Clicking the backdrop, but not the sheet, closes it too.
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeCaseStudy();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCaseStudy();
  });

  /* ------------------------------------------------------------ scroll reveal */
  /* Fade cards in as they scroll into view. */
  const revealTargets = $$(".rv");

  if (!("IntersectionObserver" in window)) {
    // No observer support: show everything rather than leaving it invisible.
    revealTargets.forEach((element) => element.classList.add("in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target); // one-shot, then stop watching
        });
      },
      { threshold: 0.1 }
    );
    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  /* ----------------------------------------------------- nav active section */
  const navLinks = $$("#nav a");

  // The rootMargin shrinks the viewport to a thin band across the middle, so a
  // link highlights when its section crosses the reader's eyeline rather than
  // scrolling past the very top or bottom of the screen.
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("on", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((section) => sectionObserver.observe(section));

  /* ------------------------------------------------------------------- theme */
  /* Light/dark switch, remembered across visits. */
  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    // Keep the browser chrome (mobile address bar) in step with the page.
    if (themeMeta) themeMeta.content = theme === "light" ? "#f4f6fb" : "#090A0F";
  };

  // localStorage throws in some private-browsing modes, so guard every access.
  const readStoredTheme = () => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  };

  const storedTheme = readStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") applyTheme(storedTheme);

  $("#theme").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* not persisting is fine; the toggle still works for this visit */
    }
  });

  /* ------------------------------------------------------------- mobile menu */
  const nav = $("#nav");
  const menuButton = $("#menu");

  const setMenuOpen = (open) => {
    nav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuButton.textContent = open ? "✕" : "☰";
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuButton.addEventListener("click", () => setMenuOpen(!nav.classList.contains("open")));
  // Following a link should never leave the menu covering the new section.
  navLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

  // Back at a wide viewport the full nav bar returns, so drop the open state.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) setMenuOpen(false);
  });

  /* ---------------------------------------------------------- contact details */
  /* Every address lives in data.js; the markup ships as empty placeholders so
     there is only ever one copy to update. */
  const { email, linkedin, location } = SITE.contact;
  // "https://github.com/manaskumarmishra-MKM" -> "github.com/manaskumarmishra-MKM"
  const githubHandle = SITE.githubUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  $("#emailLink").href = `mailto:${email}`;
  $("#emailText").textContent = email;

  $("#linkedinLink").href = linkedin;
  $("#linkedinText").textContent = "Connect on LinkedIn";

  $("#githubLink").href = SITE.githubUrl;
  $("#githubText").textContent = githubHandle;

  $("#locationText").textContent = `${location} · Hybrid & remote`;

  // Footer mirrors the same three links.
  $("#footerEmail").href = `mailto:${email}`;
  $("#footerLinkedIn").href = linkedin;
  $("#footerGitHub").href = SITE.githubUrl;

  // The fallback "open email app" button should already be usable if Formspree
  // is down before anything has been typed.
  $("#mt").href = `mailto:${email}`;

  /* ------------------------------------------------------------- contact form */
  const form = $("#cf");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Read fields through form.elements: a control named "name" or "email" is
  // shadowed by the form's own IDL attribute of that name, so `form.name` is
  // ambiguous. form.elements is always the input.
  const fieldValue = (name) => form.elements[name].value.trim();

  const messageField = $("#m");
  const messageCount = $("#cc");
  const nameField = $("#n");
  const emailField = $("#e");
  const sendButton = $("#send");

  /** Paints a field red while it is invalid; the tick beside the label is set
   *  by the caller, which knows what to say. */
  const markValidity = (input, isValid) => input.classList.toggle("bad", !isValid);

  // Live character count, read from the textarea's own maxlength so the two
  // cannot drift apart.
  messageField.addEventListener("input", () => {
    messageCount.textContent = `${messageField.value.length} / ${messageField.maxLength}`;
  });

  nameField.addEventListener("input", () => {
    const valid = nameField.value.trim().length > 1;
    markValidity(nameField, valid);
    $("#ns").textContent = valid ? "✓" : "";
  });

  emailField.addEventListener("input", () => {
    const valid = emailPattern.test(emailField.value);
    markValidity(emailField, valid);
    $("#es").textContent = valid ? "✓" : "";
  });

  const formIsValid = () =>
    Boolean(fieldValue("name")) &&
    emailPattern.test(fieldValue("email")) &&
    Boolean(fieldValue("subject")) &&
    Boolean(fieldValue("message"));

  /** Prefills the "open email app" link with whatever was already typed, so a
   *  failed send does not cost the visitor their message. */
  const buildMailtoFallback = () => {
    const subject = fieldValue("subject");
    const body = `${fieldValue("message")}\n\n— ${fieldValue("name")} (${fieldValue("email")})`;
    $("#mt").href = `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const showForm = () => {
    form.style.display = "grid";
    $("#okm").classList.remove("show");
    $("#errm").classList.remove("show");
  };

  async function submitForm() {
    if (!formIsValid()) {
      showToast("Fill in your name, a valid email, a subject and a message.");
      return;
    }

    sendButton.disabled = true;
    sendButton.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(`Formspree replied ${response.status}`);

      form.style.display = "none";
      $("#errm").classList.remove("show");
      $("#okm").classList.add("show");
      $("#ts").textContent = new Date().toLocaleTimeString();
      form.reset();
    } catch {
      // Formspree unreachable (offline, blocked, bad endpoint). Offer the typed
      // message as a pre-filled email instead of losing it.
      buildMailtoFallback();
      form.style.display = "none";
      $("#errm").classList.add("show");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Send message";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // always handled by fetch, never a real page post
    submitForm();
  });

  $("#again").addEventListener("click", showForm);
  $("#retry").addEventListener("click", () => {
    showForm();
    submitForm();
  });
})();
