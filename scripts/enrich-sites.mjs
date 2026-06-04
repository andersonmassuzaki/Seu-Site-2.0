import path from "node:path";
import { loadEnv, numberEnv } from "../src/lib/env.mjs";
import { readCsv, writeCsv } from "../src/lib/csv.mjs";
import { inspectHtml } from "../src/lib/scoring.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
loadEnv(root);

const timeoutMs = numberEnv("FETCH_TIMEOUT_MS", 12000);
const leadsPath = path.join(root, "data/leads.csv");
const auditsPath = path.join(root, "data/site_audits.csv");
const leads = readCsv(leadsPath);
const existingAudits = readCsv(auditsPath);
const auditedIds = new Set(existingAudits.map((audit) => audit.lead_id));
const audits = [...existingAudits];

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 prospect-audit-bot/0.1"
      }
    });
    if (!response.ok) return "";
    return response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

for (const lead of leads) {
  if (!lead.id || auditedIds.has(lead.id)) continue;
  console.log(`Auditing: ${lead.url}`);
  const html = await fetchHtml(lead.url);
  const audit = html ? inspectHtml(html) : {};
  audits.push({
    lead_id: lead.id,
    url: lead.url,
    type: lead.type,
    title: audit.title ?? "",
    has_viewport: audit.hasViewport ? "yes" : "no",
    has_whatsapp: audit.hasWhatsapp ? "yes" : "no",
    has_instagram: audit.hasInstagram ? "yes" : "no",
    has_cart_terms: audit.hasCartTerms ? "yes" : "no",
    has_product_terms: audit.hasProductTerms ? "yes" : "no",
    platform: audit.platform ?? "",
    email: audit.email ?? "",
    phone: audit.phone ?? "",
    whatsapp: audit.whatsapp ?? "",
    instagram: audit.instagram ?? "",
    old_copyright: audit.oldCopyright ?? "",
    technical_flags: html ? "" : "falha ao baixar html",
    commercial_flags: "",
    audited_at: new Date().toISOString()
  });
}

writeCsv(auditsPath, audits, [
  "lead_id",
  "url",
  "type",
  "title",
  "has_viewport",
  "has_whatsapp",
  "has_instagram",
  "has_cart_terms",
  "has_product_terms",
  "platform",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "old_copyright",
  "technical_flags",
  "commercial_flags",
  "audited_at"
]);
console.log(`Audits total: ${audits.length}`);
