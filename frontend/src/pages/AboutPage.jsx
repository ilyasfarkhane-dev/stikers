import {
  FaArrowRight,
  FaCheck,
  FaClipboardCheck,
  FaCloudUploadAlt,
  FaCog,
  FaCommentDots,
  FaCrosshairs,
  FaCut,
  FaLayerGroup,
  FaPrint,
  FaQuoteLeft,
  FaSun,
  FaTag,
  FaTruck,
} from "react-icons/fa";
import { AppLink } from "../router.jsx";

const A = "/assets/images/";

const TRUST = [
  { label: "Imprimantes Roland & Mimaki", icon: FaPrint },
  { label: "Impression UV & éco-solvant", icon: FaSun },
  { label: "Découpe de précision", icon: FaCut },
  { label: "Livraison partout au Maroc", icon: FaTruck },
];

const WORKSHOP = [
  {
    title: "Imprimantes Roland & Mimaki",
    text: "Une impression numérique haute définition pour des couleurs nettes et lumineuses, du petit autocollant au sticker premium.",
    image: "photos/uv-vernis-2.jpg",
    icon: FaPrint,
  },
  {
    title: "Impression UV & éco-solvant",
    text: "L'UV pour les rendus premium, le blanc et le vernis sélectif ; l'éco-solvant pour les vinyles, vitrines et la signalétique.",
    image: "photos/eco-solvant-1.jpg",
    icon: FaSun,
  },
  {
    title: "Découpe de précision",
    text: "Nos machines de découpe façonnent vos stickers à la forme, en carré, en rond ou en bande selon votre projet.",
    image: "photos/hologramme-2.jpg",
    icon: FaCut,
  },
];

const VALUES = [
  {
    title: "Le besoin d'abord",
    text: "Packaging, vitrine, véhicule, étiquettes : on part de votre usage pour choisir la bonne solution.",
    icon: FaCrosshairs,
  },
  {
    title: "Conseil matière & finition",
    text: "Vinyle, transparent, premium, holographique : nous vous orientons vers la combinaison adaptée.",
    icon: FaCommentDots,
  },
  {
    title: "Contrôle de fichier & BAT",
    text: "Chaque fichier est vérifié avant impression ; un BAT vous est envoyé si nécessaire.",
    icon: FaClipboardCheck,
  },
  {
    title: "Retrait ou livraison",
    text: "Retirez votre commande à l'atelier ou faites-vous livrer partout au Maroc.",
    icon: FaTruck,
  },
];

const PROCESS = [
  { label: "Choix de la solution", icon: FaTag },
  { label: "Configuration", icon: FaLayerGroup },
  { label: "Envoi du fichier", icon: FaCloudUploadAlt },
  { label: "Production & BAT", icon: FaCog },
  { label: "Contrôle qualité", icon: FaCheck },
  { label: "Livraison", icon: FaTruck },
];

export function AboutPage() {
  return (
    <main className="page page-solutions page-about">
      <section className="sol-hero">
        <div className="sol-hero-media" aria-hidden="true">
          <img className="sol-hero-bg" src={`${A}photos/dore-1.jpg`} alt="" />
          <div className="sol-hero-shade" />
        </div>
        <div className="sol-hero-inner">
          <div className="sol-hero-copy">
            <p className="sol-kicker">À propos</p>
            <h1>
              Stick&apos;Arts, l&apos;atelier stickers de <em>Comstore</em>
            </h1>
            <p className="sol-hero-lead">
              Impression, publicité, gadgeterie&nbsp;: Comstore a créé Stick&apos;Arts pour transformer vos idées en stickers
              professionnels, imprimés à la demande avec nos technologies Roland &amp; Mimaki.
            </p>
            <div className="ab-hero-actions">
              <AppLink className="btn btn-primary sol-hero-cta" href="/configurateur">
                Configurer mon sticker <FaArrowRight aria-hidden="true" />
              </AppLink>
              <AppLink className="btn btn-outline-light" href="/contact">
                Nous contacter
              </AppLink>
            </div>
          </div>
          <p className="sol-hero-aside" aria-hidden="true">
            Vos idées prennent vie&nbsp;!
          </p>
        </div>
      </section>

      <section className="sol-trust" aria-label="Points forts">
        <ul>
          {TRUST.map(({ label, icon: Icon }) => (
            <li key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ab-story">
        <div className="ab-story-media">
          <img className="ab-story-main" src={`${A}photos/argente-1.jpg`} alt="Sticker argenté Comstore" />
          <img className="ab-story-small" src={`${A}photos/transparent-1.jpg`} alt="Sticker transparent Comstore" />
          <span className="ab-story-badge">
            <strong>Roland</strong>
            <em>&amp;</em>
            <strong>Mimaki</strong>
          </span>
        </div>
        <div className="ab-story-copy">
          <p className="shop-kicker">
            Qui sommes-nous&nbsp;?
            <span aria-hidden="true" />
          </p>
          <h2>
            Imprimez votre identité. <em>Collez votre créativité.</em>
          </h2>
          <p>
            Stick&apos;Arts est la marque stickers de Comstore. Notre mission&nbsp;: transformer votre besoin en sticker prêt à
            coller — de la solution à la matière, de la finition au format, jusqu&apos;à la livraison.
          </p>
          <p>
            Du simple autocollant promotionnel au sticker premium pour packaging, vitrine, véhicule ou décoration, nous vous
            proposons une solution adaptée à chaque projet, que vous soyez une entreprise, un commerçant, un créateur ou un
            particulier.
          </p>
          <ul className="ab-story-points">
            <li>
              <FaCheck aria-hidden="true" /> Commande en ligne ou sur devis pour les projets spécifiques
            </li>
            <li>
              <FaCheck aria-hidden="true" /> Un large choix de matières et de finitions
            </li>
            <li>
              <FaCheck aria-hidden="true" /> Un accompagnement du fichier jusqu&apos;à la livraison
            </li>
          </ul>
        </div>
      </section>

      <section className="sol-usage ab-workshop">
        <div className="sol-section-head">
          <h2>Notre atelier &amp; nos équipements</h2>
          <p>Des machines professionnelles pour un rendu à la hauteur de votre marque.</p>
        </div>
        <div className="ab-workshop-grid">
          {WORKSHOP.map(({ title, text, image, icon: Icon }) => (
            <article className="usage-card" key={title}>
              <div className="usage-card-media">
                <img src={`${A}${image}`} alt="" />
                <span className="usage-card-icon" aria-hidden="true">
                  <Icon />
                </span>
              </div>
              <div className="usage-card-body">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ab-values">
        <div className="ab-values-inner">
          <div className="ab-values-head">
            <p className="sol-kicker sol-kicker--on-dark">Notre savoir-faire</p>
            <h2>Ce qui nous guide au quotidien</h2>
            <blockquote>
              <FaQuoteLeft aria-hidden="true" />
              Vous n&apos;avez pas besoin de connaître la technique&nbsp;: nous vous aidons à choisir la bonne solution.
            </blockquote>
          </div>
          <ul className="ab-values-grid">
            {VALUES.map(({ title, text, icon: Icon }) => (
              <li key={title}>
                <span className="ab-value-icon" aria-hidden="true">
                  <Icon />
                </span>
                <strong>{title}</strong>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sol-config">
        <div className="sol-config-copy">
          <h2>Un projet en tête&nbsp;?</h2>
          <p>Choisissez, configurez, envoyez votre fichier&nbsp;: nous produisons, contrôlons et livrons.</p>
          <AppLink className="btn btn-dark sol-config-btn" href="/contact">
            Parler à l&apos;équipe <FaArrowRight aria-hidden="true" />
          </AppLink>
        </div>
        <ol className="sol-config-steps">
          {PROCESS.map(({ label, icon: Icon }, i) => (
            <li key={label}>
              <span className="sol-step-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="sol-step-num">{i + 1}</span>
              <span className="sol-step-label">{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
