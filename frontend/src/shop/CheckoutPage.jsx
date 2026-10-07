import { useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaClipboardCheck,
  FaCloudUploadAlt,
  FaCreditCard,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaRegCopy,
  FaShoppingBag,
  FaTrashAlt,
  FaTruck,
} from "react-icons/fa";
import { AppLink, navigate } from "../router.jsx";
import { useCart } from "./CartContext.jsx";
import { useEstimates, useSiteData } from "./SiteData.jsx";
import { ShopField, ShopHero } from "./ShopUI.jsx";

const A = "/assets/images/";

const HERO_CHIPS = [
  { label: "Contrôle de fichier", icon: FaClipboardCheck },
  { label: "Livraison partout au Maroc", icon: FaTruck },
];

const METHOD_ICONS = { livraison: FaMoneyBillWave, carte: FaCreditCard };

const EMPTY = { name: "", phone: "", email: "", city: "", address: "", message: "", website: "" };

function OrderConfirmation({ done, note }) {
  const [copied, setCopied] = useState(false);
  const MethodIcon = METHOD_ICONS[done.method?.id] ?? FaCreditCard;
  const firstName = done.contact.name.trim().split(/\s+/)[0];

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(done.ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="co-confirm" role="status">
      <div className="co-confirm-hero">
        <span className="co-confirm-check" aria-hidden="true">
          <FaCheck />
        </span>
        <p className="co-confirm-kicker">Commande confirmée</p>
        <h2>
          Merci{firstName ? ` ${firstName}` : ""}, <em>c&apos;est noté !</em>
        </h2>
        <p className="co-confirm-lead">Votre commande est bien enregistrée.</p>

        {done.ref && (
          <div className="co-confirm-ref">
            <span>Référence de commande</span>
            <div>
              <strong>{done.ref}</strong>
              <button type="button" onClick={copyRef} aria-label="Copier la référence">
                {copied ? <FaCheck aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
                {copied ? "Copiée" : "Copier"}
              </button>
            </div>
          </div>
        )}

        {note && <p className="co-confirm-note">{note}</p>}

        <div className="co-confirm-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate("/configurateur")}>
            Commander d&apos;autres stickers <FaArrowRight aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-outline-light" onClick={() => navigate("/")}>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>

      <div className="co-confirm-recap">
        <div className="co-confirm-recap-head">
          <h3>Récapitulatif</h3>
          <span>
            {done.items.length} article{done.items.length > 1 ? "s" : ""}
          </span>
        </div>

        <ul className="co-confirm-items">
          {done.items.map((item) => (
            <li key={item.id}>
              <span className="co-thumb">
                <img src={`${A}${item.image || "photos/uv-vernis-1.jpg"}`} alt="" />
              </span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.details}</small>
              </div>
              <b>{item.price ?? "À calculer"}</b>
            </li>
          ))}
        </ul>

        <div className="co-confirm-total">
          <span>{done.total ? "Total estimé" : "Total"}</span>
          <strong>{done.total ?? "Estimation à calculer"}</strong>
        </div>

        <div className="co-confirm-tiles">
          <div className="co-confirm-tile">
            <span className="co-confirm-tile-icon" aria-hidden="true">
              <MethodIcon />
            </span>
            <div>
              <small>Paiement</small>
              <strong>{done.method?.label}</strong>
            </div>
          </div>
          <div className="co-confirm-tile">
            <span className="co-confirm-tile-icon" aria-hidden="true">
              <FaMapMarkerAlt />
            </span>
            <div>
              <small>Livraison</small>
              <strong>{done.contact.name}</strong>
              <span>
                {done.contact.address}, {done.contact.city}
              </span>
              <span>{done.contact.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CheckoutPage() {
  const cart = useCart();
  const { site } = useSiteData();
  const methods = (site.payment?.methods ?? []).filter((m) => m.enabled);
  const firstAvailable = methods.find((m) => m.available)?.id ?? null;
  const [payment, setPayment] = useState(firstAvailable);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const estimates = useEstimates(cart.items.map((item) => item.config ?? {}));

  const selected = methods.find((m) => m.id === payment && m.available) ?? methods.find((m) => m.available) ?? null;
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return setError("Indiquez votre nom et votre téléphone.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError("Adresse e-mail invalide.");
    if (!form.city.trim() || !form.address.trim()) return setError("Indiquez votre ville et votre adresse de livraison.");
    if (!selected) return setError("Choisissez un moyen de paiement.");
    setError(null);

    const body = new FormData();
    for (const key of Object.keys(EMPTY)) body.set(key, form[key].trim());
    body.set("kind", "commande");
    body.set("payment", selected.id);
    body.set("items", JSON.stringify(cart.items.map(({ name, config }) => ({ name, config }))));
    cart.items.forEach((item, i) => item.fileObject && body.set(`file_${i}`, item.fileObject, item.fileObject.name));

    setSending(true);
    try {
      const res = await fetch("/api/public/requests", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Envoi impossible pour le moment.");
      setDone({
        ref: data.ref,
        total: estimates.total,
        method: selected,
        items: cart.items.map((item, i) => ({ ...item, price: estimates.each[i] ?? null })),
        contact: { ...form },
      });
      cart.clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof TypeError ? "Connexion impossible. Vérifiez votre réseau puis réessayez." : err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pd-page co-page">
      <ShopHero
        crumbs={[{ label: "Accueil", href: "/" }, { label: "Panier" }, { label: "Finaliser ma commande" }]}
        kicker="Commande"
        title={
          <>
            Finaliser ma <em>commande</em>
          </>
        }
        lead="Vos coordonnées, votre adresse de livraison et votre moyen de paiement."
        chips={HERO_CHIPS}
      />

      <div className="co-main">
        {done ? (
          <OrderConfirmation done={done} note={site.payment?.note} />
        ) : cart.items.length === 0 ? (
          <section className="co-card co-empty">
            <span className="co-empty-icon" aria-hidden="true">
              <FaShoppingBag />
            </span>
            <h2>Votre panier est vide</h2>
            <p>Configurez votre sticker puis ajoutez-le au panier pour finaliser votre commande.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/configurateur")}>
              Configurer mon sticker <FaArrowRight aria-hidden="true" />
            </button>
          </section>
        ) : (
          <form className="co-grid" onSubmit={submit} noValidate>
            <div className="co-card co-form">
              <ShopField num={1} legend="Vos coordonnées">
                <div className="co-fields">
                  <label className="shop-input">
                    <span>Nom / Société *</span>
                    <input type="text" autoComplete="name" value={form.name} onChange={set("name")} />
                  </label>
                  <label className="shop-input">
                    <span>Téléphone *</span>
                    <input type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
                  </label>
                  <label className="shop-input co-wide">
                    <span>E-mail</span>
                    <input type="email" autoComplete="email" value={form.email} onChange={set("email")} />
                  </label>
                </div>
              </ShopField>

              <ShopField num={2} legend="Adresse de livraison">
                <div className="co-fields">
                  <label className="shop-input">
                    <span>Ville *</span>
                    <input type="text" autoComplete="address-level2" value={form.city} onChange={set("city")} />
                  </label>
                  <label className="shop-input co-wide">
                    <span>Adresse *</span>
                    <input type="text" autoComplete="street-address" value={form.address} onChange={set("address")} />
                  </label>
                  <label className="shop-input co-wide">
                    <span>Instructions (facultatif)</span>
                    <textarea rows="2" value={form.message} onChange={set("message")} />
                  </label>
                </div>
              </ShopField>

              <ShopField num={3} legend="Moyen de paiement">
                <div className="co-methods" role="radiogroup" aria-label="Moyen de paiement">
                  {methods.map((m) => {
                    const Icon = METHOD_ICONS[m.id] ?? FaCreditCard;
                    const active = selected?.id === m.id;
                    return (
                      <label key={m.id} className={`co-method ${active ? "is-active" : ""} ${m.available ? "" : "is-soon"}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={active}
                          disabled={!m.available}
                          onChange={() => setPayment(m.id)}
                        />
                        <span className="co-method-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="co-method-copy">
                          <strong>{m.label}</strong>
                          <small>{m.description}</small>
                        </span>
                        {m.available ? (
                          <span className="co-method-radio" aria-hidden="true">
                            {active && <FaCheck />}
                          </span>
                        ) : (
                          <span className="co-soon">Bientôt disponible</span>
                        )}
                      </label>
                    );
                  })}
                  {methods.length === 0 && <p className="co-muted">Aucun moyen de paiement n&apos;est activé pour le moment.</p>}
                </div>
              </ShopField>

              <label className="cfg-hp" aria-hidden="true">
                Site web
                <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
              </label>
            </div>

            <aside className="co-summary">
              <div className="co-summary-card">
                <div className="co-summary-head">
                  <h2>Récapitulatif</h2>
                  <span>
                    {cart.items.length} article{cart.items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="co-items">
                  {cart.items.map((item, i) => (
                    <li key={item.id}>
                      <span className="co-thumb">
                        <img src={`${A}${item.image || "photos/uv-vernis-1.jpg"}`} alt="" />
                      </span>
                      <div className="co-item-copy">
                        <strong>{item.name}</strong>
                        <small>{item.details}</small>
                        <span className={`co-file ${item.file ? "is-ready" : ""}`}>
                          {item.file ? <FaCheck aria-hidden="true" /> : <FaCloudUploadAlt aria-hidden="true" />}
                          {item.file ?? "Fichier à transmettre"}
                        </span>
                      </div>
                      <div className="co-item-side">
                        <strong>{estimates.each[i] ?? "À calculer"}</strong>
                        <button type="button" aria-label={`Retirer ${item.name}`} onClick={() => cart.remove(item.id)}>
                          <FaTrashAlt aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="co-total">
                  <span>{estimates.total ? "Total estimé" : "Total"}</span>
                  <strong>{estimates.total ?? "Estimation à calculer"}</strong>
                </div>
                <p className="co-summary-note">{site.payment?.note}</p>
                {error && (
                  <p className="shop-error" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-primary co-submit" disabled={sending || !selected}>
                  {sending ? "Envoi en cours…" : "Confirmer ma commande"} <FaArrowRight aria-hidden="true" />
                </button>
                <p className="co-secure">
                  <FaLock aria-hidden="true" /> Vos informations sont utilisées uniquement pour traiter votre commande.
                </p>
                <AppLink href="/configurateur" className="co-continue">
                  Ajouter un autre sticker
                </AppLink>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
