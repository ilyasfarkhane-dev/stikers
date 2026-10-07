import { useEffect, useState } from "react";
import { FaCheck, FaCloudUploadAlt, FaFileAlt } from "react-icons/fa";
import { AppLink } from "../router.jsx";
import { useCatalog } from "./SiteData.jsx";

const A = "/assets/images/";

export function ShopHero({ crumbs, kicker, title, lead, chips = [], aside }) {
  return (
    <section className="shop-hero">
      <div className="shop-hero-media" aria-hidden="true">
        <img src={`${A}photos/uv-vernis-2.jpg`} alt="" />
      </div>
      <div className="shop-hero-inner">
        <div className="shop-hero-copy">
          {crumbs && (
            <nav className="shop-crumbs" aria-label="Fil d'Ariane">
              {crumbs.map((c, i) => (
                <span key={c.label}>
                  {c.href ? <AppLink href={c.href}>{c.label}</AppLink> : <span aria-current="page">{c.label}</span>}
                  {i < crumbs.length - 1 && <span className="shop-crumbs-sep">/</span>}
                </span>
              ))}
            </nav>
          )}
          <p className="shop-kicker">
            {kicker}
            <span aria-hidden="true" />
          </p>
          <h1>{title}</h1>
          {lead && <p className="shop-hero-lead">{lead}</p>}
          {chips.length > 0 && (
            <ul className="shop-hero-chips">
              {chips.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Icon aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {aside && (
          <p className="shop-hero-aside" aria-hidden="true">
            {aside}
          </p>
        )}
      </div>
    </section>
  );
}

export function ShopField({ num, legend, aside, children }) {
  return (
    <fieldset className="shop-field">
      {legend && (
        <legend className="shop-field-head">
          {num != null && <span className="shop-field-num">{num}</span>}
          <span className="shop-field-label">{legend}</span>
          {aside && <span className="shop-field-aside">{aside}</span>}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

export function ChipGroup({ options, value, onChange, isDisabled, disabledHint = "Non disponible avec cette matière" }) {
  return (
    <div className="shop-chips">
      {options.map((opt) => {
        const disabled = isDisabled?.(opt.id) ?? false;
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={`shop-chip ${active ? "is-active" : ""}`}
            aria-pressed={active}
            disabled={disabled}
            title={disabled ? disabledHint : undefined}
            onClick={() => onChange(opt.id)}
          >
            {opt.tone && <span className={`finish-swatch finish-swatch--${opt.tone} shop-chip-swatch`} aria-hidden="true" />}
            <span>{opt.label}</span>
            {active && <FaCheck className="shop-chip-check" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

function clampDim(value, limits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return limits.min;
  return Math.min(limits.max, Math.max(limits.min, Math.round(n)));
}

export function DimensionsInputs({ width, height, onChange }) {
  const DIMENSION_LIMITS = useCatalog().dimensionLimits ?? { min: 10, max: 1500 };
  const clamp = (v) => clampDim(v, DIMENSION_LIMITS);
  return (
    <div className="shop-dims">
      <label className="shop-input">
        <span>Largeur</span>
        <input
          type="number"
          min={DIMENSION_LIMITS.min}
          max={DIMENSION_LIMITS.max}
          value={width}
          onChange={(e) => onChange({ width: e.target.value })}
          onBlur={(e) => onChange({ width: clamp(e.target.value) })}
        />
        <em>mm</em>
      </label>
      <span className="shop-dims-x" aria-hidden="true">
        ×
      </span>
      <label className="shop-input">
        <span>Hauteur</span>
        <input
          type="number"
          min={DIMENSION_LIMITS.min}
          max={DIMENSION_LIMITS.max}
          value={height}
          onChange={(e) => onChange({ height: e.target.value })}
          onBlur={(e) => onChange({ height: clamp(e.target.value) })}
        />
        <em>mm</em>
      </label>
    </div>
  );
}

export function QuantityInputs({ value, onChange }) {
  const QUANTITY_TIERS = useCatalog().tiers;
  const set = (n) => onChange(Math.max(1, Math.round(Number(n) || 1)));
  return (
    <div className="shop-qty-wrap">
      <div className="shop-qty">
        <button type="button" aria-label="Diminuer la quantité" onClick={() => set(value - 50)}>
          −
        </button>
        <input type="number" min="1" aria-label="Quantité" value={value} onChange={(e) => set(e.target.value)} />
        <button type="button" aria-label="Augmenter la quantité" onClick={() => set(value + 50)}>
          +
        </button>
      </div>
      <div className="shop-tiers">
        {QUANTITY_TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            className={value === tier ? "is-active" : ""}
            aria-pressed={value === tier}
            onClick={() => set(tier)}
          >
            {tier.toLocaleString("fr-FR")}
          </button>
        ))}
      </div>
    </div>
  );
}

const extList = (rules) => rules.extensions.map((e) => e.toUpperCase()).join(", ");

function validateFile(file, rules) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!rules.extensions.includes(ext)) {
    return `Format non accepté. Formats autorisés : ${extList(rules)}.`;
  }
  if (file.size > rules.maxSizeMb * 1024 * 1024) {
    return `Fichier trop volumineux (max. ${rules.maxSizeMb} Mo).`;
  }
  return null;
}

export function useDesignFile() {
  const FILE_RULES = useCatalog().fileRules;
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file || !/^image\/(png|jpe?g|svg\+xml)$/.test(file.type)) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const select = (next) => {
    if (!next) return;
    const problem = validateFile(next, FILE_RULES);
    setError(problem);
    setFile(problem ? null : next);
  };

  return { file, error, previewUrl, select, clear: () => setFile(null) };
}

export function UploadZone({ design, label = "Importer mon fichier", compact = false }) {
  const FILE_RULES = useCatalog().fileRules;
  const [dragging, setDragging] = useState(false);
  return (
    <div className="shop-upload-wrap">
      <label
        className={`shop-upload ${compact ? "is-compact" : ""} ${dragging ? "is-dragging" : ""} ${design.file ? "has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          design.select(e.dataTransfer.files?.[0]);
        }}
      >
        <span className="shop-upload-icon" aria-hidden="true">
          {design.file ? <FaFileAlt /> : <FaCloudUploadAlt />}
        </span>
        <span className="shop-upload-text">
          <strong>{design.file ? design.file.name : label}</strong>
          <small>
            {design.file
              ? "Fichier prêt — contrôlé avant production"
              : `${extList(FILE_RULES)} — max. ${FILE_RULES.maxSizeMb} Mo`}
          </small>
        </span>
        <input
          type="file"
          accept={FILE_RULES.extensions.map((e) => `.${e}`).join(",")}
          onChange={(e) => design.select(e.target.files?.[0])}
        />
      </label>
      {design.error && (
        <p className="shop-error" role="alert">
          {design.error}
        </p>
      )}
    </div>
  );
}

/** Video thumbnail: the poster image, or the first frame when the video has no poster. */
export function VideoPoster({ video }) {
  return video.posterUrl ? (
    <img src={video.posterUrl} alt="" loading="lazy" />
  ) : (
    <video src={`${video.url}#t=0.5`} muted playsInline preload="metadata" aria-hidden="true" />
  );
}