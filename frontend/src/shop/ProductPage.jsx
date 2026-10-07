import { useEffect, useState } from "react";
import {
  FaAlignLeft,
  FaArrowRight,
  FaClipboardCheck,
  FaCrosshairs,
  FaCut,
  FaFileAlt,
  FaLayerGroup,
  FaLightbulb,
  FaPlay,
  FaShieldAlt,
  FaSlidersH,
  FaTruck,
} from "react-icons/fa";
import { AppLink, navigate } from "../router.jsx";
import { useCart } from "./CartContext.jsx";
import { useCatalog, useEstimate, useSiteData, useVideos } from "./SiteData.jsx";
import { ChipGroup, DimensionsInputs, QuantityInputs, ShopField, ShopHero, UploadZone, useDesignFile, VideoPoster } from "./ShopUI.jsx";

const A = "/assets/images/";
const INFO_ICONS = [FaAlignLeft, FaSlidersH, FaLayerGroup, FaFileAlt, FaLightbulb, FaTruck];
const GALLERY = ["photos/uv-vernis-1.jpg", "photos/transparent-1.jpg", "photos/hologramme-1.jpg", "photos/argente-1.jpg"];

const HERO_CHIPS = [
  { label: "Roland & Mimaki", icon: FaCrosshairs },
  { label: "Découpe de précision", icon: FaCut },
  { label: "Livraison partout au Maroc", icon: FaTruck },
];

const ASSURANCES = [
  { label: "Contrôle de fichier avant impression", icon: FaClipboardCheck },
  { label: "BAT envoyé si nécessaire", icon: FaShieldAlt },
  { label: "Retrait atelier ou livraison", icon: FaTruck },
];

export function configToQuery(config, extra = {}) {
  return new URLSearchParams({
    type: config.type,
    matiere: config.material,
    finition: config.finish,
    largeur: String(config.width),
    hauteur: String(config.height),
    quantite: String(config.quantity),
    decoupe: config.cut,
    ...extra,
  }).toString();
}

export function ProductPage({ product }) {
  const cart = useCart();
  const design = useDesignFile();
  const { products } = useSiteData();
  const library = useVideos();
  const {
    cuts: CUTS,
    finishes: FINISHES,
    materials: MATERIALS,
    defaultConfig,
    describeConfig,
    isCompatible,
    labelOf,
  } = useCatalog();
  const [shot, setShot] = useState(product.image);
  const [config, setConfig] = useState({
    ...defaultConfig,
    type: product.type,
    material: product.materials?.[0] ?? defaultConfig.material,
    finish: product.finishes?.[0] ?? defaultConfig.finish,
  });

  const materials = MATERIALS.filter((m) => (product.materials ?? []).includes(m.id));
  const finishes = FINISHES.filter((f) => (product.finishes ?? []).includes(f.id));
  const gallery = product.gallery?.length ? product.gallery : GALLERY;
  const videos = (product.videos ?? []).map((id) => library.find((v) => v.id === id)).filter(Boolean);
  const others = Object.values(products).filter((p) => p.slug !== product.slug);
  const [video, setVideo] = useState(null);
  const activeVideo = videos.find((v) => v.id === video) ?? null;

  useEffect(() => {
    if (design.previewUrl) setVideo(null);
  }, [design.previewUrl]);
  const update = (patch) => setConfig((prev) => ({ ...prev, ...patch }));
  const estimate = useEstimate(config);

  const selectMaterial = (material) => {
    const finish = isCompatible(material, config.finish)
      ? config.finish
      : (finishes.find((f) => isCompatible(material, f.id))?.id ?? config.finish);
    update({ material, finish });
  };

  const addToCart = () => {
    cart.add({
      name: product.name,
      image: product.image,
      details: describeConfig(config),
      file: design.file?.name ?? null,
      fileObject: design.file ?? null,
      config,
    });
  };

  const [first, ...rest] = product.name.split(" ");

  return (
    <main className="pd-page">
      <ShopHero
        crumbs={[{ label: "Accueil", href: "/" }, { label: "Stickers", href: "/solutions" }, { label: product.name }]}
        kicker="Fiche produit"
        title={
          <>
            {first} {rest.slice(0, -1).join(" ")} <em>{rest.at(-1)}</em>
          </>
        }
        lead={product.subtitle}
        chips={HERO_CHIPS}
      />

      <div className="pd-main">
        <section className="pd-gallery" aria-label="Aperçu du produit">
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
              <img className="pd-stage-img" src={`${A}${shot}`} alt={product.name} />
            )}
            {!activeVideo && (
              <p className="pd-stage-hint">
                {design.file ? `Votre fichier : ${design.file.name}` : "Votre visuel apparaît ici après importation du fichier"}
              </p>
            )}
          </div>
          <ul className="pd-thumbs">
            {gallery.map((img) => (
              <li key={img}>
                <button
                  type="button"
                  className={!activeVideo && !design.previewUrl && shot === img ? "is-active" : ""}
                  onClick={() => {
                    setShot(img);
                    setVideo(null);
                  }}
                  aria-label="Voir un exemple"
                >
                  <img src={`${A}${img}`} alt="" />
                </button>
              </li>
            ))}
            {videos.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className={`pd-thumb-video ${activeVideo?.id === v.id ? "is-active" : ""}`}
                  onClick={() => setVideo(v.id)}
                  aria-label={`Lire la vidéo ${v.label}`}
                >
                  <VideoPoster video={v} />
                  <span className="pd-video-play" aria-hidden="true">
                    <FaPlay />
                  </span>
                  <small>Vidéo</small>
                </button>
              </li>
            ))}
          </ul>
          <ul className="pd-assurances">
            {ASSURANCES.map(({ label, icon: Icon }) => (
              <li key={label}>
                <Icon aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="pd-config" aria-label="Personnaliser votre sticker">
          <div className="pd-config-head">
            <p className="shop-eyebrow">Personnalisez votre sticker</p>
            <h2>Votre design. Votre format. Votre finition.</h2>
          </div>

          <ShopField num={1} legend="Matière" aside={labelOf(MATERIALS, config.material)}>
            <ChipGroup options={materials} value={config.material} onChange={selectMaterial} />
          </ShopField>
          <ShopField num={2} legend="Finition" aside={labelOf(FINISHES, config.finish)}>
            <ChipGroup
              options={finishes}
              value={config.finish}
              onChange={(finish) => update({ finish })}
              isDisabled={(id) => !isCompatible(config.material, id)}
            />
          </ShopField>
          <ShopField num={3} legend="Dimensions">
            <DimensionsInputs width={config.width} height={config.height} onChange={update} />
          </ShopField>
          <div className="pd-split">
            <ShopField num={4} legend="Quantité">
              <QuantityInputs value={config.quantity} onChange={(quantity) => update({ quantity })} />
            </ShopField>
            <ShopField num={5} legend="Découpe">
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
          <ShopField num={6} legend="Votre fichier">
            <UploadZone design={design} />
          </ShopField>

          <div className="pd-buybar">
            <div className="pd-buybar-price">
              <span>À partir de</span>
              <strong>{estimate ?? "— MAD"}</strong>
              <small>Selon matière, dimensions, finition, découpe et quantité.</small>
            </div>
            <div className="pd-buybar-actions">
              <button type="button" className="btn btn-primary" onClick={addToCart}>
                Ajouter au panier <FaArrowRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => navigate(`/configurateur?${configToQuery(config, { etape: "coordonnees" })}`)}
              >
                Demander un devis
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="pd-info" aria-label="Informations produit">
        <div className="shop-section-head">
          <span className="shop-accent" aria-hidden="true" />
          <div>
            <h2>Tout savoir sur ce sticker</h2>
            <p>Caractéristiques, fichiers acceptés, conseils et livraison.</p>
          </div>
        </div>
        <div className="pd-info-grid">
          {(product.info ?? []).map((block, i) => {
            const Icon = INFO_ICONS[i] ?? FaAlignLeft;
            return (
              <article className="pd-info-card" key={block.title}>
                <span className="pd-info-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="pd-info-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{block.title}</h3>
                <p>{block.text}</p>
              </article>
            );
          })}
        </div>
        <ul className="pd-seo" aria-label="Mots-clés">
          {(product.seo ?? "").split(" • ").filter(Boolean).map((kw) => (
            <li key={kw}>{kw}</li>
          ))}
        </ul>
      </section>

      {others.length > 0 && (
        <section className="pd-related" aria-label="Nos autres stickers">
          <div className="shop-section-head">
            <span className="shop-accent" aria-hidden="true" />
            <div>
              <h2>Découvrez nos autres stickers</h2>
              <p>Chaque sticker a sa fiche, ses photos et ses vidéos.</p>
            </div>
          </div>
          <ul className="pd-related-grid">
            {others.map((p) => (
              <li key={p.slug}>
                <AppLink href={`/produit/${p.slug}`} className="pd-related-card">
                  <span className="pd-related-media">
                    <img src={`${A}${p.image}`} alt="" loading="lazy" />
                  </span>
                  <span className="pd-related-body">
                    <strong>{p.name}</strong>
                    <small>{p.subtitle}</small>
                    <em>
                      Voir la fiche <FaArrowRight aria-hidden="true" />
                    </em>
                  </span>
                </AppLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
