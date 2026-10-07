import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaCar,
  FaHome,
  FaIndustry,
  FaStar,
  FaStore,
  FaTag,
  FaWineBottle,
} from "react-icons/fa";
import { createCatalog } from "../../../backend/shared/catalog.js";
import { DEFAULT_CATALOG, DEFAULT_PRODUCTS, DEFAULT_SITE, mediaUrl } from "../../../backend/shared/defaults.js";

export const TYPE_ICON_COMPONENTS = {
  tag: FaTag,
  bottle: FaWineBottle,
  box: FaBoxOpen,
  car: FaCar,
  home: FaHome,
  star: FaStar,
  store: FaStore,
  calendar: FaCalendarAlt,
  industry: FaIndustry,
};

const OBJECT_KEYS = ["topbar", "contact", "hero", "socials", "payment"];

function mergeSite(remote) {
  if (!remote || typeof remote !== "object") return DEFAULT_SITE;
  const site = { ...DEFAULT_SITE, ...remote };
  for (const key of OBJECT_KEYS) site[key] = { ...DEFAULT_SITE[key], ...(remote[key] ?? {}) };
  return site;
}

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [remote, setRemote] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/site", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => !cancelled && data && setRemote(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const catalog = createCatalog(remote?.catalog ?? DEFAULT_CATALOG);
    const productList = Array.isArray(remote?.products) ? remote.products : DEFAULT_PRODUCTS;
    return {
      loaded: Boolean(remote),
      site: mergeSite(remote?.site),
      catalog,
      products: Object.fromEntries(productList.filter((p) => p?.slug).map((p) => [p.slug, p])),
      pricing: remote?.pricing ?? { enabled: false, currency: "MAD" },
    };
  }, [remote]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

/** Visible site videos with resolved URLs (`url`, `posterUrl`). */
export function useVideos() {
  const { site } = useContext(SiteDataContext);
  return useMemo(
    () =>
      (Array.isArray(site.videos) ? site.videos : DEFAULT_SITE.videos)
        .filter((v) => v?.id && v.src && v.visible !== false)
        .map((v) => ({ ...v, url: mediaUrl(v.src), posterUrl: mediaUrl(v.poster) })),
    [site.videos],
  );
}

export function useCatalog() {
  return useContext(SiteDataContext).catalog;
}

const formatAmount = (value, currency) => (value == null ? null : `${value.toLocaleString("fr-FR")} ${currency}`);

// Prices are computed server-side so cost coefficients never reach the browser.
export function useEstimates(configs) {
  const { pricing } = useSiteData();
  const [result, setResult] = useState({ each: [], total: null });
  const key = JSON.stringify(configs);

  useEffect(() => {
    const items = JSON.parse(key);
    if (!pricing.enabled || !items.length) {
      setResult({ each: [], total: null });
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/public/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const currency = data?.currency || pricing.currency;
          const values = data?.estimates ?? [];
          const total = values.length && values.every((v) => v != null) ? values.reduce((a, b) => a + b, 0) : null;
          setResult({ each: values.map((v) => formatAmount(v, currency)), total: formatAmount(total, currency) });
        })
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, pricing.enabled, pricing.currency]);

  return result;
}

export function useEstimate(config) {
  return useEstimates([config]).total;
}
