import { useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaClipboardList,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaSlidersH,
  FaStore,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa";
import { AppLink } from "../router.jsx";
import { useSiteData } from "../shop/SiteData.jsx";

const A = "/assets/images/";
const digits = (value) => String(value ?? "").replace(/[^\d+]/g, "");

const SUBJECTS = ["Demande d'information", "Projet / devis spécifique", "Suivi de commande", "Partenariat", "Autre"];

const EMPTY = { name: "", phone: "", email: "", subject: SUBJECTS[0], message: "", website: "" };

const ROUTES = [
  {
    title: "Configurer mon sticker",
    text: "Type, matière, finition, format : composez votre sticker en ligne.",
    href: "/configurateur",
    icon: FaSlidersH,
  },
  {
    title: "Demander un devis",
    text: "Un projet particulier ? Envoyez votre configuration et votre fichier.",
    href: "/configurateur?etape=coordonnees",
    icon: FaClipboardList,
  },
  {
    title: "Voir nos solutions",
    text: "Packaging, vitrine, véhicule, étiquettes : trouvez la bonne solution.",
    href: "/solutions",
    icon: FaStore,
  },
];

export function ContactPage() {
  const { site } = useSiteData();
  const contact = site.contact ?? {};
  const phone = site.topbar?.phone;
  const whatsapp = contact.whatsapp;
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: "idle" });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const channels = [
    phone && { label: "Téléphone", value: phone, href: `tel:${digits(phone)}`, icon: FaPhoneAlt },
    whatsapp && {
      label: "WhatsApp",
      value: "Écrivez-nous sur WhatsApp",
      href: `https://wa.me/${digits(whatsapp).replace("+", "")}`,
      icon: FaWhatsapp,
      external: true,
    },
    contact.email && { label: "E-mail", value: contact.email, href: `mailto:${contact.email}`, icon: FaEnvelope },
    contact.address && { label: "Atelier", value: contact.address, icon: FaMapMarkerAlt },
    contact.hours && { label: "Horaires", value: contact.hours, icon: FaClock },
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setStatus({ state: "error", message: "Indiquez votre nom et au moins un téléphone ou un e-mail." });
      return;
    }
    if (!form.message.trim()) {
      setStatus({ state: "error", message: "Écrivez votre message." });
      return;
    }
    setStatus({ state: "sending" });
    const body = new FormData();
    body.set("kind", "message");
    body.set("name", form.name);
    body.set("phone", form.phone);
    body.set("email", form.email);
    body.set("message", `[${form.subject}] ${form.message}`);
    body.set("website", form.website);
    body.set("items", "[]");
    try {
      const res = await fetch("/api/public/requests", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Envoi impossible pour le moment.");
      setStatus({ state: "sent", ref: data.ref });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Envoi impossible pour le moment." });
    }
  };

  return (
    <main className="page page-solutions page-contact">
      <section className="sol-hero ct-hero">
        <div className="sol-hero-media" aria-hidden="true">
          <img className="sol-hero-bg" src={`${A}photos/hologramme-2.jpg`} alt="" />
          <div className="sol-hero-shade" />
        </div>
        <div className="sol-hero-inner">
          <div className="sol-hero-copy">
            <p className="sol-kicker">Contact</p>
            <h1>
              Parlons de votre <em>projet</em>
            </h1>
            <p className="sol-hero-lead">
              Une question sur une matière, une finition ou un délai&nbsp;? Notre équipe vous répond et vous accompagne du
              fichier jusqu&apos;à la livraison.
            </p>
          </div>
          <p className="sol-hero-aside" aria-hidden="true">
            On vous répond&nbsp;!
          </p>
        </div>
      </section>

      <section className="ct-main">
        <aside className="ct-info">
          <div className="ct-info-head">
            <p className="sol-kicker sol-kicker--on-dark">Nos coordonnées</p>
            <h2>Stick&apos;Arts by Comstore</h2>
            <p>Appelez-nous, écrivez-nous ou passez à l&apos;atelier.</p>
          </div>
          <ul className="ct-channels">
            {channels.map(({ label, value, href, icon: Icon, external }) => {
              const content = (
                <>
                  <span className="ct-channel-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </span>
                  {href && <FaArrowRight aria-hidden="true" className="ct-channel-go" />}
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a className="ct-channel" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                      {content}
                    </a>
                  ) : (
                    <div className="ct-channel">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="ct-info-foot">
            <FaTruck aria-hidden="true" /> Retrait atelier ou livraison partout au Maroc
          </p>
        </aside>

        <section className="ct-form-card" aria-labelledby="ct-form-title">
          {status.state === "sent" ? (
            <div className="ct-success" role="status">
              <span className="ct-success-icon" aria-hidden="true">
                <FaCheck />
              </span>
              <h2>Message envoyé&nbsp;!</h2>
              <p>
                Merci, nous avons bien reçu votre message
                {status.ref ? (
                  <>
                    {" "}
                    (référence <strong>{status.ref}</strong>)
                  </>
                ) : null}
                . Notre équipe revient vers vous rapidement.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => setStatus({ state: "idle" })}>
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="shop-section-head ct-form-head">
                <span className="shop-accent" aria-hidden="true" />
                <div>
                  <h2 id="ct-form-title">Envoyez-nous un message</h2>
                  <p>Réponse par téléphone, WhatsApp ou e-mail selon vos coordonnées.</p>
                </div>
              </div>
              <div className="ct-fields">
                <label className="shop-input">
                  <span>Nom / Société *</span>
                  <input type="text" autoComplete="name" value={form.name} onChange={set("name")} />
                </label>
                <label className="shop-input">
                  <span>Téléphone</span>
                  <input type="tel" autoComplete="tel" placeholder="+212…" value={form.phone} onChange={set("phone")} />
                </label>
                <label className="shop-input">
                  <span>E-mail</span>
                  <input type="email" autoComplete="email" value={form.email} onChange={set("email")} />
                </label>
                <label className="shop-input">
                  <span>Sujet</span>
                  <select className="shop-select" value={form.subject} onChange={set("subject")}>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="shop-input ct-field-wide">
                  <span>Votre message *</span>
                  <textarea
                    rows={6}
                    placeholder="Décrivez votre projet : usage, support, quantité, délai souhaité…"
                    value={form.message}
                    onChange={set("message")}
                  />
                </label>
                <label className="ct-honeypot" aria-hidden="true">
                  Site web
                  <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                </label>
              </div>
              {status.state === "error" && (
                <p className="shop-error" role="alert">
                  {status.message}
                </p>
              )}
              <div className="ct-form-foot">
                <small>* Champs obligatoires — indiquez au moins un téléphone ou un e-mail.</small>
                <button type="submit" className="btn btn-primary" disabled={status.state === "sending"}>
                  {status.state === "sending" ? "Envoi…" : "Envoyer le message"} <FaPaperPlane aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </section>
      </section>

      <section className="ct-routes" aria-label="Accès rapides">
        {ROUTES.map(({ title, text, href, icon: Icon }) => (
          <AppLink key={title} href={href} className="ct-route">
            <span className="ct-route-icon" aria-hidden="true">
              <Icon />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <FaArrowRight aria-hidden="true" className="ct-route-go" />
          </AppLink>
        ))}
      </section>
    </main>
  );
}
