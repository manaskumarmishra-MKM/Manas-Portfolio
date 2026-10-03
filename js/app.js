/* app.js — drives the cinematic intro page (index.html).
 *
 * The intro is a six-stage camera sequence with a HUD, a spoken voice-over and
 * a set of "teleport" panels. This file owns the stage machine, the audio
 * controls, the teleport modal and the toast, and it renders its panels from
 * the data in data.js. */
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);

  // Escapes text that gets interpolated into innerHTML. The apostrophe matters
  // too: several strings are dropped into single-quoted or attribute contexts.
  const esc = (t) =>
    String(t).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /** Clamps a skill level to 0-100 and returns it as a number.
   *  Used both for display and for an inline width style, so a stray value in
   *  data.js can never inject arbitrary CSS. */
  const percent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  /* ---------- Timecode + latency ---------- */
  // SMPTE-style timecode: HH:MM:SS:FF at 24 fps. Hours and minutes are both
  // derived from elapsed time, so the counter keeps climbing instead of
  // freezing the hours field at "00".
  const startedAt = performance.now();
  const FPS = 24;
  const pad = (value) => String(value).padStart(2, "0");

  setInterval(() => {
    const elapsed = performance.now() - startedAt;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor(elapsed / 60000) % 60;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const frames = Math.floor((elapsed / 1000) * FPS) % FPS;
    $("timecode-display").textContent = `TC: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)} [${FPS} FPS]`;
  }, 1000 / FPS);

  // Cosmetic "system latency" readout in the header.
  setInterval(() => {
    $("latency-val").textContent = `${10 + Math.floor(Math.random() * 5)}ms`;
  }, 3200);

  /* ---------- Stage machine ---------- */
  const nav = $("stage-nav");
  const img = $("main-stage-img");
  let current = 5;
  let autoCycle = true;
  let autoTimer = null;

  S.stages.forEach((st, i) => {
    if (i) nav.insertAdjacentHTML("beforeend", '<div class="w-4 h-0.5 bg-surface-glass-border"></div>');
    const b = document.createElement("button");
    b.className = "stage-pill flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-secondary bg-surface-container border border-surface-glass-border font-code-tech text-code-tech transition-all duration-300";
    b.dataset.stage = st.n;
    b.innerHTML = `<b class="text-xs">${String(st.n).padStart(2, "0")}</b><span>// ${esc(st.label)}</span>`;
    b.addEventListener("click", () => { stopAuto(); applyStage(st.n); });
    nav.appendChild(b);
  });

  function applyStage(n) {
    current = n;
    const cfg = S.stages[n - 1];
    document.querySelectorAll(".stage-pill").forEach((p) => {
      const on = Number(p.dataset.stage) === n;
      p.classList.toggle("active", on);
      p.classList.toggle("text-primary-container", on);
      p.classList.toggle("bg-surface-container-high", on);
      p.classList.toggle("text-text-secondary", !on);
    });
    img.style.transform = cfg.scale;
    img.style.filter = cfg.filter;
    $("focal-lock-badge").textContent = `[ FOCAL LOCK: ${cfg.focal} ]`;
    $("ocular-lock-stat").textContent = `[ OCULAR_LOCK: ${cfg.ocular}% ]`;
    $("stage-status-stat").textContent = `CALIBRATION: ${cfg.status}`;
    $("fov-display").textContent = `FIELD_OF_VIEW: ${cfg.fov}° HORIZONTAL`;
    $("iso-display").textContent = `EXPOSURE: ${cfg.iso}`;
    if (n === 6) playVoice();
  }

  /* Auto-cycle plays the intro once, 1 -> 6, then stops on the voice stage */
  function runIntro() {
    stopAuto();
    autoCycle = true;
    updateAutoLabel();
    applyStage(1);
    autoTimer = setInterval(() => {
      if (current >= 6) return stopAuto();
      applyStage(current + 1);
    }, 2200);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoCycle = false;
    updateAutoLabel();
  }
  function updateAutoLabel() {
    $("autoplay-text").textContent = `[ AUTO-CYCLE: ${autoCycle ? "ON" : "OFF"} ]`;
  }
  $("autoplay-toggle-btn").addEventListener("click", () => (autoCycle ? stopAuto() : runIntro()));

  /* ---------- Voice ---------- */
  Voice.buildWords($("voice-dialogue"), S.voiceScript);
  if (!Voice.supported) $("voice-warning").classList.remove("hidden");

  function playVoice() { Voice.speak(S.voiceScript); }
  $("replay-btn").addEventListener("click", playVoice);

  function toggleSound() {
    const muted = !Voice.isMuted();
    Voice.setMuted(muted);
    document.body.classList.toggle("muted", muted);
    $("audio-state-text").textContent = muted ? "[ SOUND: MUTED ]" : "[ SOUND: ACTIVE ]";
    $("mute-voice-btn").textContent = muted ? "[ UNMUTE VOICE ]" : "[ MUTE VOICE ]";
    if (!muted && current === 6) playVoice();
  }
  $("audio-toggle-btn").addEventListener("click", toggleSound);
  $("mute-voice-btn").addEventListener("click", toggleSound);

  // Playback speeds for the voice intro. 1.25 is a genuine step, so the label
  // cannot be rounded to one decimal (it would read "1.3x" while the engine
  // actually runs at 1.25). Whole numbers keep the ".0" so the cycled label
  // matches the "1.0x" the button ships with in the markup.
  const speeds = [1.0, 1.25, 1.5, 2.0];
  const formatSpeed = (rate) => (Number.isInteger(rate) ? rate.toFixed(1) : String(rate));
  let speedIndex = 0;
  $("speed-toggle-btn").addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    const rate = speeds[speedIndex];
    Voice.setRate(rate);
    $("speed-toggle-btn").textContent = `[ ⚡ SPEED ${formatSpeed(rate)}x ]`;
    playVoice(); // replay immediately so the new rate is audible
  });

  /* ---------- Start gate (user click unlocks audio) ---------- */
  const gate = $("start-gate");
  $("start-btn").addEventListener("click", () => {
    // Browsers only allow speech after a user gesture, and iOS/Safari in
    // particular need an utterance issued inside the click handler itself.
    // Going through Voice keeps every speech call in one place.
    if (Voice.supported) Voice.unlock();
    gate.classList.add("leaving");
    setTimeout(() => gate.remove(), 650);
    runIntro();
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(title, msg) {
    const el = $("hud-toast");
    $("toast-title").textContent = title;
    $("toast-msg").textContent = msg;
    el.classList.remove("translate-y-8", "opacity-0");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("translate-y-8", "opacity-0"), 3200);
  }

  /* ---------- Teleport modal ---------- */
  const modal = $("teleport-modal");
  const body = $("modal-body-content");

  const tag = (t, c = "primary-container") => `<span class="font-code-meta text-[11px] px-2 py-0.5 rounded bg-surface-container text-${c}">${esc(t)}</span>`;
  const heading = (t, sub) => `<div><h3 class="font-headline-sm text-headline-sm font-bold">${esc(t)}</h3><p class="font-code-meta text-code-meta text-text-secondary">${esc(sub)}</p></div>`;

  const renderers = {
    projects() {
      const cards = S.projects.map((p) => `
        <div class="p-4 rounded-xl bg-canvas-void/90 border border-surface-glass-border flex flex-col justify-between gap-3">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-[17px] font-bold text-primary-container">${esc(p.name)}</span>
              <span class="text-[10px] font-code-meta px-2 py-0.5 rounded bg-surface-container text-text-secondary border border-surface-glass-border">${esc(p.status)}</span>
            </div>
            <p class="font-body-sm text-body-sm text-text-secondary">${esc(p.desc)}</p>
          </div>
          <div class="flex flex-wrap gap-1.5 pt-3 border-t border-surface-glass-border">
            ${p.tags.map((t) => tag(t)).join("")}
            ${p.link ? `<a class="ml-auto font-code-meta text-code-meta text-primary-container hover:underline" href="${esc(p.link)}" target="_blank" rel="noopener">Open</a>` : ""}
          </div>
        </div>`).join("");
      return heading("Featured Projects", `${S.projects.length} systems loaded`) + `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cards}</div>`;
    },
    skills() {
      const cols = S.skills.map((g) => `
        <div class="p-4 rounded-xl bg-canvas-void/90 border border-surface-glass-border flex flex-col gap-3">
          <span class="font-code-tech text-code-tech text-primary-container font-bold">${esc(g.group)}</span>
          ${g.items.map(([n, v]) => {
            const level = percent(v);
            return `
            <div>
              <div class="flex justify-between text-xs font-code-meta"><span>${esc(n)}</span><span class="text-primary-container">${level}%</span></div>
              <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden"><div class="h-full bg-primary-container" style="width:${level}%"></div></div>
            </div>`;
          }).join("")}
        </div>`).join("");
      return heading("Technical Arsenal", "Languages, web, mobile, AI and embedded") + `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cols}</div>`;
    },
    journey() {
      const items = S.journey.map((j) => `
        <div class="relative">
          <span class="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-surface-charcoal border-2 border-primary-container ${j.active ? "animate-pulse" : ""}"></span>
          <div class="p-3.5 rounded-xl bg-canvas-void/80 border ${j.active ? "border-primary-container/40" : "border-surface-glass-border"}">
            <span class="font-code-meta text-[11px] text-primary-container font-bold">${esc(j.phase)}</span>
            <h4 class="font-headline-sm text-[16px] font-bold mt-1">${esc(j.title)}</h4>
            <p class="font-body-sm text-body-sm text-text-secondary mt-1">${esc(j.text)}</p>
          </div>
        </div>`).join("");
      return heading("Computer Science & Engineering Roadmap", "Academic and builder milestones") +
        `<div class="relative pl-6 sm:pl-8 border-l-2 border-primary-container/40 space-y-6">${items}</div>`;
    },
    resume() {
      const r = S.resume;
      const list = (a) => `<ul class="text-text-secondary space-y-1 list-disc list-inside">${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
      return `
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-glass-border">
          ${heading(r.title, r.sub)}
          <button onclick="window.print()" class="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-action text-label-action border border-surface-glass-border">[ PRINT ]</button>
        </div>
        <div class="p-5 rounded-xl bg-canvas-void/90 border border-surface-glass-border space-y-4 font-body-sm">
          <p class="text-text-secondary leading-relaxed">${esc(r.objective)}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-surface-glass-border">
            <div><h4 class="font-code-tech text-code-tech text-primary font-bold mb-1.5">CORE STACK</h4>${list(r.stack)}</div>
            <div><h4 class="font-code-tech text-code-tech text-secondary font-bold mb-1.5">HIGHLIGHTS</h4>${list(r.highlights)}</div>
          </div>
        </div>`;
    }
  };

  let lastFocus = null;
  function openModal(t) {
    lastFocus = document.activeElement;
    $("modal-telemetry-tag").textContent = `// TELEPORT // ${t.label.replace(/\s+/g, "_")}`;
    body.innerHTML = renderers[t.key]();
    $("modal-action-cta").href = t.href;
    $("modal-action-cta").textContent = t.cta;
    const resumeCopyBtn = $("resume-copy-btn");
    if (t.key === "resume") {
      resumeCopyBtn.classList.remove("hidden");
      resumeCopyBtn.addEventListener("click", () => {
        navigator.clipboard && navigator.clipboard.writeText(S.resume.copyText);
        showToast("COPIED", "Profile summary copied to clipboard.");
      });
    } else {
      resumeCopyBtn.classList.add("hidden");
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    $("modal-close-btn").focus();
    showToast(`TELEPORT: ${t.label}`, "Node engaged");
  }
  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (lastFocus) lastFocus.focus();
  }

  const row = $("teleport-row");
  S.teleports.forEach((t) => {
    const b = document.createElement("button");
    b.className = "teleport-btn px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-primary-container font-code-tech text-code-tech border border-surface-glass-border hover:border-primary-container/50 active:scale-95 flex items-center gap-1.5";
    b.innerHTML = `<span class="material-symbols-outlined text-xs">${t.icon}</span><span>[ ${esc(t.label)} ]</span>`;
    b.addEventListener("click", () => {
      if (t.external) {
        showToast("EXTERNAL LINK", "Opening GitHub profile...");
        window.open(S.githubUrl, "_blank", "noopener,noreferrer");
      } else openModal(t);
    });
    row.appendChild(b);
  });

  $("modal-close-btn").addEventListener("click", closeModal);
  $("modal-dismiss-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

  /* ---------- Initial state (before the gate is clicked) ---------- */
  applyStage(1);
  Voice.stop();
})();
