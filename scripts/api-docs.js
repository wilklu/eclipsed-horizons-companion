#!/usr/bin/env node

import { spawn } from "child_process";

const baseUrl = (process.env.API_BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const endpoints = [
  { path: "/api/openapi.yaml", label: "OpenAPI spec" },
  { path: "/api/docs", label: "Swagger UI" },
];
const shouldOpen = process.argv.includes("--open");

function openUrl(url) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }

  const cmd = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
}

async function checkEndpoint(url, label) {
  try {
    const response = await fetch(url);
    const ok = response.ok;
    const status = `${response.status} ${response.statusText}`;

    if (ok) {
      console.log(`[OK] ${label}: ${url} (${status})`);
      return true;
    }

    console.log(`[FAIL] ${label}: ${url} (${status})`);
    return false;
  } catch (error) {
    console.log(`[FAIL] ${label}: ${url} (${error.message})`);
    return false;
  }
}

async function main() {
  console.log(`Checking API docs at ${baseUrl}`);

  const results = await Promise.all(endpoints.map(({ path, label }) => checkEndpoint(`${baseUrl}${path}`, label)));

  const allPassed = results.every(Boolean);

  if (allPassed && shouldOpen) {
    const docsUrl = `${baseUrl}/api/docs`;
    console.log(`Opening Swagger UI: ${docsUrl}`);
    openUrl(docsUrl);
  }

  if (!allPassed) {
    console.log("Some checks failed. Make sure the API server is running with the latest code.");
    process.exit(1);
  }

  console.log("API documentation endpoints are available.");
}

main().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
