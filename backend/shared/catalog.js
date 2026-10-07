import { DEFAULT_CATALOG, DEFAULT_PRICING } from "./defaults.js";

const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

export function createCatalog(rawCatalog = DEFAULT_CATALOG, rawPricing = DEFAULT_PRICING) {
  const catalog = { ...DEFAULT_CATALOG, ...(rawCatalog ?? {}) };
  const pricing = { ...DEFAULT_PRICING, ...(rawPricing ?? {}) };
  const { types, materials, finishes, cuts, usages, compatibility } = catalog;
  const tiers = [...(catalog.quantityTiers ?? [])].map(Number).filter((n) => n > 0).sort((a, b) => a - b);

  const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;
  const materialsForType = (typeId) => {
    const allowed = types.find((t) => t.id === typeId)?.materials ?? materials.map((m) => m.id);
    return allowed.filter((id) => materials.some((m) => m.id === id));
  };
  const isMaterialAllowed = (typeId, materialId) => materialsForType(typeId).includes(materialId);
  const compatValue = (materialId, finishId) => compatibility?.[materialId]?.[finishId] ?? true;
  const isCompatible = (materialId, finishId) => compatValue(materialId, finishId) !== false;

  const defaultConfig = {
    type: types[0]?.id ?? "",
    material: materialsForType(types[0]?.id)[0] ?? materials[0]?.id ?? "",
    finish: finishes[0]?.id ?? "",
    width: catalog.defaults?.width ?? 100,
    height: catalog.defaults?.height ?? 100,
    quantity: catalog.defaults?.quantity ?? tiers[0] ?? 100,
    cut: catalog.defaults?.cut ?? cuts[0]?.id ?? "",
    usage: catalog.defaults?.usage ?? usages[0]?.id ?? "",
  };

  const pick = (list, value, fallback) => (list.some((item) => item.id === value) ? value : fallback);

  const normalizeConfig = (config) => {
    const c = { ...defaultConfig, ...config };
    c.type = pick(types, c.type, defaultConfig.type);
    const allowed = materialsForType(c.type);
    c.material = allowed.includes(c.material) ? c.material : (allowed[0] ?? defaultConfig.material);
    c.finish = pick(finishes, c.finish, defaultConfig.finish);
    if (!isCompatible(c.material, c.finish)) {
      c.finish = finishes.find((f) => isCompatible(c.material, f.id))?.id ?? c.finish;
    }
    c.cut = pick(cuts, c.cut, defaultConfig.cut);
    c.usage = pick(usages, c.usage, defaultConfig.usage);
    c.width = Math.round(Number(c.width) || defaultConfig.width);
    c.height = Math.round(Number(c.height) || defaultConfig.height);
    c.quantity = Math.max(1, Math.round(Number(c.quantity) || defaultConfig.quantity));
    return c;
  };

  const estimatePrice = (config) => {
    const area = (config.width / 1000) * (config.height / 1000) * config.quantity;
    const material = num(pricing.materialPerM2?.[config.material]);
    const finish = num(pricing.finishPerM2?.[config.finish]);
    const cut = num(pricing.cutPerUnit?.[config.cut]);
    const print = num(pricing.printPerM2);
    const packaging = num(pricing.packaging) ?? 0;
    const margin = num(pricing.margin);
    if ([material, finish, cut, print, margin].some((p) => p === null)) return null;

    const tier = [...tiers].reverse().find((t) => config.quantity >= t);
    const discount = (num(pricing.quantityDiscount?.[tier]) ?? 0) / 100;
    const base = area * (material + print + finish) + cut * config.quantity + packaging;
    const total = base * (1 - discount) * (1 + margin / 100);
    const minimum = num(pricing.minimumOrder) ?? 0;
    return Math.round(Math.max(total, minimum));
  };

  const pricingReady = () =>
    num(pricing.printPerM2) !== null &&
    num(pricing.margin) !== null &&
    materials.some((m) => num(pricing.materialPerM2?.[m.id]) !== null);

  const formatPrice = (value) =>
    value === null || value === undefined ? null : `${Number(value).toLocaleString("fr-FR")} ${pricing.currency || "MAD"}`;

  const describeConfig = (config) =>
    [
      labelOf(materials, config.material),
      labelOf(finishes, config.finish),
      `${config.width} × ${config.height} mm`,
      `${config.quantity} ex.`,
      labelOf(cuts, config.cut),
    ].join(" • ");

  return {
    types,
    materials,
    finishes,
    cuts,
    usages,
    compatibility,
    tiers,
    dimensionLimits: catalog.dimensionLimits,
    fileRules: catalog.fileRules,
    pricing,
    defaultConfig,
    labelOf,
    materialsForType,
    isMaterialAllowed,
    compatValue,
    isCompatible,
    normalizeConfig,
    estimatePrice,
    pricingReady,
    formatPrice,
    describeConfig,
  };
}
