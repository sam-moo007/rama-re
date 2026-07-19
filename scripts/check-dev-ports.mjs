import { createServer } from "node:net";

const ports = [3000, 4000];

async function check(port, host) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen({ host, port }, () => server.close(resolve));
  });
}

const occupied = [];
for (const port of ports) {
  for (const host of ["0.0.0.0", "::"]) {
    try {
      await check(port, host);
    } catch (error) {
      if (error?.code === "EADDRINUSE") {
        occupied.push(port);
        break;
      }
      throw error;
    }
  }
}

if (occupied.length) {
  console.error(`RAMA development stack not started: port${occupied.length > 1 ? "s" : ""} ${occupied.join(", ")} ${occupied.length > 1 ? "are" : "is"} already in use.`);
  console.error("An existing pnpm dev stack may already be healthy. Stop that stack before starting another one.");
  process.exitCode = 1;
}
