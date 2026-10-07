import { useCallback, useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaChevronRight,
  FaClipboardList,
  FaCreditCard,
  FaDownload,
  FaEnvelope,
  FaFileAlt,
  FaHourglassHalf,
  FaInbox,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaSearch,
  FaShoppingBag,
  FaTrashAlt,
  FaWallet,
  FaWhatsapp,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { REQUEST_STATUSES } from "../../../backend/shared/defaults.js";
import { navigate } from "../router.jsx";
import { api, formatDate, formatMoney } from "./api.js";
import { Field, NumberInput, PageHead, TextArea, TextInput } from "./ui.jsx";

const statusLabel = (id) => REQUEST_STATUSES.find((s) => s.id === id)?.label ?? id;

export function StatusBadge({ status }) {
  return <span className={`adm-status adm-status--${status}`}>{statusLabel(status)}</span>;
}

const formatSize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(diff)) return "";
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 30) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatDate(iso);
}

const amountOf = (r) =>
  r.quoted_price != null
    ? { value: formatMoney(r.quoted_price), hint: "Prix proposé" }
    : r.estimate != null
      ? { value: formatMoney(r.estimate), hint: "Estimation" }
      : { value: "À chiffrer", hint: "Sans tarif", pending: true };

const PAYMENT_ICONS = { livraison: FaMoneyBillWave, carte: FaCreditCard };

function KindBadge({ kind }) {
  if (kind === "message") {
    return (
      <span className="rq-kind is-message">
        <FaEnvelope aria-hidden="true" /> Message
      </span>
    );
  }
  return kind === "commande" ? (
    <span className="rq-kind is-order">
      <FaShoppingBag aria-hidden="true" /> Commande
    </span>
  ) : (
    <span className="rq-kind">
      <FaClipboardList aria-hidden="true" /> Devis
    </span>
  );
}

function RequestDetail({ id, onClose, onChanged, notify, storage }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = (r) => setForm({ status: r.status, statusNote: "", quoted_price: r.quoted_price, admin_notes: r.admin_notes ?? "" });

  useEffect(() => {
    let alive = true;
    setData(null);
    api(`requests/${id}`)
      .then((r) => {
        if (!alive) return;
        setData(r);
        resetForm(r);
      })
      .catch((err) => {
        notify(err.message, "error");
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dirty =
    data &&
    form &&
    (form.status !== data.status ||
      (form.quoted_price ?? null) !== (data.quoted_price ?? null) ||
      form.admin_notes !== (data.admin_notes ?? ""));

  const save = async () => {
    setSaving(true);
    try {
      const r = await api(`requests/${id}`, { method: "PATCH", body: form });
      setData((prev) => ({ ...prev, ...r }));
      resetForm(r);
      notify("Demande mise à jour.");
      onChanged();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Supprimer définitivement la demande ${data.ref} et ses fichiers ?`)) return;
    try {
      await api(`requests/${id}`, { method: "DELETE" });
      notify("Demande supprimée.");
      onChanged();
      onClose();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const whatsapp = data?.phone
    ? `https://wa.me/${data.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Bonjour ${data.name}, concernant votre demande ${data.ref} chez Stick'Arts :`)}`
    : null;
  const amount = data ? amountOf(data) : null;
  const PaymentIcon = PAYMENT_ICONS[data?.checkout?.payment] ?? FaWallet;

  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer rq-drawer" aria-label="Détail de la demande">
        {!data || !form ? (
          <div className="adm-loading">Chargement…</div>
        ) : (
          <>
            <header className="rq-drawer-head">
              <div className="rq-drawer-top">
                <KindBadge kind={data.kind} />
                <button type="button" className="rq-drawer-close" onClick={onClose} aria-label="Fermer">
                  <IoClose />
                </button>
              </div>
              <div className="rq-drawer-title">
                <div>
                  <h2>{data.ref}</h2>
                  <p>
                    <StatusBadge status={data.status} />
                    <span>Reçue le {formatDate(data.created_at)}</span>
                  </p>
                </div>
                <div className={`rq-drawer-amount ${amount.pending ? "is-pending" : ""}`}>
                  <small>{amount.hint}</small>
                  <strong>{amount.value}</strong>
                </div>
              </div>
              <div className="rq-quick">
                {data.phone && (
                  <a href={`tel:${data.phone}`}>
                    <FaPhoneAlt aria-hidden="true" /> Appeler
                  </a>
                )}
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noreferrer">
                    <FaWhatsapp aria-hidden="true" /> WhatsApp
                  </a>
                )}
                {data.email && (
                  <a href={`mailto:${data.email}?subject=${encodeURIComponent(`Votre demande ${data.ref} — Stick'Arts`)}`}>
                    <FaEnvelope aria-hidden="true" /> E-mail
                  </a>
                )}
              </div>
            </header>

            <div className="rq-drawer-body">
              <section className="rq-card">
                <h3>Client</h3>
                <div className="rq-client">
                  <span className="rq-avatar is-lg">{initials(data.name)}</span>
                  <div>
                    <strong>{data.name}</strong>
                    {data.phone && <span>{data.phone}</span>}
                    {data.email && <span>{data.email}</span>}
                  </div>
                </div>
                {data.message && <blockquote className="rq-message">{data.message}</blockquote>}
              </section>

              {data.checkout && (
                <section className="rq-card">
                  <h3>Livraison & paiement</h3>
                  <div className="rq-tiles">
                    <div className="rq-tile">
                      <span className="rq-tile-icon">
                        <PaymentIcon aria-hidden="true" />
                      </span>
                      <div>
                        <small>Paiement</small>
                        <strong>{data.checkout.paymentLabel || data.checkout.payment}</strong>
                      </div>
                    </div>
                    <div className="rq-tile">
                      <span className="rq-tile-icon">
                        <FaMapMarkerAlt aria-hidden="true" />
                      </span>
                      <div>
                        <small>Livraison</small>
                        <strong>{data.checkout.city}</strong>
                        <span>{data.checkout.address}</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {data.items.length > 0 && (
              <section className="rq-card">
                <h3>
                  Articles <em>{data.items.length}</em>
                </h3>
                <ul className="rq-items">
                  {data.items.map((item, i) => {
                    const files = data.files.filter((f) => f.item_index === i);
                    const specs = [
                      ["Type", item.summary?.type],
                      ["Matière", item.summary?.material],
                      ["Finition", item.summary?.finish],
                      ["Format", `${item.config.width} × ${item.config.height} mm`],
                      ["Quantité", `${Number(item.config.quantity).toLocaleString("fr-FR")} ex.`],
                      ["Découpe", item.summary?.cut],
                      ["Utilisation", item.summary?.usage],
                    ];
                    return (
                      <li key={i}>
                        <div className="rq-item-head">
                          <strong>{item.name}</strong>
                          <span className={item.estimate == null ? "is-pending" : ""}>
                            {item.estimate == null ? "À chiffrer" : formatMoney(item.estimate)}
                          </span>
                        </div>
                        <dl className="rq-specs">
                          {specs.map(([label, value]) => (
                            <div key={label}>
                              <dt>{label}</dt>
                              <dd>{value || "—"}</dd>
                            </div>
                          ))}
                        </dl>
                        {files.length === 0 ? (
                          <p className="rq-file is-missing">
                            <FaFileAlt aria-hidden="true" /> Aucun fichier joint — à demander au client
                          </p>
                        ) : (
                          files.map((f) =>
                            f.stored ? (
                              <a key={f.id} className="rq-file" href={`/api/admin/files/${f.id}`}>
                                <FaFileAlt aria-hidden="true" />
                                <span>{f.name}</span>
                                <small>{formatSize(f.size)}</small>
                                <FaDownload aria-hidden="true" className="rq-file-dl" />
                              </a>
                            ) : (
                              <p key={f.id} className="rq-file is-missing">
                                <FaFileAlt aria-hidden="true" /> {f.name} — non stocké
                                {storage ? "" : " (stockage de fichiers non configuré)"}
                              </p>
                            ),
                          )
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="rq-total">
                  <span>Estimation automatique</span>
                  <strong>{data.estimate == null ? "À calculer" : formatMoney(data.estimate)}</strong>
                </div>
              </section>
              )}

              <section className="rq-card">
                <h3>Traitement</h3>
                <p className="rq-label">Statut</p>
                <div className="rq-status-picker" role="radiogroup" aria-label="Statut">
                  {REQUEST_STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={form.status === s.id}
                      className={`adm-status adm-status--${s.id} ${form.status === s.id ? "is-picked" : ""}`}
                      onClick={() => setForm({ ...form, status: s.id })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="adm-grid rq-form">
                  {form.status !== data.status && (
                    <Field label="Note de changement de statut" wide>
                      <TextInput
                        value={form.statusNote}
                        onChange={(statusNote) => setForm({ ...form, statusNote })}
                        placeholder="Ex. BAT envoyé par WhatsApp"
                      />
                    </Field>
                  )}
                  <Field label="Prix proposé au client" wide>
                    <NumberInput value={form.quoted_price} onChange={(quoted_price) => setForm({ ...form, quoted_price })} suffix="MAD" min="0" />
                  </Field>
                  <Field label="Notes internes" wide>
                    <TextArea
                      value={form.admin_notes}
                      onChange={(admin_notes) => setForm({ ...form, admin_notes })}
                      rows={3}
                      placeholder="Visible uniquement dans l'administration"
                    />
                  </Field>
                </div>
              </section>

              <section className="rq-card">
                <h3>Historique</h3>
                <ol className="rq-timeline">
                  {[...data.history].reverse().map((h, i) => (
                    <li key={i} className={`is-${h.status}`}>
                      <span className="rq-timeline-dot" aria-hidden="true" />
                      <div>
                        <StatusBadge status={h.status} />
                        <p>{h.note || statusLabel(h.status)}</p>
                        <time>{formatDate(h.at)}</time>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <footer className="rq-drawer-foot">
              <button type="button" className="rq-delete" onClick={remove}>
                <FaTrashAlt aria-hidden="true" /> Supprimer
              </button>
              <div>
                {dirty && <span className="rq-dirty">Modifications non enregistrées</span>}
                <button type="button" className="adm-btn adm-btn--gold" onClick={save} disabled={saving || !dirty}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

const KIND_TABS = [
  { value: "", label: "Tout" },
  { value: "devis", label: "Devis" },
  { value: "commande", label: "Commandes" },
  { value: "message", label: "Messages" },
];

export function Requests({ notify, search, storage }) {
  const params = new URLSearchParams(search);
  const status = params.get("status") ?? "";
  const kind = params.get("kind") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page")) || 1;
  const openId = params.get("id");

  const [query, setQuery] = useState(q);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const setParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      }
      if (!("page" in patch) && !("id" in patch)) next.delete("page");
      const qs = next.toString();
      navigate(`/admin/demandes${qs ? `?${qs}` : ""}`);
    },
    [search],
  );

  useEffect(() => {
    const filters = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) filters.set("status", status);
    if (kind) filters.set("kind", kind);
    if (q) filters.set("q", q);
    api(`requests?${filters}`)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, [status, kind, q, page, reloadKey]);

  useEffect(() => {
    api("stats")
      .then(setStats)
      .catch(() => {});
  }, [reloadKey]);

  useEffect(() => {
    if (query === q) return undefined;
    const t = setTimeout(() => setParams({ q: query }), 350);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (kind) exportParams.set("kind", kind);
  if (q) exportParams.set("q", q);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const by = stats?.byStatus ?? {};
  const count = (...ids) => ids.reduce((sum, id) => sum + Number(by[id] ?? 0), 0);
  const kpis = [
    { label: "Demandes reçues", value: Number(stats?.totals?.total ?? 0), hint: `${Number(stats?.totals?.last7 ?? 0)} cette semaine`, icon: FaInbox },
    { label: "À traiter", value: count("nouveau", "en_cours"), hint: "Nouveau + en cours", icon: FaHourglassHalf, accent: true },
    { label: "En production", value: count("devis_envoye", "bat_envoye", "en_production", "pret"), hint: "Devis, BAT, production", icon: FaBoxOpen },
    { label: "Montant en cours", value: formatMoney(Number(stats?.totals?.pipeline ?? 0)), hint: "Hors terminées / annulées", icon: FaWallet },
  ];
  const allCount = Object.values(by).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="adm-page rq-page">
      <PageHead kicker="Suivi client" title="Demandes & commandes">
        <a className="adm-btn adm-btn--ghost" href={`/api/admin/requests/export.csv?${exportParams}`}>
          <FaDownload aria-hidden="true" /> Exporter (CSV)
        </a>
      </PageHead>

      <div className="rq-kpis">
        {kpis.map(({ label, value, hint, icon: Icon, accent }) => (
          <div key={label} className={`rq-kpi ${accent ? "is-accent" : ""}`}>
            <span className="rq-kpi-icon">
              <Icon aria-hidden="true" />
            </span>
            <div>
              <small>{label}</small>
              <strong>{stats ? value : "—"}</strong>
              <span>{hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rq-toolbar">
        <div className="rq-toolbar-row">
          <label className="rq-search">
            <FaSearch aria-hidden="true" />
            <input type="search" placeholder="Rechercher une référence, un nom, un téléphone, un e-mail…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="rq-segment" role="group" aria-label="Type de demande">
            {KIND_TABS.map((t) => (
              <button key={t.value || "all"} type="button" className={kind === t.value ? "is-active" : ""} onClick={() => setParams({ kind: t.value })}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rq-tabs" role="group" aria-label="Filtrer par statut">
          <button type="button" className={!status ? "is-active" : ""} onClick={() => setParams({ status: "" })}>
            Tous <em>{allCount}</em>
          </button>
          {REQUEST_STATUSES.map((s) => (
            <button key={s.id} type="button" className={status === s.id ? "is-active" : ""} onClick={() => setParams({ status: s.id })}>
              <i className={`rq-dot adm-status--${s.id}`} aria-hidden="true" />
              {s.label}
              {Number(by[s.id] ?? 0) > 0 && <em>{by[s.id]}</em>}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="adm-alert adm-alert--error">{error}</p>}

      <div className="rq-list">
        <div className="rq-list-head" aria-hidden="true">
          <span>Demande</span>
          <span>Client</span>
          <span>Articles</span>
          <span>Montant</span>
          <span>Statut</span>
          <span>Reçue</span>
        </div>
        {!data ? (
          <div className="adm-loading">Chargement…</div>
        ) : data.items.length === 0 ? (
          <div className="rq-empty">
            <span>
              <FaInbox aria-hidden="true" />
            </span>
            <strong>Aucune demande</strong>
            <p>{q || status || kind ? "Aucune demande ne correspond à ces filtres." : "Les demandes de devis et commandes du site apparaîtront ici."}</p>
          </div>
        ) : (
          data.items.map((r) => {
            const amount = amountOf(r);
            const first = r.items[0];
            return (
              <button
                key={r.id}
                type="button"
                className={`rq-row ${String(r.id) === openId ? "is-open" : ""} ${r.status === "nouveau" ? "is-new" : ""}`}
                onClick={() => setParams({ id: r.id })}
              >
                <span className="rq-cell rq-cell-ref">
                  <strong>{r.ref}</strong>
                  <KindBadge kind={r.kind} />
                </span>
                <span className="rq-cell rq-cell-client">
                  <span className="rq-avatar">{initials(r.name)}</span>
                  <span>
                    <strong>{r.name}</strong>
                    <small>{r.phone || r.email}</small>
                  </span>
                </span>
                {r.kind === "message" ? (
                  <span className="rq-cell">
                    <strong>Message</strong>
                    <small>{r.message ? `${r.message.slice(0, 60)}${r.message.length > 60 ? "…" : ""}` : ""}</small>
                  </span>
                ) : (
                  <span className="rq-cell">
                    <strong>{r.items.length === 1 ? first.name : `${r.items.length} articles`}</strong>
                    <small>{first?.config ? `${first.config.width}×${first.config.height} mm • ${first.config.quantity} ex.` : ""}</small>
                  </span>
                )}
                <span className={`rq-cell rq-cell-amount ${amount.pending ? "is-pending" : ""}`}>
                  <strong>{amount.value}</strong>
                  <small>{r.checkout?.paymentLabel ?? amount.hint}</small>
                </span>
                <span className="rq-cell">
                  <StatusBadge status={r.status} />
                </span>
                <span className="rq-cell rq-cell-date">
                  <strong>{timeAgo(r.created_at)}</strong>
                  <small>{formatDate(r.created_at)}</small>
                </span>
                <FaChevronRight className="rq-chevron" aria-hidden="true" />
              </button>
            );
          })
        )}
      </div>

      {data && data.total > data.limit && (
        <nav className="rq-pager" aria-label="Pagination">
          <span>
            {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)} sur {data.total} demandes
          </span>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => setParams({ page: page - 1 })}>
              ← Précédent
            </button>
            <b>
              {page} / {pages}
            </b>
            <button type="button" disabled={page >= pages} onClick={() => setParams({ page: page + 1 })}>
              Suivant →
            </button>
          </div>
        </nav>
      )}

      {openId && (
        <RequestDetail
          id={openId}
          storage={storage}
          notify={notify}
          onClose={() => setParams({ id: "" })}
          onChanged={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
