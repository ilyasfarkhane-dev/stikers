import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheck,
  FaCut,
  FaExternalLinkAlt,
  FaFileUpload,
  FaLayerGroup,
  FaMinus,
  FaPalette,
  FaPlus,
  FaRulerCombined,
  FaShapes,
  FaSortAmountUp,
  FaStar,
  FaTh,
  FaTrashAlt,
} from "react-icons/fa";
import { SWATCH_TONES, TYPE_ICONS } from "../../../backend/shared/defaults.js";
import { TYPE_ICON_COMPONENTS } from "../shop/SiteData.jsx";
import { slugify } from "./api.js";
import { Field, ImagePicker, NumberInput, PageHead, SaveBar, TagsInput, TextInput, useSectionEditor } from "./ui.jsx";

const IMG = "/assets/images/";

const TONE_LABELS = {
  gloss: "Brillant",
  matte: "Mat",
  clear: "Transparent",
  white: "Blanc",
  varnish: "Vernis",
  "lam-gloss": "Laminage brillant",
  "lam-matte": "Laminage mat",
  holo: "Holographique",
  metal: "Métallique",
};

const ICON_LABELS = {
  tag: "Étiquette",
  bottle: "Bouteille",
  box: "Boîte",
  car: "Véhicule",
  home: "Maison",
  star: "Étoile",
  store: "Boutique",
  calendar: "Événement",
  industry: "Industrie",
};

function uniqueId(base, list) {
  let id = slugify(base) || "element";
  let n = 2;
  while (list.some((item) => item.id === id)) id = `${slugify(base) || "element"}-${n++}`;
  return id;
}

const imageSrc = (value) => (!value ? "" : value.startsWith("/") || value.startsWith("http") ? value : `${IMG}${value}`);

function listOps(items, onChange, minItems = 1) {
  return {
    update: (index, patch) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item))),
    move: (index, dir) => {
      const target = index + dir;
      if (target < 0 || target >= items.length) return;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    },
    remove: (index) => {
      if (items.length <= minItems) return;
      if (!window.confirm("Supprimer cet élément ?")) return;
      onChange(items.filter((_, i) => i !== index));
    },
    add: (item) => onChange([...items, item]),
  };
}

function ItemTools({ index, count, ops, minItems = 1, className = "" }) {
  return (
    <div className={`cf-tools ${className}`}>
      <button type="button" onClick={() => ops.move(index, -1)} disabled={index === 0} aria-label="Monter" title="Monter">
        <FaArrowUp />
      </button>
      <button type="button" onClick={() => ops.move(index, 1)} disabled={index === count - 1} aria-label="Descendre" title="Descendre">
        <FaArrowDown />
      </button>
      <button type="button" className="is-danger" onClick={() => ops.remove(index)} disabled={count <= minItems} aria-label="Supprimer" title="Supprimer">
        <FaTrashAlt />
      </button>
    </div>
  );
}

function IdField({ item, savedList, onChange }) {
  const locked = savedList.some((s) => s.id === item.id);
  return (
    <Field label="Identifiant" hint={locked ? "Fixe : utilisé par les demandes et les tarifs" : "Lettres, chiffres et tirets"}>
      <TextInput value={item.id} onChange={(v) => onChange({ id: slugify(v) })} disabled={locked} />
    </Field>
  );
}

function TonePicker({ value, onChange }) {
  return (
    <div className="cf-tones" role="radiogroup" aria-label="Pastille">
      {SWATCH_TONES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          className={value === t ? "is-on" : ""}
          onClick={() => onChange(t)}
          title={TONE_LABELS[t] ?? t}
        >
          <span className={`finish-swatch finish-swatch--${t}`} aria-hidden="true" />
          <small>{TONE_LABELS[t] ?? t}</small>
        </button>
      ))}
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="cf-icons" role="radiogroup" aria-label="Icône">
      {TYPE_ICONS.map((id) => {
        const Icon = TYPE_ICON_COMPONENTS[id] ?? TYPE_ICON_COMPONENTS.tag;
        return (
          <button key={id} type="button" role="radio" aria-checked={value === id} className={value === id ? "is-on" : ""} onClick={() => onChange(id)} title={ICON_LABELS[id] ?? id}>
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function MaterialChips({ materials, value = [], onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div className="cf-chips">
      {materials.map((m) => {
        const on = value.includes(m.id);
        return (
          <button key={m.id} type="button" className={`cf-chip ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => toggle(m.id)}>
            <span className={`finish-swatch finish-swatch--${m.tone}`} aria-hidden="true" />
            {m.label || m.id}
            {value[0] === m.id && <em>Par défaut</em>}
            <i aria-hidden="true">{on ? <FaCheck /> : <FaPlus />}</i>
          </button>
        );
      })}
    </div>
  );
}

function SectionHead({ step, title, text, action }) {
  return (
    <header className="cf-head">
      <div>
        {step && <p className="cf-step">{step}</p>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </header>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button type="button" className="adm-btn adm-btn--dark cf-add-btn" onClick={onClick}>
      <FaPlus aria-hidden="true" /> {label}
    </button>
  );
}

const compatKind = (value) => (value === false ? "no" : value === true || value === undefined ? "yes" : "cond");

export function CatalogEditor({ settings, setSettings, notify }) {
  const editor = useSectionEditor("catalog", settings, setSettings, notify);
  const [tab, setTab] = useState("types");
  const [hover, setHover] = useState(null);
  const c = editor.draft;
  const saved = settings.catalog;
  const set = (patch) => editor.setDraft({ ...c, ...patch });

  const combos = c.materials.length * c.finishes.length;
  const compatCount = c.materials.reduce(
    (sum, m) => sum + c.finishes.filter((f) => compatKind(c.compatibility?.[m.id]?.[f.id]) !== "no").length,
    0,
  );
  const setCompat = (mId, fId, value) => set({ compatibility: { ...c.compatibility, [mId]: { ...(c.compatibility?.[mId] ?? {}), [fId]: value } } });
  const cycleCompat = (mId, fId) => {
    const current = c.compatibility?.[mId]?.[fId];
    const kind = compatKind(current);
    setCompat(mId, fId, kind === "yes" ? "Selon usage" : kind === "cond" ? false : true);
  };

  const TABS = [
    { id: "types", label: "Types de sticker", hint: "Étape 1", count: c.types.length, icon: FaShapes },
    { id: "materials", label: "Matières", hint: "Étape 2", count: c.materials.length, icon: FaLayerGroup },
    { id: "finishes", label: "Finitions", hint: "Étape 3", count: c.finishes.length, icon: FaPalette },
    { id: "matrix", label: "Compatibilités", hint: "Matières × finitions", count: `${compatCount}/${combos}`, icon: FaTh },
    { id: "options", label: "Découpes & usages", hint: "Étapes 6 et 7", count: c.cuts.length + c.usages.length, icon: FaCut },
    { id: "rules", label: "Quantités & fichiers", hint: "Formats, paliers, fichiers", icon: FaRulerCombined },
  ];

  const typeOps = listOps(c.types, (types) => set({ types }));
  const materialOps = listOps(c.materials, (materials) => set({ materials }));
  const finishOps = listOps(c.finishes, (finishes) => set({ finishes }));
  const cutOps = listOps(c.cuts, (cuts) => set({ cuts }));
  const usageOps = listOps(c.usages, (usages) => set({ usages }));

  const compatibleFinishes = (mId) => c.finishes.filter((f) => compatKind(c.compatibility?.[mId]?.[f.id]) !== "no").length;
  const compatibleMaterials = (fId) => c.materials.filter((m) => compatKind(c.compatibility?.[m.id]?.[fId]) !== "no").length;

  const optionList = (key, items, ops, savedList, defaultKey, placeholder) => (
    <ul className="cf-rows">
      {items.map((x, i) => {
        const locked = savedList.some((s) => s.id === x.id);
        const isDefault = c.defaults?.[defaultKey] === x.id;
        return (
          <li key={i} className={isDefault ? "is-default" : ""}>
            <span className="cf-index">{String(i + 1).padStart(2, "0")}</span>
            <div className="cf-row-fields">
              <TextInput value={x.label} onChange={(label) => ops.update(i, { label })} placeholder={placeholder} aria-label="Nom affiché" />
              {locked ? (
                <code title="Identifiant fixe : utilisé par les demandes et les tarifs">{x.id}</code>
              ) : (
                <input className="cf-id-input" value={x.id} onChange={(e) => ops.update(i, { id: slugify(e.target.value) })} aria-label="Identifiant" />
              )}
            </div>
            <button
              type="button"
              className={`cf-default ${isDefault ? "is-on" : ""}`}
              onClick={() => set({ defaults: { ...c.defaults, [defaultKey]: x.id } })}
              title="Sélectionné par défaut dans le configurateur"
            >
              <FaStar aria-hidden="true" />
              {isDefault ? " Par défaut" : <span className="adm-sr">Définir par défaut</span>}
            </button>
            <ItemTools index={i} count={items.length} ops={ops} />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="adm-page cf-page">
      <PageHead kicker="Paramètres" title="Configurateur">
        <a className="adm-btn adm-btn--ghost" href="/configurateur" target="_blank" rel="noreferrer">
          Voir le configurateur <FaExternalLinkAlt aria-hidden="true" />
        </a>
      </PageHead>

      <div className="cf-layout">
        <nav className="cf-nav" aria-label="Sections du configurateur">
          <p className="cf-nav-title">Parcours client</p>
          {TABS.map(({ id, label, hint, count, icon: Icon }) => (
            <button key={id} type="button" className={tab === id ? "is-active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
              <span className="cf-nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="cf-nav-text">
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              {count !== undefined && <em>{count}</em>}
            </button>
          ))}
          <div className="cf-nav-note">
            Les changements ne sont visibles sur le site qu&apos;après <b>Enregistrer & publier</b>.
          </div>
        </nav>

        <div className="cf-main">
          {tab === "types" && (
            <>
              <SectionHead
                step="Étape 1 du configurateur"
                title="Types de sticker"
                text="Cochez les matières proposées pour chaque type : la première cochée est sélectionnée par défaut."
                action={
                  <AddButton
                    label="Ajouter un type"
                    onClick={() =>
                      typeOps.add({ id: uniqueId("nouveau-type", c.types), label: "", hint: "", icon: "tag", image: "photos/uv-vernis-1.jpg", materials: c.materials.map((m) => m.id) })
                    }
                  />
                }
              />
              <div className="cf-type-grid">
                {c.types.map((t, i) => {
                  const Icon = TYPE_ICON_COMPONENTS[t.icon] ?? TYPE_ICON_COMPONENTS.tag;
                  const update = (patch) => typeOps.update(i, patch);
                  return (
                    <article key={i} className="cf-card cf-type">
                      <div className="cf-type-media">
                        {t.image && <img src={imageSrc(t.image)} alt="" />}
                        <span className="cf-type-order">{String(i + 1).padStart(2, "0")}</span>
                        <ItemTools index={i} count={c.types.length} ops={typeOps} className="is-floating" />
                        <div className="cf-type-caption">
                          <span className="cf-type-icon" aria-hidden="true">
                            <Icon />
                          </span>
                          <div>
                            <strong>{t.label || "Nouveau type"}</strong>
                            <small>{t.hint || "Sous-titre"}</small>
                          </div>
                        </div>
                      </div>
                      <div className="cf-card-body adm-grid">
                        <Field label="Nom affiché">
                          <TextInput value={t.label} onChange={(label) => update({ label })} />
                        </Field>
                        <IdField item={t} savedList={saved.types} onChange={update} />
                        <Field label="Sous-titre">
                          <TextInput value={t.hint} onChange={(hint) => update({ hint })} />
                        </Field>
                        <div className="adm-field">
                          <span className="adm-field-label">Icône</span>
                          <IconPicker value={t.icon} onChange={(icon) => update({ icon })} />
                        </div>
                        <Field label="Image d'aperçu" wide>
                          <ImagePicker value={t.image} onChange={(image) => update({ image })} />
                        </Field>
                        <div className="adm-field is-wide">
                          <span className="adm-field-label">
                            Matières proposées <small className="cf-count">{(t.materials ?? []).length}/{c.materials.length}</small>
                          </span>
                          <MaterialChips materials={c.materials} value={t.materials ?? []} onChange={(materials) => update({ materials })} />
                          {!t.materials?.length && <small className="adm-field-hint">Aucune matière : toutes seront proposées.</small>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {tab === "materials" && (
            <>
              <SectionHead
                step="Étape 2 du configurateur"
                title="Matières"
                text="Les matières forment aussi les lignes de la matrice Matières × Finitions."
                action={<AddButton label="Ajouter une matière" onClick={() => materialOps.add({ id: uniqueId("nouvelle-matiere", c.materials), label: "", usage: "", tone: "white" })} />}
              />
              <div className="cf-swatch-grid">
                {c.materials.map((m, i) => (
                  <article key={i} className="cf-card cf-swatch-card">
                    <header>
                      <span className={`finish-swatch finish-swatch--${m.tone}`} aria-hidden="true" />
                      <div>
                        <strong>{m.label || "Nouvelle matière"}</strong>
                        <small>
                          {m.usage || "Usage conseillé"} · {compatibleFinishes(m.id)}/{c.finishes.length} finitions
                        </small>
                      </div>
                      <ItemTools index={i} count={c.materials.length} ops={materialOps} />
                    </header>
                    <div className="cf-card-body adm-grid">
                      <Field label="Nom affiché">
                        <TextInput value={m.label} onChange={(label) => materialOps.update(i, { label })} />
                      </Field>
                      <IdField item={m} savedList={saved.materials} onChange={(patch) => materialOps.update(i, patch)} />
                      <Field label="Usage conseillé" wide>
                        <TextInput value={m.usage} onChange={(usage) => materialOps.update(i, { usage })} />
                      </Field>
                      <div className="adm-field is-wide">
                        <span className="adm-field-label">Pastille photo</span>
                        <TonePicker value={m.tone} onChange={(tone) => materialOps.update(i, { tone })} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "finishes" && (
            <>
              <SectionHead
                step="Étape 3 du configurateur"
                title="Finitions"
                text="Les finitions forment les colonnes de la matrice. Les finitions incompatibles avec la matière choisie sont grisées."
                action={<AddButton label="Ajouter une finition" onClick={() => finishOps.add({ id: uniqueId("nouvelle-finition", c.finishes), label: "", tone: "gloss" })} />}
              />
              <div className="cf-swatch-grid">
                {c.finishes.map((f, i) => (
                  <article key={i} className="cf-card cf-swatch-card">
                    <header>
                      <span className={`finish-swatch finish-swatch--${f.tone}`} aria-hidden="true" />
                      <div>
                        <strong>{f.label || "Nouvelle finition"}</strong>
                        <small>
                          Compatible avec {compatibleMaterials(f.id)}/{c.materials.length} matières
                        </small>
                      </div>
                      <ItemTools index={i} count={c.finishes.length} ops={finishOps} />
                    </header>
                    <div className="cf-card-body adm-grid">
                      <Field label="Nom affiché">
                        <TextInput value={f.label} onChange={(label) => finishOps.update(i, { label })} />
                      </Field>
                      <IdField item={f} savedList={saved.finishes} onChange={(patch) => finishOps.update(i, patch)} />
                      <div className="adm-field is-wide">
                        <span className="adm-field-label">Pastille photo</span>
                        <TonePicker value={f.tone} onChange={(tone) => finishOps.update(i, { tone })} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "matrix" && (
            <>
              <SectionHead
                step="Règles de compatibilité"
                title="Matrice Matières × Finitions"
                text="Cliquez sur une case pour passer de Compatible à Sous condition puis Non. « Non » grise la finition dans le configurateur ; « Sous condition » affiche votre texte dans la matrice publique."
              />
              <div className="cf-legend">
                <span>
                  <i className="cf-cell cf-cell--yes">
                    <FaCheck />
                  </i>
                  Compatible
                </span>
                <span>
                  <i className="cf-cell cf-cell--cond">?</i>
                  Sous condition
                </span>
                <span>
                  <i className="cf-cell cf-cell--no">
                    <FaMinus />
                  </i>
                  Non compatible
                </span>
                <strong>
                  {compatCount} combinaisons possibles sur {combos}
                </strong>
              </div>
              <div className="cf-card cf-matrix-card">
                <div className="cf-matrix-wrap">
                  <table className="cf-matrix" onMouseLeave={() => setHover(null)}>
                    <thead>
                      <tr>
                        <th className="cf-matrix-corner">
                          Matière <span>↓</span> / Finition <span>→</span>
                        </th>
                        {c.finishes.map((f) => (
                          <th key={f.id} className={hover?.f === f.id ? "is-hover" : ""}>
                            <span className={`finish-swatch finish-swatch--${f.tone}`} aria-hidden="true" />
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {c.materials.map((m) => (
                        <tr key={m.id} className={hover?.m === m.id ? "is-hover" : ""}>
                          <th>
                            <div className="cf-matrix-row">
                              <span className={`finish-swatch finish-swatch--${m.tone}`} aria-hidden="true" />
                              <span>
                                {m.label}
                                <small>
                                  {compatibleFinishes(m.id)}/{c.finishes.length} finitions
                                </small>
                              </span>
                            </div>
                          </th>
                          {c.finishes.map((f) => {
                            const value = c.compatibility?.[m.id]?.[f.id];
                            const kind = compatKind(value);
                            return (
                              <td key={f.id} className={hover?.f === f.id ? "is-hover" : ""} onMouseEnter={() => setHover({ m: m.id, f: f.id })}>
                                <button
                                  type="button"
                                  className={`cf-cell cf-cell--${kind}`}
                                  onClick={() => cycleCompat(m.id, f.id)}
                                  aria-label={`${m.label} × ${f.label} : ${kind === "yes" ? "compatible" : kind === "no" ? "non compatible" : "sous condition"}`}
                                >
                                  {kind === "yes" ? <FaCheck /> : kind === "no" ? <FaMinus /> : "?"}
                                </button>
                                {kind === "cond" && (
                                  <input
                                    className="cf-cond-input"
                                    value={value}
                                    onChange={(e) => setCompat(m.id, f.id, e.target.value || "Selon usage")}
                                    aria-label="Condition"
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === "options" && (
            <>
              <SectionHead
                step="Étapes 6 et 7 du configurateur"
                title="Découpes & utilisations"
                text="L'étoile indique l'option sélectionnée par défaut quand un client ouvre le configurateur."
              />
              <div className="cf-two">
                <section className="cf-card">
                  <header className="cf-card-head">
                    <span className="cf-card-icon" aria-hidden="true">
                      <FaCut />
                    </span>
                    <div>
                      <h3>Découpes</h3>
                      <p>{c.cuts.length} options</p>
                    </div>
                  </header>
                  {optionList("cuts", c.cuts, cutOps, saved.cuts, "cut", "Ex. À la forme")}
                  <button type="button" className="cf-add-row" onClick={() => cutOps.add({ id: uniqueId("nouvelle-decoupe", c.cuts), label: "" })}>
                    <FaPlus aria-hidden="true" /> Ajouter une découpe
                  </button>
                </section>
                <section className="cf-card">
                  <header className="cf-card-head">
                    <span className="cf-card-icon" aria-hidden="true">
                      <FaShapes />
                    </span>
                    <div>
                      <h3>Utilisations</h3>
                      <p>{c.usages.length} options</p>
                    </div>
                  </header>
                  {optionList("usages", c.usages, usageOps, saved.usages, "usage", "Ex. Intérieur")}
                  <button type="button" className="cf-add-row" onClick={() => usageOps.add({ id: uniqueId("nouvelle-utilisation", c.usages), label: "" })}>
                    <FaPlus aria-hidden="true" /> Ajouter une utilisation
                  </button>
                </section>
              </div>
            </>
          )}

          {tab === "rules" && (
            <>
              <SectionHead step="Règles du configurateur" title="Quantités, formats & fichiers" text="Valeurs proposées par défaut et limites appliquées aux demandes des clients." />
              <div className="cf-two">
                <section className="cf-card">
                  <header className="cf-card-head">
                    <span className="cf-card-icon" aria-hidden="true">
                      <FaSortAmountUp />
                    </span>
                    <div>
                      <h3>Quantités</h3>
                      <p>Boutons rapides du configurateur</p>
                    </div>
                  </header>
                  <div className="cf-card-body adm-grid">
                    <Field label="Paliers de quantité" wide hint="Séparez par des virgules, ex. 100, 250, 500, 1000">
                      <TagsInput
                        value={(c.quantityTiers ?? []).map(String)}
                        onChange={(v) => set({ quantityTiers: v.map(Number).filter((n) => n > 0).sort((a, b) => a - b) })}
                      />
                    </Field>
                    <div className="cf-preview is-wide">
                      {(c.quantityTiers ?? []).map((q) => (
                        <span key={q} className={Number(c.defaults?.quantity) === q ? "is-on" : ""}>
                          {q.toLocaleString("fr-FR")}
                        </span>
                      ))}
                    </div>
                    <Field label="Quantité par défaut" wide>
                      <NumberInput value={c.defaults?.quantity} onChange={(quantity) => set({ defaults: { ...c.defaults, quantity } })} suffix="ex." />
                    </Field>
                  </div>
                </section>

                <section className="cf-card cf-wide cf-first">
                  <header className="cf-card-head">
                    <span className="cf-card-icon" aria-hidden="true">
                      <FaRulerCombined />
                    </span>
                    <div>
                      <h3>Formats</h3>
                      <p>Dimensions en millimètres</p>
                    </div>
                  </header>
                  <div className="cf-card-body cf-format">
                    <div className="adm-grid">
                      <Field label="Dimension minimale">
                        <NumberInput value={c.dimensionLimits?.min} onChange={(min) => set({ dimensionLimits: { ...c.dimensionLimits, min } })} suffix="mm" />
                      </Field>
                      <Field label="Dimension maximale">
                        <NumberInput value={c.dimensionLimits?.max} onChange={(max) => set({ dimensionLimits: { ...c.dimensionLimits, max } })} suffix="mm" />
                      </Field>
                      <Field label="Largeur par défaut">
                        <NumberInput value={c.defaults?.width} onChange={(width) => set({ defaults: { ...c.defaults, width } })} suffix="mm" />
                      </Field>
                      <Field label="Hauteur par défaut">
                        <NumberInput value={c.defaults?.height} onChange={(height) => set({ defaults: { ...c.defaults, height } })} suffix="mm" />
                      </Field>
                    </div>
                    <div className="cf-format-preview" aria-hidden="true">
                      <span
                        style={{
                          aspectRatio: `${Math.max(1, Number(c.defaults?.width) || 1)} / ${Math.max(1, Number(c.defaults?.height) || 1)}`,
                        }}
                      >
                        {c.defaults?.width ?? "—"} × {c.defaults?.height ?? "—"}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="cf-card">
                  <header className="cf-card-head">
                    <span className="cf-card-icon" aria-hidden="true">
                      <FaFileUpload />
                    </span>
                    <div>
                      <h3>Fichiers clients</h3>
                      <p>Formats acceptés à l&apos;envoi du visuel</p>
                    </div>
                  </header>
                  <div className="cf-card-body adm-grid">
                    <Field label="Extensions acceptées" wide hint="Ex. pdf, ai, eps, svg, png, jpg">
                      <TagsInput
                        value={c.fileRules?.extensions ?? []}
                        onChange={(v) => set({ fileRules: { ...c.fileRules, extensions: v.map((e) => e.toLowerCase().replace(/^\./, "")) } })}
                      />
                    </Field>
                    <Field label="Taille maximale">
                      <NumberInput value={c.fileRules?.maxSizeMb} onChange={(maxSizeMb) => set({ fileRules: { ...c.fileRules, maxSizeMb } })} suffix="Mo" />
                    </Field>
                    <div className="cf-preview is-wide is-files">
                      {(c.fileRules?.extensions ?? []).map((e) => (
                        <span key={e}>.{e}</span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      <SaveBar editor={editor} />
    </div>
  );
}
