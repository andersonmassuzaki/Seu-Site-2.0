import fs from "node:fs";
import path from "node:path";
import { readCsv } from "../src/lib/csv.mjs";
import { buildOnePageMarkdown, buildPdfHtml, buildVideoStoryboard, kitSlug } from "../src/lib/kit.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outbox = readCsv(path.join(root, "data/outbox.csv"));
const kitRoot = path.join(root, "kits");
fs.mkdirSync(kitRoot, { recursive: true });

let count = 0;
for (const lead of outbox) {
  if (!lead.lead_id) continue;
  const dir = path.join(kitRoot, kitSlug(lead));
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, "diagnostico-pdf.html"), buildPdfHtml(lead));
  fs.writeFileSync(path.join(dir, "resumo.md"), buildOnePageMarkdown(lead));
  fs.writeFileSync(
    path.join(dir, "roteiro-video.json"),
    `${JSON.stringify(buildVideoStoryboard(lead), null, 2)}\n`
  );
  fs.writeFileSync(path.join(dir, "mensagem.txt"), `${lead.message}\n`);
  count += 1;
}

console.log(`Generated ${count} prospect kits in ${kitRoot}`);
