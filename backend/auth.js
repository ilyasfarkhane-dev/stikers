import { upsertSql } from "./db.js";

const COOKIE = "stk_admin";
const SESSION_TTL = 7 * 24 * 60 * 60;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW = 15 * 60;

const encoder = new TextEncoder();

function b64url(bytes) {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(text) {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function sessionSecret(env) {
  return env.SESSION_SECRET || `stk-session::${env.ADMIN_PASSWORD}`;
}

export function isAuthConfigured(env) {
  return typeof env.ADMIN_PASSWORD === "string" && env.ADMIN_PASSWORD.length >= 8;
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

export async function passwordMatches(env, candidate) {
  const [a, b] = await Promise.all([sha256(String(candidate ?? "")), sha256(env.ADMIN_PASSWORD)]);
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionCookie(env, request) {
  const payload = b64url(encoder.encode(JSON.stringify({ sub: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_TTL })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(sessionSecret(env)), encoder.encode(payload));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${payload}.${b64url(sig)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export async function isAuthenticated(env, request) {
  if (!isAuthConfigured(env)) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [payload, sig] = match[1].split(".");
  if (!payload || !sig) return false;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(sessionSecret(env)),
      fromB64url(sig),
      encoder.encode(payload),
    );
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return data.sub === "admin" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export async function isLockedOut(db, ip) {
  const row = await db.prepare("SELECT count, window_start FROM login_attempts WHERE ip = ?").bind(ip).first();
  if (!row) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec - row.window_start < ATTEMPT_WINDOW && row.count >= MAX_ATTEMPTS;
}

export async function recordFailedLogin(db, ip) {
  const nowSec = Math.floor(Date.now() / 1000);
  const row = await db.prepare("SELECT count, window_start FROM login_attempts WHERE ip = ?").bind(ip).first();
  if (!row || nowSec - row.window_start >= ATTEMPT_WINDOW) {
    await db
      .prepare(upsertSql(db, "login_attempts", ["ip", "count", "window_start"], "ip", { count: "1", window_start: "excluded" }))
      .bind(ip, 1, nowSec)
      .run();
  } else {
    await db.prepare("UPDATE login_attempts SET count = count + 1 WHERE ip = ?").bind(ip).run();
  }
}

export async function clearFailedLogins(db, ip) {
  await db.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(ip).run();
}
