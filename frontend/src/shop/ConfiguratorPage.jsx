import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaClipboardCheck,
  FaCut,
  FaExpand,
  FaFileAlt,
  FaLayerGroup,
  FaShieldAlt,
  FaShoppingBag,
  FaStar,
  FaTag,
  FaTruck,
  FaCalculator,
  FaPlay,
  FaSortNumericUp,
} from "react-icons/fa";
import { useCart } from "./CartContext.jsx";
import { MaterialMatrix } from "./MaterialMatrix.jsx";
import { useCatalog, useEstimate, useVideos } from "./SiteData.jsx";
import { ChipGroup, DimensionsInputs, QuantityInputs, ShopField, ShopHero, UploadZone, useDesignFile, VideoPoster } from "./ShopUI.jsx";

const A = "/assets/images/";
const HERO_CHIPS = [
  { label: "Contrôle de fichier", icon: FaClipboardCheck },
  { label: "Découpe de précision", icon: FaCut },
  { label: "Livraison partout au Maroc", icon: FaTruck },
];

const ASSURANCES = [
  { label: "Contrôle de fichier avant impression", icon: FaClipboardCheck },
  { label: "BAT envoyé si nécessaire", icon: FaShieldAlt },
  { label: "Retrait atelier ou livraison", icon: FaTruck },
];

const LOGIC = [
  { title: "Type", text: "Classe de produit et usage du sticker.", icon: FaTag },
  { title: "Matière", text: "Support choisi : vinyle, transparent, premium, holographique ou film technique.", icon: FaLayerGroup },
  { title: "Finition", text: "Aspect et protection : brillant, mat, laminage, blanc ou vernis sélectif.", icon: FaStar },
  { title: "Dimensions", text: "Largeur × hauteur : la surface consommée détermine la matière utilisée.", icon: FaExpand },
  { title: "Quantité", text: "Nombre d'exemplaires, avec paliers 100 / 250 / 500 / 1 000.", icon: FaSortNumericUp },
  { title: "Découpe", text: "Carrée, ronde, à la forme, mi-chair ou feuille selon capacités.", icon: FaCut },
  { title: "Fichier", text: "Contrôle du fichier, BAT si nécessaire avant production.", icon: FaFileAlt },
  { title: "Prix", text: "Calcul automatique, ou devis personnalisé pour les demandes complexes.", icon: FaCalculator },
  { title: "Panier", text: "Commande directe ou demande de devis, puis production et livraison.", icon: FaShoppingBag },
];

const PRICE_RULE = ["Matière", "Impression", "Finition", "Découpe", "Quantité", "Options", "Emballage", "Livraison"];

function readInitialState() {
  const q = new URLSearchParams(window.location.search);
  const num = (value) => (Number(value) > 0 ? Math.round(Number(value)) : undefined);
  const raw = {
    type: q.get("type") ?? undefined,
    material: q.get("matiere") ?? undefined,
    finish: q.get("finition") ?? undefined,
    width: num(q.get("largeur")),
    height: num(q.get("hauteur")),
    quantity: num(q.get("quantite")),
    cut: q.get("decoupe") ?? undefined,
    usage: q.get("utilisation") ?? undefined,
  };
  return {
    config: Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)),
    openQuote: q.get("etape") === "coordonnees",
  };
}

const EMPTY_CONTACT = { name: "", phone: "", email: "", message: "", website: "" };

export function ConfiguratorPage() {
  const cart = useCart();
  const design = useDesignFile();
  const catalog = useCatalog();
  const {
    types: STICKER_TYPES,
    materials: MATERIALS,
    finishes: FINISHES,
    cuts: CUTS,
    usages: USAGES,
    describeConfig,
    isCompatible,
    isMaterialAllowed,
    labelOf,
    normalizeConfig,
  } = catalog;
  const [initial] = useState(readInitialState);
  const [config, setConfig] = useState(() => normalizeConfig(initial.config));
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [contactError, setContactError] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    setConfig((prev) => normalizeConfig({ ...prev, ...initial.config }));
  }, [catalog]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch) => setConfig((prev) => normalizeConfig({ ...prev, ...patch }));
  const estimate = useEstimate(config);
  const currentType = STICKER_TYPES.find((t) => t.id === config.type) ?? STICKER_TYPES[0];
  const [video, setVideo] = useState(null);
  const videos = useVideos().filter((v) => v.material === config.material);
  const activeVideo = videos.find((v) => v.id === video) ?? null;

  useEffect(() => {
    if (design.previewUrl) setVideo(null);
  }, [design.previewUrl]);
  useEffect(() => {
    if (initial.openQuote) {
      requestAnimationFrame(() => document.getElementById("devis")?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [initial.openQuote]);

  const selectMaterial = (material) => update({ material });

  const addToCart = () => {
    cart.add({
      name: currentType.label,
      image: currentType.image,
      details: describeConfig(config),
      file: design.file?.name ?? null,
      fileObject: design.file ?? null,
      config,
    });
  };

  const requestQuote = () => document.getElementById("devis")?.scrollIntoView({ behavior: "smooth" });

  const submitContact = async (e) => {
    e.preventDefault();
    if (!contact.name.trim() || (!contact.phone.trim() && !contact.email.trim())) {
      setContactError("Indiquez votre nom et au moins un téléphone ou un e-mail.");
      return;
    }
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) {
      setContactError("Adresse e-mail invalide.");
      return;
    }
    setContactError(null);

    const entries = [{ name: currentType.label, config, file: design.file }];
    const form = new FormData();
    for (const key of ["name", "phone", "email", "message", "website"]) form.set(key, contact[key].trim());
    form.set("kind", "devis");
    form.set("items", JSON.stringify(entries.map(({ name, config: c }) => ({ name, config: c }))));
    entries.forEach(({ file }, i) => file && form.set(`file_${i}`, file, file.name));

    setSending(true);
    try {
      const res = await fetch("/api/public/requests", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Envoi impossible pour le moment.");
      setSubmitted({ ref: data.ref, kind: "devis" });
      setContact(EMPTY_CONTACT);
    } catch (err) {
      setContactError(
        err instanceof TypeError ? "Connexion impossible. Vérifiez votre réseau puis réessayez." : err.message,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pd-page cfg-page">
      <ShopHero
        crumbs={[{ label: "Accueil", href: "/" }, { label: "Stickers", href: "/solutions" }, { label: "Configurateur" }]}
        kicker="Configurateur"
        title={
          <>
            Commandez vos stickers en <em>quelques clics</em>
          </>
        }
        lead="Choisissez vos options, importez votre fichier et obtenez une estimation adaptée à votre projet."
        chips={HERO_CHIPS}
      />

      <div className="pd-main">
        <section className="pd-gallery" aria-label="Aperçu de votre sticker">
          <div className={`pd-stage ${activeVideo ? "is-video" : ""}`}>
            <span className="pd-stage-badge">{activeVideo ? `Vidéo • ${activeVideo.label}` : "Aperçu du produit"}</span>
            {activeVideo ? (
              <video
                key={activeVideo.id}
                className="pd-stage-video"
                src={activeVideo.url}
                poster={activeVideo.posterUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : design.previewUrl ? (
              <img className="pd-stage-img is-upload" src={design.previewUrl} alt="Aperçu de votre visuel" />
            ) : (
              <img className="pd-stage-img" src={`${A}${currentType.image}`} alt={currentType.label} />
            )}
            {!activeVideo && (
              <p className="pd-stage-hint">
                {design.file ? `Votre fichier : ${design.file.name}` : "Votre visuel apparaît ici après importation du fichier"}
              </p>
            )}
          </div>
          <ul className="pd-thumbs pd-thumbs--6">
            {STICKER_TYPES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={!activeVideo && config.type === t.id ? "is-active" : ""}
                  onClick={() => {
                    update({ type: t.id });
                    setVideo(null);
                  }}
                  aria-label={t.label}
                  title={t.label}
                >
                  <img src={`${A}${t.image}`} alt="" />
                </button>
              </li>
            ))}
          </ul>
          {videos.length > 0 && (
          <>
          <div className="pd-media-head">
            <span className="pd-media-icon" aria-hidden="true">
              <FaPlay />
            </span>
            <strong>En vidéo : {labelOf(MATERIALS, config.material)}</strong>
            <small>
              {videos.length} vidéo{videos.length > 1 ? "s" : ""}
            </small>
          </div>
          <ul className="pd-thumbs pd-thumbs--videos">
            {videos.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className={`pd-thumb-video ${activeVideo?.id === v.id ? "is-active" : ""}`}
                  onClick={() => setVideo(v.id)}
                  aria-label={`Lire la vidéo ${v.label}`}
                  title={v.label}
                >
                  <VideoPoster video={v} />
                  <span className="pd-video-play" aria-hidden="true">
                    <FaPlay />
                  </span>
                  <small>{v.label}</small>
                </button>
              </li>
            ))}
          </ul>
          </>
          )}
          <ul className="pd-assurances">
            {ASSURANCES.map(({ label, icon: Icon }) => (
              <li key={label}>
                <Icon aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="pd-config" id="cfg-options" aria-label="Configurer votre sticker">
          <div className="pd-config-head">
            <p className="shop-eyebrow">Configurez votre sticker</p>
            <h2>Votre design. Votre format. Votre finition.</h2>
          </div>

          <ShopField num={1} legend="Type de sticker" aside={currentType.hint}>
            <ChipGroup options={STICKER_TYPES} value={config.type} onChange={(type) => update({ type })} />
          </ShopField>
          <ShopField num={2} legend="Matière" aside={labelOf(MATERIALS, config.material)}>
            <ChipGroup
              options={MATERIALS}
              value={config.material}
              onChange={selectMaterial}
              isDisabled={(id) => !isMaterialAllowed(config.type, id)}
              disabledHint={`Non proposé pour un ${currentType.label.toLowerCase()}`}
            />
          </ShopField>
          <ShopField num={3} legend="Finition" aside={labelOf(FINISHES, config.finish)}>
            <ChipGroup
              options={FINISHES}
              value={config.finish}
              onChange={(finish) => update({ finish })}
              isDisabled={(id) => !isCompatible(config.material, id)}
            />
          </ShopField>
          <ShopField num={4} legend="Dimensions">
            <DimensionsInputs width={config.width} height={config.height} onChange={update} />
          </ShopField>
          <div className="pd-split">
            <ShopField num={5} legend="Quantité">
              <QuantityInputs value={config.quantity} onChange={(quantity) => update({ quantity })} />
            </ShopField>
            <ShopField num={6} legend="Découpe">
              <select
                className="shop-select"
                value={config.cut}
                onChange={(e) => update({ cut: e.target.value })}
                aria-label="Découpe"
              >
                {CUTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </ShopField>
          </div>
          <ShopField num={7} legend="Utilisation" aside={labelOf(USAGES, config.usage)}>
            <ChipGroup options={USAGES} value={config.usage} onChange={(usage) => update({ usage })} />
          </ShopField>
          <ShopField num={8} legend="Votre fichier">
            <UploadZone design={design} label="Glissez-déposez ou importez votre fichier" />
          </ShopField>

          <div className="pd-buybar">
            <div className="pd-buybar-price">
              <span>{estimate ? "Estimation" : "Estimation à calculer"}</span>
              <strong>{estimate ?? "— MAD"}</strong>
              <small>
                {currentType.label} • {describeConfig(config)}
              </small>
            </div>
            <div className="pd-buybar-actions">
              <button type="button" className="btn btn-primary" onClick={addToCart}>
                Ajouter au panier <FaArrowRight aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-outline-light" onClick={requestQuote}>
                Demander un devis
              </button>
            </div>
          </div>
        </section>
      </div>

      <MaterialMatrix id="cfg-matrice" showActions={false} />

      <section className="pd-info cfg-quote" id="devis" aria-labelledby="devis-title">
        <div className="shop-section-head">
          <span className="shop-accent" aria-hidden="true" />
          <div>
            <h2 id="devis-title">Demander un devis</h2>
            <p>Recevez votre prix, votre BAT si nécessaire et le suivi de votre commande.</p>
          </div>
        </div>
        <div className="cfg-quote-card">
          {submitted ? (
            <div className="cfg-success" role="status">
              <span className="cfg-success-icon" aria-hidden="true">
                <FaCheck />
              </span>
              <div>
                <strong>
                  Merci, votre {submitted.kind === "commande" ? "commande" : "demande"} est enregistrée
                  {submitted.ref ? ` — référence ${submitted.ref}` : ""}.
                </strong>
                <p>Nous vérifions votre fichier et revenons vers vous avec un prix et un BAT si nécessaire.</p>
                <button type="button" className="cfg-success-again" onClick={() => setSubmitted(null)}>
                  Faire une nouvelle demande
                </button>
              </div>
            </div>
          ) : (
            <form className="cfg-form" onSubmit={submitContact} noValidate>
              <label className="shop-input">
                <span>Nom / Société *</span>
                <input
                  type="text"
                  autoComplete="organization"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                />
              </label>
              <label className="shop-input">
                <span>Téléphone</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </label>
              <label className="shop-input">
                <span>E-mail</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </label>
              <label className="shop-input cfg-form-wide">
                <span>Message (facultatif)</span>
                <textarea
                  rows="3"
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                />
              </label>
              {contactError && (
                <p className="shop-error cfg-form-wide" role="alert">
                  {contactError}
                </p>
              )}
              <label className="cfg-hp" aria-hidden="true">
                Site web
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contact.website}
                  onChange={(e) => setContact({ ...contact, website: e.target.value })}
                />
              </label>
              <div className="cfg-form-foot cfg-form-wide">
                <p>
                  <strong>Votre configuration :</strong> {currentType.label} • {describeConfig(config)}
                  {design.file ? ` • ${design.file.name}` : ""}
                </p>
                <button type="submit" className="btn btn-dark" disabled={sending}>
                  {sending ? "Envoi en cours…" : "Obtenir mon prix"}{" "}
                  <FaArrowRight aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="pd-info" aria-labelledby="logic-title">
        <div className="shop-section-head">
          <span className="shop-accent" aria-hidden="true" />
          <div>
            <h2 id="logic-title">Comment est calculé votre prix&nbsp;?</h2>
            <p>Chaque option du configurateur alimente l&apos;estimation.</p>
          </div>
        </div>
        <div className="pd-info-grid">
          {LOGIC.map(({ title, text, icon: Icon }, i) => (
            <article className="pd-info-card" key={title}>
              <span className="pd-info-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="pd-info-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <ul className="pd-seo" aria-label="Règle de prix">
          {PRICE_RULE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
