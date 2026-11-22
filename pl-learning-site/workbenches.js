import { course as go, playgroundCode } from "./go/course.js";
import { modules as zigModules, sandbox } from "./zig/course.js";

const zigDocs = "https://ziglang.org/documentation/0.17.0/";

export const workbenches = {
  go: {
    ...go,
    storageKey: "workbench:go:v1",
    file: "main.go",
    art: { path: "gopher.jpg", width: 900, height: 600 },
    description: "Build from variables and functions to interfaces, errors, and concurrency.",
    playgroundCode,
    playgroundNote: '<h3>Supported packages</h3><p>The editor includes selected functions from <code>fmt</code>, <code>strings</code>, <code>errors</code>, <code>math</code>, and <code>strconv</code>.</p><a href="https://go.dev/play/" target="_blank" rel="noopener noreferrer">Open the official Go playground</a>'
  },
  zig: {
    id: "zig",
    name: "Zig",
    storageKey: "zig-workbench-v1",
    file: "main.zig",
    art: { path: "zig-poster.jpg", width: 1100, height: 733 },
    description: "Learn Zig’s fundamentals and practice working with structs, pointers, and compile-time code.",
    playgroundCode: sandbox,
    playgroundNote: '<h3>Browser target</h3><p>The editor compiles for <code>wasm32-wasi</code>. Calls such as <code>std.debug.print</code> appear in the output.</p><a href="' + zigDocs + '" target="_blank" rel="noopener noreferrer">Open the Zig language reference</a>',
    modules: zigModules.map(module => ({
      title: module.title,
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        initial: lesson.starter,
        hints: [lesson.hint],
        reference: zigDocs + "#" + lesson.reference
      }))
    }))
  }
};
