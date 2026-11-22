import { workbenches } from "./workbenches.js";
import { createRunner } from "./runner.js";

const course = workbenches[document.body.dataset.course];
const isZig = course.id === "zig";
const runner = createRunner(course.id);

const icons = {
  book: '<path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H8a4 4 0 0 1 4 4 4 4 0 0 1 4-4h2.5A2.5 2.5 0 0 1 21 5.5V19h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  chart: '<path d="M4 20h16M7 16v-4m5 4V8m5 8V4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 1.5"/>',
  circle: '<circle cx="12" cy="12" r="7.5"/>',
  active: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>',
  checkCircle: '<circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.3 4.8-4.8"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  bulb: '<path d="M9 19h6m-5 3h4m-5-6c0-2-3-3-3-7a6 6 0 1 1 12 0c0 4-3 5-3 7z"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2.2 6M4 5v6h6"/>',
  play: '<path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  brackets: '<path d="M9 4H7a2 2 0 0 0-2 2v3a3 3 0 0 1-3 3 3 3 0 0 1 3 3v3a2 2 0 0 0 2 2h2m6-16h2a2 2 0 0 1 2 2v3a3 3 0 0 0 3 3 3 3 0 0 0-3 3v3a2 2 0 0 1-2 2h-2"/>',
  flag: '<path d="M5 21V4m0 1c5-4 9 4 14 0v9c-5 4-9-4-14 0"/>'
};

const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const lessons = course.modules.flatMap(module => module.lessons);
const time = lessons.reduce((total, lesson) => total + lesson.minutes, 0);
const main = document.querySelector("#main");
const nav = document.querySelector("#main-nav");
const tabs = [["learn", "book", "Learn"], ["playground", "terminal", "Playground"], ["progress", "chart", "Progress"]];
let editor;

function readState() {
  const defaultState = { completed: {}, drafts: {}, current: lessons[0].id };
  try {
    const saved = JSON.parse(localStorage.getItem(course.storageKey));
    const completed = Array.isArray(saved?.completed)
      ? Object.fromEntries(saved.completed.map(id => [id, true]))
      : saved?.completed ?? defaultState.completed;
    return {
      completed,
      drafts: saved?.drafts ?? defaultState.drafts,
      current: saved?.current ?? saved?.last ?? defaultState.current
    };
  } catch {
    return defaultState;
  }
}

const state = readState();

function saveState() {
  try {
    const saved = isZig
      ? { completed: lessons.filter(lesson => state.completed[lesson.id]).map(lesson => lesson.id), drafts: state.drafts, last: state.current }
      : state;
    localStorage.setItem(course.storageKey, JSON.stringify(saved));
  } catch {
    // Continue in this tab if browser storage is unavailable.
  }
}

const completedCount = () => lessons.filter(({ id }) => Boolean(state.completed[id])).length;
const percentage = () => Math.round((completedCount() / lessons.length) * 100);
const lessonLink = (lesson) => `#learn/${lesson.id}`;
const nextUnfinished = () => lessons.find(lesson => !state.completed[lesson.id]);
const isLesson = id => lessons.some(lesson => lesson.id === id);

function route() {
  const [page, id] = location.hash.slice(1).split("/");
  if (page === "playground" || page === "progress") return { page };
  if (isZig && page === "curriculum") return { page: "progress", module: Number(id) };
  return { page: "learn", id: isLesson(id) ? id : isLesson(state.current) ? state.current : lessons[0].id };
}

function hero() {
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <h1 id="hero-title">Learn <em>${course.name}.</em></h1>
      <p>${course.description}</p>
      <div class="hero-meta"><span>${icon("layers", 17)} ${course.modules.length} modules</span><span>${icon("book", 16)} ${lessons.length} lessons</span><span>${icon("clock", 17)} ~${Math.round(time / 60)} hours</span></div>
    </div>
    <div class="hero-art" aria-hidden="true"><img src="${course.art.path}" alt="" width="${course.art.width}" height="${course.art.height}"></div>
  </section>`;
}

function progressMeter() {
  return `<div class="progress-caption"><span>${completedCount()} of ${lessons.length} lessons complete</span><strong>${percentage()}%</strong></div>
    <progress class="meter" value="${completedCount()}" max="${lessons.length}" aria-label="Overall course progress"></progress>`;
}

function courseOutline(activeId) {
  const groups = course.modules.map((module, index) => {
    const isActive = module.lessons.some(lesson => lesson.id === activeId);
    return `<details class="module" ${isActive ? "open" : ""}>
      <summary><span class="module-index">${String(index + 1).padStart(2, "0")}</span><span>${module.title}</span>${icon("chevron", 14)}</summary>
      <ul>${module.lessons.map(lesson => {
        const active = lesson.id === activeId;
        const done = state.completed[lesson.id];
        return `<li><a class="lesson-link ${active ? "selected" : ""}" href="${lessonLink(lesson)}" ${active ? 'aria-current="page"' : ""}>
          <span data-lesson-status="${lesson.id}" class="${done ? "is-complete" : ""}">${icon(done ? "checkCircle" : active ? "active" : "circle", 17)}${done ? '<span class="sr-only">Completed</span>' : ""}</span>
          <span>${lesson.title}</span><small>${lesson.minutes}m</small>
        </a></li>`;
      }).join("")}</ul>
    </details>`;
  }).join("");
  return `<aside class="course-outline panel" aria-label="Course outline">
    <details ${matchMedia("(min-width: 701px)").matches ? "open" : ""}>
      <summary class="outline-summary"><h2>${icon("layers", 19)} Course outline</h2>${icon("chevron", 14)}</summary>
      <div id="outline-progress">${progressMeter()}</div>
      <nav aria-label="Lessons" class="modules">${groups}</nav>
    </details>
  </aside>`;
}

function lessonInfo(lesson) {
  const index = lessons.indexOf(lesson);
  const module = course.modules.find(item => item.lessons.includes(lesson));
  const next = lessons[index + 1];
  const concepts = lesson.explanation
    ? lesson.explanation.map(paragraph => `<p class="lesson-intro">${paragraph}</p>`).join("")
    : `<p class="lesson-intro">${escapeHtml(lesson.intro)}</p>
      <h3>Key concepts</h3>
      <dl class="concept-list">${lesson.concepts.map(([term, description]) => `<div><dt><code>${escapeHtml(term)}</code></dt><dd>${escapeHtml(description)}</dd></div>`).join("")}</dl>`;
  return `<article class="lesson-info panel">
    <div class="lesson-meta"><span>${module.title}</span><span class="meta-dot" aria-hidden="true"></span><span>${icon("clock", 15)} ${lesson.minutes} min</span></div>
    <h2 id="lesson-title">${lesson.title}</h2>
    ${concepts}
    <div class="task-card">
      <h3>${icon("target", 18)} Your task</h3>
      <p>${lesson.task}</p>
      <div class="expected"><span>Expected output</span><pre>${escapeHtml(lesson.expected)}</pre></div>
    </div>
    <details class="hints"><summary>${icon("bulb", 17)} Show hint ${icon("chevron", 14)}</summary>
      ${lesson.hints.map(hint => `<p>${hint}</p>`).join("")}
      <details class="solution"><summary>Show example solution</summary>
        <pre>${escapeHtml(lesson.solution.trimEnd())}</pre>
        <button type="button" class="button button-quiet" id="load-solution">Load example</button>
      </details>
    </details>
    ${lesson.reference ? `<a class="reference-link" href="${lesson.reference}" target="_blank" rel="noopener noreferrer">Read the Zig reference</a>` : ""}
    <div class="lesson-nav">
      ${index > 0 ? `<a class="button button-quiet" href="${lessonLink(lessons[index - 1])}">Previous lesson</a>` : ""}
      <a class="button button-quiet lesson-next" href="${next ? lessonLink(next) : "#progress"}">${next ? "Next lesson" : "View progress"}</a>
    </div>
  </article>`;
}

function editorPanel(lesson) {
  return `<section class="workbench panel" aria-label="${course.name} code editor">
    <div class="workbench-heading">
      <h2>${icon("terminal", 19)} ${course.name} editor</h2>
      <div class="editor-actions">
        <button type="button" id="reset" class="button button-quiet" title="Restore starter code">${icon("reset", 16)} <span>Reset</span></button>
        <button type="button" id="run" class="button button-accent" aria-keyshortcuts="Control+Enter Meta+Enter">${icon("play", 17)} <span>Run code</span></button>
      </div>
    </div>
    <div class="file-bar">
      <span class="file-tab">${icon("brackets", 15)} ${course.file}</span>
      <button type="button" id="copy-code" class="button button-quiet" aria-label="Copy code" title="Copy code">${icon("copy", 16)}</button>
    </div>
    <div class="editor-surface">
      <pre class="line-numbers" id="line-numbers" aria-hidden="true"></pre>
      <div class="code-surface">
        <pre class="highlight" id="highlight" aria-hidden="true"></pre>
      <textarea id="code" class="code-input" aria-label="Edit ${course.file}" aria-describedby="editor-shortcut" wrap="off" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="64000"></textarea>
      </div>
    </div>
    <div class="output-heading"><h3>${icon("terminal", 16)} Output</h3><button type="button" id="clear" class="button button-quiet" hidden>Clear</button></div>
    <div class="output" id="output" aria-live="polite" aria-atomic="true"><p class="output-placeholder">Run your code to see the output here.</p></div>
    <div class="editor-footer"><span id="editor-shortcut"><kbd>${/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"}</kbd> <kbd>Enter</kbd> to run</span><span class="editor-notice" id="editor-notice" role="status"></span>${lesson ? `<button type="button" id="check" class="button button-outline">${icon("check", 17)} Check answer</button>` : ""}</div>
  </section>`;
}

function progressPage() {
  const next = nextUnfinished();
  return `<div class="subpage">
    <div class="page-intro"><span class="page-icon">${icon("chart", 26)}</span><h1>Your progress</h1><p>Pick up where you left off. Progress is saved in this browser.</p></div>
    <section class="panel progress-overview"><div><h2>${course.name} learning path</h2>${progressMeter()}</div>
      <a class="button button-accent" href="${next ? lessonLink(next) : "#learn"}">${next ? "Continue learning" : "Review lessons"}</a>
    </section>
    <div class="progress-grid">${course.modules.map((module, index) => {
      const finished = module.lessons.filter(lesson => state.completed[lesson.id]).length;
      return `<section class="panel progress-module" id="module-${index + 1}" tabindex="-1"><h2>${module.title}</h2><p>${finished} / ${module.lessons.length} complete</p>
        ${module.lessons.map(lesson => `<a href="${lessonLink(lesson)}" class="progress-lesson"><span class="${state.completed[lesson.id] ? "is-complete" : ""}">${icon(state.completed[lesson.id] ? "checkCircle" : "circle", 18)}<span class="sr-only">${state.completed[lesson.id] ? "Completed" : "Incomplete"}</span></span>${lesson.title}</a>`).join("")}
      </section>`;
    }).join("")}</div>
  </div>`;
}

function render({ focus = false } = {}) {
  runner.stop();
  editor = undefined;
  const { page, id, module } = route();
  nav.innerHTML = tabs.map(([key, symbol, label]) =>
    `<a class="${key === page ? "nav-current" : ""}" href="#${key}" ${key === page ? 'aria-current="page"' : ""}>${icon(symbol, 17)} <span>${label}</span></a>`).join("");
  if (page === "learn") {
    const lesson = lessons.find(item => item.id === id);
    state.current = lesson.id;
    saveState();
    main.innerHTML = `${hero()}<div class="learn-layout">${courseOutline(lesson.id)}<div class="lesson-layout">${lessonInfo(lesson)}${editorPanel(lesson)}</div></div>`;
    setupEditor(lesson);
    document.title = `${lesson.title} · ${course.name} Workbench`;
    if (focus && location.hash.includes("/")) {
      const title = document.querySelector("#lesson-title");
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
      title.closest("article").scrollIntoView({ block: "start" });
    }
  } else if (page === "playground") {
    main.innerHTML = `<div class="subpage playground-page">
      <div class="page-intro"><span class="page-icon">${icon("terminal", 26)}</span><h1>${course.name} playground</h1><p>Try an idea, test a snippet, or write a program from scratch.</p></div>
      <div class="playground-layout">${editorPanel()}<aside class="panel playground-guide">
        <h2>${icon("book", 19)} About this editor</h2>
        <p>Run a single-file ${course.name} program in your browser. Your code is saved here as you type.</p>
        ${course.playgroundNote}
      </aside></div>
    </div>`;
    setupEditor();
    document.title = `Playground · ${course.name} Workbench`;
  } else {
    main.innerHTML = progressPage();
    document.title = `Progress · ${course.name} Workbench`;
    const section = module && document.querySelector(`#module-${module}`);
    if (section) {
      section.scrollIntoView({ block: "start" });
      if (focus) section.focus({ preventScroll: true });
      return;
    }
  }
  if (focus && (page !== "learn" || !location.hash.includes("/"))) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

const keywords = new Set("break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var".split(" "));
const builtins = new Set("any append bool byte cap clear close complex copy delete error false float32 float64 imag int int32 int64 len make max min new nil panic print println real recover rune string true uint uint32 uint64".split(" "));
const goTokens = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`[\s\S]*?`|\b(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?)\b|[a-zA-Z_][a-zA-Z_0-9]*/g;

const zigTokens = /\/\/[^\n]*|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|@[A-Za-z_]\w*|\b(?:const|var|pub|fn|return|if|else|while|for|switch|struct|comptime|error|catch|try|orelse|defer|errdefer|test|async|union|enum|break|continue|unreachable)\b|\b(?:[uif]\d+|usize|isize|void|bool|type|anytype|true|false|null)\b|\b\d[\da-fA-F_xob.]*\b/g;

function highlightCode(code) {
  let html = "";
  let last = 0;
  for (const match of code.matchAll(isZig ? zigTokens : goTokens)) {
    const value = match[0];
    const style = isZig ? zigTokenStyle(value)
      : value.startsWith("//") || value.startsWith("/*") ? "comment"
      : ['"', "'", "`"].includes(value[0]) ? "string"
      : keywords.has(value) ? "keyword"
      : builtins.has(value) || /^[0-9]/.test(value) ? "value"
      : code.slice(match.index + value.length).trimStart().startsWith("(") ? "function" : "";
    html += escapeHtml(code.slice(last, match.index));
    html += style ? `<span class="token-${style}">${escapeHtml(value)}</span>` : escapeHtml(value);
    last = match.index + value.length;
  }
  return html + escapeHtml(code.slice(last)) + "\n";
}

function zigTokenStyle(value) {
  if (value.startsWith("//")) return "comment";
  if (/^["']/.test(value)) return "string";
  if (value.startsWith("@")) return "function";
  return /^(?:[uif]\d+|usize|isize|void|bool|type|anytype|true|false|null|\d.*)$/.test(value) ? "value" : "keyword";
}

function setupEditor(lesson) {
  const key = lesson?.id ?? "playground";
  const starter = lesson?.initial ?? course.playgroundCode;
  const input = document.querySelector("#code");
  const lines = document.querySelector("#line-numbers");
  const highlight = document.querySelector("#highlight");
  const output = document.querySelector("#output");
  const clear = document.querySelector("#clear");
  const run = document.querySelector("#run");
  const check = document.querySelector("#check");
  const reset = document.querySelector("#reset");
  const placeholder = '<p class="output-placeholder">Run your code to see the output here.</p>';

  function syncScroll() {
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
    lines.scrollTop = input.scrollTop;
  }

  function updateCode() {
    lines.textContent = input.value.split("\n").map((_, index) => index + 1).join("\n") + "\n";
    highlight.innerHTML = highlightCode(input.value);
    syncScroll();
  }

  function saveDraft() {
    state.drafts[key] = input.value;
    saveState();
    updateCode();
  }

  function showOutput(html) {
    output.innerHTML = html;
    clear.hidden = !html || html === placeholder;
  }

  let pending = false;
  async function runCode(checkAnswer) {
    if (pending) {
      runner.stop();
      return;
    }

    pending = true;
    reset.disabled = true;
    if (check) check.disabled = true;
    run.innerHTML = icon("stop", 17) + " Stop";
    const showStage = stage => {
      showOutput(`<p class="output-placeholder">${escapeHtml(stage)}</p>`);
      clear.hidden = true;
    };
    showStage(`Starting ${course.name}…`);
    const result = await runner.execute(input.value, checkAnswer ? lesson.required ?? [] : [], showStage);
    if (!main.contains(run)) return;

    pending = false;
    reset.disabled = false;
    if (check) check.disabled = false;
    run.innerHTML = icon("play", 17) + " Run code";

    if (result.stopped) {
      showOutput('<p class="output-placeholder">Run stopped.</p>');
      return;
    }

    const actualOutput = isZig ? result.output?.trim() : result.output?.trimEnd();
    const consoleText = [result.output?.trimEnd(), result.stderr?.trimEnd()].filter(Boolean).join("\n");
    const consoleHtml = consoleText ? `<pre>${escapeHtml(consoleText)}</pre>` : "";
    if (result.error) {
      showOutput(`${consoleHtml}<p class="result result-error">${escapeHtml(result.error)}</p>`);
      return;
    }
    if (!checkAnswer) {
      showOutput(consoleHtml || '<p class="output-placeholder">Program finished without output.</p>');
      return;
    }
    if (actualOutput !== lesson.expected) {
      showOutput(`${consoleHtml}<p class="result result-error">The output differs from the expected result. Review the task and try again.</p>`);
      return;
    }
    if (result.missing?.length) {
      showOutput(`${consoleHtml}<p class="result result-error">The output matches. Include the requested Go constructs: ${escapeHtml(result.missing.join(", "))}.</p>`);
      return;
    }
    state.completed[lesson.id] = true;
    saveState();
    document.querySelector("#outline-progress").innerHTML = progressMeter();
    const status = document.querySelector(`[data-lesson-status="${lesson.id}"]`);
    status.classList.add("is-complete");
    status.innerHTML = icon("checkCircle", 17) + '<span class="sr-only">Completed</span>';
    showOutput(`${consoleHtml}<p class="result result-success">${icon("checkCircle", 16)} Lesson complete.</p>`);
  }

  editor = { run: () => { if (!pending) runCode(false); } };
  input.value = state.drafts[key] ?? starter;
  updateCode();
  input.addEventListener("input", saveDraft);
  input.addEventListener("scroll", syncScroll);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
      const start = input.selectionStart;
      const currentLine = input.value.slice(0, start).split("\n").at(-1);
      const prefix = /^[\t ]*/.exec(currentLine)[0];
      const indent = currentLine.trimEnd().endsWith("{") ? prefix + (isZig ? "    " : "\t") : prefix;
      if (indent) {
        event.preventDefault();
        if (!document.execCommand("insertText", false, "\n" + indent)) {
          input.setRangeText("\n" + indent, start, input.selectionEnd, "end");
          saveDraft();
        }
      }
    }
  });
  reset.addEventListener("click", () => {
    if (input.value !== starter && !window.confirm("Restore starter code for this editor?")) return;
    input.value = starter;
    saveDraft();
    showOutput(placeholder);
    input.focus();
  });
  const notice = document.querySelector("#editor-notice");
  input.addEventListener("input", () => { notice.textContent = ""; });
  document.querySelector("#copy-code").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      notice.textContent = "Code copied.";
    } catch {
      input.select();
      notice.textContent = "Code selected. Use your copy shortcut.";
    }
  });
  run.addEventListener("click", () => runCode(false));
  check?.addEventListener("click", () => runCode(true));
  clear.addEventListener("click", () => {
    showOutput(placeholder);
    run.focus();
  });
  document.querySelector("#load-solution")?.addEventListener("click", () => {
    if (input.value !== starter && input.value !== lesson.solution && !window.confirm("Replace this draft with the example solution?")) return;
    input.value = lesson.solution;
    saveDraft();
    showOutput(placeholder);
    input.focus();
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && editor) {
    event.preventDefault();
    editor.run();
  }
});

document.querySelector(".skip-link").addEventListener("click", event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener("hashchange", () => render({ focus: true }));
render();
