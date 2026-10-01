import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBars,
  FaBoxOpen,
  FaCar,
  FaAward,
  FaCalendarAlt,
  FaCheck,
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
  FaTruck,
  FaUser,
  FaWineBottle,
  FaYoutube,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const A = "/assets/images/";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Nos solutions", href: "/solutions" },
  { label: "Matières & Finitions", href: "/matieres-finitions" },
  { label: "Applications", href: "/#besoins" },
  { label: "Comment ça marche ?", href: "/#techno" },
  { label: "Tarifs", href: "/#configurer" },
  { label: "À propos", href: "/#footer" },
  { label: "Contact", href: "/#contact" },
];

function normalizePath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean;
}

function usePath() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onChange = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  return path;
}

function navigate(to) {
  const url = new URL(to, window.location.origin);
  const nextPath = normalizePath(url.pathname);
  const currentPath = normalizePath(window.location.pathname);
  const next = `${url.pathname}${url.search}${url.hash}`;

  if (nextPath === currentPath) {
    window.history.pushState({}, "", next);
    if (url.hash) {
      document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
    return;
  }

  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function isNavActive(href, path) {
  if (href === "/") return path === "/";
  if (href === "/solutions") return path === "/solutions";
  if (href === "/matieres-finitions") return path === "/matieres-finitions";
  return false;
}

function AppLink({ href, className = "", children, onClick, ...rest }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

const solutions = [
  {
    name: "Die Cut Stickers",
    image: "die-cut.png",
    badge: "Popular",
    accent: false,
    fit: "contain",
  },
  {
    name: "Embossed Stickers",
    image: "embossed.png",
    badge: "Studio pick",
    accent: true,
    fit: "contain",
  },
  {
    name: "Circle Stickers",
    image: "circle.png",
    accent: false,
    fit: "contain",
  },
  {
    name: "Sample Pack",
    image: "sample-pack.jpg",
    accent: false,
    fit: "cover",
    framed: true,
  },
  {
    name: "Holographic Stickers",
    image: "holographic.png",
    badge: "New",
    accent: false,
    fit: "contain",
  },
  {
    name: "Vehicle Stickers",
    image: "review-1.png",
    accent: false,
    fit: "cover",
    framed: true,
  },
  {
    name: "UV Stickers",
    image: "review-2.png",
    accent: true,
    fit: "cover",
    framed: true,
  },
];

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
    name: "Vinyle brillant",
    traits: "Couleurs éclatantes • finition lumineuse",
    ideal: "Idéal pour packaging, vitrines et promotion",
    image: "die-cut.png",
    icon: FaStar,
  },
  {
    name: "Vinyle mat",
    traits: "Aspect élégant • peu de reflets",
    ideal: "Idéal pour marques premium et décoration",
    image: "embossed.png",
    icon: FaLayerGroup,
  },
  {
    name: "Transparent",
    traits: "Effet sans fond • rendu moderne",
    ideal: "Idéal pour bouteilles, vitrines et supports clairs",
    image: "circle.png",
    icon: FaTint,
  },
  {
    name: "Vinyle blanc",
    traits: "Support polyvalent • excellente opacité",
    ideal: "Pour stickers et étiquettes du quotidien",
    image: "sample-pack.jpg",
    icon: FaTag,
  },
  {
    name: "Holographique",
    traits: "Effet irisé • rendu spectaculaire",
    ideal: "Pour événements, édition limitée et premium",
    image: "holographic.png",
    icon: FaAward,
  },
  {
    name: "Films techniques",
    traits: "Repositionnable • dépoli • microperforé",
    ideal: "Pour usages spécifiques et signalétique",
    image: "dtf.jpg",
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
  { label: "Mon packaging", icon: FaBoxOpen },
  { label: "Mon véhicule", icon: FaCar },
  { label: "Ma vitrine", icon: FaStore },
  { label: "Mes produits", icon: FaWineBottle },
  { label: "Ma décoration", icon: FaHome },
  { label: "Mes étiquettes", icon: FaTag },
  { label: "Mon événement", icon: FaCalendarAlt },
];

const usageSolutions = [
  {
    title: "Packaging",
    desc: "Valorisez vos produits avec des stickers premium pour emballages et coffrets.",
    image: "sample-pack.jpg",
    icon: FaBoxOpen,
  },
  {
    title: "Vitrine",
    desc: "Attirez l'œil avec des adhésifs vitrine impactants pour vos promos et messages.",
    image: "benefit-1.png",
    icon: FaStore,
  },
  {
    title: "Véhicule",
    desc: "Habillage partiel ou total, résistant aux UV et aux intempéries.",
    image: "review-1.png",
    icon: FaCar,
  },
  {
    title: "Étiquettes",
    desc: "Étiquettes produits, pots et flacons avec découpe précise et finitions soignées.",
    image: "circle.png",
    icon: FaTag,
  },
  {
    title: "Décoration",
    desc: "Stickers muraux et déco intérieure pour un rendu net et durable.",
    image: "holographic.png",
    icon: FaHome,
  },
  {
    title: "Événement",
    desc: "Badges, goodies et signalétique pour vos salons, lancements et activations.",
    image: "hero-tent.png",
    icon: FaCalendarAlt,
  },
  {
    title: "Industriel",
    desc: "Marquage technique, sécurité et identification haute tenue.",
    image: "dtf.jpg",
    icon: FaIndustry,
  },
  {
    title: "Premium",
    desc: "Effets métalliques, vernis sélectif et finitions haut de gamme pour vos marques.",
    image: "embossed.png",
    icon: FaStar,
  },
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
    image: "hero-printer.jpg",
  },
  {
    title: "Éco-solvant",
    icon: FaLeaf,
    points: ["Durabilité extérieur", "Couleurs naturelles", "Idéal véhicules & grands formats"],
    image: "benefit-2.png",
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

function Header({ cartOpen, setCartOpen, path }) {
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
        <p className="topbar-left">Impression numérique haute définition | Roland &amp; Mimaki</p>
        <div className="topbar-center">
          <span>
            <FaTruck aria-hidden="true" /> Livraison partout au Maroc
          </span>
          <span>
            <FaShieldAlt aria-hidden="true" /> Paiement sécurisé
          </span>
        </div>
        <a className="topbar-phone" href="tel:+212612345678">
          <FaPhoneAlt aria-hidden="true" /> +212 6 12 34 56 78
        </a>
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
          <button className="icon-btn" aria-label="Rechercher" type="button">
            <FaSearch />
          </button>
          <button className="icon-btn" aria-label="Compte" type="button">
            <FaUser />
          </button>
          <button className="icon-btn cart-btn" aria-label="Panier" type="button" onClick={() => setCartOpen(true)}>
            <FaShoppingBag />
            <span className="cart-count">0</span>
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

function CartDrawer({ open, onClose }) {
  return (
    <>
      <div className={`cart-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <button className="drawer-close" type="button" onClick={onClose} aria-label="Fermer le panier">
          <IoClose />
        </button>
        <div className="cart-empty">
          <h2>Votre panier est vide</h2>
          <p>Connectez-vous pour commander plus rapidement.</p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Continuer mes achats
          </button>
        </div>
      </aside>
    </>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media" aria-hidden="true">
        <img className="hero-bg" src={`${A}hero-printer.jpg`} alt="" />
        <div className="hero-shade" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-kicker">
            Stickers personnalisés
            <span className="hero-kicker-rule" aria-hidden="true" />
          </p>
          <h1>
            Imprimez votre identité.
            <br />
            Collez votre <em>créativité.</em>
          </h1>
          <div className="hero-copy">
            <p>
              Des stickers professionnels imprimés à la demande avec les technologies d&apos;impression numérique
              haute définition Roland et Mimaki.
            </p>
            <p>
              Du simple autocollant promotionnel au sticker premium pour packaging, vitrine, véhicule ou décoration,
              nous vous proposons une solution adaptée à chaque projet.
            </p>
          </div>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#configurer">
              Commander mes stickers <FaArrowRight aria-hidden="true" />
            </a>
            <a className="btn btn-ghost" href="#contact">
              Demander un devis
            </a>
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
          <span>Votre design.</span>
          <span>Votre format.</span>
          <span>Votre finition.</span>
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
            key={item.name}
            style={{ "--tilt": `${i % 2 === 0 ? -1.2 : 1.2}deg` }}
          >
            {item.badge && <span className="solution-badge">{item.badge}</span>}
            <h3>{item.name}</h3>
            <div className={`solution-image solution-image--${item.fit}`}>
              <img src={`${A}${item.image}`} alt={item.name} />
            </div>
            <Stars />
            <AppLink className="shop-btn" href="/#configurer">
              Shop now
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
          <img className="sol-hero-bg" src={`${A}hero-printer.jpg`} alt="" />
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
                  <AppLink className="usage-card-link" href="/#configurer">
                    Découvrir <FaArrowRight aria-hidden="true" />
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
            <img src={`${A}hero-stamp.png`} alt="" />
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
          <AppLink className="btn btn-dark sol-config-btn" href="/#configurer">
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
          <img className="sol-hero-bg" src={`${A}hero-printer.jpg`} alt="" />
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
                  <AppLink className="usage-card-link" href="/#configurer">
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
            <img src={`${A}embossed.png`} alt="" />
            <div className="sol-finish-cta-copy">
              <h3>Des finitions qui font la différence&nbsp;!</h3>
              <AppLink className="btn btn-outline-light" href="/#configurer">
                Configurer mon sticker <FaArrowRight aria-hidden="true" />
              </AppLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="sol-config">
        <div className="sol-config-copy">
          <h2>Besoin d&apos;aide pour choisir&nbsp;?</h2>
          <p>
            Indiquez votre usage, votre support et votre quantité&nbsp;: nous vous orientons vers la bonne combinaison.
          </p>
          <AppLink className="btn btn-dark sol-config-btn" href="/#configurer">
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
        <img src={`${A}hero-printer.jpg`} alt="Impression professionnelle Roland et Mimaki" />
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
              <span>sans odeur et haute tenue</span>
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
      <div className="finitions-head">
        <h2>Nos finitions</h2>
        <p>Parce que chaque détail compte</p>
      </div>
      <div className="finitions-layout">
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
        <aside className="finish-spotlight">
          <img src={`${A}embossed.png`} alt="Sticker effet métallique premium" />
          <p>Des finitions haut de gamme pour un rendu professionnel.</p>
          <a className="btn btn-outline-light" href="#finitions">
            Voir toutes les finitions <FaArrowRight aria-hidden="true" />
          </a>
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
          <img src={`${A}hero-stamp.png`} alt="Main décollant un sticker personnalisé" />
          <div className="config-panel-copy">
            <h3>Créez votre sticker sur mesure</h3>
            <p>
              Choisissez le type, la matière, la finition, la taille et la quantité. Le prix s&apos;affiche en temps
              réel&nbsp;!
            </p>
            <a className="btn btn-primary config-btn" href="#contact">
              Configurer mon sticker <FaArrowRight aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer">
      <section className="prefooter" id="contact">
        <article className="prefooter-item">
          <span className="prefooter-icon" aria-hidden="true">
            <FaLeaf />
          </span>
          <div>
            <strong>Qualité &amp; savoir-faire</strong>
            <p>Une équipe passionnée à votre service pour un résultat à la hauteur de vos attentes.</p>
          </div>
        </article>
        <article className="prefooter-item">
          <span className="prefooter-icon" aria-hidden="true">
            <FaTruck />
          </span>
          <div>
            <strong>Livraison rapide</strong>
            <p>Partout au Maroc, en toute sécurité.</p>
          </div>
        </article>
        <article className="prefooter-item prefooter-item--cta">
          <span className="prefooter-icon" aria-hidden="true">
            <FaCommentDots />
          </span>
          <div>
            <strong>Besoin d&apos;un conseil&nbsp;?</strong>
            <p>Contactez-nous, nous vous accompagnons dans votre projet.</p>
            <a className="btn btn-ghost prefooter-btn" href="tel:+212612345678">
              Nous contacter <FaArrowRight aria-hidden="true" />
            </a>
          </div>
        </article>
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
          <a href="#footer" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#footer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#footer" aria-label="TikTok">
            <FaTiktok />
          </a>
          <a href="#footer" aria-label="LinkedIn">
            <FaLinkedinIn />
          </a>
          <a href="#footer" aria-label="YouTube">
            <FaYoutube />
          </a>
        </div>
      </div>

      <div className="legal">
        <span>© 2026 Stick&apos;Art. Tous droits réservés.</span>
        <nav className="legal-nav" aria-label="Informations légales">
          <a href="#footer">Mentions légales</a>
          <a href="#footer">CGV</a>
          <a href="#footer">Politique de confidentialité</a>
        </nav>
      </div>
    </footer>
  );
}

export function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const path = usePath();

  const page =
    path === "/solutions" ? "solutions" : path === "/matieres-finitions" ? "matieres" : "home";

  useEffect(() => {
    document.title =
      page === "solutions"
        ? "Nos solutions | Stick'Art"
        : page === "matieres"
          ? "Matières & Finitions | Stick'Art"
          : "Stick'Art | Stickers personnalisés professionnels";

    const hash = window.location.hash.slice(1);
    if (path === "/" && hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [path, page]);

  return (
    <>
      <Header cartOpen={cartOpen} setCartOpen={setCartOpen} path={path} />
      {page === "solutions" ? <SolutionsPage /> : page === "matieres" ? <MatieresFinitionsPage /> : <HomePage />}
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
