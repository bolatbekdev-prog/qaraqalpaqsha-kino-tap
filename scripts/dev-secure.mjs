import { spawn } from "node:child_process";

const start = (name, cmd, args) => {
  const child = spawn(cmd, args, {
    stdio: "inherit",
    shell: true
  });
  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
};

const stream = start("stream", "npm", ["run", "dev:stream"]);
const app = start("app", "npm", ["run", "dev"]);

const shutdown = () => {
  stream.kill("SIGTERM");
  app.kill("SIGTERM");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

