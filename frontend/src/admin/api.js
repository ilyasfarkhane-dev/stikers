export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const init = { method, credentials: "same-origin", headers: { accept: "application/json" } };
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`/api/admin/${path}`, init);
  } catch {
    throw new ApiError("Connexion au serveur impossible.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== "login") window.dispatchEvent(new Event("admin:unauthorized"));
    throw new ApiError(data.error || `Erreur ${res.status}`, res.status);
  }
  return data;
}

export const formatDate = (iso, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";

export const formatMoney = (value, currency = "MAD") =>
  value === null || value === undefined || value === "" ? "—" : `${Number(value).toLocaleString("fr-FR")} ${currency}`;

export const slugify = (text) =>
  String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
