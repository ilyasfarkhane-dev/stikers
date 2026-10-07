import { Suspense, lazy, useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBars,
  FaBoxOpen,
  FaCar,
  FaAward,
  FaCalendarAlt,
  FaCheck,
  FaClipboardCheck,
  FaCloudUploadAlt,
  FaCog,
  FaCrosshairs,
  FaCut,
  FaExpand,
  FaFacebookF,
  FaHome,
  FaIndustry,
  FaInstagram,
  FaLayerGroup,
  FaLeaf,
  FaLinkedinIn,
  FaCommentDots,
  FaPhoneAlt,
  FaTint,
  FaSearch,
  FaShieldAlt,
  FaShoppingBag,
  FaStar,
  FaStore,
  FaSun,
  FaTag,
  FaTiktok,
  FaTrashAlt,
  FaTruck,
  FaUser,
  FaWineBottle,
  FaYoutube,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { AppLink, navigate, useLocation } from "./router.jsx";
import { useCart } from "./shop/CartContext.jsx";
import { ProductPage } from "./shop/ProductPage.jsx";
import { ConfiguratorPage } from "./shop/ConfiguratorPage.jsx";
import { CheckoutPage } from "./shop/CheckoutPage.jsx";
import { MaterialMatrix } from "./shop/MaterialMatrix.jsx";
import { useEstimates, useSiteData } from "./shop/SiteData.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";

const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

const A = "/assets/images/";
const telHref = (phone) => `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Nos solutions", href: "/solutions" },
  { label: "Matières & Finitions", href: "/matieres-finitions" },
  { label: "Applications", href: "/applications" },
  { label: "Comment ça marche ?", href: "/applications#comment-ca-marche" },
  { label: "Tarifs", href: "/configurateur" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

function isNavActive(href, path) {
  if (href === "/") return path === "/";
  return href === path;
}

const finishes = [
  { name: "Brillant", tone: "gloss" },
  { name: "Mat", tone: "matte" },
  { name: "Transparent", tone: "clear" },
  { name: "Blanc sélectif", tone: "white" },
  { name: "Vernis sélectif", tone: "varnish" },
  { name: "Laminage brillant", tone: "lam-gloss" },
  { name: "Laminage mat", tone: "lam-matte" },
  { name: "Effet holographique", tone: "holo" },
  { name: "Effet métallique", tone: "metal" },
];

const pageFinishes = [
  { name: "Brillant", tone: "gloss" },
  { name: "Mat", tone: "matte" },
  { name: "Blanc sélectif", tone: "white" },
  { name: "Vernis sélectif", tone: "varnish" },
  { name: "Laminage brillant", tone: "lam-gloss" },
  { name: "Laminage mat", tone: "lam-matte" },
  { name: "Effet holographique", tone: "holo" },
  { name: "Effet métallisé", tone: "metal" },
];

const materials = [
  {
    name: "Vinyle blanc brillant",
    traits: "Couleurs lumineuses • support polyvalent",
    ideal: "Idéal pour packaging, vitrines et promotion",
    image: "photos/uv-vernis-1.jpg",
    icon: FaStar,
  },
  {
    name: "Vinyle blanc mat",
    traits: "Rendu sobre • moins de reflets",
    ideal: "Idéal pour marques premium et décoration",
    image: "photos/argente-1.jpg",
    icon: FaLayerGroup,
  },
  {
    name: "Vinyle transparent",
    traits: "Effet sans fond • rendu moderne",
    ideal: "Idéal pour bouteilles, vitrines et supports clairs",
    image: "photos/transparent-1.jpg",
    icon: FaTint,
  },
  {
    name: "Vinyle premium",
    traits: "Image de marque • rendu haut de gamme",
    ideal: "Pour les marques exigeantes et le packaging de luxe",
    image: "photos/dore-1.jpg",
    icon: FaTag,
  },
  {
    name: "Holographique",
    traits: "Effet irisé • rendu spectaculaire",
    ideal: "Pour événements, édition limitée et premium",
    image: "photos/hologramme-1.jpg",
    icon: FaAward,
  },
  {
    name: "Films techniques",
    traits: "Dépoli • microperforé • repositionnable",
    ideal: "Aussi : papier adhésif, kraft, BOPP / PE / polyester selon compatibilité",
    image: "photos/eco-solvant-2.jpg",
    icon: FaCog,
  },
];

const matieresTrust = [
  { label: "Supports adaptés à chaque usage", icon: FaLayerGroup },
  { label: "Finitions premium au choix", icon: FaStar },
  { label: "Rendu HD & couleurs fidèles", icon: FaCrosshairs },
  { label: "Conseil matière sur mesure", icon: FaCommentDots },
];

const needs = [
  { label: "Mon packaging", icon: FaBoxOpen, type: "packaging" },
  { label: "Mon véhicule", icon: FaCar, type: "vehicule" },
  { label: "Ma vitrine", icon: FaStore, type: "transparent" },
  { label: "Mes produits", icon: FaWineBottle, type: "premium" },
  { label: "Ma décoration", icon: FaHome, type: "mural" },
  { label: "Mes étiquettes", icon: FaTag, type: "premium" },
  { label: "Mon événement", icon: FaCalendarAlt, type: "classique" },
];

const usageSolutions = [
  {
    title: "Packaging premium",
    desc: "Boîtes, sachets, colis, bouteilles et produits : vinyle, papier, kraft ou transparent, avec laminage et effets.",
    image: "photos/dore-1.jpg",
    icon: FaBoxOpen,
  },
  {
    title: "Vitrine & retail",
    desc: "Branding, promotions et horaires : transparent, dépoli, opaque, microperforé ou contour découpé.",
    image: "photos/argente-2.jpg",
    icon: FaStore,
  },
  {
    title: "Véhicule & flotte",
    desc: "Logos, communication mobile et marquage : vinyles adaptés, découpe et protection.",
    image: "photos/eco-solvant-1.jpg",
    icon: FaCar,
  },
  {
    title: "Événement & promotion",
    desc: "Salons, stands, PLV, goodies et campagnes promotionnelles.",
    image: "photos/hologramme-2.jpg",
    icon: FaCalendarAlt,
  },
  {
    title: "Décoration murale",
    desc: "Bureaux, chambres, commerces et signalétique intérieure.",
    image: "photos/hologramme-1.jpg",
    icon: FaHome,
  },
  {
    title: "Étiquettes produits",
    desc: "Pots, bouteilles, boîtes, codes-barres et références produits.",
    image: "photos/transparent-1.jpg",
    icon: FaTag,
  },
  {
    title: "Industriel & sécurité",
    desc: "Garantie, identification, marquage technique et solutions techniques.",
    image: "photos/eco-solvant-2.jpg",
    icon: FaIndustry,
  },
  {
    title: "Repositionnable",
    desc: "Pour vos promotions et l'affichage temporaire, sans laisser de traces.",
    image: "photos/argente-1.jpg",
    icon: FaExpand,
  },
];

const sectors = [
  {
    title: "Entreprises",
    desc: "Branding, logos et communication pour affirmer votre identité.",
    image: "photos/uv-vernis-1.jpg",
    icon: FaAward,
  },
  {
    title: "Restaurants & cafés",
    desc: "Packaging, vitrines, bouteilles et promotions.",
    image: "photos/transparent-2.jpg",
    icon: FaWineBottle,
  },
  {
    title: "Boutiques",
    desc: "Vitrines, promotions, décoration et étiquettes.",
    image: "photos/argente-2.jpg",
    icon: FaStore,
  },
  {
    title: "E-commerce",
    desc: "Colis, packaging et identité de marque à chaque envoi.",
    image: "photos/dore-1.jpg",
    icon: FaShoppingBag,
  },
  {
    title: "Cosmétiques",
    desc: "Flacons, pots et boîtes avec des finitions premium.",
    image: "photos/argente-1.jpg",
    icon: FaStar,
  },
  {
    title: "Alimentaire",
    desc: "Bocaux, bouteilles et emballages alimentaires.",
    image: "photos/transparent-1.jpg",
    icon: FaBoxOpen,
  },
  {
    title: "Événementiel",
    desc: "Salons, mariages, goodies et activations.",
    image: "photos/hologramme-2.jpg",
    icon: FaCalendarAlt,
  },
  {
    title: "Automobile",
    desc: "Marquage de véhicules et de flottes.",
    image: "photos/eco-solvant-1.jpg",
    icon: FaCar,
  },
  {
    title: "Décoration",
    desc: "Murs et espaces commerciaux.",
    image: "photos/hologramme-1.jpg",
    icon: FaHome,
  },
  {
    title: "Industrie",
    desc: "Identification, sécurité et marquage technique.",
    image: "photos/eco-solvant-2.jpg",
    icon: FaIndustry,
  },
];

const applicationsTrust = [
  { label: "Une solution par besoin", icon: FaCrosshairs },
  { label: "Conseil matière & finition", icon: FaCommentDots },
  { label: "Production Roland & Mimaki", icon: FaCog },
  { label: "Livraison partout au Maroc", icon: FaTruck },
];

const processSteps = [
  { label: "Choix de la solution", icon: FaTag },
  { label: "Configuration", icon: FaLayerGroup },
  { label: "Envoi du fichier", icon: FaCloudUploadAlt },
  { label: "Production & BAT", icon: FaCog },
  { label: "Contrôle qualité", icon: FaCheck },
  { label: "Livraison", icon: FaTruck },
];

const solutionTrust = [
  { label: "Qualité d'impression HD", icon: FaCrosshairs },
  { label: "Large choix de matières et finitions", icon: FaLayerGroup },
  { label: "Découpe de précision", icon: FaCut },
  { label: "Livraison rapide partout au Maroc", icon: FaTruck },
];

const techCards = [
  {
    title: "Impression UV",
    icon: FaSun,
    points: ["Couleurs HD ultra-nettes", "Blanc & vernis sélectif", "Résistance UV & rayures"],
    image: "photos/uv-vernis-2.jpg",
  },
  {
    title: "Éco-solvant",
    icon: FaLeaf,
    points: ["Durabilité extérieur", "Couleurs naturelles", "Idéal véhicules & grands formats"],
    image: "photos/eco-solvant-2.jpg",
  },
];

const configSteps = [
  { label: "Type de sticker", icon: FaTag },
  { label: "Matière", icon: FaLayerGroup },
  { label: "Finition", icon: FaStar },
  { label: "Dimensions", icon: FaExpand },
  { label: "Quantité", icon: FaCog },
  { label: "Découpe", icon: FaCut },
];

function LogoMark({ className = "", light = false }) {
  const src = light ? "/assets/logo-white.png" : "/assets/logo-black.png";
  return (
    <AppLink className={`logo ${light ? "logo--light" : ""} ${className}`} href="/" aria-label="Stick'Art — Accueil">
      <img className="logo-img" src={src} alt="Stick'Arts by Comstore" />
    </AppLink>
  );
}

function Header({ cartOpen, setCartOpen, cartCount, path }) {
  const { topbar } = useSiteData().site;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("locked", mobileOpen || cartOpen);
    return () => document.body.classList.remove("locked");
  }, [mobileOpen, cartOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  return (
    <>
      <div className="topbar">
        <p className="topbar-left">{topbar.left}</p>
        <div className="topbar-center">
          {topbar.delivery && (
            <span>
              <FaTruck aria-hidden="true" /> {topbar.delivery}
            </span>
          )}
          {topbar.payment && (
            <span>
              <FaShieldAlt aria-hidden="true" /> {topbar.payment}
            </span>
          )}
        </div>
        {topbar.phone && (
          <a className="topbar-phone" href={telHref(topbar.phone)}>
            <FaPhoneAlt aria-hidden="true" /> {topbar.phone}
          </a>
        )}
      </div>

      <header className="site-header">
        <LogoMark />
        <nav className="desktop-nav" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <AppLink key={link.label} href={link.href} className={isNavActive(link.href, path) ? "is-active" : undefined}>
              {link.label}
            </AppLink>
          ))}
        </nav>
        <div className="header-actions">
         
          <button className="icon-btn cart-btn" aria-label="Panier" type="button" onClick={() => setCartOpen(true)}>
            <FaShoppingBag />
            <span className="cart-count">{cartCount}</span>
          </button>
          <button className="mobile-menu-button" aria-label="Ouvrir le menu" type="button" onClick={() => setMobileOpen(true)}>
            <FaBars />
          </button>
        </div>
      </header>

      <div className={`drawer-overlay ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`mobile-menu ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <button className="drawer-close" aria-label="Fermer le menu" type="button" onClick={() => setMobileOpen(false)}>
          <IoClose />
        </button>
        <LogoMark />
        {navLinks.map((link) => (
          <AppLink
            key={link.label}
            href={link.href}
            className={isNavActive(link.href, path) ? "is-active" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </AppLink>
        ))}
      </aside>
    </>
  );
}

function CartDrawer({ open, onClose, items, onRemove }) {
  const estimates = useEstimates(items.map((item) => item.config ?? {}));
  const suggestions = Object.values(useSiteData().products).slice(0, 3);
  const go = (href) => {
    onClose();
    navigate(href);
  };

  return (
    <>
      <div className={`cart-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} aria-label="Panier">
        <header className="cart-head">
          <div>
            <span className="cart-kicker">Mon panier</span>
            <h2>
              Votre panier
              {items.length > 0 && <span className="cart-head-count">{items.length}</span>}
            </h2>
          </div>
          <button className="cart-close" type="button" onClick={onClose} aria-label="Fermer le panier">
            <IoClose />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <section className="cart-empty-hero">
              <div className="cart-empty-art" aria-hidden="true">
                <img className="is-left" src={`${A}photos/hologramme-1.jpg`} alt="" />
                <img className="is-right" src={`${A}photos/dore-2.jpg`} alt="" />
                <img className="is-center" src={`${A}photos/eco-solvant-2.jpg`} alt="" />
                <span className="cart-empty-badge">
                  <FaShoppingBag />
                  <em>0</em>
                </span>
              </div>
              <h3>Votre panier est vide</h3>
              <p>Choisissez le type, la matière, la finition et le format : votre sticker s&apos;ajoute ici, prêt à être commandé.</p>
              <button type="button" className="btn btn-primary cart-empty-cta" onClick={() => go("/configurateur")}>
                Configurer mon sticker <FaArrowRight aria-hidden="true" />
              </button>
            </section>

            {suggestions.length > 0 && (
              <section className="cart-empty-picks" aria-label="Nos stickers">
                <p className="cart-empty-label">Ou partez d&apos;un modèle</p>
                <ul>
                  {suggestions.map((p) => (
                    <li key={p.slug}>
                      <button type="button" onClick={() => go(`/produit/${p.slug}`)}>
                        <img src={`${A}${p.image}`} alt="" loading="lazy" />
                        <span>
                          <strong>{p.name}</strong>
                          <small>{p.subtitle}</small>
                        </span>
                        <FaArrowRight aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ul className="cart-empty-trust">
              <li>
                <FaClipboardCheck aria-hidden="true" /> Contrôle de fichier avant impression
              </li>
              <li>
                <FaTruck aria-hidden="true" /> Livraison partout au Maroc
              </li>
              <li>
                <FaStore aria-hidden="true" /> Retrait atelier ou livraison
              </li>
            </ul>
          </div>
        ) : (
          <>
            <div className="cart-body">
              <ul className="cart-list">
                {items.map((item, index) => (
                  <li className="cart-item" key={item.id}>
                    <span className="cart-thumb">
                      <img src={`${A}${item.image || "photos/uv-vernis-1.jpg"}`} alt="" />
                    </span>
                    <div className="cart-item-main">
                      <div className="cart-item-top">
                        <strong>{item.name}</strong>
                        <button
                          type="button"
                          className="cart-remove"
                          aria-label={`Retirer ${item.name}`}
                          onClick={() => onRemove(item.id)}
                        >
                          <FaTrashAlt aria-hidden="true" />
                        </button>
                      </div>
                      <ul className="cart-specs">
                        {String(item.details ?? "")
                          .split(" • ")
                          .filter(Boolean)
                          .map((spec) => (
                            <li key={spec}>{spec}</li>
                          ))}
                      </ul>
                      <div className="cart-item-bottom">
                        <span className={`cart-file ${item.file ? "is-ready" : ""}`}>
                          {item.file ? <FaCheck aria-hidden="true" /> : <FaCloudUploadAlt aria-hidden="true" />}
                          {item.file ? item.file : "Fichier à transmettre"}
                        </span>
                        <strong className={`cart-item-price ${estimates.each[index] ? "" : "is-pending"}`}>
                          {estimates.each[index] ?? "À calculer"}
                        </strong>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="cart-foot">
              <div className="cart-total">
                <span>{estimates.total ? "Total estimé" : "Prix"}</span>
                <strong>{estimates.total ?? "Estimation à calculer"}</strong>
              </div>
              <p className="cart-note">
                Prix confirmé après contrôle de votre fichier. Paiement et livraison validés avec notre équipe.
              </p>
              <button type="button" className="btn btn-primary cart-cta" onClick={() => go("/commande")}>
                Finaliser ma commande <FaArrowRight aria-hidden="true" />
              </button>
              <button type="button" className="cart-continue" onClick={() => go("/configurateur")}>
                Ajouter un autre sticker
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function Hero() {
  const { hero } = useSiteData().site;
  return (
    <section className="hero" id="top">
      <div className="hero-media" aria-hidden="true">
        <img className="hero-bg" src={`${A}photos/uv-vernis-2.jpg`} alt="" />
        <div className="hero-shade" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-kicker">
            {hero.kicker}
            <span className="hero-kicker-rule" aria-hidden="true" />
          </p>
          <h1>
            {hero.titleLine1}
            <br />
            {hero.titleLine2} <em>{hero.titleAccent}</em>
          </h1>
          <div className="hero-copy">
            {hero.paragraph1 && <p>{hero.paragraph1}</p>}
            {hero.paragraph2 && <p>{hero.paragraph2}</p>}
          </div>
          <div className="hero-actions">
            <AppLink className="btn btn-primary" href="/configurateur">
              {hero.primaryCta} <FaArrowRight aria-hidden="true" />
            </AppLink>
            <AppLink className="btn btn-ghost" href="/configurateur?etape=coordonnees">
              {hero.secondaryCta}
            </AppLink>
          </div>

          <ul className="hero-trust">
            <li>
              <FaAward aria-hidden="true" />
              <span>Qualité professionnelle</span>
            </li>
            <li>
              <FaTint aria-hidden="true" />
              <span>Impression UV &amp; Éco-solvant</span>
            </li>
            <li>
              <FaCrosshairs aria-hidden="true" />
              <span>Découpe de précision</span>
            </li>
            <li>
              <FaTruck aria-hidden="true" />
              <span>Livraison rapide</span>
            </li>
          </ul>
        </div>

        <p className="hero-aside" aria-hidden="true">
          {(hero.aside ?? []).map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <span className="stars" aria-label="5 sur 5 étoiles">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} />
      ))}
    </span>
  );
}

function Solutions({ showHead = true }) {
  const solutions = (useSiteData().site.solutions ?? []).filter((item) => item.visible !== false);
  return (
    <section className="solutions" id="solutions">
      {showHead && (
        <div className="section-head">
          <div>
            <h2>Nos solutions</h2>
            <p>Des stickers pour tous vos projets</p>
          </div>
        </div>
      )}
      <div className="solution-grid">
        {solutions.map((item, i) => (
          <article
            className={`solution-card ${item.accent ? "is-accent" : ""} ${item.framed ? "is-framed" : ""}`}
            key={`${item.name}-${i}`}
            title={item.tagline}
            style={{ "--tilt": `${i % 2 === 0 ? -1.2 : 1.2}deg` }}
          >
            {item.badge && <span className="solution-badge">{item.badge}</span>}
            <h3>{item.name}</h3>
            <div className={`solution-image solution-image--${item.fit || "contain"}`}>
              <img src={`${A}${item.image}`} alt={`${item.name} — ${item.tagline}`} />
            </div>
            <Stars />
            <AppLink className="shop-btn" href={item.href}>
              Commander
            </AppLink>
          </article>
        ))}
      </div>
    </section>
  );
}

function SolutionsPage() {
  return (
    <main className="page page-solutions">
      <section className="sol-hero">
        <div className="sol-hero-media" aria-hidden="true">
          <img className="sol-hero-bg" src={`${A}photos/uv-vernis-2.jpg`} alt="" />
          <div className="sol-hero-shade" />
        </div>
        <div className="sol-hero-inner">
          <div className="sol-hero-copy">
            <p className="sol-kicker">Nos solutions</p>
            <h1>
              Des stickers pour chaque <em>besoin</em>
            </h1>
            <p className="sol-hero-lead">
              Entreprises, commerçants, créateurs ou particuliers : nous imprimons vos stickers en haute définition
              avec des finitions professionnelles adaptées à chaque usage.
            </p>
            <a className="btn btn-primary sol-hero-cta" href="#usage">
              Découvrir toutes nos solutions <FaArrowRight aria-hidden="true" />
            </a>
          </div>
          <p className="sol-hero-aside" aria-hidden="true">
            Votre idée, notre expertise, le bon sticker&nbsp;!
          </p>
        </div>
      </section>

      <section className="sol-trust" aria-label="Points forts">
        <ul>
          {solutionTrust.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sol-usage" id="usage">
        <div className="sol-section-head">
          <h2>Nos solutions par usage</h2>
          <p>Trouvez le sticker qui correspond parfaitement à votre projet.</p>
        </div>
        <div className="usage-grid">
          {usageSolutions.map((item) => {
            const Icon = item.icon;
            return (
              <article className="usage-card" key={item.title}>
                <div className="usage-card-media">
                  <img src={`${A}${item.image}`} alt="" />
                  <span className="usage-card-icon" aria-hidden="true">
                    <Icon />
                  </span>
                </div>
                <div className="usage-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <AppLink className="usage-card-link" href="/configurateur">
                    Commander <FaArrowRight aria-hidden="true" />
                  </AppLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sol-tech" id="technologies">
        <div className="sol-tech-intro">
          <p className="sol-kicker sol-kicker--on-dark">Nos technologies</p>
          <h2>
            UV ou Éco-solvant&nbsp;?
            <br />
            On vous guide&nbsp;!
          </h2>
          <p>
            Deux technologies d&apos;impression performantes pour des rendus nets et durables. Choisissez celle qui
            correspond le mieux à votre projet.
          </p>
          <a className="btn btn-outline-gold" href="#technologies">
            Comparer les technologies <FaArrowRight aria-hidden="true" />
          </a>
        </div>
        <div className="sol-tech-cards">
          {techCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="tech-compare-card" key={card.title}>
                <div className="tech-compare-head">
                  <span className="tech-compare-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{card.title}</h3>
                </div>
                <ul>
                  {card.points.map((point) => (
                    <li key={point}>
                      <FaCheck aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="tech-compare-media">
                  <img src={`${A}${card.image}`} alt="" />
                </div>
                <AppLink className="tech-compare-link" href="/#techno">
                  En savoir plus <FaArrowRight aria-hidden="true" />
                </AppLink>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sol-finitions" id="sol-finitions">
        <div className="sol-section-head sol-section-head--left">
          <h2>Nos finitions</h2>
          <p>Donnez plus de caractère à vos stickers</p>
        </div>
        <div className="sol-finitions-layout">
          <ul className="sol-finish-rail">
            {finishes.map((f) => (
              <li key={f.name}>
                <span className={`finish-swatch finish-swatch--${f.tone}`} aria-hidden="true" />
                <strong>{f.name}</strong>
              </li>
            ))}
          </ul>
          <aside className="sol-finish-cta">
            <img src={`${A}photos/dore-2.jpg`} alt="" />
            <div className="sol-finish-cta-copy">
              <h3>Des finitions qui font la différence&nbsp;!</h3>
              <AppLink className="btn btn-outline-light" href="/matieres-finitions">
                Voir toutes les finitions <FaArrowRight aria-hidden="true" />
              </AppLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="sol-config">
        <div className="sol-config-copy">
          <h2>Configurez votre sticker en quelques clics</h2>
          <p>Type, matière, finition, dimensions, quantité et découpe — le prix s&apos;affiche en temps réel.</p>
          <AppLink className="btn btn-dark sol-config-btn" href="/configurateur">
            Lancer le configurateur <FaArrowRight aria-hidden="true" />
          </AppLink>
        </div>
        <ol className="sol-config-steps">
          {configSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.label}>
                <span className="sol-step-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="sol-step-num">{i + 1}</span>
                <span className="sol-step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function MatieresFinitionsPage() {
  return (
    <main className="page page-solutions page-matieres">
      <section className="sol-hero">
        <div className="sol-hero-media" aria-hidden="true">
          <img className="sol-hero-bg" src={`${A}photos/uv-vernis-2.jpg`} alt="" />
          <div className="sol-hero-shade" />
        </div>
        <div className="sol-hero-inner">
          <div className="sol-hero-copy">
            <p className="sol-kicker">Matières &amp; Finitions</p>
            <h1>
              Donnez du <em>caractère</em> à vos stickers
            </h1>
            <p className="sol-hero-lead">
              Choisissez la matière, l&apos;aspect et la finition qui correspondent à votre marque, à votre support et à
              l&apos;environnement d&apos;utilisation.
            </p>
            <a className="btn btn-primary sol-hero-cta" href="#matieres">
              Découvrir nos matières <FaArrowRight aria-hidden="true" />
            </a>
          </div>
          <p className="sol-hero-aside" aria-hidden="true">
            Matière + finition.
            <br />
            Le bon choix pour le bon usage.
          </p>
        </div>
      </section>

      <section className="sol-trust" aria-label="Points forts">
        <ul>
          {matieresTrust.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sol-usage mf-matieres" id="matieres">
        <div className="sol-section-head">
          <h2>Nos matières</h2>
          <p>Des supports adaptés à chaque projet</p>
        </div>
        <div className="usage-grid mf-matieres-grid">
          {materials.map((item) => {
            const Icon = item.icon;
            return (
              <article className="usage-card" key={item.name}>
                <div className="usage-card-media">
                  <img src={`${A}${item.image}`} alt="" />
                  <span className="usage-card-icon" aria-hidden="true">
                    <Icon />
                  </span>
                </div>
                <div className="usage-card-body">
                  <h3>{item.name}</h3>
                  <p>{item.traits}</p>
                  <p className="mf-matiere-ideal">{item.ideal}</p>
                  <AppLink className="usage-card-link" href="/configurateur">
                    Choisir <FaArrowRight aria-hidden="true" />
                  </AppLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sol-finitions" id="page-finitions">
        <div className="sol-section-head sol-section-head--left">
          <h2>Nos finitions</h2>
          <p>Le détail qui fait la différence</p>
        </div>
        <div className="sol-finitions-layout">
          <ul className="sol-finish-rail mf-finish-rail">
            {pageFinishes.map((f) => (
              <li key={f.name}>
                <span className={`finish-swatch finish-swatch--${f.tone}`} aria-hidden="true" />
                <strong>{f.name}</strong>
              </li>
            ))}
          </ul>
          <aside className="sol-finish-cta">
            <img src={`${A}photos/argente-1.jpg`} alt="" />
            <div className="sol-finish-cta-copy">
              <h3>Des finitions qui font la différence&nbsp;!</h3>
              <AppLink className="btn btn-outline-light" href="/configurateur">
                Configurer mon sticker <FaArrowRight aria-hidden="true" />
              </AppLink>
            </div>
          </aside>
        </div>
      </section>

      <MaterialMatrix />

      <section className="sol-config">
        <div className="sol-config-copy">
          <h2>Besoin d&apos;aide pour choisir&nbsp;?</h2>
          <p>
            Indiquez votre usage, votre support et votre quantité&nbsp;: nous vous orientons vers la bonne combinaison.
          </p>
          <AppLink className="btn btn-dark sol-config-btn" href="/configurateur">
            Configurer mon sticker <FaArrowRight aria-hidden="true" />
          </AppLink>
        </div>
        <ol className="sol-config-steps">
          {configSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.label}>
                <span className="sol-step-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="sol-step-num">{i + 1}</span>
                <span className="sol-step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function ApplicationsPage() {
  return (
    <main className="page page-solutions page-applications">
      <section className="sol-hero">
        <div className="sol-hero-media" aria-hidden="true">
          <img className="sol-hero-bg" src={`${A}photos/uv-vernis-2.jpg`} alt="" />
          <div className="sol-hero-shade" />
        </div>
        <div className="sol-hero-inner">
          <div className="sol-hero-copy">
            <p className="sol-kicker">Applications</p>
            <h1>
              Des stickers pour chaque <em>secteur</em>
            </h1>
            <p className="sol-hero-lead">
              Vous n&apos;avez pas besoin de connaître la technique&nbsp;: partez de votre activité, nous vous aidons à
              choisir la bonne solution, la bonne matière et la bonne finition.
            </p>
            <a className="btn btn-primary sol-hero-cta" href="#secteurs">
              Voir les applications <FaArrowRight aria-hidden="true" />
            </a>
          </div>
          <p className="sol-hero-aside" aria-hidden="true">
            Votre activité, notre savoir-faire&nbsp;!
          </p>
        </div>
      </section>

      <section className="sol-trust" aria-label="Points forts">
        <ul>
          {applicationsTrust.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sol-usage" id="secteurs">
        <div className="sol-section-head">
          <h2>Applications &amp; secteurs</h2>
          <p>Des stickers adaptés à votre métier et à vos supports.</p>
        </div>
        <div className="usage-grid">
          {sectors.map((item) => {
            const Icon = item.icon;
            return (
              <article className="usage-card" key={item.title}>
                <div className="usage-card-media">
                  <img src={`${A}${item.image}`} alt="" />
                  <span className="usage-card-icon" aria-hidden="true">
                    <Icon />
                  </span>
                </div>
                <div className="usage-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <AppLink className="usage-card-link" href="/configurateur">
                    Commander <FaArrowRight aria-hidden="true" />
                  </AppLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sol-config" id="comment-ca-marche">
        <div className="sol-config-copy">
          <h2>Comment ça marche&nbsp;?</h2>
          <p>
            Choisissez votre solution, configurez-la, envoyez votre fichier&nbsp;: nous produisons, contrôlons et livrons
            partout au Maroc. Un BAT vous est transmis si nécessaire.
          </p>
          <AppLink className="btn btn-dark sol-config-btn" href="/configurateur">
            Commander mes stickers <FaArrowRight aria-hidden="true" />
          </AppLink>
        </div>
        <ol className="sol-config-steps">
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.label}>
                <span className="sol-step-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="sol-step-num">{i + 1}</span>
                <span className="sol-step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function HomePage() {
  return (
    <main>
      <Hero />
      <Solutions />
      <Finitions />
      <Besoins />
      <Techno />
    </main>
  );
}

function Techno() {
  return (
    <section className="techno" id="techno">
      <div className="techno-media">
        <img src={`${A}photos/uv-vernis-2.jpg`} alt="Sticker Comstore imprimé en UV avec vernis sélectif" />
        <div className="techno-brands">
          <p className="techno-brand-logos">
            <strong>Roland</strong>
            <span aria-hidden="true">|</span>
            <strong className="techno-brand-mimaki">Mimaki</strong>
          </p>
          <em>Technologies d&apos;impression de pointe</em>
        </div>
      </div>
      <div className="techno-copy">
        <span className="techno-accent" aria-hidden="true" />
        <h2>Une technologie professionnelle</h2>
        <p>
          Grâce à nos imprimantes Roland et Mimaki et à nos machines de découpe de précision, nous vous garantissons
          une qualité d&apos;impression exceptionnelle, des couleurs éclatantes et une grande résistance, même en
          extérieur.
        </p>
        <ul className="techno-features">
          <li>
            <span className="feature-icon">
              <FaCog />
            </span>
            <div>
              <strong>Haute résolution</strong>
              <span>jusqu&apos;à 1440 dpi</span>
            </div>
          </li>
          <li>
            <span className="feature-icon">
              <FaTint />
            </span>
            <div>
              <strong>Encres UV &amp; éco-solvant</strong>
              <span>selon support et usage</span>
            </div>
          </li>
          <li>
            <span className="feature-icon">
              <FaCut />
            </span>
            <div>
              <strong>Découpe à la forme</strong>
              <span>ou en bande</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

function Finitions() {
  return (
    <section className="finitions" id="finitions">
      <div className="finitions-layout">
        <div className="finitions-main">
          <div className="finitions-head">
            <h2>Nos finitions</h2>
            <p>Parce que chaque détail compte</p>
          </div>
          <div className="finish-rail">
            <ul className="finish-grid">
              {finishes.map((f) => (
                <li key={f.name}>
                  <span className={`finish-swatch finish-swatch--${f.tone}`} aria-hidden="true" />
                  <strong>{f.name}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="finish-spotlight">
          <img src={`${A}photos/dore-2.jpg`} alt="" aria-hidden="true" />
          <div className="finish-spotlight-copy">
            <p>Des finitions haut de gamme pour un rendu professionnel.</p>
            <AppLink className="btn btn-outline-light" href="/matieres-finitions">
              Voir toutes les finitions <FaArrowRight aria-hidden="true" />
            </AppLink>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Besoins() {
  const [active, setActive] = useState(0);

  return (
    <section className="besoins" id="besoins">
      <div className="besoins-layout">
        <div className="besoins-picker">
          <div className="besoins-picker-head">
            <h2>Quel sticker pour votre besoin&nbsp;?</h2>
            <p>Vous avez un projet&nbsp;? Nous avons la solution.</p>
          </div>
          <div className="need-grid" role="list">
            {needs.map((need, i) => {
              const Icon = need.icon;
              return (
                <button
                  key={need.label}
                  type="button"
                  role="listitem"
                  className={`need-card ${active === i ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <Icon aria-hidden="true" />
                  <span>{need.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <article className="config-panel" id="configurer">
          <img src={`${A}photos/dore-2.jpg`} alt="Sticker doré Comstore tenu en main" />
          <div className="config-panel-copy">
            <h3>Créez votre sticker sur mesure</h3>
            <p>
              Choisissez le type, la matière, la finition, la taille et la quantité. Le prix s&apos;affiche en temps
              réel&nbsp;!
            </p>
            <AppLink className="btn btn-primary config-btn" href={`/configurateur?type=${needs[active].type}`}>
              Configurer mon sticker <FaArrowRight aria-hidden="true" />
            </AppLink>
          </div>
        </article>
      </div>
    </section>
  );
}

const PREFOOTER_ICONS = [FaLeaf, FaTruck, FaCommentDots];
const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", icon: FaFacebookF },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "tiktok", label: "TikTok", icon: FaTiktok },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn },
  { key: "youtube", label: "YouTube", icon: FaYoutube },
];

function Footer() {
  const { prefooter = [], socials = {}, copyright, topbar, contact } = useSiteData().site;
  const phone = topbar?.phone || contact?.whatsapp;
  return (
    <footer id="footer">
      <section className="prefooter" id="contact">
        {prefooter.slice(0, 3).map((item, i) => {
          const Icon = PREFOOTER_ICONS[i] ?? FaLeaf;
          const isCta = i === 2;
          return (
            <article className={`prefooter-item ${isCta ? "prefooter-item--cta" : ""}`} key={i}>
              <span className="prefooter-icon" aria-hidden="true">
                <Icon />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                {isCta && (
                  <AppLink className="btn btn-ghost prefooter-btn" href="/contact">
                    Nous contacter <FaArrowRight aria-hidden="true" />
                  </AppLink>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <div className="footer-main">
        <LogoMark light className="footer-brand" />
        <nav className="footer-nav" aria-label="Pied de page">
          {navLinks.map((link) => (
            <AppLink key={link.label} href={link.href}>
              {link.label}
            </AppLink>
          ))}
        </nav>
        <div className="socials">
          {SOCIAL_LINKS.map(({ key, label, icon: Icon }) =>
            socials[key] ? (
              <a key={key} href={socials[key]} aria-label={label} target="_blank" rel="noreferrer">
                <Icon />
              </a>
            ) : (
              <a key={key} href="#footer" aria-label={label}>
                <Icon />
              </a>
            ),
          )}
        </div>
      </div>

      <div className="legal">
        <span>{copyright}</span>
        <nav className="legal-nav" aria-label="Informations légales">
          <a href="#footer">Mentions légales</a>
          <a href="#footer">CGV</a>
          <a href="#footer">Politique de confidentialité</a>
        </nav>
      </div>
    </footer>
  );
}

const PAGE_TITLES = {
  solutions: "Nos solutions — Stickers vitrine, véhicule, packaging | Stick'Arts",
  matieres: "Matières & Finitions — Sticker vinyle, transparent, holographique | Stick'Arts",
  applications: "Applications — Stickers personnalisés pour chaque secteur | Stick'Arts",
  configurateur: "Configurateur — Commandez vos stickers personnalisés | Stick'Arts",
  commande: "Finaliser ma commande | Stick'Arts",
  apropos: "À propos — Stick'Arts by Comstore, atelier de stickers personnalisés au Maroc",
  contact: "Contact — Devis et conseils stickers personnalisés | Stick'Arts",
  home: "Stickers personnalisés Maroc — Impression UV & éco-solvant | Stick'Arts",
};

function resolvePage(path, products) {
  if (path === "/admin" || path.startsWith("/admin/")) return { page: "admin" };
  if (path === "/solutions") return { page: "solutions" };
  if (path === "/matieres-finitions") return { page: "matieres" };
  if (path === "/applications") return { page: "applications" };
  if (path === "/configurateur") return { page: "configurateur" };
  if (path === "/commande") return { page: "commande" };
  if (path === "/a-propos") return { page: "apropos" };
  if (path === "/contact") return { page: "contact" };
  const match = path.match(/^\/produit\/([^/]+)$/);
  if (match && products[match[1]]) return { page: "produit", product: products[match[1]] };
  return { page: "home" };
}

export function App() {
  const { path } = useLocation();
  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <Suspense fallback={<div className="admin-boot">Chargement…</div>}>
        <AdminApp />
      </Suspense>
    );
  }
  return <PublicSite />;
}

function PublicSite() {
  const cart = useCart();
  const { products } = useSiteData();
  const { path, search } = useLocation();
  const { page, product } = resolvePage(path, products);

  useEffect(() => {
    document.title =
      page === "produit" ? `${product.name} — Stickers personnalisés Maroc | Stick'Arts` : PAGE_TITLES[page];

    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [path, search, page, product]);

  return (
    <>
      <Header cartOpen={cart.open} setCartOpen={cart.setOpen} cartCount={cart.items.length} path={path} />
      {page === "solutions" ? (
        <SolutionsPage />
      ) : page === "matieres" ? (
        <MatieresFinitionsPage />
      ) : page === "applications" ? (
        <ApplicationsPage />
      ) : page === "configurateur" ? (
        <ConfiguratorPage key={search} />
      ) : page === "apropos" ? (
        <AboutPage />
      ) : page === "contact" ? (
        <ContactPage />
      ) : page === "commande" ? (
        <CheckoutPage />
      ) : page === "produit" ? (
        <ProductPage key={product.slug} product={product} />
      ) : (
        <HomePage />
      )}
      <Footer />
      <CartDrawer open={cart.open} onClose={() => cart.setOpen(false)} items={cart.items} onRemove={cart.remove} />
    </>
  );
}
