import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { DEFAULT_VIDEOS } from "../../../backend/shared/defaults.js";
import { api, slugify } from "./api.js";
import { ProductVideos, titleFromFile, uploadMedia } from "./ProductVideos.jsx";
import { CheckList, Field, ImagePicker, ListEditor, PageHead, Panel, SaveBar, Select, TextArea, TextInput } from "./ui.jsx";

const INFO_TEMPLATE = [
  { title: "Description courte", text: "" },
  { title: "Caractéristiques", text: "" },
  { title: "Finitions disponibles", text: "" },
  { title: "Fichiers acceptés", text: "PDF, AI, EPS, SVG, PNG, JPG — idéalement avec fonds perdus et traits de coupe si nécessaires." },
  { title: "Conseils d'utilisation", text: "" },
  { title: "Livraison", text: "Retrait atelier ou livraison selon votre zone ; délai affiché après validation du fichier et de la production." },
];

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function ProductsEditor({ settings, setSettings, notify, storage }) {
  const saved = settings.products;
  const savedVideos = Array.isArray(settings.site?.videos) ? settings.site.videos : DEFAULT_VIDEOS;
  const [products, setProducts] = useState(saved);
  const [library, setLibrary] = useState(savedVideos);
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState(null);
  const { types, materials, finishes } = settings.catalog;

  useEffect(() => setProducts(saved), [saved]);
  useEffect(() => setLibrary(savedVideos), [savedVideos]);

  const productsDirty = !same(products, saved);
  const videosDirty = !same(library, savedVideos);
  const dirty = productsDirty || videosDirty;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setProductVideos = (slug, videos) => setProducts((list) => list.map((p) => (p.slug === slug ? { ...p, videos } : p)));
  const editVideo = (id, patch) => setLibrary((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVideo = (slug, id) => {
    const elsewhere = products.some((p) => p.slug !== slug && (p.videos ?? []).includes(id));
    const label = library.find((v) => v.id === id)?.label;
    if (!elsewhere && !window.confirm(`Supprimer la vidéo « ${label} » ? Elle n'est utilisée sur aucune autre fiche et disparaîtra aussi du configurateur.`)) return;
    setProducts((list) => list.map((p) => (p.slug === slug ? { ...p, videos: (p.videos ?? []).filter((x) => x !== id) } : p)));
    if (!elsewhere) setLibrary((list) => list.filter((v) => v.id !== id));
  };

  const uploadVideo = async (product, file, id, field) => {
    const key = id ?? `new:${product.slug}`;
    setUpload({ id: key, progress: 0 });
    try {
      const res = await uploadMedia(file, (progress) => setUpload({ id: key, progress }));
      if (id) {
        editVideo(id, { [field]: res.url });
      } else {
        const video = {
          id: `video-${Date.now().toString(36)}`,
          label: titleFromFile(file.name),
          material: product.materials?.[0] ?? null,
          src: res.url,
          poster: "",
          visible: true,
        };
        setLibrary((list) => [...list, video]);
        setProductVideos(product.slug, [...(product.videos ?? []), video.id]);
      }
      notify(field === "poster" ? "Image d'aperçu importée — pensez à enregistrer." : "Vidéo importée — pensez à enregistrer.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setUpload(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const next = { ...settings };
      if (videosDirty) next.site = (await api("settings/site", { method: "PUT", body: { ...settings.site, videos: library } })).value;
      if (productsDirty) next.products = (await api("settings/products", { method: "PUT", body: products })).value;
      setSettings(next);
      notify("Fiches produit et vidéos enregistrées et publiées sur le site.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Rétablir les fiches produit et les vidéos d'origine ? Vos modifications et vidéos importées seront retirées.")) return;
    setSaving(true);
    try {
      const resProducts = await api("settings/products", { method: "DELETE" });
      const resSite = await api("settings/site", { method: "PUT", body: { ...settings.site, videos: DEFAULT_VIDEOS } });
      setSettings((prev) => ({ ...prev, products: resProducts.value, site: resSite.value }));
      notify("Valeurs par défaut rétablies.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-page">
      <PageHead kicker="Catalogue" title="Fiches produit" />
      <Panel title="Produits" subtitle="Chaque fiche est publiée à l'adresse /produit/identifiant. Liez-la depuis une carte « Nos solutions ».">
        <ListEditor
          items={products}
          onChange={setProducts}
          itemTitle={(p) => p.name || "Nouveau produit"}
          addLabel="Ajouter un produit"
          create={(list) => {
            let slug = "nouveau-produit";
            for (let n = 2; list.some((p) => p.slug === slug); n++) slug = `nouveau-produit-${n}`;
            return {
              slug,
              type: types[0]?.id,
              name: "",
              subtitle: "",
              image: "photos/uv-vernis-1.jpg",
              materials: materials.slice(0, 3).map((m) => m.id),
              finishes: finishes.slice(0, 3).map((f) => f.id),
              videos: [],
              info: INFO_TEMPLATE,
              seo: "",
            };
          }}
          renderItem={(p, update) => {
            const locked = saved.some((s) => s.slug === p.slug);
            return (
              <>
                <Field label="Nom du produit">
                  <TextInput value={p.name} onChange={(name) => update({ name })} />
                </Field>
                <Field label="Identifiant (URL)" hint={locked ? `/produit/${p.slug}` : "Lettres, chiffres et tirets"}>
                  <div className="adm-inline">
                    <TextInput value={p.slug} onChange={(v) => update({ slug: slugify(v) })} disabled={locked} />
                    {locked && (
                      <a className="adm-icon-btn" href={`/produit/${p.slug}`} target="_blank" rel="noreferrer" aria-label="Voir la fiche">
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                </Field>
                <Field label="Sous-titre" wide>
                  <TextInput value={p.subtitle} onChange={(subtitle) => update({ subtitle })} />
                </Field>
                <Field label="Type de sticker">
                  <Select value={p.type} onChange={(type) => update({ type })} options={types.map((t) => ({ value: t.id, label: t.label }))} />
                </Field>
                <Field label="Image principale">
                  <ImagePicker value={p.image} onChange={(image) => update({ image })} />
                </Field>
                <Field label="Matières proposées" wide>
                  <CheckList options={materials} value={p.materials ?? []} onChange={(v) => update({ materials: v })} />
                </Field>
                <Field label="Finitions proposées" wide>
                  <CheckList options={finishes} value={p.finishes ?? []} onChange={(v) => update({ finishes: v })} />
                </Field>
                <div className="adm-field is-wide">
                  <ProductVideos
                    product={p}
                    products={products}
                    library={library}
                    materials={materials}
                    storage={storage}
                    upload={upload}
                    onAssign={(videos) => update({ videos })}
                    onEdit={editVideo}
                    onRemove={(id) => removeVideo(p.slug, id)}
                    onUpload={(file, id, field) => uploadVideo(p, file, id, field)}
                  />
                </div>
                <div className="adm-field is-wide">
                  <span className="adm-field-label">Blocs d&apos;information</span>
                  <ListEditor
                    items={p.info ?? []}
                    onChange={(info) => update({ info })}
                    itemTitle={(b) => b.title || "Bloc"}
                    addLabel="Ajouter un bloc"
                    create={() => ({ title: "", text: "" })}
                    renderItem={(b, upd) => (
                      <>
                        <Field label="Titre" wide>
                          <TextInput value={b.title} onChange={(title) => upd({ title })} />
                        </Field>
                        <Field label="Texte" wide>
                          <TextArea value={b.text} onChange={(text) => upd({ text })} rows={2} />
                        </Field>
                      </>
                    )}
                  />
                </div>
                <Field label="Mots-clés SEO" wide hint="Séparés par « • »">
                  <TextInput value={p.seo} onChange={(seo) => update({ seo })} />
                </Field>
              </>
            );
          }}
        />
      </Panel>
      <SaveBar
        editor={{
          dirty,
          saving: saving || Boolean(upload),
          save,
          reset,
          discard: () => {
            setProducts(saved);
            setLibrary(savedVideos);
          },
        }}
      />
    </div>
  );
}
