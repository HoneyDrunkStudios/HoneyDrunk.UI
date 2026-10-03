import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const routes = new Map([
  ["/", "index.html"],
  ["/fixture.js", "fixture.js"],
]);
createServer(async (request, response) => {
  const file = routes.get(new URL(request.url, "http://127.0.0.1").pathname);
  if (!file) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(resolve("artifacts/web", file));
    response
      .writeHead(200, {
        "Content-Type": file.endsWith(".js") ? "text/javascript" : "text/html",
      })
      .end(body);
  } catch {
    response.writeHead(500).end();
  }
}).listen(4178, "127.0.0.1");
