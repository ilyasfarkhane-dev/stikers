// Converts between Node's http objects and the Fetch Request/Response used by backend/api.js.

export async function toWebRequest(req) {
  const proto = String(req.headers["x-forwarded-proto"] ?? "http").split(",")[0].trim() === "https" ? "https" : "http";
  const origin = `${proto}://${req.headers.host ?? "localhost"}`;
  const chunks = [];
  if (!["GET", "HEAD"].includes(req.method)) {
    for await (const chunk of req) chunks.push(chunk);
  }
  const headers = Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v ?? ""]]));
  return new Request(new URL(req.url, origin), {
    method: req.method,
    headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

export async function sendWebResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}

export function sendJsonError(res, status, message) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
}
