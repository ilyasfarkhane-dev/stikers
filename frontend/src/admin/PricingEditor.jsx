import { useMemo, useState } from "react";
import { createCatalog } from "../../../backend/shared/catalog.js";
import { formatMoney } from "./api.js";
import { Field, NumberInput, PageHead, Panel, SaveBar, Select, TextInput, useSectionEditor } from "./ui.jsx";

function CoefTable({ title, subtitle, rows, values = {}, unit, onChange }) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <ul className="adm-coefs">
        {rows.map((r) => (
          <li key={r.id}>
            <span>
              {r.tone && <span className={`finish-swatch finish-swatch--${r.tone}`} aria-hidden="true" />}
              {r.label}
            </span>
            <NumberInput value={values[r.id]} onChange={(v) => onChange({ ...values, [r.id]: v })} suffix={unit} min="0" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function PricingEditor({ settings, setSettings, notify }) {
  const editor = useSectionEditor("pricing", settings, setSettings, notify);
  const p = editor.draft;
  const set = (patch) => editor.setDraft({ ...p, ...patch });
  const cur = p.currency || "MAD";
  const base = useMemo(() => createCatalog(settings.catalog), [settings.catalog]);
  const [sim, setSim] = useState(() => base.defaultConfig);

  const catalog = useMemo(() => createCatalog(settings.catalog, p), [settings.catalog, p]);
  const config = catalog.normalizeConfig(sim);
  const price = catalog.estimatePrice(config);

  const missing = [];
  const n = (v) => v !== null && v !== undefined && v !== "";
  if (!n(p.printPerM2)) missing.push("impression / m²");
  if (!n(p.margin)) missing.push("marge");
  if (!n(p.materialPerM2?.[config.material])) missing.push(`matière « ${catalog.labelOf(catalog.materials, config.material)} »`);
  if (!n(p.finishPerM2?.[config.finish])) missing.push(`finition « ${catalog.labelOf(catalog.finishes, config.finish)} »`);
  if (!n(p.cutPerUnit?.[config.cut])) missing.push(`découpe « ${catalog.labelOf(catalog.cuts, config.cut)} »`);

  const area = (config.width / 1000) * (config.height / 1000) * config.quantity;
  const enabled = createCatalog(settings.catalog, settings.pricing).pricingReady();

  return (
    <div className="adm-page">
      <PageHead kicker="Paramètres" title="Tarifs">
        <span className={`adm-pill ${enabled ? "is-ok" : "is-warn"}`}>
          {enabled ? "Prix automatique affiché sur le site" : "Le site affiche « Estimation à calculer »"}
        </span>
      </PageHead>

      <p className="adm-alert adm-alert--info">
        Prix = (matière + impression + finition) × surface + découpe × quantité + emballage, puis remise quantité et marge, avec un minimum de
        commande. Laissez un champ vide tant que le coût réel n&apos;est pas validé : le client verra alors «&nbsp;Estimation à calculer&nbsp;» et
        vous chiffrez sa demande depuis l&apos;onglet Demandes. Ces coefficients ne sont jamais envoyés au navigateur des visiteurs.
      </p>

      <div className="adm-pricing">
        <div className="adm-pricing-main">
          <Panel title="Général">
            <div className="adm-grid">
              <Field label="Devise">
                <TextInput value={p.currency} onChange={(currency) => set({ currency })} maxLength={6} />
              </Field>
              <Field label="Impression (encre + machine)">
                <NumberInput value={p.printPerM2} onChange={(printPerM2) => set({ printPerM2 })} suffix={`${cur}/m²`} min="0" />
              </Field>
              <Field label="Emballage (par commande)">
                <NumberInput value={p.packaging} onChange={(packaging) => set({ packaging })} suffix={cur} min="0" />
              </Field>
              <Field label="Marge">
                <NumberInput value={p.margin} onChange={(margin) => set({ margin })} suffix="%" min="0" />
              </Field>
              <Field label="Minimum de commande">
                <NumberInput value={p.minimumOrder} onChange={(minimumOrder) => set({ minimumOrder })} suffix={cur} min="0" />
              </Field>
            </div>
          </Panel>

          <CoefTable title="Matières" subtitle="Coût par m²" rows={catalog.materials} values={p.materialPerM2} unit={`${cur}/m²`} onChange={(materialPerM2) => set({ materialPerM2 })} />
          <CoefTable title="Finitions" subtitle="Surcoût par m² (0 si inclus)" rows={catalog.finishes} values={p.finishPerM2} unit={`${cur}/m²`} onChange={(finishPerM2) => set({ finishPerM2 })} />
          <CoefTable title="Découpes" subtitle="Coût par exemplaire" rows={catalog.cuts} values={p.cutPerUnit} unit={`${cur}/ex.`} onChange={(cutPerUnit) => set({ cutPerUnit })} />
          <CoefTable
            title="Remises quantité"
            subtitle="Appliquées à partir de chaque palier"
            rows={catalog.tiers.map((t) => ({ id: String(t), label: `À partir de ${t.toLocaleString("fr-FR")} ex.` }))}
            values={Object.fromEntries(Object.entries(p.quantityDiscount ?? {}).map(([k, v]) => [String(k), v]))}
            unit="%"
            onChange={(quantityDiscount) => set({ quantityDiscount })}
          />
        </div>

        <aside className="adm-sim">
          <Panel title="Simulateur" subtitle="Testez vos tarifs avant de publier">
            <div className="adm-grid adm-grid--tight">
              <Field label="Type" wide>
                <Select value={config.type} onChange={(type) => setSim({ ...config, type })} options={catalog.types.map((t) => ({ value: t.id, label: t.label }))} />
              </Field>
              <Field label="Matière" wide>
                <Select
                  value={config.material}
                  onChange={(material) => setSim({ ...config, material })}
                  options={catalog.materialsForType(config.type).map((id) => ({ value: id, label: catalog.labelOf(catalog.materials, id) }))}
                />
              </Field>
              <Field label="Finition" wide>
                <Select
                  value={config.finish}
                  onChange={(finish) => setSim({ ...config, finish })}
                  options={catalog.finishes.filter((f) => catalog.isCompatible(config.material, f.id)).map((f) => ({ value: f.id, label: f.label }))}
                />
              </Field>
              <Field label="Largeur">
                <NumberInput value={config.width} onChange={(width) => setSim({ ...config, width })} suffix="mm" />
              </Field>
              <Field label="Hauteur">
                <NumberInput value={config.height} onChange={(height) => setSim({ ...config, height })} suffix="mm" />
              </Field>
              <Field label="Quantité">
                <NumberInput value={config.quantity} onChange={(quantity) => setSim({ ...config, quantity })} suffix="ex." />
              </Field>
              <Field label="Découpe">
                <Select value={config.cut} onChange={(cut) => setSim({ ...config, cut })} options={catalog.cuts.map((x) => ({ value: x.id, label: x.label }))} />
              </Field>
            </div>
            <div className="adm-sim-result">
              <span>Surface totale : {area.toLocaleString("fr-FR", { maximumFractionDigits: 3 })} m²</span>
              {price === null ? (
                <>
                  <strong>Estimation à calculer</strong>
                  <small>Manque : {missing.join(", ") || "—"}</small>
                </>
              ) : (
                <>
                  <strong>{formatMoney(price, cur)}</strong>
                  <small>
                    soit {formatMoney(Math.round((price / config.quantity) * 100) / 100, cur)} / exemplaire
                  </small>
                </>
              )}
            </div>
          </Panel>
        </aside>
      </div>

      <SaveBar editor={editor} />
    </div>
  );
}
