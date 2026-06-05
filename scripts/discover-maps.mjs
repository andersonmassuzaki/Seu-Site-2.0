import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "../src/lib/env.mjs";
import { readCsv, appendCsv } from "../src/lib/csv.mjs";

loadEnv();

const root = path.resolve(new URL("..", import.meta.url).pathname);
const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY) {
  console.error("GOOGLE_MAPS_API_KEY ausente em .env");
  process.exit(1);
}

const queryArg = process.argv.find((a) => a.startsWith("--query="));
const locationArg = process.argv.find((a) => a.startsWith("--location="));
const radiusArg = process.argv.find((a) => a.startsWith("--radius="));
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const typeArg = process.argv.find((a) => a.startsWith("--type="));

if (!queryArg) {
  console.error(
    "Uso: node scripts/discover-maps.mjs --query='barbearia santo amaro' [--location='Santo Amaro, Sao Paulo'] [--radius=3000] [--limit=20] [--type=barbershop]"
  );
  process.exit(1);
}

const query = queryArg.slice("--query=".length);
const locationHint = locationArg ? locationArg.slice("--location=".length) : null;
const radiusM = radiusArg ? parseInt(radiusArg.slice("--radius=".length), 10) : 5000;
const limit = limitArg ? parseInt(limitArg.slice("--limit=".length), 10) : 20;
const leadType = typeArg ? typeArg.slice("--type=".length) : "local-business";

console.log(`Buscando: "${query}" (limit ${limit})`);

const places = await searchPlaces(query, locationHint, radiusM, limit);
console.log(`Encontrados ${places.length} negocios.`);

const leadsPath = path.join(root, "data/leads.csv");
const existing = new Set(readCsv(leadsPath).map((l) => l.id));
const headers = [
  "id", "type", "name", "url", "source_query", "city", "niche",
  "status", "score", "priority", "main_problem",
  "email", "phone", "whatsapp", "instagram",
  "next_action", "next_follow_up_at", "created_at", "updated_at"
];

const rows = [];
const mapsDir = path.join(root, "data/maps");
fs.mkdirSync(mapsDir, { recursive: true });

for (const p of places) {
  const id = `${leadType}:${slug(p.displayName?.text)}-${shortHash(p.id)}`;
  if (existing.has(id)) continue;

  // grava raw da Places API por lead pra usar no builder de brand
  fs.writeFileSync(
    path.join(mapsDir, `${slug(p.displayName?.text)}-${shortHash(p.id)}.json`),
    JSON.stringify(p, null, 2)
  );

  rows.push({
    id,
    type: leadType,
    name: p.displayName?.text || "",
    url: p.websiteUri || "",
    source_query: query,
    city: extractCity(p.formattedAddress),
    niche: p.primaryType || "",
    status: "discovered",
    score: "",
    priority: "",
    main_problem: p.websiteUri ? "" : "sem-site",
    email: "",
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "",
    whatsapp: "",
    instagram: "",
    next_action: p.websiteUri ? "auditar-site-atual" : "criar-site-do-zero",
    next_follow_up_at: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

if (rows.length) {
  appendCsv(leadsPath, rows, headers);
  console.log(`+${rows.length} leads novos em data/leads.csv`);
} else {
  console.log("Nenhum lead novo (todos ja existiam).");
}

// breakdown
const withSite = rows.filter((r) => r.url).length;
const withoutSite = rows.length - withSite;
console.log(`Com site: ${withSite} | Sem site: ${withoutSite}`);

// ----------------------------------------------------------------

async function searchPlaces(textQuery, locHint, radius, max) {
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.shortFormattedAddress",
    "places.location",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.rating",
    "places.userRatingCount",
    "places.primaryType",
    "places.primaryTypeDisplayName",
    "places.types",
    "places.regularOpeningHours",
    "places.priceLevel",
    "places.editorialSummary",
    "places.businessStatus",
    "places.photos",
    "places.reviews",
    "nextPageToken"
  ].join(",");

  let collected = [];
  let pageToken = null;

  while (collected.length < max) {
    const body = {
      textQuery: locHint ? `${textQuery} ${locHint}` : textQuery,
      pageSize: Math.min(20, max - collected.length),
      languageCode: "pt-BR",
      regionCode: "BR"
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": fieldMask
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = await res.json();
    if (!json.places || !json.places.length) break;
    collected = collected.concat(json.places);

    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
    await new Promise((r) => setTimeout(r, 2000)); // Places exige delay para pageToken
  }

  return collected.slice(0, max).filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY");
}

function slug(s) {
  return String(s || "lead")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

function shortHash(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i += 1) {
    h = (h * 31 + String(s).charCodeAt(i)) >>> 0;
  }
  return h.toString(36).slice(0, 6);
}

function extractCity(addr) {
  if (!addr) return "";
  // tenta pegar "..., Cidade - UF, CEP, Brazil"
  const m = addr.match(/,\s*([^,]+?)\s*-\s*[A-Z]{2}/);
  return m ? m[1].trim() : "";
}
