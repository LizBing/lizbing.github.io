importScripts("wasm_exec.js");

async function loadEngine() {
  const go = new Go();
  const response = await fetch("go-engine.bin");
  if (!response.ok) throw new Error("Go runtime download failed.");
  const wasm = new Response(response.body.pipeThrough(new DecompressionStream("gzip")), {
    headers: { "Content-Type": "application/wasm" }
  });
  const { instance } = await WebAssembly.instantiateStreaming(wasm, go.importObject);
  go.run(instance).then(() => {
    self.postMessage({ type: "failure", message: "The Go program stopped unexpectedly." });
  }).catch(() => {
    self.postMessage({ type: "failure", message: "The Go program stopped unexpectedly." });
  });
  if (typeof self.runGoProgram !== "function") throw new Error("The Go runtime could not start.");
  self.postMessage({ type: "ready" });
}

self.onmessage = ({ data }) => {
  try {
    const result = self.runGoProgram(data.source, data.required);
    self.postMessage({ type: "result", result });
  } catch {
    self.postMessage({ type: "failure", message: "The Go program stopped unexpectedly." });
  }
};

loadEngine().catch(() => {
  self.postMessage({ type: "failure", message: "The Go runtime could not load. Try running your code again." });
});
