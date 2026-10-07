import { useCallback, useEffect, useState } from "react";
import {
  FaBars,
  FaBoxOpen,
  FaChartPie,
  FaCoins,
  FaExternalLinkAlt,
  FaInbox,
  FaLock,
  FaPenNib,
  FaSignOutAlt,
  FaSlidersH,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { AppLink, navigate, useLocation } from "../router.jsx";
import { api } from "./api.js";
import { Dashboard } from "./Dashboard.jsx";
import { Requests } from "./Requests.jsx";
import { CatalogEditor } from "./CatalogEditor.jsx";
import { PricingEditor } from "./PricingEditor.jsx";
import { ContentEditor } from "./ContentEditor.jsx";
import { ProductsEditor } from "./ProductsEditor.jsx";
import "./admin.css";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: FaChartPie },
  { href: "/admin/demandes", label: "Demandes & commandes", icon: FaInbox },
  { href: "/admin/configurateur", label: "Configurateur", icon: FaSlidersH },
  { href: "/admin/tarifs", label: "Tarifs", icon: FaCoins },
  { href: "/admin/produits", label: "Produits", icon: FaBoxOpen },
  { href: "/admin/contenu", label: "Contenu du site", icon: FaPenNib },
];

function Login({ session, onLoggedIn }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("login", { method: "POST", body: { password } });
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <img src="/assets/logo-black.png" alt="Stick'Arts" className="adm-login-logo" />
        <p className="adm-kicker">Espace administrateur</p>
        <h1>Connexion</h1>
        {session && !session.configured ? (
          <p className="adm-alert adm-alert--warn">
            Le mot de passe administrateur n&apos;est pas encore configuré. Ajoutez le secret <code>ADMIN_PASSWORD</code>{" "}
            (8 caractères minimum) dans les paramètres d&apos;hébergement, puis rechargez cette page.
          </p>
        ) : (
          <>
            <label className="adm-field">
              <span className="adm-field-label">Mot de passe</span>
              <input
                className="adm-input"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="adm-alert adm-alert--error">{error}</p>}
            <button className="adm-btn adm-btn--gold adm-btn--block" type="submit" disabled={busy || !password}>
              <FaLock aria-hidden="true" /> {busy ? "Connexion…" : "Se connecter"}
            </button>
          </>
        )}
        <AppLink href="/" className="adm-login-back">
          ← Retour au site
        </AppLink>
      </form>
    </main>
  );
}

function Toasts({ toasts }) {
  return (
    <div className="adm-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <p key={t.id} className={`adm-toast adm-toast--${t.tone}`}>
          {t.message}
        </p>
      ))}
    </div>
  );
}

export default function AdminApp() {
  const { path, search } = useLocation();
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const notify = useCallback((message, tone = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setSession(await api("session"));
      setLoadError(null);
    } catch (err) {
      setLoadError(err.status === 503 ? err.message : "Le serveur d'administration est injoignable.");
    }
  }, []);

  useEffect(() => {
    document.title = "Administration — Stick'Arts";
    checkSession();
    const onUnauthorized = () => setSession((s) => (s ? { ...s, authenticated: false } : s));
    window.addEventListener("admin:unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", onUnauthorized);
  }, [checkSession]);

  useEffect(() => {
    if (!session?.authenticated) return;
    api("settings")
      .then(setSettings)
      .catch((err) => notify(err.message, "error"));
  }, [session?.authenticated, notify]);

  useEffect(() => setMenuOpen(false), [path]);

  if (loadError) {
    return (
      <main className="adm-login">
        <div className="adm-login-card">
          <img src="/assets/logo-black.png" alt="Stick'Arts" className="adm-login-logo" />
          <h1>Administration indisponible</h1>
          <p className="adm-alert adm-alert--warn">{loadError}</p>
          <button type="button" className="adm-btn adm-btn--gold adm-btn--block" onClick={checkSession}>
            Réessayer
          </button>
        </div>
      </main>
    );
  }
  if (!session) return <div className="admin-boot">Chargement…</div>;
  if (!session.authenticated) return <Login session={session} onLoggedIn={checkSession} />;

  const logout = async () => {
    await api("logout", { method: "POST" }).catch(() => {});
    setSettings(null);
    setSession({ ...session, authenticated: false });
  };

  const section = path.split("/")[2] ?? "";
  const shared = { settings, setSettings, notify };
  let content;
  if (section === "demandes") content = <Requests notify={notify} search={search} storage={session.storage} />;
  else if (!settings && section) content = <div className="adm-loading">Chargement des paramètres…</div>;
  else if (section === "configurateur") content = <CatalogEditor {...shared} />;
  else if (section === "tarifs") content = <PricingEditor {...shared} />;
  else if (section === "produits" || section === "videos") content = <ProductsEditor {...shared} storage={session.storage} />;
  else if (section === "contenu") content = <ContentEditor {...shared} />;
  else content = <Dashboard currency={settings?.pricing?.currency ?? "MAD"} settings={settings} storage={session.storage} />;

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="adm-brand">
          <img src="/assets/logo-white.png" alt="Stick'Arts" />
          <span>Admin</span>
        </div>
        <nav aria-label="Administration">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <AppLink key={href} href={href} className={active ? "is-active" : undefined}>
                <Icon aria-hidden="true" /> {label}
              </AppLink>
            );
          })}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer">
            <FaExternalLinkAlt aria-hidden="true" /> Voir le site
          </a>
          <button type="button" onClick={logout}>
            <FaSignOutAlt aria-hidden="true" /> Déconnexion
          </button>
        </div>
      </aside>
      {menuOpen && <div className="adm-scrim" onClick={() => setMenuOpen(false)} />}

      <div className="adm-main">
        <div className="adm-mobilebar">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
            <FaBars />
          </button>
          <img src="/assets/logo-black.png" alt="Stick'Arts" />
          <button type="button" onClick={() => navigate("/admin/demandes")} aria-label="Demandes">
            <FaInbox />
          </button>
        </div>
        {menuOpen && (
          <button type="button" className="adm-close" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
            <IoClose />
          </button>
        )}
        {content}
      </div>
      <Toasts toasts={toasts} />
    </div>
  );
}
