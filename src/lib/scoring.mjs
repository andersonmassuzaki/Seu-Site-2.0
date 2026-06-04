const PLATFORM_PATTERNS = [
  ["Braavo", /braavo/i],
  ["Nuvemshop", /nuvemshop/i],
  ["Loja Integrada", /loja integrada/i],
  ["VTEX", /vtex/i],
  ["Shopify", /shopify/i],
  ["WooCommerce", /woocommerce|wp-content\/plugins\/woocommerce/i],
  ["Tray", /tray/i],
  ["Wake", /wake commerce/i]
];

export function inspectHtml(html) {
  const text = html.replace(/\s+/g, " ");
  const lower = text.toLowerCase();
  const platform = PLATFORM_PATTERNS.find(([, pattern]) => pattern.test(html))?.[0] ?? "";
  const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] ?? "";
  const rawPhone =
    text.match(/(?:\+55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-.\s]?\d{4}/)?.[0] ?? "";
  const phone = rawPhone.replace(/[^\d+]/g, "");
  const whatsapp =
    html.match(/https?:\/\/(?:api\.)?whatsapp\.com\/[^\s"'<>]+/i)?.[0] ??
    html.match(/https?:\/\/wa\.me\/[^\s"'<>]+/i)?.[0] ??
    "";
  const instagram = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-z0-9._-]+\/?/i)?.[0] ?? "";
  const copyrightYears = [...text.matchAll(/(?:©|copyright)\s*(20\d{2})/gi)].map((match) =>
    Number(match[1])
  );
  const oldestRecentYear = copyrightYears.length ? Math.max(...copyrightYears) : "";

  return {
    title: html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.trim().slice(0, 120) ?? "",
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasWhatsapp: /whatsapp|wa\.me|api\.whatsapp/i.test(lower),
    hasInstagram: /instagram\.com/i.test(lower),
    hasCartTerms: /sacola|carrinho|checkout|finalizar compra|meu carrinho/i.test(lower),
    hasProductTerms: /produto|comprar|parcelamento|frete|troca|devolucao|devolução/i.test(lower),
    platform,
    email,
    phone,
    whatsapp,
    instagram,
    oldCopyright: oldestRecentYear && oldestRecentYear <= 2021 ? String(oldestRecentYear) : ""
  };
}

export function scoreLead(type, audit) {
  let score = 20;
  const technicalFlags = [];
  const commercialFlags = [];

  if (!audit.hasViewport) {
    score += 25;
    technicalFlags.push("sem meta viewport");
  }

  if (audit.oldCopyright) {
    score += 12;
    commercialFlags.push(`rodape parece antigo (${audit.oldCopyright})`);
  }

  if (!audit.hasWhatsapp) {
    score += type === "institucional" ? 14 : 8;
    commercialFlags.push("contato por WhatsApp pouco evidente");
  }

  if (!audit.hasInstagram) {
    score += 5;
    commercialFlags.push("Instagram nao encontrado no site");
  }

  if (type === "ecommerce") {
    if (audit.hasCartTerms) score += 10;
    if (audit.hasProductTerms) score += 10;
    if (audit.platform) score += 12;
    if (!audit.hasCartTerms) commercialFlags.push("estrutura de compra pouco evidente");
    if (!audit.hasProductTerms) commercialFlags.push("vitrine/produto pouco evidente");
  }

  if (type === "institucional") {
    if (!audit.hasCartTerms) score += 6;
    if (!audit.hasProductTerms) score += 6;
    commercialFlags.push("oportunidade de melhorar credibilidade e captacao");
  }

  const cappedScore = Math.max(0, Math.min(100, score));
  const priority = cappedScore >= 75 ? "alta" : cappedScore >= 55 ? "media" : "baixa";

  return {
    score: cappedScore,
    priority,
    technicalFlags,
    commercialFlags
  };
}

export function mainProblem(type, audit, scored) {
  if (!audit.hasViewport) return "Site pode estar com problemas de responsividade no mobile.";
  if (type === "ecommerce" && audit.platform) {
    return `Loja em ${audit.platform} com oportunidade de melhorar vitrine, mobile e jornada de compra.`;
  }
  if (type === "ecommerce") return "E-commerce com oportunidade de melhorar apresentacao e fluxo de compra.";
  if (!audit.hasWhatsapp) return "Site institucional com contato comercial pouco evidente.";
  return scored.commercialFlags[0] ?? "Oportunidade de melhorar percepcao profissional do site.";
}
