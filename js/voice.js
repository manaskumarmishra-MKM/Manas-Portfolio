/* Voice engine: browser speechSynthesis plus word-by-word highlighting.
 *
 * Exposes window.Voice. Highlighting is driven by the engine's own boundary
 * events where available, and by a timer everywhere else, so the text still
 * lights up in sync on browsers with no speech support at all.
 */
window.Voice = (function () {
  const synth = window.speechSynthesis || null;
  const state = { muted: false, rate: 1.0, voice: null, timer: null, speaking: false };

  // One <span> per word, plus each word's character offset in the original
  // script. Boundary events report a character index, so the offsets are what
  // let us map a boundary back onto a specific word.
  let words = [];
  let offsets = [];

  /** Splits the script into <span>s and records where each word starts. */
  function buildWords(container, script) {
    container.textContent = "";
    words = [];
    offsets = [];

    // Walk the string directly instead of searching for each word: with
    // repeated words (e.g. "I" twice) indexOf would keep matching the first
    // occurrence and the highlight would lag behind the audio.
    const pattern = /\S+/g;
    let match;
    while ((match = pattern.exec(script)) !== null) {
      offsets.push(match.index);
      const span = document.createElement("span");
      span.className = "dialogue-word";
      span.textContent = match[0];
      container.appendChild(span);
      words.push(span);
    }
  }

  /** Lights every word up to `index`, marking `index` as the current one. */
  function light(index) {
    words.forEach((word, i) => {
      word.classList.toggle("word-lit", i <= index);
      word.classList.toggle("word-lit-now", i === index);
    });
  }

  function reset() {
    light(-1);
  }

  /** Picks the best available English voice, preferring an Indian one. */
  function pickVoice() {
    if (!synth) return;
    const list = synth.getVoices();
    if (!list.length) return;
    state.voice =
      list.find((voice) => voice.lang === "en-IN") ||
      list.find((voice) => /en-(GB|US)/.test(voice.lang) && /male|david|daniel|google uk english male/i.test(voice.name)) ||
      list.find((voice) => voice.lang.startsWith("en")) ||
      list[0];
  }

  if (synth) {
    // The voice list is often empty on first load and filled in moments later.
    pickVoice();
    if (synth.addEventListener) synth.addEventListener("voiceschanged", pickVoice);
  }

  function stop() {
    clearInterval(state.timer);
    if (synth) synth.cancel();
    state.speaking = false;
    document.body.classList.remove("speaking");
  }

  /** Called when speech ends, or when the timer fallback runs out. */
  function finish(onEnd) {
    clearInterval(state.timer);
    light(words.length);
    state.speaking = false;
    document.body.classList.remove("speaking");
    if (onEnd) onEnd();
  }

  // Timer-driven highlighting, used when muted, unsupported, or when the
  // browser never fires boundary events. 330ms per word roughly matches a
  // natural speaking pace at rate 1.0.
  function startTimer(onEnd) {
    clearInterval(state.timer);
    let index = 0;
    light(0);
    state.timer = setInterval(() => {
      index++;
      if (index >= words.length) return finish(onEnd);
      light(index);
    }, Math.round(330 / state.rate));
  }

  /** Maps a character index from a boundary event back to a word index. */
  function wordIndexForChar(charIndex) {
    let index = 0;
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] <= charIndex) index = i;
    }
    return index;
  }

  function speak(script, onEnd) {
    stop();
    reset();
    state.speaking = true;
    document.body.classList.add("speaking"); // drives the equalizer animation

    // No audio available, or the visitor muted us: silently run the text.
    if (!synth || state.muted) return startTimer(onEnd);

    const utterance = new SpeechSynthesisUtterance(script);
    if (state.voice) {
      utterance.voice = state.voice;
      utterance.lang = state.voice.lang;
    }
    utterance.rate = state.rate;
    utterance.pitch = 1;

    // Boundary events are the accurate source of timing, so once the first one
    // arrives the fallback timer stands down.
    let gotBoundary = false;
    utterance.onboundary = (event) => {
      if (event.name && event.name !== "word") return;
      gotBoundary = true;
      clearInterval(state.timer);
      light(wordIndexForChar(event.charIndex));
    };
    utterance.onend = () => finish(onEnd);
    // "canceled" and "interrupted" mean we stopped it deliberately (unmute,
    // replay, navigating away), so those are not failures worth recovering from.
    utterance.onerror = (event) => {
      if (event.error !== "canceled" && event.error !== "interrupted") startTimer(onEnd);
    };

    synth.speak(utterance);

    // Some browsers never fire boundary events. If none have arrived shortly
    // after starting, fall back to the timer so the text still highlights.
    setTimeout(() => {
      if (state.speaking && !gotBoundary) startTimer(onEnd);
    }, 700);
  }

  /**
   * Unlocks speech inside a user gesture. Mobile Safari refuses to speak until
   * the page has been tapped, and it only accepts the first utterance issued
   * from within that tap, so this must be called synchronously from a click.
   */
  function unlock() {
    if (!synth) return;
    synth.speak(new SpeechSynthesisUtterance(""));
  }

  return {
    buildWords,
    speak,
    stop,
    reset,
    unlock,
    supported: !!synth,
    isMuted: () => state.muted,
    setMuted(muted) {
      state.muted = muted;
      if (muted && synth) synth.cancel();
    },
    setRate(rate) {
      state.rate = rate;
    },
  };
})();
