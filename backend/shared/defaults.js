// Default content for every admin-editable section.
// Used by the website (fallback when the API is unavailable) and by the worker (initial values).

export const SITE_IMAGES = [
  "photos/uv-vernis-1.jpg",
  "photos/uv-vernis-2.jpg",
  "photos/eco-solvant-1.jpg",
  "photos/eco-solvant-2.jpg",
  "photos/transparent-1.jpg",
  "photos/transparent-2.jpg",
  "photos/argente-1.jpg",
  "photos/argente-2.jpg",
  "photos/dore-1.jpg",
  "photos/dore-2.jpg",
  "photos/hologramme-1.jpg",
  "photos/hologramme-2.jpg",
];

// Default site videos (admin-editable in /admin/videos, stored in `site.videos`).
// src/poster: path under /assets/ (web copies in public/assets/videos) or an uploaded file URL (/api/public/media/…).
// material: catalog material shown in the video — the configurator only lists videos of the selected material.
const video = (id, label, material) => ({ id, label, material, src: `videos/${id}.mp4`, poster: `videos/${id}.jpg`, visible: true });

export const DEFAULT_VIDEOS = [
  video("uv-vernis-1", "UV vernis", "vinyle-blanc"),
  video("uv-vernis-2", "UV vernis", "vinyle-blanc"),
  video("eco-solvant-1", "Éco-solvant", "vinyle-blanc"),
  video("eco-solvant-2", "Éco-solvant", "vinyle-blanc"),
  video("transparent-1", "Transparent", "vinyle-transparent"),
  video("transparent-2", "Transparent", "vinyle-transparent"),
  video("argente-1", "Argenté", "vinyle-premium"),
  video("argente-2", "Argenté", "vinyle-premium"),
  video("dore-1", "Doré", "vinyle-premium"),
  video("dore-2", "Doré", "vinyle-premium"),
  video("hologramme-1", "Hologramme", "holographique"),
  video("hologramme-2", "Hologramme", "holographique"),
];

export const mediaUrl = (path) => (!path ? "" : path.startsWith("/") || /^https?:\/\//.test(path) ? path : `/assets/${path}`);

export const SWATCH_TONES = ["gloss", "matte", "clear", "white", "varnish", "lam-gloss", "lam-matte", "holo", "metal"];

export const TYPE_ICONS = ["tag", "bottle", "box", "car", "home", "star", "store", "calendar", "industry"];

export const REQUEST_STATUSES = [
  { id: "nouveau", label: "Nouveau" },
  { id: "en_cours", label: "En cours de traitement" },
  { id: "devis_envoye", label: "Devis envoyé" },
  { id: "bat_envoye", label: "BAT envoyé" },
  { id: "en_production", label: "En production" },
  { id: "pret", label: "Prêt / expédié" },
  { id: "termine", label: "Terminé" },
  { id: "annule", label: "Annulé" },
];

export const REQUEST_KINDS = [
  { id: "devis", label: "Demande de devis" },
  { id: "commande", label: "Commande" },
  { id: "message", label: "Message (contact)" },
];

export const DEFAULT_CATALOG = {
  types: [
    {
      id: "classique",
      label: "Sticker classique",
      hint: "UV / Éco-solvant",
      icon: "tag",
      image: "photos/uv-vernis-1.jpg",
      materials: ["vinyle-blanc", "vinyle-transparent", "vinyle-premium", "holographique"],
    },
    {
      id: "transparent",
      label: "Sticker transparent",
      hint: "Vitrine / bouteille",
      icon: "bottle",
      image: "photos/transparent-1.jpg",
      materials: ["vinyle-transparent", "film-technique"],
    },
    {
      id: "packaging",
      label: "Sticker packaging",
      hint: "Produit / emballage",
      icon: "box",
      image: "photos/dore-1.jpg",
      materials: ["vinyle-blanc", "vinyle-transparent", "vinyle-premium", "holographique"],
    },
    {
      id: "vehicule",
      label: "Sticker véhicule",
      hint: "Auto / flotte",
      icon: "car",
      image: "photos/eco-solvant-1.jpg",
      materials: ["vinyle-blanc", "vinyle-transparent", "film-technique"],
    },
    {
      id: "mural",
      label: "Sticker mural",
      hint: "Décoration / intérieur",
      icon: "home",
      image: "photos/hologramme-1.jpg",
      materials: ["vinyle-blanc", "vinyle-premium", "film-technique"],
    },
    {
      id: "premium",
      label: "Étiquette premium",
      hint: "Marque / produit",
      icon: "star",
      image: "photos/argente-1.jpg",
      materials: ["vinyle-premium", "holographique", "vinyle-transparent", "vinyle-blanc"],
    },
  ],
  materials: [
    { id: "vinyle-blanc", label: "Vinyle blanc", usage: "Packaging / promo", tone: "white" },
    { id: "vinyle-transparent", label: "Vinyle transparent", usage: "Vitrine / bouteille", tone: "clear" },
    { id: "vinyle-premium", label: "Vinyle premium", usage: "Marque / premium", tone: "metal" },
    { id: "holographique", label: "Holographique", usage: "Événement / édition", tone: "holo" },
    { id: "film-technique", label: "Film technique", usage: "Vitrine / industriel", tone: "lam-matte" },
  ],
  finishes: [
    { id: "brillant", label: "Brillant", tone: "gloss" },
    { id: "mat", label: "Mat", tone: "matte" },
    { id: "transparent", label: "Transparent", tone: "clear" },
    { id: "blanc-selectif", label: "Blanc sélectif", tone: "white" },
    { id: "vernis-selectif", label: "Vernis sélectif", tone: "varnish" },
    { id: "laminage", label: "Laminage", tone: "lam-gloss" },
  ],
  // true = compatible, false = non disponible, string = disponible sous condition.
  compatibility: {
    "vinyle-blanc": { brillant: true, mat: true, transparent: false, "blanc-selectif": true, "vernis-selectif": true, laminage: true },
    "vinyle-transparent": { brillant: true, mat: true, transparent: true, "blanc-selectif": true, "vernis-selectif": true, laminage: true },
    "vinyle-premium": { brillant: true, mat: true, transparent: false, "blanc-selectif": true, "vernis-selectif": true, laminage: true },
    holographique: { brillant: true, mat: false, transparent: false, "blanc-selectif": false, "vernis-selectif": true, laminage: false },
    "film-technique": { brillant: false, mat: true, transparent: true, "blanc-selectif": false, "vernis-selectif": false, laminage: "Selon usage" },
  },
  cuts: [
    { id: "carree", label: "Carrée" },
    { id: "ronde", label: "Ronde" },
    { id: "forme", label: "À la forme" },
    { id: "mi-chair", label: "Mi-chair" },
    { id: "feuille", label: "Feuille / bande" },
  ],
  usages: [
    { id: "interieur", label: "Intérieur" },
    { id: "exterieur", label: "Extérieur" },
    { id: "vitrine", label: "Vitrine" },
    { id: "vehicule", label: "Véhicule" },
    { id: "packaging", label: "Packaging" },
    { id: "industriel", label: "Industriel" },
  ],
  quantityTiers: [100, 250, 500, 1000],
  dimensionLimits: { min: 10, max: 1500 },
  fileRules: { extensions: ["pdf", "ai", "eps", "svg", "png", "jpg", "jpeg"], maxSizeMb: 50 },
  defaults: { width: 100, height: 100, quantity: 100, cut: "forme", usage: "interieur" },
};

// Prix = matière + impression + finition + découpe + quantité + options + emballage + livraison + marge.
// null = coût non renseigné : le site affiche alors « Estimation à calculer ».
export const DEFAULT_PRICING = {
  currency: "MAD",
  materialPerM2: {},
  printPerM2: null,
  finishPerM2: {},
  cutPerUnit: {},
  quantityDiscount: {},
  packaging: null,
  margin: null,
  minimumOrder: null,
};

export const DEFAULT_SITE = {
  topbar: {
    left: "Impression numérique haute définition | Roland & Mimaki",
    delivery: "Livraison partout au Maroc",
    payment: "Paiement sécurisé",
    phone: "+212 6 12 34 56 78",
  },
  contact: {
    email: "contact@stickarts.ma",
    whatsapp: "+212612345678",
    address: "Casablanca, Maroc",
    hours: "Lun – Sam, 9h – 19h",
  },
  hero: {
    kicker: "Stickers personnalisés",
    titleLine1: "Imprimez votre identité.",
    titleLine2: "Collez votre",
    titleAccent: "créativité.",
    paragraph1:
      "Des stickers professionnels imprimés à la demande avec les technologies d'impression numérique haute définition Roland et Mimaki.",
    paragraph2:
      "Du simple autocollant promotionnel au sticker premium pour packaging, vitrine, véhicule ou décoration, nous vous proposons une solution adaptée à chaque projet.",
    primaryCta: "Commander mes stickers",
    secondaryCta: "Demander un devis",
    aside: ["Votre design.", "Votre format.", "Votre finition."],
  },
  solutions: [
    { name: "Stickers UV", tagline: "Couleurs intenses et finitions premium", href: "/produit/sticker-classique", image: "photos/uv-vernis-1.jpg", badge: "Populaire", fit: "cover", accent: false, framed: false, visible: true },
    { name: "Stickers Éco-solvant", tagline: "Résistants et polyvalents pour l'extérieur", href: "/produit/sticker-eco-solvant", image: "photos/argente-1.jpg", badge: "Extérieur", fit: "cover", accent: true, framed: false, visible: true },
    { name: "Stickers transparents", tagline: "L'élégance sur tous vos supports", href: "/produit/sticker-transparent", image: "photos/transparent-1.jpg", badge: "", fit: "cover", accent: false, framed: false, visible: true },
    { name: "Stickers véhicule", tagline: "Marquez vos véhicules et votre flotte", href: "/configurateur?type=vehicule&utilisation=vehicule", image: "photos/eco-solvant-1.jpg", badge: "", fit: "cover", accent: false, framed: true, visible: true },
    { name: "Stickers vitrine", tagline: "Attirez l'attention de vos clients", href: "/configurateur?type=transparent&utilisation=vitrine", image: "photos/transparent-2.jpg", badge: "", fit: "cover", accent: false, framed: true, visible: true },
    { name: "Stickers packaging", tagline: "Valorisez vos produits et emballages", href: "/configurateur?type=packaging&utilisation=packaging", image: "photos/dore-1.jpg", badge: "", fit: "cover", accent: false, framed: true, visible: true },
    { name: "Stickers premium", tagline: "Des effets spéciaux pour un rendu unique", href: "/produit/sticker-hologramme", image: "photos/hologramme-1.jpg", badge: "Premium", fit: "cover", accent: true, framed: false, visible: true },
  ],
  prefooter: [
    { title: "Qualité & savoir-faire", text: "Une équipe passionnée à votre service pour un résultat à la hauteur de vos attentes." },
    { title: "Livraison rapide", text: "Partout au Maroc, en toute sécurité." },
    { title: "Besoin d'un conseil ?", text: "Contactez-nous, nous vous accompagnons dans votre projet." },
  ],
  socials: { facebook: "", instagram: "", tiktok: "", linkedin: "", youtube: "" },
  videos: DEFAULT_VIDEOS,
  // Moyens de paiement proposés sur /commande. `available: false` = affiché « Bientôt disponible ».
  payment: {
    note: "Votre commande est confirmée par notre équipe après contrôle de votre fichier.",
    methods: [
      {
        id: "livraison",
        label: "Paiement à la livraison",
        description: "Réglez votre commande en espèces à la réception de vos stickers.",
        enabled: true,
        available: true,
      },
      {
        id: "carte",
        label: "Carte bancaire",
        description: "Paiement en ligne par carte bancaire.",
        enabled: true,
        available: false,
      },
    ],
  },
  copyright: "© 2026 Stick'Arts by Comstore. Tous droits réservés.",
};

const productInfo = ({ description, features, finishes, advice }) => [
  { title: "Description courte", text: description },
  { title: "Caractéristiques", text: features },
  { title: "Finitions disponibles", text: finishes },
  { title: "Fichiers acceptés", text: "PDF, AI, EPS, SVG, PNG, JPG — idéalement avec fonds perdus et traits de coupe si nécessaires." },
  { title: "Conseils d'utilisation", text: advice },
  { title: "Livraison", text: "Retrait atelier ou livraison selon votre zone ; délai affiché après validation du fichier et de la production." },
];

export const DEFAULT_PRODUCTS = [
  {
    slug: "sticker-classique",
    type: "classique",
    name: "Sticker classique personnalisé",
    subtitle: "Impression haute définition • UV ou éco-solvant",
    image: "photos/uv-vernis-1.jpg",
    materials: ["vinyle-blanc", "vinyle-transparent", "vinyle-premium"],
    finishes: ["brillant", "mat", "laminage"],
    gallery: ["photos/uv-vernis-1.jpg", "photos/uv-vernis-2.jpg"],
    videos: ["uv-vernis-1", "uv-vernis-2"],
    info: productInfo({
      description: "Sticker personnalisé imprimé en haute définition, disponible en plusieurs matières et finitions.",
      features: "UV / éco-solvant • découpe à la forme • petites et grandes séries • intérieur / extérieur selon matière.",
      finishes: "Brillant • mat • transparent • blanc sélectif • vernis sélectif • laminage • holographique • métallisé.",
      advice: "Choisir la matière selon le support et l'environnement : intérieur, extérieur, vitrine, véhicule ou packaging.",
    }),
    seo: "Sticker personnalisé • impression UV • sticker vinyle • étiquette personnalisée • découpe à la forme",
  },
  {
    slug: "sticker-eco-solvant",
    type: "classique",
    name: "Sticker éco-solvant personnalisé",
    subtitle: "Impression éco-solvant • intérieur et extérieur selon matière",
    image: "photos/eco-solvant-1.jpg",
    materials: ["vinyle-blanc", "vinyle-transparent"],
    finishes: ["brillant", "mat", "laminage"],
    gallery: ["photos/eco-solvant-1.jpg", "photos/eco-solvant-2.jpg"],
    videos: ["eco-solvant-1", "eco-solvant-2"],
    info: productInfo({
      description: "Sticker imprimé en éco-solvant sur vinyle, pour vos marquages intérieurs et extérieurs.",
      features: "Impression éco-solvant • vinyle blanc ou transparent • découpe à la forme • petites et grandes séries.",
      finishes: "Brillant • mat • laminage.",
      advice: "Choisir la matière et la finition selon le support et l'environnement : intérieur, extérieur, véhicule ou vitrine.",
    }),
    seo: "Sticker éco-solvant • sticker extérieur • sticker vinyle • autocollant personnalisé • découpe à la forme",
  },
  {
    slug: "sticker-transparent",
    type: "transparent",
    name: "Sticker transparent personnalisé",
    subtitle: "Vinyle transparent • vitrine, bouteille, packaging",
    image: "photos/transparent-1.jpg",
    materials: ["vinyle-transparent"],
    finishes: ["brillant", "mat", "blanc-selectif"],
    gallery: ["photos/transparent-1.jpg", "photos/transparent-2.jpg"],
    videos: ["transparent-1", "transparent-2"],
    info: productInfo({
      description: "Sticker sur vinyle transparent : seul votre visuel apparaît sur le support.",
      features: "Vinyle transparent • blanc sélectif possible • découpe à la forme • petites et grandes séries.",
      finishes: "Brillant • mat • blanc sélectif.",
      advice: "Idéal sur vitrine, verre, bouteille ou packaging. Le blanc sélectif rend vos couleurs lisibles sur un support foncé ou transparent.",
    }),
    seo: "Sticker transparent • étiquette transparente • sticker vitrine • sticker bouteille • blanc sélectif",
  },
  {
    slug: "sticker-argente",
    type: "premium",
    name: "Sticker argenté personnalisé",
    subtitle: "Effet métallisé argent • étiquette premium",
    image: "photos/argente-1.jpg",
    materials: ["vinyle-premium"],
    finishes: ["brillant", "mat", "laminage"],
    gallery: ["photos/argente-1.jpg", "photos/argente-2.jpg"],
    videos: ["argente-1", "argente-2"],
    info: productInfo({
      description: "Sticker à effet argenté pour donner un rendu premium à votre marque et à vos produits.",
      features: "Vinyle premium • effet métallisé argent • découpe à la forme • petites et grandes séries.",
      finishes: "Brillant • mat • laminage.",
      advice: "Recommandé pour étiquettes produits, packaging et coffrets. Envoyez un fichier vectoriel pour un rendu net du logo.",
    }),
    seo: "Sticker argenté • étiquette métallisée • sticker premium • étiquette produit • logo argent",
  },
  {
    slug: "sticker-dore",
    type: "premium",
    name: "Sticker doré personnalisé",
    subtitle: "Effet métallisé or • étiquette premium",
    image: "photos/dore-1.jpg",
    materials: ["vinyle-premium"],
    finishes: ["brillant", "mat", "vernis-selectif"],
    gallery: ["photos/dore-1.jpg", "photos/dore-2.jpg"],
    videos: ["dore-1", "dore-2"],
    info: productInfo({
      description: "Sticker à effet doré pour valoriser vos produits, coffrets et emballages.",
      features: "Vinyle premium • effet métallisé or • découpe à la forme • petites et grandes séries.",
      finishes: "Brillant • mat • vernis sélectif.",
      advice: "Recommandé pour étiquettes produits, packaging et événements. Envoyez un fichier vectoriel pour un rendu net du logo.",
    }),
    seo: "Sticker doré • étiquette dorée • sticker premium • étiquette packaging • logo or",
  },
  {
    slug: "sticker-hologramme",
    type: "premium",
    name: "Sticker holographique personnalisé",
    subtitle: "Effet hologramme • rendu irisé qui change avec la lumière",
    image: "photos/hologramme-1.jpg",
    materials: ["holographique"],
    finishes: ["brillant", "vernis-selectif"],
    gallery: ["photos/hologramme-1.jpg", "photos/hologramme-2.jpg"],
    videos: ["hologramme-1", "hologramme-2"],
    info: productInfo({
      description: "Sticker holographique aux reflets irisés, pour un effet visuel fort.",
      features: "Film holographique • découpe à la forme • petites et grandes séries.",
      finishes: "Brillant • vernis sélectif.",
      advice: "Idéal pour événements, éditions limitées et packaging. Le rendu varie selon l'angle et la lumière.",
    }),
    seo: "Sticker holographique • sticker hologramme • étiquette irisée • sticker premium • édition limitée",
  },
];

export const SETTING_SECTIONS = {
  site: DEFAULT_SITE,
  catalog: DEFAULT_CATALOG,
  pricing: DEFAULT_PRICING,
  products: DEFAULT_PRODUCTS,
};
