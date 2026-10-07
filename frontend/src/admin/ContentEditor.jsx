import { useState } from "react";
import { DEFAULT_SITE } from "../../../backend/shared/defaults.js";
import { Field, ImagePicker, ListEditor, PageHead, Panel, SaveBar, Select, TextArea, TextInput, Toggle, useSectionEditor } from "./ui.jsx";

const TABS = [
  { id: "hero", label: "Accueil" },
  { id: "solutions", label: "Cartes « Nos solutions »" },
  { id: "contact", label: "Bandeau & contact" },
  { id: "payment", label: "Paiement" },
  { id: "footer", label: "Pied de page" },
];

const SOCIALS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
];

export function ContentEditor({ settings, setSettings, notify }) {
  const editor = useSectionEditor("site", settings, setSettings, notify);
  const [tab, setTab] = useState("hero");
  const s = editor.draft;
  const setGroup = (group, patch) => editor.setDraft({ ...s, [group]: { ...(s[group] ?? {}), ...patch } });
  const hero = s.hero ?? {};
  const payment = { ...DEFAULT_SITE.payment, ...(s.payment ?? {}) };
  const setPayment = (patch) => editor.setDraft({ ...s, payment: { ...payment, ...patch } });
  const setMethod = (id, patch) => setPayment({ methods: payment.methods.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  return (
    <div className="adm-page">
      <PageHead kicker="Paramètres" title="Contenu du site">
        <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noreferrer">
          Voir le site
        </a>
      </PageHead>

      <div className="adm-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="adm-two adm-two--preview">
          <Panel title="Bannière d'accueil">
            <div className="adm-grid">
              <Field label="Accroche (doré)" wide>
                <TextInput value={hero.kicker} onChange={(kicker) => setGroup("hero", { kicker })} />
              </Field>
              <Field label="Titre — ligne 1" wide>
                <TextInput value={hero.titleLine1} onChange={(titleLine1) => setGroup("hero", { titleLine1 })} />
              </Field>
              <Field label="Titre — ligne 2">
                <TextInput value={hero.titleLine2} onChange={(titleLine2) => setGroup("hero", { titleLine2 })} />
              </Field>
              <Field label="Mot en italique doré">
                <TextInput value={hero.titleAccent} onChange={(titleAccent) => setGroup("hero", { titleAccent })} />
              </Field>
              <Field label="Paragraphe 1" wide>
                <TextArea value={hero.paragraph1} onChange={(paragraph1) => setGroup("hero", { paragraph1 })} />
              </Field>
              <Field label="Paragraphe 2" wide>
                <TextArea value={hero.paragraph2} onChange={(paragraph2) => setGroup("hero", { paragraph2 })} />
              </Field>
              <Field label="Bouton principal">
                <TextInput value={hero.primaryCta} onChange={(primaryCta) => setGroup("hero", { primaryCta })} />
              </Field>
              <Field label="Bouton secondaire">
                <TextInput value={hero.secondaryCta} onChange={(secondaryCta) => setGroup("hero", { secondaryCta })} />
              </Field>
              <Field label="Texte manuscrit (une ligne par phrase)" wide>
                <TextArea
                  value={(hero.aside ?? []).join("\n")}
                  onChange={(v) => setGroup("hero", { aside: v.split("\n").slice(0, 4) })}
                  rows={3}
                />
              </Field>
            </div>
          </Panel>
          <div className="adm-hero-preview" aria-label="Aperçu">
            <p className="adm-hero-kicker">{hero.kicker}</p>
            <h3>
              {hero.titleLine1}
              <br />
              {hero.titleLine2} <em>{hero.titleAccent}</em>
            </h3>
            <p>{hero.paragraph1}</p>
            <div>
              <span className="adm-hero-btn">{hero.primaryCta}</span>
              <span className="adm-hero-btn is-ghost">{hero.secondaryCta}</span>
            </div>
            <p className="adm-hero-aside">
              {(hero.aside ?? []).map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </p>
          </div>
        </div>
      )}

      {tab === "solutions" && (
        <Panel title="Cartes « Nos solutions »" subtitle="Affichées sur l'accueil et la page Nos solutions (4 cartes en haut, puis le reste centré).">
          <ListEditor
            items={s.solutions ?? []}
            onChange={(solutions) => editor.setDraft({ ...s, solutions })}
            itemTitle={(x) => `${x.name || "Nouvelle carte"}${x.visible === false ? " (masquée)" : ""}`}
            addLabel="Ajouter une carte"
            create={() => ({ name: "", tagline: "", href: "/configurateur", image: "photos/uv-vernis-1.jpg", badge: "", fit: "cover", accent: false, framed: false, visible: true })}
            renderItem={(x, update) => (
              <>
                <Field label="Titre">
                  <TextInput value={x.name} onChange={(name) => update({ name })} />
                </Field>
                <Field label="Badge (facultatif)">
                  <TextInput value={x.badge} onChange={(badge) => update({ badge })} placeholder="Populaire, Premium…" />
                </Field>
                <Field label="Description" wide>
                  <TextInput value={x.tagline} onChange={(tagline) => update({ tagline })} />
                </Field>
                <Field label="Lien du bouton" wide hint="Ex. /produit/sticker-classique ou /configurateur?type=transparent">
                  <TextInput value={x.href} onChange={(href) => update({ href })} />
                </Field>
                <Field label="Image" wide>
                  <ImagePicker value={x.image} onChange={(image) => update({ image })} />
                </Field>
                <Field label="Cadrage de l'image">
                  <Select
                    value={x.fit || "contain"}
                    onChange={(fit) => update({ fit })}
                    options={[
                      { value: "contain", label: "Produit détouré (contenir)" },
                      { value: "cover", label: "Photo (remplir)" },
                    ]}
                  />
                </Field>
                <div className="adm-toggles">
                  <Toggle checked={x.visible !== false} onChange={(visible) => update({ visible })} label="Visible" />
                  <Toggle checked={x.accent} onChange={(accent) => update({ accent })} label="Carte dorée" />
                  <Toggle checked={x.framed} onChange={(framed) => update({ framed })} label="Image encadrée" />
                </div>
              </>
            )}
          />
        </Panel>
      )}

      {tab === "contact" && (
        <div className="adm-two">
          <Panel title="Bandeau supérieur">
            <div className="adm-grid">
              <Field label="Texte de gauche" wide>
                <TextInput value={s.topbar?.left} onChange={(left) => setGroup("topbar", { left })} />
              </Field>
              <Field label="Livraison">
                <TextInput value={s.topbar?.delivery} onChange={(delivery) => setGroup("topbar", { delivery })} />
              </Field>
              <Field label="Paiement">
                <TextInput value={s.topbar?.payment} onChange={(payment) => setGroup("topbar", { payment })} />
              </Field>
              <Field label="Téléphone affiché" wide>
                <TextInput value={s.topbar?.phone} onChange={(phone) => setGroup("topbar", { phone })} />
              </Field>
            </div>
          </Panel>
          <Panel title="Coordonnées">
            <div className="adm-grid">
              <Field label="E-mail">
                <TextInput value={s.contact?.email} onChange={(email) => setGroup("contact", { email })} type="email" />
              </Field>
              <Field label="WhatsApp" hint="Format international, ex. +212612345678">
                <TextInput value={s.contact?.whatsapp} onChange={(whatsapp) => setGroup("contact", { whatsapp })} />
              </Field>
              <Field label="Adresse" wide>
                <TextInput value={s.contact?.address} onChange={(address) => setGroup("contact", { address })} />
              </Field>
              <Field label="Horaires" wide>
                <TextInput value={s.contact?.hours} onChange={(hours) => setGroup("contact", { hours })} />
              </Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "payment" && (
        <div className="adm-two">
          {payment.methods.map((m) => (
            <Panel
              key={m.id}
              title={m.label || m.id}
              subtitle={m.id === "carte" ? "Le paiement en ligne nécessite un compte marchand (ex. CMI). Laissez « Bientôt disponible » tant qu'il n'est pas connecté." : "Proposé sur la page « Finaliser ma commande »."}
            >
              <div className="adm-grid">
                <Field label="Nom affiché" wide>
                  <TextInput value={m.label} onChange={(label) => setMethod(m.id, { label })} />
                </Field>
                <Field label="Description" wide>
                  <TextArea value={m.description} onChange={(description) => setMethod(m.id, { description })} rows={2} />
                </Field>
                <div className="adm-toggles">
                  <Toggle checked={m.enabled} onChange={(enabled) => setMethod(m.id, { enabled })} label="Afficher sur le site" />
                  <Toggle
                    checked={m.available}
                    onChange={(available) => setMethod(m.id, { available })}
                    label={m.available ? "Sélectionnable" : "Bientôt disponible"}
                  />
                </div>
              </div>
            </Panel>
          ))}
          <Panel title="Message de confirmation" subtitle="Affiché sous le récapitulatif et après la commande.">
            <Field label="Texte" wide>
              <TextArea value={payment.note} onChange={(note) => setPayment({ note })} rows={3} />
            </Field>
          </Panel>
        </div>
      )}

      {tab === "footer" && (
        <div className="adm-two">
          <Panel title="Bandeau avant le pied de page" subtitle="3 colonnes ; la 3e affiche le bouton « Nous contacter ».">
            <ListEditor
              items={s.prefooter ?? []}
              onChange={(prefooter) => editor.setDraft({ ...s, prefooter: prefooter.slice(0, 3) })}
              itemTitle={(x) => x.title || "Colonne"}
              create={(s.prefooter ?? []).length < 3 ? () => ({ title: "", text: "" }) : undefined}
              addLabel="Ajouter une colonne"
              renderItem={(x, update) => (
                <>
                  <Field label="Titre" wide>
                    <TextInput value={x.title} onChange={(title) => update({ title })} />
                  </Field>
                  <Field label="Texte" wide>
                    <TextArea value={x.text} onChange={(text) => update({ text })} rows={2} />
                  </Field>
                </>
              )}
            />
          </Panel>
          <Panel title="Réseaux sociaux & mentions">
            <div className="adm-grid">
              {SOCIALS.map(([key, label]) => (
                <Field key={key} label={label} wide>
                  <TextInput
                    value={s.socials?.[key]}
                    onChange={(v) => setGroup("socials", { [key]: v })}
                    placeholder={`https://${key}.com/…`}
                  />
                </Field>
              ))}
              <Field label="Copyright" wide>
                <TextInput value={s.copyright} onChange={(copyright) => editor.setDraft({ ...s, copyright })} />
              </Field>
            </div>
          </Panel>
        </div>
      )}

      <SaveBar editor={editor} />
    </div>
  );
}
