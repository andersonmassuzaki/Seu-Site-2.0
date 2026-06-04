import path from "node:path";
import { readCsv, writeCsv } from "../src/lib/csv.mjs";
import { mainProblem, scoreLead } from "../src/lib/scoring.mjs";
import { nextAction } from "../src/lib/messages.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const leadsPath = path.join(root, "data/leads.csv");
const auditsPath = path.join(root, "data/site_audits.csv");
const leads = readCsv(leadsPath);
const audits = new Map(readCsv(auditsPath).map((audit) => [audit.lead_id, audit]));
const now = new Date().toISOString();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const updated = leads.map((lead) => {
  const auditRow = audits.get(lead.id);
  if (!auditRow) return lead;

  const audit = {
    hasViewport: auditRow.has_viewport === "yes",
    hasWhatsapp: auditRow.has_whatsapp === "yes",
    hasInstagram: auditRow.has_instagram === "yes",
    hasCartTerms: auditRow.has_cart_terms === "yes",
    hasProductTerms: auditRow.has_product_terms === "yes",
    platform: auditRow.platform,
    oldCopyright: auditRow.old_copyright
  };
  const scored = scoreLead(lead.type, audit);

  return {
    ...lead,
    score: String(scored.score),
    priority: scored.priority,
    main_problem: mainProblem(lead.type, audit, scored),
    email: lead.email || auditRow.email || "",
    phone: lead.phone || auditRow.phone || "",
    whatsapp: lead.whatsapp || auditRow.whatsapp || "",
    instagram: lead.instagram || auditRow.instagram || "",
    next_action: nextAction(scored.score),
    next_follow_up_at: lead.next_follow_up_at || (scored.score >= 55 ? tomorrow : ""),
    updated_at: now
  };
});

writeCsv(leadsPath, updated, [
  "id",
  "type",
  "name",
  "url",
  "source_query",
  "city",
  "niche",
  "status",
  "score",
  "priority",
  "main_problem",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "next_action",
  "next_follow_up_at",
  "created_at",
  "updated_at"
]);
console.log(`Scored ${updated.length} leads.`);
