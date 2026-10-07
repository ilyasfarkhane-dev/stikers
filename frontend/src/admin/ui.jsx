import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrashAlt, FaUndo } from "react-icons/fa";
import { SITE_IMAGES } from "../../../backend/shared/defaults.js";
import { api } from "./api.js";

const IMG = "/assets/images/";

export function Panel({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`adm-panel ${className}`}>
      {(title || actions) && (
        <header className="adm-panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="adm-panel-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ kicker, title, children }) {
  return (
    <header className="adm-page-head">
      <div>
        {kicker && <p className="adm-kicker">{kicker}</p>}
        <h1>{title}</h1>
      </div>
      {children && <div className="adm-page-actions">{children}</div>}
    </header>
  );
}

export function Field({ label, hint, wide = false, children }) {
  return (
    <label className={`adm-field ${wide ? "is-wide" : ""}`}>
      <span className="adm-field-label">{label}</span>
      {children}
      {hint && <small className="adm-field-hint">{hint}</small>}
    </label>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return <input className="adm-input" type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function TextArea({ value, onChange, rows = 3, ...rest }) {
  return <textarea className="adm-input" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

// Empty input = null ("non renseigné").
export function NumberInput({ value, onChange, suffix, placeholder = "—", ...rest }) {
  return (
    <span className="adm-number">
      <input
        className="adm-input"
        type="number"
        step="any"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        {...rest}
      />
      {suffix && <em>{suffix}</em>}
    </span>
  );
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <select className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`adm-toggle ${checked ? "is-on" : ""}`}
      role="switch"
      aria-checked={Boolean(checked)}
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true" />
      {label}
    </button>
  );
}

export function TagsInput({ value = [], onChange, placeholder = "Séparez par des virgules" }) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => setText(value.join(", ")), [value.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className="adm-input"
      type="text"
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() =>
        onChange(
          text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function ImagePicker({ value, onChange }) {
  const known = SITE_IMAGES.includes(value);
  return (
    <div className="adm-image-picker">
      <span className="adm-thumb">{value ? <img src={value.startsWith("/") || value.startsWith("http") ? value : `${IMG}${value}`} alt="" /> : null}</span>
      <select className="adm-input" value={known ? value : "__custom"} onChange={(e) => e.target.value !== "__custom" && onChange(e.target.value)}>
        {SITE_IMAGES.map((img) => (
          <option key={img} value={img}>
            {img}
          </option>
        ))}
        <option value="__custom">Autre (URL / chemin)…</option>
      </select>
      {!known && <TextInput value={value} onChange={onChange} placeholder="https://… ou /assets/…" />}
    </div>
  );
}

export function CheckList({ options, value = [], onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div className="adm-checklist">
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          className={`adm-check ${value.includes(o.id) ? "is-on" : ""}`}
          aria-pressed={value.includes(o.id)}
          onClick={() => toggle(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ListEditor({ items = [], onChange, create, renderItem, itemTitle, addLabel = "Ajouter", minItems = 0 }) {
  const update = (index, patch) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index, dir) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const remove = (index) => {
    if (items.length <= minItems) return;
    if (!window.confirm("Supprimer cet élément ?")) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="adm-list">
      {items.map((item, i) => (
        <article className="adm-list-item" key={i}>
          <header>
            <span className="adm-list-index">{String(i + 1).padStart(2, "0")}</span>
            <strong>{itemTitle?.(item, i) ?? `Élément ${i + 1}`}</strong>
            <div className="adm-list-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">
                <FaArrowUp />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre">
                <FaArrowDown />
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => remove(i)}
                disabled={items.length <= minItems}
                aria-label="Supprimer"
              >
                <FaTrashAlt />
              </button>
            </div>
          </header>
          <div className="adm-grid">{renderItem(item, (patch) => update(i, patch), i)}</div>
        </article>
      ))}
      {create && (
        <button type="button" className="adm-add" onClick={() => onChange([...items, create(items)])}>
          <FaPlus aria-hidden="true" /> {addLabel}
        </button>
      )}
    </div>
  );
}

// Draft/save/reset lifecycle for one settings section.
export function useSectionEditor(key, settings, setSettings, notify) {
  const saved = settings[key];
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(saved), [saved]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api(`settings/${key}`, { method: "PUT", body: draft });
      setSettings((prev) => ({ ...prev, [key]: res.value }));
      notify("Modifications enregistrées et publiées sur le site.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Rétablir les valeurs par défaut de cette section ? Vos modifications seront perdues.")) return;
    setSaving(true);
    try {
      const res = await api(`settings/${key}`, { method: "DELETE" });
      setSettings((prev) => ({ ...prev, [key]: res.value }));
      notify("Valeurs par défaut rétablies.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return { draft, setDraft, dirty, saving, save, reset, discard: () => setDraft(saved) };
}

export function SaveBar({ editor }) {
  return (
    <div className={`adm-savebar ${editor.dirty ? "is-dirty" : ""}`}>
      <span>{editor.dirty ? "Modifications non enregistrées" : "Tout est à jour"}</span>
      <div>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={editor.reset} disabled={editor.saving}>
          <FaUndo aria-hidden="true" /> Valeurs par défaut
        </button>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={editor.discard} disabled={!editor.dirty || editor.saving}>
          Annuler
        </button>
        <button type="button" className="adm-btn adm-btn--gold" onClick={editor.save} disabled={!editor.dirty || editor.saving}>
          {editor.saving ? "Enregistrement…" : "Enregistrer & publier"}
        </button>
      </div>
    </div>
  );
}
