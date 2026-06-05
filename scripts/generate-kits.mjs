import fs from "node:fs";
import path from "node:path";
import { readCsv } from "../src/lib/csv.mjs";
import {
  buildOnePageMarkdown,
  buildPdfHtml,
  buildPreviewHtml,
  buildVideoStoryboard,
  kitSlug
} from "../src/lib/kit.mjs";
import { buildEcommerceFashionPreview } from "../src/lib/templates/ecommerce-fashion.mjs";
import { buildBarbershopPreview } from "../src/lib/templates/barbershop.mjs";

function pickTemplate(lead, brand) {
  if (
    lead.type === "ecommerce" &&
    brand &&
    Array.isArray(brand.content?.products) &&
    brand.content.products.length >= 4
  ) {
    return "ecommerce-fashion";
  }
  const cat = brand?.category || "";
  if (lead.type === "barbershop" || cat === "barber_shop" || cat === "hair_salon") {
    return "barbershop";
  }
  return "generic";
}

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outbox = readCsv(path.join(root, "data/outbox.csv"));
const kitRoot = path.join(root, "kits");
fs.mkdirSync(kitRoot, { recursive: true });

let count = 0;
for (const lead of outbox) {
  if (!lead.lead_id) continue;
  const dir = path.join(kitRoot, kitSlug(lead));
  const previewDir = path.join(dir, "preview");
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  fs.writeFileSync(path.join(dir, "diagnostico-pdf.html"), buildPdfHtml(lead));
  fs.writeFileSync(path.join(dir, "resumo.md"), buildOnePageMarkdown(lead));
  fs.writeFileSync(
    path.join(dir, "roteiro-video.json"),
    `${JSON.stringify(buildVideoStoryboard(lead), null, 2)}\n`
  );
  fs.writeFileSync(path.join(dir, "mensagem.txt"), `${lead.message}\n`);

  const brandPath = path.join(dir, "brand.json");
  let brand = null;
  if (fs.existsSync(brandPath)) {
    try {
      brand = JSON.parse(fs.readFileSync(brandPath, "utf8"));
    } catch {}
  }
  const hasShots = fs.existsSync(path.join(previewDir, "shots", "desktop.png"));
  const template = pickTemplate(lead, brand);

  if (template === "barbershop") {
    fs.writeFileSync(
      path.join(previewDir, "index.html"),
      buildBarbershopPreview(lead, brand)
    );
  } else if (template === "ecommerce-fashion") {
    // "Depois" = template premium dedicado
    fs.writeFileSync(
      path.join(previewDir, "index.html"),
      buildEcommerceFashionPreview(lead, brand)
    );
    // "Antes" = preview com screenshots reais
    if (hasShots) {
      fs.writeFileSync(
        path.join(previewDir, "antes.html"),
        buildPreviewHtml(lead, brand, { hasShots, beforeOnly: true })
      );
    }
  } else {
    fs.writeFileSync(
      path.join(previewDir, "index.html"),
      buildPreviewHtml(lead, brand, { hasShots })
    );
  }
  count += 1;
}

console.log(`Generated ${count} prospect kits in ${kitRoot}`);
