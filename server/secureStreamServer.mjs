import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import { SECURE_STREAMS } from "./secureCatalog.mjs";

const PORT = Number(process.env.STREAM_SERVER_PORT || 8787);
const SECRET = process.env.STREAM_SIGNING_SECRET || "change-me-in-production";
const TOKEN_TTL_SECONDS = Number(process.env.STREAM_TOKEN_TTL_SECONDS || 45);
const ALLOWED_ORIGIN = process.env.STREAM_ALLOWED_ORIGIN || "http://localhost:3000";
const SESSION_IDLE_SECONDS = Number(process.env.STREAM_SESSION_IDLE_SECONDS || 120);
const TOKEN_RATE_LIMIT_PER_MINUTE = Number(process.env.STREAM_TOKEN_RATE_LIMIT_PER_MINUTE || 12);

const usedNonces = new Set();
const activeSessionsByUser = new Map();
const tokenHitsByUser = new Map();

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
};

const base64urlEncode = (value) => Buffer.from(value, "utf8").toString("base64url");
const base64urlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

const signPayload = (payloadBase64) =>
  crypto.createHmac("sha256", SECRET).update(payloadBase64).digest("base64url");

const createToken = (payload) => {
  const payloadBase64 = base64urlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadBase64);
  return `${payloadBase64}.${signature}`;
};

const verifyToken = (token) => {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expected = signPayload(payloadBase64);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }

  try {
    return JSON.parse(base64urlDecode(payloadBase64));
  } catch {
    return null;
  }
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const getClientIp = (req) => {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
};

const toYouTubeEmbed = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  if (!match?.[1]) return url;
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&fs=0&disablekb=1`;
};

const addCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

const isAllowedOrigin = (req) => {
  const origin = String(req.headers.origin || "");
  if (!origin) return false;
  return origin === ALLOWED_ORIGIN;
};

const isAllowedReferer = (req) => {
  const referer = String(req.headers.referer || "");
  if (!referer) return false;
  return referer.startsWith(ALLOWED_ORIGIN);
};

const isRateLimited = (uid) => {
  const now = Date.now();
  const current = tokenHitsByUser.get(uid) || { windowStart: now, count: 0 };
  if (now - current.windowStart >= 60000) {
    tokenHitsByUser.set(uid, { windowStart: now, count: 1 });
    return false;
  }
  if (current.count >= TOKEN_RATE_LIMIT_PER_MINUTE) return true;
  tokenHitsByUser.set(uid, { windowStart: current.windowStart, count: current.count + 1 });
  return false;
};

const server = http.createServer(async (req, res) => {
  addCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const ua = String(req.headers["user-agent"] || "unknown");
  const uaHash = sha256(ua);
  const ipHash = sha256(getClientIp(req));

  if (req.method === "GET" && url.pathname === "/api/stream/health") {
    return json(res, 200, { ok: true, now: Date.now() });
  }

  if (req.method === "POST" && url.pathname === "/api/stream/token") {
    try {
      if (!isAllowedOrigin(req)) {
        return json(res, 403, { error: "Origin is not allowed for stream token request." });
      }
      const body = await readBody(req);
      const movieId = String(body?.movieId || "");
      const uid = String(body?.uid || "");
      const stream = SECURE_STREAMS[movieId];
      if (!stream) return json(res, 404, { error: "Movie stream not found." });
      if (!uid) return json(res, 401, { error: "Unauthorized stream request." });
      if (isRateLimited(uid)) return json(res, 429, { error: "Too many stream token requests. Please wait." });

      const now = Math.floor(Date.now() / 1000);
      const active = activeSessionsByUser.get(uid);
      if (active && now - active.updatedAt <= SESSION_IDLE_SECONDS) {
        const sameClient = active.uaHash === uaHash && active.ipHash === ipHash;
        if (!sameClient) {
          return json(res, 429, { error: "This account already has an active stream on another device." });
        }
      }

      const sessionId = crypto.randomUUID();
      const payload = {
        movieId,
        uid,
        sid: sessionId,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
        nonce: crypto.randomUUID(),
        uaHash,
        ipHash
      };

      const token = createToken(payload);
      const playbackUrl = `/api/stream/play?token=${encodeURIComponent(token)}`;
      return json(res, 200, {
        playbackUrl,
        expiresIn: TOKEN_TTL_SECONDS,
        kind: stream.kind,
        sessionId,
        drm: stream.drm || null
      });
    } catch {
      return json(res, 400, { error: "Invalid request body." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/stream/play") {
    if (!isAllowedReferer(req)) {
      return json(res, 403, { error: "Invalid referer for stream playback." });
    }
    const token = url.searchParams.get("token");
    if (!token) return json(res, 400, { error: "Missing token." });

    const payload = verifyToken(token);
    if (!payload) return json(res, 401, { error: "Invalid token signature." });

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return json(res, 401, { error: "Token expired." });
    if (payload.iat && now - payload.iat > TOKEN_TTL_SECONDS + 10) {
      return json(res, 401, { error: "Token is stale." });
    }
    if (payload.uaHash !== uaHash || payload.ipHash !== ipHash) {
      return json(res, 401, { error: "Token does not match this client." });
    }
    if (usedNonces.has(payload.nonce)) return json(res, 401, { error: "Token already used." });
    usedNonces.add(payload.nonce);

    const stream = SECURE_STREAMS[payload.movieId];
    if (!stream) return json(res, 404, { error: "Movie stream not found." });
    if (!payload.uid || !payload.sid) return json(res, 401, { error: "Invalid stream token payload." });

    const active = activeSessionsByUser.get(payload.uid);
    if (active && active.sid !== payload.sid) {
      const sameClient = active.uaHash === uaHash && active.ipHash === ipHash;
      const isActive = now - active.updatedAt <= SESSION_IDLE_SECONDS;
      if (isActive && !sameClient) {
        return json(res, 429, { error: "Another device is already streaming on this account." });
      }
    }

    activeSessionsByUser.set(payload.uid, {
      sid: payload.sid,
      uaHash,
      ipHash,
      updatedAt: now
    });

    const location = stream.kind === "youtube" ? toYouTubeEmbed(stream.source) : stream.source;
    res.writeHead(302, {
      Location: location,
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/stream/heartbeat") {
    try {
      if (!isAllowedOrigin(req)) return json(res, 403, { error: "Origin is not allowed." });
      const body = await readBody(req);
      const uid = String(body?.uid || "");
      const sid = String(body?.sid || "");
      if (!uid || !sid) return json(res, 400, { error: "Missing uid or sid." });

      const active = activeSessionsByUser.get(uid);
      if (!active || active.sid !== sid) return json(res, 401, { error: "Invalid session." });
      if (active.uaHash !== uaHash || active.ipHash !== ipHash) {
        return json(res, 401, { error: "Session client mismatch." });
      }

      active.updatedAt = Math.floor(Date.now() / 1000);
      activeSessionsByUser.set(uid, active);
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 400, { error: "Invalid request body." });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/stream/release") {
    try {
      if (!isAllowedOrigin(req)) return json(res, 403, { error: "Origin is not allowed." });
      const body = await readBody(req);
      const uid = String(body?.uid || "");
      const sid = String(body?.sid || "");
      if (!uid || !sid) return json(res, 400, { error: "Missing uid or sid." });

      const active = activeSessionsByUser.get(uid);
      if (active?.sid === sid && active.uaHash === uaHash && active.ipHash === ipHash) {
        activeSessionsByUser.delete(uid);
      }
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 400, { error: "Invalid request body." });
    }
  }

  return json(res, 404, { error: "Not found." });
});

setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [uid, session] of activeSessionsByUser.entries()) {
    if (now - session.updatedAt > SESSION_IDLE_SECONDS) {
      activeSessionsByUser.delete(uid);
    }
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`Secure stream server listening on http://localhost:${PORT}`);
});
