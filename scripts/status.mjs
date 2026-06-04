import path from "node:path";
import { readCsv } from "../src/lib/csv.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const leads = readCsv(path.join(root, "data/leads.csv"));
const audits = readCsv(path.join(root, "data/site_audits.csv"));
const outbox = readCsv(path.join(root, "data/outbox.csv"));

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "vazio";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function printCounts(title, counts) {
  console.log(`\n${title}`);
  for (const [key, value] of Object.entries(counts).sort()) {
    console.log(`- ${key}: ${value}`);
  }
}

const high = leads.filter((lead) => lead.priority === "alta");
const medium = leads.filter((lead) => lead.priority === "media");
const contactable = leads.filter((lead) => lead.email || lead.phone || lead.whatsapp || lead.instagram);

console.log("Prospection status");
console.log("==================");
console.log(`Leads: ${leads.length}`);
console.log(`Audits: ${audits.length}`);
console.log(`Outbox rows: ${outbox.length}`);
console.log(`High priority: ${high.length}`);
console.log(`Medium priority: ${medium.length}`);
console.log(`With contact found: ${contactable.length}`);

printCounts("By type", countBy(leads, "type"));
printCounts("By priority", countBy(leads, "priority"));
printCounts("By status", countBy(leads, "status"));

const next = leads
  .filter((lead) => lead.score && Number(lead.score) >= 55)
  .sort((a, b) => Number(b.score) - Number(a.score))
  .slice(0, 10);

if (next.length) {
  console.log("\nTop next actions");
  for (const lead of next) {
    console.log(`- ${lead.score} ${lead.priority} | ${lead.name} | ${lead.url}`);
  }
}
