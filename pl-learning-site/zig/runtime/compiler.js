import {
  WASI, ConsoleStdout, Directory, File, OpenFile, PreopenDirectory
} from "./wasi/index.js";

const encode = new TextEncoder();
const decode = new TextDecoder();
const maxOutput = 32_768;

async function unpack(name) {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok || !response.body) throw new Error("A compiler file could not be loaded.");
  const bytes = response.body.pipeThrough(new DecompressionStream("gzip"));
  return new Response(bytes).arrayBuffer();
}

function readLibrary(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const root = new Map();
  for (let offset = 0; offset < bytes.length;) {
    const nameLength = view.getUint32(offset, true);
    const fileLength = view.getUint32(offset + 4, true);
    const start = offset + 8 + nameLength;
    const parts = decode.decode(bytes.subarray(offset + 8, start)).split("/");
    const name = parts.pop();
    let directory = root;
    for (const part of parts) {
      if (!directory.has(part)) directory.set(part, new Directory(new Map()));
      directory = directory.get(part).contents;
    }
    directory.set(name, new File(bytes.subarray(start, start + fileLength), { readonly: true }));
    offset = start + fileLength;
  }
  return root;
}

let runtime;
function loadRuntime() {
  runtime ??= Promise.all([
    unpack("compiler.bin").then(bytes => WebAssembly.compile(bytes)),
    unpack("zig-lib.bin").then(readLibrary),
    unpack("compiler-rt.bin")
  ]).catch(error => {
    runtime = null;
    throw error;
  });
  return runtime;
}

function captureOutput() {
  const decoder = new TextDecoder();
  let output = "";
  let truncated = false;
  const stream = new ConsoleStdout(bytes => {
    if (truncated) return;
    const remaining = maxOutput - output.length;
    const text = decoder.decode(bytes.subarray(0, remaining), { stream: true });
    output += text;
    truncated = bytes.length > remaining || output.length >= maxOutput;
  });
  return {
    stream,
    read: () => output + decoder.decode() + (truncated ? "\n[Output truncated]" : "")
  };
}

function processIo(output) {
  return [new OpenFile(new File([])), output.stream, output.stream];
}

export async function runZig(source, onStage = () => {}) {
  if (encode.encode(source).length > 65_536) {
    return { status: "error", output: "Keep your Zig program under 64 KiB." };
  }

  onStage("Loading compiler…");
  const [compiler, library, intrinsics] = await loadRuntime();
  onStage("Compiling…");
  const files = new Map([
    ["main.zig", new File(encode.encode(source), { readonly: true })],
    ["lib", new Directory(library)],
    ["compiler-rt.o", new File(intrinsics, { readonly: true })]
  ]);
  const output = captureOutput();
  // Link a prebuilt Zig runtime object for the browser compiler’s self-hosted Wasm backend.
  const wasi = new WASI([
    "zig", "build-exe", "main.zig", "-target", "wasm32-wasi",
    "-fno-llvm", "-fno-lld", "-fno-compiler-rt", "compiler-rt.o", "-femit-bin=main.wasm",
    "--zig-lib-dir", "lib", "--cache-dir", ".zig-cache", "--global-cache-dir", ".zig-cache"
  ], [], [
    ...processIo(output), new PreopenDirectory(".", files)
  ], { debug: false });
  const compile = await WebAssembly.instantiate(compiler, { wasi_snapshot_preview1: wasi.wasiImport });
  const exitCode = wasi.start(compile);
  if (exitCode !== 0 || !files.has("main.wasm")) {
    return { status: "error", output: output.read() || "The compiler could not produce a program." };
  }

  onStage("Running…");
  const result = captureOutput();
  const programWasi = new WASI(["main"], [], processIo(result), { debug: false });
  try {
    const program = await WebAssembly.instantiate(files.get("main.wasm").data, {
      wasi_snapshot_preview1: programWasi.wasiImport
    });
    const exit = programWasi.start(program.instance);
    const text = result.read();
    return exit === 0
      ? { status: "ok", output: text }
      : { status: "error", output: text ? `${text.trimEnd()}\nProgram exited with code ${exit}.` : `Program exited with code ${exit}.` };
  } catch (error) {
    return { status: "error", output: [result.read().trimEnd(), error.message].filter(Boolean).join("\n") };
  }
}
