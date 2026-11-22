export function createRunner(courseId) {
  const isZig = courseId === "zig";
  let worker;
  let active;

  function closeWorker() {
    worker?.terminate();
    worker = undefined;
  }

  function finish(result, close = !isZig) {
    const run = active;
    if (!run) return;
    active = undefined;
    clearTimeout(run.timer);
    if (close) closeWorker();
    run.resolve(result);
  }

  function limit(milliseconds, error) {
    clearTimeout(active.timer);
    active.timer = setTimeout(() => finish({ error }, true), milliseconds);
  }

  function execute(source, required, onStage) {
    return new Promise(resolve => {
      active = { resolve };
      const startError = isZig ? "The Zig compiler could not start." : "The Go runtime could not load.";
      limit(isZig ? 60_000 : 25_000, startError);
      try {
        worker ??= isZig
          ? new Worker(new URL("./zig/runtime/worker.js", import.meta.url), { type: "module" })
          : new Worker(new URL("./go/go-worker.js", import.meta.url));
        worker.onerror = () => finish({ error: startError }, true);
        if (isZig) {
          worker.onmessage = ({ data }) => {
            if (!active) return;
            if (data.stage) {
              onStage(data.stage);
              if (data.stage === "Compiling…") limit(20_000, "The Zig compiler took too long.");
              if (data.stage === "Running…") limit(5_000, "The program took too long. Check for a loop that never ends.");
            } else {
              finish(data.status === "ok" ? { output: data.output } : { error: data.output });
            }
          };
          worker.postMessage({ source });
        } else {
          worker.onmessage = ({ data }) => {
            if (!active) return;
            if (data.type === "ready") {
              onStage("Running Go…");
              limit(6_000, "The program took too long. Check for an infinite loop or a blocked channel.");
              worker.postMessage({ source, required });
            } else if (data.type === "result") {
              finish(data.result);
            } else {
              finish({ error: data.message });
            }
          };
        }
      } catch {
        finish({ error: startError }, true);
      }
    });
  }

  return {
    execute,
    stop() {
      finish({ stopped: true }, true);
    }
  };
}
