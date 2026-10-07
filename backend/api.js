import { createCatalog } from "./shared/catalog.js";
import { REQUEST_KINDS, REQUEST_STATUSES, SETTING_SECTIONS } from "./shared/defaults.js";
import {
  clearFailedLogins,
  clearSessionCookie,
  clientIp,
  createSessionCookie,
  isAuthConfigured,
  isAuthenticated,
  isLockedOut,
  passwordMatches,
  recordFailedLogin,
} from "./auth.js";
import { ensureSchema, now, parseRequestRow, readAllSections, readSection, resetSection, writeSection } from "./db.js";

const MAX_SETTINGS_BYTES = 256 * 1024;
const MAX_ITEMS = 20;
const STATUS_IDS = REQUEST_STATUSES.map((s) => s.id);
const KIND_IDS = REQUEST_KINDS.map((k) => k.id);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

const error = (status, message) => json({ error: message }, status);

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeFileName(name) {
  return (
    String(name || "fichier")
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(-120) || "fichier"
  );
}

function makeRef() {
  const d = new Date();
  const date = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = crypto.getRandomValues(new Uint8Array(3));
  const code = Array.from(rand, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 4).toUpperCase();
  return `STK-${date}-${code}`;
}

async function readJson(request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw Object.assign(new Error("JSON attendu."), { status: 415 });
  }
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error("JSON invalide."), { status: 400 });
  }
}

async function loadCatalog(db) {
  const [catalog, pricing] = await Promise.all([readSection(db, "catalog"), readSection(db, "pricing")]);
  return createCatalog(catalog, pricing);
}

/* ---------- Public ---------- */

async function publicSite(env) {
  const sections = await readAllSections(env.DB);
  const catalog = createCatalog(sections.catalog, sections.pricing);
  const pricingEnabled = catalog.pricingReady();
  return json({
    site: sections.site,
    catalog: sections.catalog,
    products: sections.products,
    pricing: { enabled: pricingEnabled, currency: sections.pricing.currency || "MAD" },
  });
}

async function publicEstimate(request, env) {
  const body = await readJson(request);
  const catalog = await loadCatalog(env.DB);
  const configs = (Array.isArray(body.items) ? body.items : [body.config]).slice(0, MAX_ITEMS);
  const estimates = configs.map((c) => catalog.estimatePrice(catalog.normalizeConfig(c ?? {})));
  return json({ estimates, currency: catalog.pricing.currency || "MAD" });
}

async function createRequest(request, env) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) return error(415, "Formulaire multipart attendu.");

  let form;
  try {
    form = await request.formData();
  } catch {
    return error(400, "Formulaire invalide.");
  }

  if (clean(form.get("website"))) return json({ ok: true, ref: makeRef() }, 201);

  const name = clean(form.get("name"), 160);
  const phone = clean(form.get("phone"), 40);
  const email = clean(form.get("email"), 160);
  const message = clean(form.get("message"), 3000);
  const kind = KIND_IDS.includes(form.get("kind")) ? form.get("kind") : "devis";

  if (!name || (!phone && !email)) return error(422, "Indiquez votre nom et au moins un téléphone ou un e-mail.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return error(422, "Adresse e-mail invalide.");
  if (kind === "message" && !message) return error(422, "Écrivez votre message.");

  let checkout = null;
  const paymentId = clean(form.get("payment"), 40);
  if (paymentId) {
    const site = await readSection(env.DB, "site");
    const method = (site?.payment?.methods ?? []).find((m) => m.id === paymentId && m.enabled && m.available);
    if (!method) return error(422, "Moyen de paiement indisponible.");
    const city = clean(form.get("city"), 120);
    const address = clean(form.get("address"), 500);
    if (!phone) return error(422, "Indiquez un téléphone pour la livraison.");
    if (!city || !address) return error(422, "Indiquez votre ville et votre adresse de livraison.");
    checkout = { payment: method.id, paymentLabel: method.label, city, address };
  }

  let rawItems;
  try {
    rawItems = JSON.parse(form.get("items") || "[]");
  } catch {
    return error(422, "Configuration invalide.");
  }
  if (!Array.isArray(rawItems) || (rawItems.length === 0 && kind !== "message")) return error(422, "Aucune configuration fournie.");
  if (kind === "message") rawItems = [];
  if (rawItems.length > MAX_ITEMS) return error(422, "Trop d'articles dans la demande.");

  const catalog = await loadCatalog(env.DB);
  const items = rawItems.map((item) => {
    const config = catalog.normalizeConfig(item?.config ?? {});
    const estimate = catalog.estimatePrice(config);
    return {
      name: clean(item?.name, 160) || catalog.labelOf(catalog.types, config.type),
      config,
      summary: {
        type: catalog.labelOf(catalog.types, config.type),
        material: catalog.labelOf(catalog.materials, config.material),
        finish: catalog.labelOf(catalog.finishes, config.finish),
        cut: catalog.labelOf(catalog.cuts, config.cut),
        usage: catalog.labelOf(catalog.usages, config.usage),
      },
      estimate,
    };
  });
  const estimates = items.map((i) => i.estimate);
  const total = estimates.length && estimates.every((e) => e !== null) ? estimates.reduce((a, b) => a + b, 0) : null;

  const maxBytes = (Number(catalog.fileRules?.maxSizeMb) || 50) * 1024 * 1024;
  const allowedExt = (catalog.fileRules?.extensions ?? []).map((e) => String(e).toLowerCase());
  const files = [];
  for (const [field, value] of form.entries()) {
    if (!field.startsWith("file_") || typeof value === "string" || !value?.size) continue;
    const ext = value.name.split(".").pop()?.toLowerCase() ?? "";
    if (allowedExt.length && !allowedExt.includes(ext)) return error(422, `Format de fichier non accepté : ${value.name}`);
    if (value.size > maxBytes) return error(422, `Fichier trop volumineux : ${value.name}`);
    files.push({ index: Number(field.slice(5)) || 0, file: value });
  }
  if (files.length > MAX_ITEMS) return error(422, "Trop de fichiers.");

  const ref = makeRef();
  const stamp = now();
  const history = [{ at: stamp, status: "nouveau", note: kind === "commande" ? "Commande reçue" : kind === "message" ? "Message reçu" : "Demande reçue" }];

  const result = await env.DB.prepare(
    `INSERT INTO requests (ref, kind, status, name, phone, email, message, items, estimate, history, checkout, created_at, updated_at)
     VALUES (?, ?, 'nouveau', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      ref,
      kind,
      name,
      phone || null,
      email || null,
      message || null,
      JSON.stringify(items),
      total,
      JSON.stringify(history),
      checkout ? JSON.stringify(checkout) : null,
      stamp,
      stamp,
    )
    .run();
  const requestId = result.meta?.last_row_id;

  for (const { index, file } of files) {
    let key = null;
    if (env.FILES) {
      key = `requests/${ref}/${index}-${safeFileName(file.name)}`;
      await env.FILES.put(key, file.stream ? file.stream() : await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type || "application/octet-stream" },
      });
    }
    await env.DB.prepare(
      "INSERT INTO request_files (request_id, item_index, storage_key, name, size, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(requestId, index, key, file.name.slice(0, 200), file.size, file.type || null, stamp)
      .run();
  }

  return json({ ok: true, ref, estimate: total }, 201);
}

/* ---------- Admin ---------- */

async function login(request, env) {
  if (!isAuthConfigured(env)) {
    return error(503, "Mot de passe administrateur non configuré (variable ADMIN_PASSWORD, 8 caractères minimum).");
  }
  const ip = clientIp(request);
  if (await isLockedOut(env.DB, ip)) return error(429, "Trop de tentatives. Réessayez dans 15 minutes.");
  const body = await readJson(request);
  if (!(await passwordMatches(env, body.password))) {
    await recordFailedLogin(env.DB, ip);
    return error(401, "Mot de passe incorrect.");
  }
  await clearFailedLogins(env.DB, ip);
  return json({ ok: true }, 200, { "set-cookie": await createSessionCookie(env, request) });
}

async function stats(env) {
  const db = env.DB;
  const [byStatus, byKind, totals, recent, daily, items] = await Promise.all([
    db.prepare("SELECT status, COUNT(*) AS count FROM requests GROUP BY status").all(),
    db.prepare("SELECT kind, COUNT(*) AS count FROM requests GROUP BY kind").all(),
    db
      .prepare(
        `SELECT COUNT(*) AS total,
          SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7,
          SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last30,
          SUM(CASE WHEN status NOT IN ('termine', 'annule') THEN COALESCE(quoted_price, estimate, 0) ELSE 0 END) AS pipeline
         FROM requests`,
      )
      .bind(new Date(Date.now() - 7 * 864e5).toISOString(), new Date(Date.now() - 30 * 864e5).toISOString())
      .first(),
    db.prepare("SELECT * FROM requests ORDER BY created_at DESC LIMIT 6").all(),
    db
      .prepare("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM requests WHERE created_at >= ? GROUP BY day")
      .bind(new Date(Date.now() - 14 * 864e5).toISOString())
      .all(),
    db.prepare("SELECT items FROM requests ORDER BY created_at DESC LIMIT 500").all(),
  ]);

  const typeCounts = {};
  for (const row of items.results ?? []) {
    for (const item of parseRequestRow({ items: row.items, history: "[]" }).items) {
      const label = item.summary?.type ?? item.config?.type ?? "Autre";
      typeCounts[label] = (typeCounts[label] ?? 0) + 1;
    }
  }

  return json({
    totals: totals ?? { total: 0, last7: 0, last30: 0, pipeline: 0 },
    byStatus: Object.fromEntries((byStatus.results ?? []).map((r) => [r.status, r.count])),
    byKind: Object.fromEntries((byKind.results ?? []).map((r) => [r.kind, r.count])),
    daily: Object.fromEntries((daily.results ?? []).map((r) => [r.day, r.count])),
    byType: typeCounts,
    recent: (recent.results ?? []).map(parseRequestRow),
  });
}

function requestFilters(url) {
  const where = [];
  const binds = [];
  const status = url.searchParams.get("status");
  const kind = url.searchParams.get("kind");
  const q = clean(url.searchParams.get("q"), 100);
  if (status && STATUS_IDS.includes(status)) {
    where.push("status = ?");
    binds.push(status);
  }
  if (kind && KIND_IDS.includes(kind)) {
    where.push("kind = ?");
    binds.push(kind);
  }
  if (q) {
    where.push("(ref LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)");
    binds.push(...Array(5).fill(`%${q}%`));
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", binds };
}

async function listRequests(url, env) {
  const { sql, binds } = requestFilters(url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 25));
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const [rows, count] = await Promise.all([
    env.DB.prepare(`SELECT * FROM requests ${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...binds, limit, (page - 1) * limit)
      .all(),
    env.DB.prepare(`SELECT COUNT(*) AS total FROM requests ${sql}`).bind(...binds).first(),
  ]);
  return json({ items: (rows.results ?? []).map(parseRequestRow), total: count?.total ?? 0, page, limit });
}

async function exportCsv(url, env) {
  const { sql, binds } = requestFilters(url);
  const { results } = await env.DB.prepare(`SELECT * FROM requests ${sql} ORDER BY created_at DESC`).bind(...binds).all();
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Référence", "Date", "Type", "Statut", "Nom", "Téléphone", "E-mail", "Articles", "Estimation", "Prix proposé", "Paiement", "Ville", "Adresse", "Message", "Notes"];
  const lines = (results ?? []).map((raw) => {
    const r = parseRequestRow(raw);
    const items = r.items
      .map((i) => `${i.name} (${i.summary?.material ?? ""}, ${i.summary?.finish ?? ""}, ${i.config?.width}×${i.config?.height} mm, ${i.config?.quantity} ex.)`)
      .join(" | ");
    const c = r.checkout ?? {};
    return [r.ref, r.created_at, r.kind, r.status, r.name, r.phone, r.email, items, r.estimate, r.quoted_price, c.paymentLabel, c.city, c.address, r.message, r.admin_notes]
      .map(esc)
      .join(";");
  });
  return new Response(`\uFEFF${[header.map(esc).join(";"), ...lines].join("\r\n")}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="demandes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}

async function getRequest(id, env) {
  const row = await env.DB.prepare("SELECT * FROM requests WHERE id = ?").bind(id).first();
  if (!row) return error(404, "Demande introuvable.");
  const { results } = await env.DB.prepare("SELECT id, item_index, name, size, type, storage_key FROM request_files WHERE request_id = ?")
    .bind(id)
    .all();
  const files = (results ?? []).map(({ storage_key, ...f }) => ({ ...f, stored: Boolean(storage_key) }));
  return json({ ...parseRequestRow(row), files });
}

async function updateRequest(id, request, env) {
  const body = await readJson(request);
  const row = await env.DB.prepare("SELECT * FROM requests WHERE id = ?").bind(id).first();
  if (!row) return error(404, "Demande introuvable.");
  const current = parseRequestRow(row);
  const stamp = now();
  const history = [...current.history];

  let status = current.status;
  if (body.status !== undefined) {
    if (!STATUS_IDS.includes(body.status)) return error(422, "Statut inconnu.");
    if (body.status !== current.status) {
      status = body.status;
      history.push({ at: stamp, status, note: clean(body.statusNote, 300) || null });
    }
  }

  let quoted = current.quoted_price;
  if (body.quoted_price !== undefined) {
    const value = body.quoted_price === null || body.quoted_price === "" ? null : Number(body.quoted_price);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return error(422, "Prix invalide.");
    if (value !== current.quoted_price) {
      quoted = value;
      history.push({ at: stamp, status, note: value === null ? "Prix proposé retiré" : `Prix proposé : ${value}` });
    }
  }

  const notes = body.admin_notes !== undefined ? clean(body.admin_notes, 5000) : current.admin_notes;

  await env.DB.prepare("UPDATE requests SET status = ?, quoted_price = ?, admin_notes = ?, history = ?, updated_at = ? WHERE id = ?")
    .bind(status, quoted, notes, JSON.stringify(history), stamp, id)
    .run();
  return getRequest(id, env);
}

async function deleteRequest(id, env) {
  const { results } = await env.DB.prepare("SELECT storage_key FROM request_files WHERE request_id = ?").bind(id).all();
  if (env.FILES) {
    for (const f of results ?? []) if (f.storage_key) await env.FILES.delete(f.storage_key);
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM request_files WHERE request_id = ?").bind(id),
    env.DB.prepare("DELETE FROM requests WHERE id = ?").bind(id),
  ]);
  return json({ ok: true });
}

async function downloadFile(id, env) {
  const row = await env.DB.prepare("SELECT * FROM request_files WHERE id = ?").bind(id).first();
  if (!row) return error(404, "Fichier introuvable.");
  if (!row.storage_key || !env.FILES) return error(404, "Fichier non stocké (stockage R2 non configuré).");
  const object = await env.FILES.get(row.storage_key);
  if (!object) return error(404, "Fichier introuvable dans le stockage.");
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || row.type || "application/octet-stream",
      "content-disposition": `attachment; filename="${safeFileName(row.name)}"`,
      "cache-control": "no-store",
    },
  });
}

/* ---------- Site media (admin-uploaded videos / posters) ---------- */

const MEDIA_TYPES = {
  "video/mp4": { ext: "mp4", maxMb: 60 },
  "video/webm": { ext: "webm", maxMb: 60 },
  "image/jpeg": { ext: "jpg", maxMb: 8 },
  "image/png": { ext: "png", maxMb: 8 },
  "image/webp": { ext: "webp", maxMb: 8 },
};
const MEDIA_NAME = /^[a-z0-9][a-z0-9-]{0,80}\.(mp4|webm|jpg|png|webp)$/;

async function uploadMedia(request, env) {
  if (!env.FILES) return error(503, "Stockage de fichiers non configuré (binding R2 « FILES »).");
  let form;
  try {
    form = await request.formData();
  } catch {
    return error(400, "Formulaire invalide.");
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return error(400, "Fichier manquant.");
  const rule = MEDIA_TYPES[file.type];
  if (!rule) return error(415, "Format non pris en charge (MP4, WebM, JPG, PNG ou WebP).");
  if (file.size > rule.maxMb * 1024 * 1024) return error(413, `Fichier trop lourd (${rule.maxMb} Mo maximum).`);
  const base = String(file.name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${base ? `-${base}` : ""}.${rule.ext}`;
  await env.FILES.put(`media/${name}`, file.stream ? file.stream() : await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  return json({ ok: true, url: `/api/public/media/${name}`, name, size: file.size, type: file.type }, 201);
}

async function serveMedia(name, request, env) {
  if (!MEDIA_NAME.test(name) || !env.FILES) return error(404, "Média introuvable.");
  const key = `media/${name}`;
  const head = await env.FILES.head(key);
  if (!head) return error(404, "Média introuvable.");
  const size = head.size;
  const headers = {
    "content-type": head.httpMetadata?.contentType || "application/octet-stream",
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
  };
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (match && (match[1] || match[2])) {
    let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    let end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    const object = await env.FILES.get(key, { range: { offset: start, length: end - start + 1 } });
    return new Response(object.body, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(end - start + 1) },
    });
  }
  const object = await env.FILES.get(key);
  return new Response(object.body, { headers: { ...headers, "content-length": String(size) } });
}

async function saveSettings(key, request, env) {
  if (!(key in SETTING_SECTIONS)) return error(404, "Section inconnue.");
  const text = await request.text();
  if (text.length > MAX_SETTINGS_BYTES) return error(413, "Contenu trop volumineux.");
  if (!request.headers.get("content-type")?.includes("application/json")) return error(415, "JSON attendu.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return error(400, "JSON invalide.");
  }
  const expectsArray = Array.isArray(SETTING_SECTIONS[key]);
  if (expectsArray !== Array.isArray(value) || typeof value !== "object" || value === null) {
    return error(422, "Format de section invalide.");
  }
  await writeSection(env.DB, key, value);
  return json({ ok: true, key, value });
}

/* ---------- Router ---------- */

export async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  if (!env.DB) return error(503, "Base de données non configurée (binding D1 « DB »).");

  try {
    await ensureSchema(env.DB);
    if (path === "/api/public/site" && method === "GET") return await publicSite(env);
    if (path === "/api/public/estimate" && method === "POST") return await publicEstimate(request, env);
    if (path === "/api/public/requests" && method === "POST") return await createRequest(request, env);
    const mediaMatch = path.match(/^\/api\/public\/media\/([^/]+)$/);
    if (mediaMatch && (method === "GET" || method === "HEAD")) return await serveMedia(mediaMatch[1], request, env);

    if (path === "/api/admin/login" && method === "POST") return await login(request, env);
    if (path === "/api/admin/logout" && method === "POST") return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
    if (path === "/api/admin/session" && method === "GET") {
      return json({ authenticated: await isAuthenticated(env, request), configured: isAuthConfigured(env), storage: Boolean(env.FILES) });
    }

    if (path.startsWith("/api/admin/")) {
      if (!(await isAuthenticated(env, request))) return error(401, "Authentification requise.");

      if (path === "/api/admin/stats" && method === "GET") return await stats(env);
      if (path === "/api/admin/requests" && method === "GET") return await listRequests(url, env);
      if (path === "/api/admin/requests/export.csv" && method === "GET") return await exportCsv(url, env);

      const reqMatch = path.match(/^\/api\/admin\/requests\/(\d+)$/);
      if (reqMatch) {
        const id = Number(reqMatch[1]);
        if (method === "GET") return await getRequest(id, env);
        if (method === "PATCH") return await updateRequest(id, request, env);
        if (method === "DELETE") return await deleteRequest(id, env);
      }

      const fileMatch = path.match(/^\/api\/admin\/files\/(\d+)$/);
      if (fileMatch && method === "GET") return await downloadFile(Number(fileMatch[1]), env);
      if (path === "/api/admin/media" && method === "POST") return await uploadMedia(request, env);

      if (path === "/api/admin/settings" && method === "GET") return json(await readAllSections(env.DB));
      const setMatch = path.match(/^\/api\/admin\/settings\/([a-z]+)$/);
      if (setMatch && method === "PUT") return await saveSettings(setMatch[1], request, env);
      if (setMatch && method === "DELETE") {
        if (!(setMatch[1] in SETTING_SECTIONS)) return error(404, "Section inconnue.");
        await resetSection(env.DB, setMatch[1]);
        return json({ ok: true, value: SETTING_SECTIONS[setMatch[1]] });
      }
    }
  } catch (err) {
    if (err?.status) return error(err.status, err.message);
    console.error(err);
    return error(500, "Erreur serveur.");
  }

  return null;
}
