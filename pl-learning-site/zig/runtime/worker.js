import { runZig } from "./compiler.js";

self.addEventListener("message", async ({ data }) => {
  try {
    const result = await runZig(data.source, stage => self.postMessage({ stage }));
    self.postMessage(result);
  } catch (error) {
    self.postMessage({ status: "error", output: error.message || "The Zig compiler could not start." });
  }
});
