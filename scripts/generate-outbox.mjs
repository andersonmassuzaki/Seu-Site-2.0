import fs from "node:fs";
import path from "node:path";
import { loadEnv, numberEnv } from "../src/lib/env.mjs";
import { appendCsv, readCsv } from "../src/lib/csv.mjs";
import { buildDiagnosis, buildMessage, nextAction } from "../src/lib/messages.mjs";
import { scoreLead } from "../src/lib/scoring.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
loadEnv(root);

const minScore = numberEnv("MIN_SCORE_TO_EXPORT", 55);
const config = JSON.parse(fs.readFileSync(path.join(root, "config/segments.json"), "utf8"));
const historyPath = path.join(root, "data/history.json");
const history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
const exported = new Set(history.exportedLeadIds);
const leads = readCsv(path.join(root, "data/leads.csv"));
const audits = new Map(readCsv(path.join(root, "data/site_audits.csv")).map((audit) => [audit.lead_id, audit]));
const outboxRows = [];

for (const lead of leads) {
  const score = Number(lead.score || 0);
  const segmentMinScore = config[lead.type]?.minScoreToExport ?? minScore;
  if (!lead.id || exported.has(lead.id) || score < segmentMinScore) continue;

  const auditRow = audits.get(lead.id) ?? {};
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
  outboxRows.push({
    lead_id: lead.id,
    type: lead.type,
    name: lead.name,
    url: lead.url,
    email: lead.email,
    phone: lead.phone,
    whatsapp: lead.whatsapp,
    instagram: lead.instagram,
    score: lead.score,
    priority: lead.priority,
    diagnosis: buildDiagnosis(lead, audit, scored),
    message: buildMessage(lead, audit, scored),
    offer: config[lead.type]?.offer ?? "",
    next_action: nextAction(score),
    next_follow_up_at: lead.next_follow_up_at,
    created_at: new Date().toISOString()
  });
  exported.add(lead.id);
}

appendCsv(path.join(root, "data/outbox.csv"), outboxRows, [
  "lead_id",
  "type",
  "name",
  "url",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "score",
  "priority",
  "diagnosis",
  "message",
  "offer",
  "next_action",
  "next_follow_up_at",
  "created_at"
]);

if (process.env.CRM_WEBHOOK_URL && outboxRows.length) {
  for (const row of outboxRows) {
    const response = await fetch(process.env.CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row)
    });
    if (!response.ok) {
      console.error(`Webhook failed for ${row.lead_id}: ${response.status}`);
    }
  }
}

history.exportedLeadIds = [...exported];
fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Generated ${outboxRows.length} outbox rows.`);
