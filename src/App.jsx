import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBars,
  FaBoxOpen,
  FaCar,
  FaAward,
  FaCalendarAlt,
  FaCog,
  FaCrosshairs,
  FaCut,
  FaFacebookF,
  FaHandHoldingHeart,
  FaHome,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaTint,
  FaSearch,
  FaShieldAlt,
  FaShoppingBag,
  FaStar,
  FaStore,
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
  { label: "Accueil", href: "#top", active: true },
  { label: "Stickers", href: "#solutions" },
  { label: "Matières & Finitions", href: "#finitions" },
  { label: "Applications", href: "#besoins" },
  { label: "Comment ça marche ?", href: "#techno" },
  { label: "Tarifs", href: "#configurer" },
  { label: "À propos", href: "#footer" },
  { label: "Contact", href: "#contact" },
];

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

const needs = [
  { label: "Mon packaging", icon: FaBoxOpen },
  { label: "Mon véhicule", icon: FaCar },
  { label: "Ma vitrine", icon: FaStore },
  { label: "Mes produits", icon: FaWineBottle },
  { label: "Ma décoration", icon: FaHome },
  { label: "Mes étiquettes", icon: FaTag },
  { label: "Mon événement", icon: FaCalendarAlt },
];

function LogoMark({ className = "", light = false }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""} ${className}`} href="#top" aria-label="Stick'Art — Accueil">
      <span className="logo-mark" aria-hidden="true" />
      <span className="logo-text">
        <strong>
          STICK<span className="logo-accent">'</span>ART
        </strong>
        <em>Vos idées prennent vie</em>
      </span>
    </a>
  );
}

function Header({ cartOpen, setCartOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("locked", mobileOpen || cartOpen);
    return () => document.body.classList.remove("locked");
  }, [mobileOpen, cartOpen]);

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
            <a key={link.label} href={link.href} className={link.active ? "is-active" : undefined}>
              {link.label}
            </a>
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
          <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
            {link.label}
          </a>
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

function Solutions() {
  return (
    <section className="solutions" id="solutions">
      <div className="section-head">
        <div>
          <h2>Nos solutions</h2>
          <p>Des stickers pour tous vos projets</p>
        </div>
      </div>
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
            <a className="shop-btn" href="#configurer">
              Shop now
            </a>
          </article>
        ))}
      </div>
    </section>
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
        <div>
          <FaHandHoldingHeart aria-hidden="true" />
          <div>
            <strong>Qualité &amp; savoir-faire</strong>
            <span>Impression pro Roland &amp; Mimaki</span>
          </div>
        </div>
        <div>
          <FaTruck aria-hidden="true" />
          <div>
            <strong>Livraison rapide</strong>
            <span>Partout au Maroc</span>
          </div>
        </div>
        <div className="prefooter-cta">
          <FaPhoneAlt aria-hidden="true" />
          <div>
            <strong>Besoin d&apos;un conseil&nbsp;?</strong>
            <span>Notre équipe vous répond</span>
          </div>
          <a className="btn btn-primary" href="tel:+212612345678">
            Nous contacter <FaArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <div className="footer-main">
        <LogoMark light />
        <nav aria-label="Pied de page">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
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
        <span>
          <a href="#footer">Mentions légales</a> · <a href="#footer">CGV</a> · <a href="#footer">Confidentialité</a>
        </span>
      </div>
    </footer>
  );
}

export function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Header cartOpen={cartOpen} setCartOpen={setCartOpen} />
      <main>
        <Hero />
        <Solutions />
        <Finitions />
        <Besoins />
        <Techno />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
