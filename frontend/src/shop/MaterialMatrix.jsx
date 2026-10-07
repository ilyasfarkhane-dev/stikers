import { FaArrowRight, FaCheck } from "react-icons/fa";
import { AppLink } from "../router.jsx";
import { useCatalog } from "./SiteData.jsx";

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="mf-cell mf-cell--yes" aria-label="Compatible">
        <FaCheck aria-hidden="true" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="mf-cell mf-cell--no" aria-label="Non disponible">
        —
      </span>
    );
  }
  return <span className="mf-cell mf-cell--cond">{value}</span>;
}

export function MaterialMatrix({
  selected,
  onSelect,
  isMaterialEnabled = () => true,
  typeLabel,
  showActions = true,
  id = "matrice",
}) {
  const { finishes: FINISHES, materials: MATERIALS, compatValue } = useCatalog();
  const interactive = typeof onSelect === "function";

  return (
    <section className={`mf-matrix ${interactive ? "is-interactive" : ""}`} id={id}>
      <div className="mf-matrix-inner">
        <header className="mf-matrix-head">
          <div>
            <p className="shop-kicker">
              Guide de compatibilité
              <span aria-hidden="true" />
            </p>
            <h2>
              Matières <em>×</em> Finitions
            </h2>
            <p>
              {interactive
                ? `Cliquez sur une combinaison compatible pour l'appliquer à votre sticker.${
                    typeLabel ? ` Les matières grisées ne sont pas proposées pour un ${typeLabel.toLowerCase()}.` : ""
                  }`
                : "Quelle finition pour quelle matière ? Repérez en un coup d'œil les combinaisons possibles."}
            </p>
          </div>
          <ul className="mf-legend" aria-label="Légende">
            <li>
              <Cell value={true} /> Compatible
            </li>
            <li>
              <Cell value="Selon usage" />
            </li>
            <li>
              <Cell value={false} /> Non disponible
            </li>
          </ul>
        </header>

        <div className="mf-matrix-card">
          <table className="mf-matrix-table">
            <thead>
              <tr>
                <th scope="col">Matière</th>
                {FINISHES.map((f) => (
                  <th scope="col" key={f.id} className={selected?.finish === f.id ? "is-selected-col" : undefined}>
                    <span className={`finish-swatch finish-swatch--${f.tone} mf-head-swatch`} aria-hidden="true" />
                    {f.label}
                  </th>
                ))}
                <th scope="col">Usage</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map((m) => {
                const rowSelected = selected?.material === m.id;
                const rowEnabled = isMaterialEnabled(m.id);
                const rowClass = [rowSelected && "is-selected-row", !rowEnabled && "is-disabled-row"]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr key={m.id} className={rowClass || undefined}>
                    <th scope="row">
                      <span className={`finish-swatch finish-swatch--${m.tone} mf-row-swatch`} aria-hidden="true" />
                      {m.label}
                    </th>
                    {FINISHES.map((f) => {
                      const value = compatValue(m.id, f.id);
                      const active = rowSelected && selected?.finish === f.id;
                      const classes = [selected?.finish === f.id && "is-selected-col", active && "is-active"]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <td key={f.id} className={classes || undefined}>
                          {interactive && rowEnabled && value !== false ? (
                            <button
                              type="button"
                              className="mf-cell-btn"
                              aria-pressed={active}
                              aria-label={`${m.label} + ${f.label}`}
                              onClick={() => onSelect({ material: m.id, finish: f.id })}
                            >
                              <Cell value={value} />
                            </button>
                          ) : (
                            <Cell value={value} />
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <span className="mf-usage">{m.usage}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="mf-matrix-foot">
          <p>Compatibilités indicatives, confirmées lors du contrôle de votre fichier selon le support et l&apos;usage.</p>
          {showActions && (
            <div>
              <AppLink className="btn btn-primary" href="/produit/sticker-classique">
                Voir la fiche produit <FaArrowRight aria-hidden="true" />
              </AppLink>
              <AppLink className="btn btn-outline-light" href="/configurateur">
                Ouvrir le configurateur <FaArrowRight aria-hidden="true" />
              </AppLink>
            </div>
          )}
        </footer>
      </div>
    </section>
  );
}
