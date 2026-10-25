import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const [command, ...args] = process.argv.slice(2);

if (command !== "dev" && command !== "build" && command !== "start") {
  throw new Error("Usage: node scripts/run-next.mjs <dev|build|start> [...args]");
}

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextCli, command, ...args], {
  env: { ...process.env, NODE_ENV: command === "dev" ? "development" : "production" },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
