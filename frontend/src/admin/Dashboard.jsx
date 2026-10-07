import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCheck,
  FaChevronRight,
  FaClipboardList,
  FaCoins,
  FaCreditCard,
  FaExclamation,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaInbox,
  FaPenNib,
  FaShoppingBag,
  FaSlidersH,
  FaTags,
} from "react-icons/fa";
import { createCatalog } from "../../../backend/shared/catalog.js";
import { REQUEST_STATUSES } from "../../../backend/shared/defaults.js";
import { AppLink, navigate } from "../router.jsx";
import { api, formatDate, formatMoney } from "./api.js";
import { StatusBadge } from "./Requests.jsx";

const STATUS_COLORS = {
  nouveau: "#d9a514",
  en_cours: "#3b6fd1",
  devis_envoye: "#8455cc",
  bat_envoye: "#2a96a3",
  en_production: "#d4652f",
  pret: "#2f9d55",
  termine: "#1c1c1c",
  annule: "#b5b5b5",
};

function lastDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 864e5);
    return d.toISOString().slice(0, 10);
  });
}

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
  return formatDate(iso, false);
}

function Card({ title, subtitle, action, className = "", children }) {
  return (
    <section className={`db-card ${className}`}>
      <header className="db-card-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Dashboard({ currency, settings, storage }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="adm-alert adm-alert--error">{error}</p>;
  if (!stats) return <div className="adm-loading">Chargement du tableau de bord…</div>;

  const by = stats.byStatus;
  const count = (...ids) => ids.reduce((sum, id) => sum + Number(by[id] ?? 0), 0);
  const total = Number(stats.totals.total ?? 0);
  const toProcess = count("nouveau", "en_cours");
  const inProduction = count("devis_envoye", "bat_envoye", "en_production", "pret");

  const days = lastDays(14);
  const daily = days.map((d) => Number(stats.daily[d] ?? 0));
  const maxDay = Math.max(4, ...daily);
  const ticks = [maxDay, Math.round(maxDay / 2), 0];
  const sum14 = daily.reduce((a, b) => a + b, 0);
  const today = days[days.length - 1];

  let angle = 0;
  const statusTotal = Math.max(
    1,
    REQUEST_STATUSES.reduce((s, st) => s + Number(by[st.id] ?? 0), 0),
  );
  const donut = REQUEST_STATUSES.filter((s) => by[s.id])
    .map((s) => {
      const start = angle;
      angle += (Number(by[s.id]) / statusTotal) * 360;
      return `${STATUS_COLORS[s.id]} ${start}deg ${angle}deg`;
    })
    .join(", ");

  const types = Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const typeTotal = Math.max(
    1,
    types.reduce((s, [, c]) => s + c, 0),
  );

  const hour = new Date().getHours();
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir";
  const dateLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const pricingOk = settings ? createCatalog(settings.catalog, settings.pricing).pricingReady() : null;
  const card = settings?.site?.payment?.methods?.find((m) => m.id === "carte");
  const productsCount = Array.isArray(settings?.products) ? settings.products.length : null;
  const checklist = [
    {
      label: "Tarifs",
      ok: pricingOk,
      text: pricingOk ? "Prix affichés sur le site" : "Coefficients à renseigner",
      href: "/admin/tarifs",
      icon: FaCoins,
    },
    {
      label: "Paiement par carte",
      ok: Boolean(card?.enabled && card?.available),
      text: card?.enabled && card?.available ? "Sélectionnable au paiement" : card?.enabled ? "Affiché « Bientôt disponible »" : "Masqué sur le site",
      href: "/admin/contenu",
      icon: FaCreditCard,
    },
    {
      label: "Fichiers clients",
      ok: Boolean(storage),
      text: storage ? "Stockage actif" : "Stockage non configuré",
      icon: FaFolderOpen,
    },
    {
      label: "Produits",
      ok: productsCount > 0,
      text: productsCount == null ? "—" : `${productsCount} fiche${productsCount > 1 ? "s" : ""} produit`,
      href: "/admin/produits",
      icon: FaTags,
    },
  ];

  const kpis = [
    {
      label: "À traiter",
      value: toProcess,
      hint: `${count("nouveau")} nouvelle${count("nouveau") > 1 ? "s" : ""}`,
      icon: FaInbox,
      href: "/admin/demandes?status=nouveau",
      accent: true,
    },
    {
      label: "7 derniers jours",
      value: Number(stats.totals.last7 ?? 0),
      hint: `${Number(stats.totals.last30 ?? 0)} sur 30 jours`,
      icon: FaClipboardList,
      href: "/admin/demandes",
    },
    {
      label: "Commandes",
      value: Number(stats.byKind.commande ?? 0),
      hint: `${Number(stats.byKind.devis ?? 0)} demande${Number(stats.byKind.devis ?? 0) > 1 ? "s" : ""} de devis`,
      icon: FaShoppingBag,
      href: "/admin/demandes?kind=commande",
    },
    { label: "En production", value: inProduction, hint: "Du devis envoyé au prêt", icon: FaBoxOpen, href: "/admin/demandes?status=en_production" },
  ];

  return (
    <div className="adm-page db-page">
      <section className="db-hero">
        <div className="db-hero-copy">
          <p className="db-hero-date">{dateLabel}</p>
          <h1>
            {greeting}, <em>bienvenue</em> dans votre atelier.
          </h1>
          <p>
            {toProcess > 0
              ? `${toProcess} demande${toProcess > 1 ? "s" : ""} attend${toProcess > 1 ? "ent" : ""} votre réponse.`
              : "Aucune demande en attente — tout est à jour."}
          </p>
          <div className="db-hero-actions">
            <AppLink href={toProcess > 0 ? "/admin/demandes?status=nouveau" : "/admin/demandes"} className="adm-btn adm-btn--gold">
              {toProcess > 0 ? "Traiter les demandes" : "Voir les demandes"} <FaArrowRight aria-hidden="true" />
            </AppLink>
            <a href="/" target="_blank" rel="noreferrer" className="db-hero-ghost">
              Voir le site <FaExternalLinkAlt aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="db-hero-stat">
          <small>Montant en cours</small>
          <strong>{formatMoney(Number(stats.totals.pipeline || 0), currency)}</strong>
          <span>Prix proposés ou estimations, hors demandes terminées / annulées</span>
          <div className="db-hero-split">
            <div>
              <b>{total}</b>
              <span>demandes au total</span>
            </div>
            <div>
              <b>{count("termine")}</b>
              <span>terminées</span>
            </div>
          </div>
        </div>
      </section>

      <div className="db-kpis">
        {kpis.map(({ label, value, hint, icon: Icon, href, accent }) => (
          <AppLink key={label} href={href} className={`db-kpi ${accent ? "is-accent" : ""}`}>
            <span className="db-kpi-icon" aria-hidden="true">
              <Icon />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <span>{hint}</span>
            </div>
            <FaChevronRight className="db-kpi-arrow" aria-hidden="true" />
          </AppLink>
        ))}
      </div>

      <div className="db-grid">
        <div className="db-col-main">
          <Card
            title="Activité"
            subtitle="Demandes reçues sur les 14 derniers jours"
            className="db-chart-card"
            action={
              <div className="db-chart-total">
                <strong>{sum14}</strong>
                <span>sur 14 jours</span>
              </div>
            }
          >
            <div className="db-chart">
              <div className="db-chart-axis" aria-hidden="true">
                {ticks.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
              <div className="db-chart-plot" role="img" aria-label="Demandes par jour sur 14 jours">
                {days.map((d, i) => {
                  const date = new Date(d);
                  return (
                    <div key={d} className={`db-col ${d === today ? "is-today" : ""}`} title={`${formatDate(d, false)} : ${daily[i]}`}>
                      <div className="db-col-track">
                        {daily[i] > 0 && (
                          <span className="db-col-fill" style={{ height: `${(daily[i] / maxDay) * 100}%` }}>
                            <em>{daily[i]}</em>
                          </span>
                        )}
                      </div>
                      <span className="db-col-label">
                        <b>{date.getDate()}</b>
                        {date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card
            title="Dernières demandes"
            subtitle="Cliquez pour ouvrir le détail"
            className="db-recent-card"
            action={
              <AppLink href="/admin/demandes" className="db-link">
                Tout voir <FaArrowRight aria-hidden="true" />
              </AppLink>
            }
          >
            {stats.recent.length === 0 ? (
              <div className="db-empty">
                <FaInbox aria-hidden="true" />
                <p>Aucune demande reçue pour l&apos;instant. Les devis et commandes du site apparaîtront ici.</p>
              </div>
            ) : (
              <ul className="db-recent">
                {stats.recent.map((r) => {
                  const amount = r.quoted_price ?? r.estimate;
                  return (
                    <li key={r.id}>
                      <button type="button" onClick={() => navigate(`/admin/demandes?id=${r.id}`)}>
                        <span className="db-avatar">{initials(r.name)}</span>
                        <span className="db-recent-main">
                          <strong>{r.name}</strong>
                          <small>
                            <span className={`db-kind ${r.kind === "commande" ? "is-order" : ""}`}>
                              {r.kind === "commande" ? "Commande" : r.kind === "message" ? "Message" : "Devis"}
                            </span>
                            {r.ref} · {r.kind === "message" ? "Message de contact" : r.items.length === 1 ? r.items[0].name : `${r.items.length} articles`}
                          </small>
                        </span>
                        <span className="db-recent-amount">
                          <strong>{amount == null ? "À chiffrer" : formatMoney(amount, currency)}</strong>
                          <small>{timeAgo(r.created_at)}</small>
                        </span>
                        <StatusBadge status={r.status} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="db-side">
          <Card title="Par statut" subtitle="Répartition de toutes les demandes" className="db-status-card">
            <div className="db-donut-wrap">
              <div className="db-donut" style={{ background: donut ? `conic-gradient(${donut})` : "#efede7" }}>
                <div>
                  <strong>{total}</strong>
                  <span>demandes</span>
                </div>
              </div>
            </div>
            <ul className="db-legend">
              {REQUEST_STATUSES.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => navigate(`/admin/demandes?status=${s.id}`)} className={by[s.id] ? "" : "is-zero"}>
                    <i style={{ background: STATUS_COLORS[s.id] }} aria-hidden="true" />
                    <span>{s.label}</span>
                    <strong>{by[s.id] ?? 0}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Configuration de la boutique" subtitle="Ce qui est prêt côté site">
            <ul className="db-checklist">
              {checklist.map(({ label, ok, text, href, icon: Icon }) => {
                const body = (
                  <>
                    <span className="db-check-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="db-check-text">
                      <strong>{label}</strong>
                      <small>{text}</small>
                    </span>
                    <span className={`db-check-state ${ok ? "is-ok" : "is-todo"}`} aria-label={ok ? "Prêt" : "À faire"}>
                      {ok ? <FaCheck /> : <FaExclamation />}
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <AppLink href={href} className="db-check">
                        {body}
                      </AppLink>
                    ) : (
                      <div className="db-check">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Stickers les plus demandés">
            {types.length === 0 ? (
              <p className="db-muted">Aucune donnée pour le moment.</p>
            ) : (
              <ol className="db-types">
                {types.map(([label, c], i) => (
                  <li key={label}>
                    <span className="db-rank">{i + 1}</span>
                    <div>
                      <p>
                        <strong>{label}</strong>
                        <span>{Math.round((c / typeTotal) * 100)} %</span>
                      </p>
                      <span className="db-meter">
                        <span style={{ width: `${(c / types[0][1]) * 100}%` }} />
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <div className="db-shortcuts">
            {[
              { href: "/admin/configurateur", label: "Configurateur", icon: FaSlidersH },
              { href: "/admin/tarifs", label: "Tarifs", icon: FaCoins },
              { href: "/admin/produits", label: "Produits", icon: FaTags },
              { href: "/admin/contenu", label: "Contenu du site", icon: FaPenNib },
            ].map(({ href, label, icon: Icon }) => (
              <AppLink key={href} href={href} className="db-shortcut">
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </AppLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
