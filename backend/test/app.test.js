const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
process.env.FRONTEND_URL = "https://shop.example";
const app = require("../index");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("health endpoint reports unavailable until MongoDB connects", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: "unavailable",
    database: "disconnected",
  });
});

test("CORS allows configured local frontend origins and denies others", async () => {
  const productionFrontend = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://shop.example" },
  });
  assert.equal(
    productionFrontend.headers.get("access-control-allow-origin"),
    "https://shop.example",
  );

  const allowed = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(
    allowed.headers.get("access-control-allow-origin"),
    "http://localhost:3000",
  );
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
  assert.equal(allowed.headers.get("cross-origin-resource-policy"), "cross-origin");

  const denied = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://not-allowed.example" },
  });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});

test("unknown API routes return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/missing-route`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { errors: "API route not found." });
});

test("signup validates input before accessing the database", async () => {
  const response = await fetch(`${baseUrl}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", password: "short" }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).success, false);
});

test("cart APIs require an authenticated session", async () => {
  const response = await fetch(`${baseUrl}/getcart`, { method: "POST" });
  assert.equal(response.status, 401);
});

test("product mutation endpoints require an authenticated admin", async () => {
  const response = await fetch(`${baseUrl}/removeproduct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: 1 }),
  });
  assert.equal(response.status, 401);
});
