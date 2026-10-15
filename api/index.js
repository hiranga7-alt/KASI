// Kasi API: one Vercel Function serving every /api/* route (see vercel.json rewrites).
// Auth: email + password (PBKDF2-SHA256), HttpOnly session cookie.
// Data: each user's JSON documents in Neon Postgres, never readable by other users.
import { neon } from "@neondatabase/serverless";
import { webcrypto } from "node:crypto";

const crypto = webcrypto;
const enc = new TextEncoder();
const ITER = 310000;             // OWASP-recommended PBKDF2-SHA256 work factor
const SESSION_DAYS = 30;
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
const MAX_DOC_BYTES = 1900000;
const DAY = 86400000;

/* ---------- database ---------- */
let sql = null;
let testDb = null; // tests inject a stand-in database
export function __setTestDb(d) { testDb = d; schemaReady = null; }
function db() {
  if (testDb) return testDb;
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) return null;
    sql = neon(url);
  }
  return sql;
}
const q = (text, params = []) => db().query(text, params);
const tx = (list) => db().transaction(list.map(([t, p]) => db().query(t, p || [])));
const one = async (text, params) => (await q(text, params))[0] || null;

let schemaReady = null; // create tables automatically on first use
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await q(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, pw_hash TEXT NOT NULL, salt TEXT NOT NULL,
        iter INTEGER NOT NULL, failed INTEGER NOT NULL DEFAULT 0, locked_until BIGINT NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL)`);
      await q(`CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL)`);
      await q(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);
      await q(`CREATE TABLE IF NOT EXISTS docs (
        user_id TEXT NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, updated_at BIGINT NOT NULL,
        PRIMARY KEY (user_id, name))`);
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

/* ---------- helpers ---------- */
const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
const fail = (status, code, error) => json({ error, code }, status);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const b64 = (buf) => Buffer.from(new Uint8Array(buf)).toString("base64");
const fromB64 = (s) => new Uint8Array(Buffer.from(s, "base64"));
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));

async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256));
}
function safeEqual(a, b) {
  a = String(a); b = String(b);
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
}
const cookie = (token, maxAgeSec) =>
  `kasi_s=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSec}`;
function readCookie(req, name) {
  for (const part of (req.headers.get("cookie") || "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}
const validEmail = (e) => typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validPassword = (p) => typeof p === "string" && p.length >= 10 && p.length <= 200;
const validDocName = (n) => /^[A-Za-z0-9-]{1,60}$/.test(n);
const DUMMY_SALT = new Uint8Array(16);

async function readJson(req) {
  const text = await req.text();
  if (text.length > MAX_DOC_BYTES) throw Object.assign(new Error("too_large"), { status: 413 });
  try { return text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error("bad_json"), { status: 400 }); }
}
async function hashNew(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: b64(salt), hash: await pbkdf2(password, salt, ITER) };
}
const verifyPassword = async (u, pw) => safeEqual(await pbkdf2(pw, fromB64(u.salt), Number(u.iter)), u.pw_hash);
const userCount = async () => Number((await one("SELECT COUNT(*) AS n FROM users")).n);

async function newSession(userId) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await q("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)",
    [await sha256(token), userId, now + SESSION_DAYS * DAY, now]);
  await q("DELETE FROM sessions WHERE user_id = $1 AND expires_at < $2", [userId, now]);
  return token;
}
async function currentUser(req) {
  const token = readCookie(req, "kasi_s");
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const th = await sha256(token);
  const row = await one(
    "SELECT u.id, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1", [th]);
  if (!row) return null;
  const now = Date.now(), exp = Number(row.expires_at);
  if (exp < now) { await q("DELETE FROM sessions WHERE token_hash = $1", [th]); return null; }
  if (exp - now < (SESSION_DAYS / 2) * DAY) {
    await q("UPDATE sessions SET expires_at = $1 WHERE token_hash = $2", [now + SESSION_DAYS * DAY, th]);
    row.renewCookie = cookie(token, SESSION_DAYS * 86400);
  }
  return row;
}

function routePath(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") && url.pathname.length > 5) return decodeURIComponent(url.pathname.slice(5));
  return (url.searchParams.get("path") || "").replace(/^\/+/, "");
}

/* ---------- request handler ---------- */
export async function handle(request) {
  const path = routePath(request);
  const method = request.method;

  if (!db()) return fail(500, "no_db", "The database isn't connected. In Vercel, open Storage and connect a Neon Postgres database, then redeploy.");

  if (method !== "GET" && method !== "HEAD") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    if (origin && new URL(origin).host !== host) return fail(403, "origin", "Request blocked.");
    if (request.headers.get("x-kasi") !== "1") return fail(403, "header", "Request blocked.");
  }

  try {
    await ensureSchema();

    if (path === "config" && method === "GET") {
      const n = await userCount();
      return json({ firstUser: n === 0, signupOpen: n === 0 || !!process.env.SIGNUP_CODE, codeRequired: n > 0 });
    }

    if (path === "signup" && method === "POST") {
      const b = await readJson(request);
      const email = String(b.email || "").trim().toLowerCase();
      if (!validEmail(email)) return fail(400, "email", "Enter a valid email address.");
      if (!validPassword(b.password)) return fail(400, "password", "Use a password of at least 10 characters.");
      if ((await userCount()) > 0) {
        if (!process.env.SIGNUP_CODE) return fail(403, "closed", "New accounts are closed on this Kasi.");
        if (!safeEqual(String(b.code || ""), process.env.SIGNUP_CODE)) return fail(403, "bad_code", "That sign-up code isn't right.");
      }
      if (await one("SELECT 1 AS x FROM users WHERE email = $1", [email]))
        return fail(409, "exists", "An account with this email already exists. Sign in instead.");
      const id = crypto.randomUUID();
      const { salt, hash } = await hashNew(b.password);
      await q("INSERT INTO users (id, email, pw_hash, salt, iter, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, email, hash, salt, ITER, Date.now()]);
      const token = await newSession(id);
      return json({ email }, 201, { "Set-Cookie": cookie(token, SESSION_DAYS * 86400) });
    }

    if (path === "login" && method === "POST") {
      const b = await readJson(request);
      const email = String(b.email || "").trim().toLowerCase();
      const password = String(b.password || "");
      const user = await one("SELECT * FROM users WHERE email = $1", [email]);
      const now = Date.now();
      if (!user) {
        await pbkdf2(password || "x", DUMMY_SALT, ITER);
        return fail(400, "bad_login", "Email or password is incorrect.");
      }
      const lockedUntil = Number(user.locked_until);
      if (lockedUntil > now) {
        const mins = Math.ceil((lockedUntil - now) / 60000);
        return fail(429, "locked", `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
      }
      if (!(await verifyPassword(user, password))) {
        const failed = Number(user.failed) + 1;
        const locked = failed >= MAX_FAILS ? now + LOCK_MINUTES * 60000 : 0;
        await q("UPDATE users SET failed = $1, locked_until = $2 WHERE id = $3", [locked ? 0 : failed, locked, user.id]);
        return locked
          ? fail(429, "locked", `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`)
          : fail(400, "bad_login", "Email or password is incorrect.");
      }
      await q("UPDATE users SET failed = 0, locked_until = 0 WHERE id = $1", [user.id]);
      const token = await newSession(user.id);
      return json({ email: user.email }, 200, { "Set-Cookie": cookie(token, SESSION_DAYS * 86400) });
    }

    const user = await currentUser(request);
    if (!user) return fail(401, "auth", "Please sign in.");
    const respond = (obj, status = 200) => json(obj, status, user.renewCookie ? { "Set-Cookie": user.renewCookie } : {});

    if (path === "me" && method === "GET") return respond({ email: user.email });

    if (path === "logout" && method === "POST") {
      await q("DELETE FROM sessions WHERE token_hash = $1", [await sha256(readCookie(request, "kasi_s"))]);
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }

    if (path === "password" && method === "POST") {
      const b = await readJson(request);
      const full = await one("SELECT * FROM users WHERE id = $1", [user.id]);
      if (!(await verifyPassword(full, String(b.current || "")))) return fail(403, "bad_password", "Your current password isn't right.");
      if (!validPassword(b.next)) return fail(400, "password", "Use a new password of at least 10 characters.");
      const { salt, hash } = await hashNew(b.next);
      await tx([
        ["UPDATE users SET pw_hash = $1, salt = $2, iter = $3 WHERE id = $4", [hash, salt, ITER, user.id]],
        ["DELETE FROM sessions WHERE user_id = $1", [user.id]],
      ]);
      const token = await newSession(user.id);
      return json({ ok: true }, 200, { "Set-Cookie": cookie(token, SESSION_DAYS * 86400) });
    }

    if (path === "delete-account" && method === "POST") {
      const b = await readJson(request);
      const full = await one("SELECT * FROM users WHERE id = $1", [user.id]);
      if (!(await verifyPassword(full, String(b.password || "")))) return fail(403, "bad_password", "That password isn't right.");
      await tx([
        ["DELETE FROM docs WHERE user_id = $1", [user.id]],
        ["DELETE FROM sessions WHERE user_id = $1", [user.id]],
        ["DELETE FROM users WHERE id = $1", [user.id]],
      ]);
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }

    if (path === "wipe" && method === "POST") {
      await q("DELETE FROM docs WHERE user_id = $1", [user.id]);
      return respond({ ok: true });
    }

    if (path === "all" && method === "GET") {
      const rows = await q("SELECT name, data FROM docs WHERE user_id = $1 AND name NOT LIKE 'rc-%'", [user.id]);
      const docs = {};
      for (const r of rows) docs[r.name] = JSON.parse(r.data);
      return respond({ docs });
    }

    if (path.startsWith("doc/")) {
      const name = path.slice(4);
      if (!validDocName(name)) return fail(400, "name", "Invalid document name.");
      if (method === "GET") {
        const r = await one("SELECT data FROM docs WHERE user_id = $1 AND name = $2", [user.id, name]);
        return respond({ data: r ? JSON.parse(r.data) : null });
      }
      if (method === "PUT") {
        const text = await request.text();
        if (text.length > MAX_DOC_BYTES) return fail(413, "too_large", "This entry is too large to save.");
        let data;
        try { data = JSON.parse(text); } catch { return fail(400, "bad_json", "Invalid data."); }
        if (!data || typeof data !== "object" || Array.isArray(data)) return fail(400, "bad_json", "Invalid data.");
        await q(
          "INSERT INTO docs (user_id, name, data, updated_at) VALUES ($1, $2, $3, $4) " +
          "ON CONFLICT (user_id, name) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at",
          [user.id, name, text, Date.now()]);
        return respond({ ok: true });
      }
      if (method === "DELETE") {
        await q("DELETE FROM docs WHERE user_id = $1 AND name = $2", [user.id, name]);
        return respond({ ok: true });
      }
    }
    return fail(404, "not_found", "Not found.");
  } catch (e) {
    if (e && e.status === 413) return fail(413, "too_large", "This entry is too large to save.");
    if (e && e.status === 400) return fail(400, "bad_json", "Invalid data.");
    console.error(e);
    return fail(500, "server", "Something went wrong on the server. Try again.");
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
