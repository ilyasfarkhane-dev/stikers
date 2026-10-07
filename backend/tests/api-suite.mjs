// Shared API test suite, run against each supported database (SQLite/D1 and MySQL).
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { handleApi } from "../api.js";
import { createLocalR2 } from "../local-bindings.mjs";

const PASSWORD = "test-password-123";

export function defineApiSuite(name, { openDb, closeDb }) {
  describe(name, () => {
    const dir = mkdtempSync(path.join(tmpdir(), "stk-api-"));
    let env;
    let cookie;

    const call = (pathname, init = {}) => handleApi(new Request(`https://site.test${pathname}`, init), env);
    const json = (method, body) => ({ method, headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body) });

    before(async () => {
      env = { DB: await openDb(dir), FILES: createLocalR2(path.join(dir, "files")), ADMIN_PASSWORD: PASSWORD };
    });

    after(async () => {
      await closeDb(env.DB);
      rmSync(dir, { recursive: true, force: true });
    });

    test("public site never exposes pricing coefficients", async () => {
      const res = await call("/api/public/site");
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.catalog.types.length > 0);
      assert.deepEqual(Object.keys(data.pricing).sort(), ["currency", "enabled"]);
    });

    test("admin routes require a session and reject a wrong password", async () => {
      assert.equal((await call("/api/admin/stats")).status, 401);
      assert.equal((await call("/api/admin/login", json("POST", { password: "nope" }))).status, 401);
      assert.equal((await call("/api/admin/login", json("POST", { password: "nope-again" }))).status, 401);
      const ok = await call("/api/admin/login", json("POST", { password: PASSWORD }));
      assert.equal(ok.status, 200);
      cookie = ok.headers.get("set-cookie").split(";")[0];
      assert.equal((await call("/api/admin/stats", { headers: { cookie } })).status, 200);
    });

    test("quote request is normalized server-side and stores the file", async () => {
      const form = new FormData();
      form.set("name", "Client Test — Café");
      form.set("phone", "+212600000000");
      form.set("items", JSON.stringify([{ name: "Transparent", config: { type: "transparent", material: "vinyle-blanc" } }]));
      form.set("file_0", new Blob(["%PDF"], { type: "application/pdf" }), "logo.pdf");
      const res = await call("/api/public/requests", { method: "POST", body: form });
      assert.equal(res.status, 201);
      const { ref } = await res.json();
      assert.match(ref, /^STK-\d{6}-[A-Z0-9]{4}$/);

      const list = await (await call("/api/admin/requests", { headers: { cookie } })).json();
      const item = list.items.find((r) => r.ref === ref);
      assert.equal(item.name, "Client Test — Café");
      assert.equal(item.items[0].config.material, "vinyle-transparent");

      const detail = await (await call(`/api/admin/requests/${item.id}`, { headers: { cookie } })).json();
      const file = await call(`/api/admin/files/${detail.files[0].id}`, { headers: { cookie } });
      assert.equal(await file.text(), "%PDF");
    });

    test("rejects invalid contact and disallowed file types", async () => {
      const noContact = new FormData();
      noContact.set("name", "X");
      noContact.set("items", JSON.stringify([{ config: {} }]));
      assert.equal((await call("/api/public/requests", { method: "POST", body: noContact })).status, 422);

      const badFile = new FormData();
      badFile.set("name", "X");
      badFile.set("email", "x@example.com");
      badFile.set("items", JSON.stringify([{ config: {} }]));
      badFile.set("file_0", new Blob(["MZ"]), "virus.exe");
      assert.equal((await call("/api/public/requests", { method: "POST", body: badFile })).status, 422);
    });

    test("status updates are recorded in history", async () => {
      const list = await (await call("/api/admin/requests", { headers: { cookie } })).json();
      const id = list.items[0].id;
      const res = await call(`/api/admin/requests/${id}`, json("PATCH", { status: "devis_envoye", quoted_price: 320 }));
      const data = await res.json();
      assert.equal(data.status, "devis_envoye");
      assert.equal(data.quoted_price, 320);
      assert.ok(data.history.some((h) => h.status === "devis_envoye"));
    });

    test("dashboard stats, filters and CSV export", async () => {
      const stats = await (await call("/api/admin/stats", { headers: { cookie } })).json();
      assert.equal(Number(stats.totals.total), 1);
      assert.equal(stats.byStatus.devis_envoye, 1);
      assert.equal(Number(stats.totals.pipeline), 320);
      assert.equal(Object.values(stats.daily).reduce((a, b) => a + b, 0), 1);

      const filtered = await (await call("/api/admin/requests?status=nouveau&q=Caf", { headers: { cookie } })).json();
      assert.equal(filtered.total, 0);
      const found = await (await call("/api/admin/requests?q=Caf", { headers: { cookie } })).json();
      assert.equal(found.total, 1);

      const csv = await (await call("/api/admin/requests/export.csv", { headers: { cookie } })).text();
      assert.match(csv, /Client Test — Café/);
    });

    test("pricing settings enable server-side estimates", async () => {
      const pricing = {
        currency: "MAD",
        materialPerM2: { "vinyle-blanc": 100 },
        printPerM2: 50,
        finishPerM2: { brillant: 0 },
        cutPerUnit: { forme: 0.5 },
        quantityDiscount: {},
        packaging: 0,
        margin: 0,
        minimumOrder: 0,
      };
      assert.equal((await call("/api/admin/settings/pricing", json("PUT", pricing))).status, 200);
      // Saving twice exercises the upsert path.
      assert.equal((await call("/api/admin/settings/pricing", json("PUT", pricing))).status, 200);
      const config = { type: "classique", material: "vinyle-blanc", finish: "brillant", width: 100, height: 100, quantity: 100, cut: "forme" };
      const res = await call("/api/public/estimate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config }) });
      const { estimates } = await res.json();
      // 1 m² × (100 + 50 + 0) + 0.5 × 100 = 200
      assert.equal(estimates[0], 200);
      const site = await (await call("/api/public/site")).json();
      assert.equal(site.pricing.enabled, true);

      assert.equal((await call("/api/admin/settings/pricing", { method: "DELETE", headers: { cookie } })).status, 200);
    });

    test("contact messages are stored without cart items", async () => {
      const send = (fields) => {
        const form = new FormData();
        for (const [k, v] of Object.entries({ kind: "message", items: "[]", ...fields })) form.set(k, v);
        return call("/api/public/requests", { method: "POST", body: form });
      };
      assert.equal((await send({ name: "Sara", email: "sara@example.ma" })).status, 422);
      const res = await send({ name: "Sara", email: "sara@example.ma", message: "[Autre] Bonjour" });
      assert.equal(res.status, 201);
      const { ref } = await res.json();
      const list = await (await call("/api/admin/requests?kind=message", { headers: { cookie } })).json();
      const item = list.items.find((r) => r.ref === ref);
      assert.equal(item.kind, "message");
      assert.equal(item.items.length, 0);
      assert.equal(item.estimate, null);
      assert.equal((await send({ kind: "devis", name: "Sara", email: "sara@example.ma" })).status, 422);
    });

    test("admin media upload is served publicly with byte ranges", async () => {
      const upload = (blob, filename, headers = { cookie }) => {
        const form = new FormData();
        form.set("file", blob, filename);
        return call("/api/admin/media", { method: "POST", headers, body: form });
      };
      const bytes = new Uint8Array(1000).map((_, i) => i % 251);
      assert.equal((await upload(new Blob([bytes], { type: "video/mp4" }), "clip.mp4", {})).status, 401);
      assert.equal((await upload(new Blob(["x"], { type: "application/pdf" }), "doc.pdf")).status, 415);

      const res = await upload(new Blob([bytes], { type: "video/mp4" }), "Démo Sticker.mp4");
      assert.equal(res.status, 201);
      const { url } = await res.json();
      assert.match(url, /^\/api\/public\/media\/[a-z0-9-]+-demo-sticker\.mp4$/);

      const full = await call(url);
      assert.equal(full.status, 200);
      assert.equal(full.headers.get("content-type"), "video/mp4");
      assert.equal(full.headers.get("accept-ranges"), "bytes");
      assert.equal((await full.arrayBuffer()).byteLength, 1000);

      const part = await call(url, { headers: { range: "bytes=100-199" } });
      assert.equal(part.status, 206);
      assert.equal(part.headers.get("content-range"), "bytes 100-199/1000");
      assert.deepEqual(new Uint8Array(await part.arrayBuffer()), bytes.slice(100, 200));
      assert.equal((await call(url, { headers: { range: "bytes=5000-" } })).status, 416);
      assert.equal((await call("/api/public/media/..%2F.env")).status, 404);
    });

    test("settings reject the wrong shape", async () => {
      assert.equal((await call("/api/admin/settings/products", json("PUT", { not: "an array" }))).status, 422);
      assert.equal((await call("/api/admin/settings/unknown", json("PUT", {}))).status, 404);
    });

    test("deleting a request removes it and its files", async () => {
      const list = await (await call("/api/admin/requests", { headers: { cookie } })).json();
      const id = list.items[0].id;
      assert.equal((await call(`/api/admin/requests/${id}`, { method: "DELETE", headers: { cookie } })).status, 200);
      assert.equal((await call(`/api/admin/requests/${id}`, { headers: { cookie } })).status, 404);
    });

    test("checkout orders store delivery + payment and reject unavailable methods", async () => {
      const order = (fields) => {
        const form = new FormData();
        form.set("name", "Client Commande");
        form.set("phone", "+212600000001");
        form.set("kind", "commande");
        form.set("items", JSON.stringify([{ name: "Sticker classique", config: { type: "classique" } }]));
        for (const [k, v] of Object.entries(fields)) form.set(k, v);
        return call("/api/public/requests", { method: "POST", body: form });
      };

      assert.equal((await order({ payment: "carte", city: "Casablanca", address: "1 rue X" })).status, 422);
      assert.equal((await order({ payment: "livraison", city: "", address: "" })).status, 422);

      const res = await order({ payment: "livraison", city: "Casablanca", address: "12 bd Zerktouni" });
      assert.equal(res.status, 201);
      const { ref } = await res.json();
      const list = await (await call("/api/admin/requests", { headers: { cookie } })).json();
      const saved = list.items.find((r) => r.ref === ref);
      assert.equal(saved.kind, "commande");
      assert.deepEqual(saved.checkout, { payment: "livraison", paymentLabel: "Paiement à la livraison", city: "Casablanca", address: "12 bd Zerktouni" });
    });
  });
}
