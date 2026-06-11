import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function startProcess(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  child.on("error", (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    process.exitCode = 1;
  });

  return child;
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const backend = startProcess("api", npmCommand, ["run", "api:dev"], rootDir);
const frontend = startProcess(
  "frontend",
  npmCommand,
  ["--prefix", "apps/system-generator/frontend", "run", "dev"],
  rootDir,
);

let shuttingDown = false;

function stopChildren(signal) {
  if (!backend.killed) {
    backend.kill(signal);
  }
  if (!frontend.killed) {
    frontend.kill(signal);
  }
}

process.on("SIGINT", () => {
  shuttingDown = true;
  stopChildren("SIGINT");
  process.exit(130);
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  stopChildren("SIGTERM");
  process.exit(143);
});

function handleChildExit(code, signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  stopChildren(signal || "SIGTERM");
  process.exit(typeof code === "number" ? code : signal ? 0 : 1);
}

backend.on("exit", (code, signal) => {
  handleChildExit(code, signal);
});

frontend.on("exit", (code, signal) => {
  handleChildExit(code, signal);
});
