import { useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaCloudUploadAlt, FaEyeSlash, FaFilm, FaImage, FaTimes } from "react-icons/fa";
import { mediaUrl } from "../../../backend/shared/defaults.js";
import { Select, TextInput, Toggle } from "./ui.jsx";

export const VIDEO_ACCEPT = "video/mp4,video/webm";
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function uploadMedia(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    xhr.open("POST", "/api/admin/media");
    xhr.withCredentials = true;
    xhr.setRequestHeader("accept", "application/json");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status === 401) window.dispatchEvent(new Event("admin:unauthorized"));
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error || `Erreur ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Connexion au serveur impossible."));
    xhr.send(form);
  });
}

export const titleFromFile = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .slice(0, 60) || "Nouvelle vidéo";

export function FilePick({ accept, disabled, onFile, className = "", children, title }) {
  const input = useRef(null);
  return (
    <>
      <button type="button" className={className} disabled={disabled} onClick={() => input.current?.click()} title={title}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

function VideoTile({ video, index, total, materials, sharedWith, upload, storage, onChange, onMove, onRemove, onUpload }) {
  const src = mediaUrl(video.src);
  const poster = mediaUrl(video.poster);
  const busy = upload?.id === video.id;
  const locked = !storage || Boolean(upload);

  return (
    <article className={`cf-card vd-card ${video.visible === false ? "is-hidden" : ""}`}>
      <div className="vd-media">
        {src ? (
          <video key={src} src={src} poster={poster || undefined} muted loop playsInline controls preload={poster ? "none" : "metadata"} />
        ) : (
          <span className="vd-media-empty">
            <FaFilm aria-hidden="true" /> Aucune vidéo
          </span>
        )}
        <span className="vd-badges">
          <span className="vd-badge">Vidéo {index + 1}</span>
          {video.visible === false && (
            <span className="vd-badge is-off">
              <FaEyeSlash aria-hidden="true" /> Masquée
            </span>
          )}
        </span>
        <div className="cf-tools is-floating">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Déplacer à gauche">
            <FaArrowLeft />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Déplacer à droite">
            <FaArrowRight />
          </button>
          <button type="button" className="is-danger" onClick={onRemove} aria-label="Retirer la vidéo de cette fiche">
            <FaTimes />
          </button>
        </div>
        {busy && (
          <span className="vd-progress">
            <span style={{ width: `${upload.progress}%` }} />
            <em>Envoi… {upload.progress}%</em>
          </span>
        )}
      </div>

      <div className="vd-body">
        <label className="vd-field">
          <span>Titre affiché</span>
          <TextInput value={video.label} onChange={(label) => onChange({ label })} maxLength={60} />
        </label>
        <label className="vd-field">
          <span>Matière (configurateur)</span>
          <Select
            value={video.material ?? ""}
            onChange={(material) => onChange({ material: material || null })}
            options={[{ value: "", label: "Aucune — pas dans le configurateur" }, ...materials.map((m) => ({ value: m.id, label: m.label }))]}
          />
        </label>
        {sharedWith.length > 0 && <p className="vd-shared">Aussi sur : {sharedWith.join(", ")}</p>}
        <div className="vd-foot">
          <Toggle checked={video.visible !== false} onChange={(visible) => onChange({ visible })} label={video.visible === false ? "Masquée" : "Visible"} />
          <div className="vd-files">
            <FilePick
              accept={VIDEO_ACCEPT}
              disabled={locked}
              onFile={(file) => onUpload(file, "src")}
              className="adm-btn adm-btn--ghost"
              title={storage ? "Remplacer le fichier vidéo" : "Stockage de fichiers non configuré"}
            >
              <FaFilm aria-hidden="true" /> Remplacer
            </FilePick>
            <FilePick
              accept={IMAGE_ACCEPT}
              disabled={locked}
              onFile={(file) => onUpload(file, "poster")}
              className="adm-btn adm-btn--ghost"
              title={storage ? "Image affichée avant la lecture" : "Stockage de fichiers non configuré"}
            >
              <FaImage aria-hidden="true" /> Aperçu
            </FilePick>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Videos of one product page: upload, edit, reorder, remove. */
export function ProductVideos({ product, products, library, materials, storage, upload, onAssign, onEdit, onRemove, onUpload }) {
  const ids = (product.videos ?? []).filter((id) => library.some((v) => v.id === id));
  const videos = ids.map((id) => library.find((v) => v.id === id));
  const nameOf = (slug) => products.find((p) => p.slug === slug)?.name || slug;
  const newKey = `new:${product.slug}`;

  const move = (index, dir) => {
    const next = [...ids];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onAssign(next);
  };

  return (
    <div className="pv-block">
      <div className="pv-head">
        <div>
          <span className="adm-field-label">Vidéos de la fiche</span>
          <small className="adm-field-hint">
            Affichées sous l&apos;aperçu produit. MP4 (H.264) ou WebM, 60 Mo max — idéalement moins de 15 s, 720 px de large, sans son.
          </small>
        </div>
        <div className="pv-actions">
          <FilePick
            accept={VIDEO_ACCEPT}
            disabled={!storage || Boolean(upload)}
            onFile={(file) => onUpload(file, null, "src")}
            className="adm-btn adm-btn--gold"
            title={storage ? "MP4 ou WebM, 60 Mo maximum" : "Stockage de fichiers non configuré"}
          >
            <FaCloudUploadAlt aria-hidden="true" /> {upload?.id === newKey ? `Envoi… ${upload.progress}%` : "Importer une vidéo"}
          </FilePick>
        </div>
      </div>

      {!storage && (
        <p className="adm-alert adm-alert--warn">Stockage de fichiers (R2 « FILES ») non configuré : import de nouvelles vidéos indisponible.</p>
      )}

      {videos.length ? (
        <div className="pv-grid">
          {videos.map((v, i) => (
            <VideoTile
              key={v.id}
              video={v}
              index={i}
              total={videos.length}
              materials={materials}
              sharedWith={products.filter((p) => p.slug !== product.slug && (p.videos ?? []).includes(v.id)).map((p) => nameOf(p.slug))}
              upload={upload}
              storage={storage}
              onChange={(patch) => onEdit(v.id, patch)}
              onMove={(dir) => move(i, dir)}
              onRemove={() => onRemove(v.id)}
              onUpload={(file, field) => onUpload(file, v.id, field)}
            />
          ))}
        </div>
      ) : (
        <p className="pv-empty">
          <FaFilm aria-hidden="true" /> Aucune vidéo sur cette fiche — la section vidéo est masquée sur le site.
        </p>
      )}
    </div>
  );
}
