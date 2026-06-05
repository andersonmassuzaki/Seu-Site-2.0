import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "../src/lib/env.mjs";
import { readCsv, appendCsv } from "../src/lib/csv.mjs";
import { kitSlug } from "../src/lib/kit.mjs";

loadEnv();
const root = path.resolve(new URL("..", import.meta.url).pathname);
const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY) {
  console.error("GOOGLE_MAPS_API_KEY ausente em .env");
  process.exit(1);
}

const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;

const leads = readCsv(path.join(root, "data/leads.csv"));
const mapsDir = path.join(root, "data/maps");
if (!fs.existsSync(mapsDir)) {
  console.log("Sem dados de maps em data/maps/, nada a fazer.");
  process.exit(0);
}

// indexa lead pelo sufixo hash do id
const leadByHash = new Map();
for (const l of leads) {
  const hash = String(l.id || "").split("-").pop();
  if (hash) leadByHash.set(hash, l);
}

const outboxPath = path.join(root, "data/outbox.csv");
const existingOutbox = new Set(readCsv(outboxPath).map((r) => r.lead_id));
const outboxHeaders = [
  "lead_id", "type", "name", "url", "email", "phone", "whatsapp", "instagram",
  "score", "priority", "diagnosis", "message", "offer",
  "next_action", "next_follow_up_at", "created_at"
];

const palettesByCategory = {
  barber_shop:   { primary: "#1f1410", accent: "#b08454", paper: "#0f0a07", ink: "#f3ecdf" },
  hair_salon:    { primary: "#a85d6a", accent: "#d4a8a8", paper: "#fff7f5", ink: "#231013" },
  restaurant:    { primary: "#8b1a1a", accent: "#d4a574", paper: "#fbf6ee", ink: "#1a0e0a" },
  cafe:          { primary: "#5d3a1a", accent: "#c9a880", paper: "#fdf8ee", ink: "#1f1208" },
  bakery:        { primary: "#8a5a2b", accent: "#e6c789", paper: "#fdf6e7", ink: "#211306" },
  gym:           { primary: "#0d0d0d", accent: "#f0c41a", paper: "#0a0a0a", ink: "#f5f5f5" },
  beauty_salon:  { primary: "#c4849b", accent: "#e6c4c8", paper: "#fff5f5", ink: "#22121a" },
  spa:           { primary: "#2e5e5a", accent: "#c7a17a", paper: "#f5f1ea", ink: "#0e1c1b" },
  default:       { primary: "#1a1714", accent: "#7a5a3a", paper: "#faf7f2", ink: "#1a1714" }
};

const newOutboxRows = [];
const mapsFiles = fs.readdirSync(mapsDir).filter((f) => f.endsWith(".json"));
let processed = 0;
let skipped = 0;

for (const file of mapsFiles) {
  const hash = file.replace(/\.json$/, "").split("-").pop();
  const lead = leadByHash.get(hash);
  if (!lead) {
    skipped += 1;
    continue;
  }
  if (only && !lead.name.toLowerCase().includes(only.toLowerCase())) continue;

  const place = JSON.parse(fs.readFileSync(path.join(mapsDir, file), "utf8"));
  const fakeOutboxLead = { ...lead, lead_id: lead.id };
  const slug = kitSlug(fakeOutboxLead);
  const kitDir = path.join(root, "kits", slug);
  const previewDir = path.join(kitDir, "preview");
  const shotsDir = path.join(previewDir, "shots");
  fs.mkdirSync(shotsDir, { recursive: true });

  const brandPath = path.join(kitDir, "brand.json");
  if (!force && fs.existsSync(brandPath)) {
    skipped += 1;
    if (!existingOutbox.has(lead.id)) {
      newOutboxRows.push(toOutboxRow(lead, place));
    }
    continue;
  }

  console.log(`-> ${slug} (${place.displayName?.text})`);

  // Baixa ate 8 fotos
  const photos = (place.photos || []).slice(0, 8);
  const gallery = [];
  let heroLocal = null;

  for (let i = 0; i < photos.length; i += 1) {
    const p = photos[i];
    try {
      const url = `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1600&key=${KEY}`;
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const fname = `place-${String(i).padStart(2, "0")}.jpg`;
      fs.writeFileSync(path.join(shotsDir, fname), buf);
      if (i === 0) heroLocal = `shots/${fname}`;
      else gallery.push({ url: `shots/${fname}`, alt: place.displayName?.text || "" });
    } catch (err) {
      console.warn(`   foto ${i} falhou: ${err.message}`);
    }
  }

  const cat = place.primaryType || "default";
  const palette = palettesByCategory[cat] || palettesByCategory.default;
  const headline = generateHeadline(cat, place.displayName?.text);
  const tagline = generateTagline(cat, place);

  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
  const phoneDigits = phone.replace(/\D/g, "");
  const whatsapp = phoneDigits
    ? `https://wa.me/55${phoneDigits.replace(/^55/, "")}`
    : null;

  const services = generateServicesForCategory(cat);

  const brand = {
    title: place.displayName?.text || "",
    headline,
    description: tagline,
    body_bg: palette.paper,
    body_color: palette.ink,
    header_bg: palette.paper,
    primary: palette.primary,
    palette: [palette.primary, palette.accent, palette.ink, palette.paper],
    font_family: "Inter, sans-serif",
    heading_font: "Fraunces, serif",
    logo: null,
    favicon: null,
    og_image: null,
    is_dark: isDark(palette.paper),
    captured_at: new Date().toISOString(),
    source_url: null,
    source_maps: place.id,
    category: cat,
    rating: place.rating || null,
    rating_count: place.userRatingCount || null,
    address: place.formattedAddress || "",
    location: place.location || null,
    opening_hours: place.regularOpeningHours?.weekdayDescriptions || [],
    content: {
      hero_image: heroLocal,
      gallery,
      products: [],
      services,
      about: tagline,
      contact: {
        phone,
        whatsapp,
        email: null,
        address: place.shortFormattedAddress || place.formattedAddress || ""
      },
      social: {
        instagram: null, facebook: null, youtube: null, tiktok: null
      },
      nav_items: serviceNavItems(cat),
      testimonials: (place.reviews || []).slice(0, 4).map((r) => ({
        text: r.text?.text || r.originalText?.text || "",
        author: r.authorAttribution?.displayName || "",
        rating: r.rating || null
      })).filter((t) => t.text)
    }
  };

  fs.writeFileSync(brandPath, JSON.stringify(brand, null, 2));
  processed += 1;

  if (!existingOutbox.has(lead.id)) {
    newOutboxRows.push(toOutboxRow(lead, place));
  }
}

if (newOutboxRows.length) {
  appendCsv(outboxPath, newOutboxRows, outboxHeaders);
  console.log(`\n+${newOutboxRows.length} leads em outbox.csv`);
}
console.log(`Brand.json: processados=${processed} pulados=${skipped}`);

// ---------- helpers ----------

function toOutboxRow(lead, place) {
  return {
    lead_id: lead.id,
    type: lead.type,
    name: lead.name,
    url: lead.url || "",
    email: "",
    phone: lead.phone || place.nationalPhoneNumber || "",
    whatsapp: "",
    instagram: "",
    score: "85",
    priority: "alta",
    diagnosis: lead.url
      ? "Site existe mas pode ganhar muito em estetica e conversao."
      : "Negocio sem site - oportunidade de criar presenca digital do zero.",
    message: "",
    offer: lead.url ? "Redesign premium do site" : "Site novo + presenca digital",
    next_action: lead.next_action || "enviar-diagnostico",
    next_follow_up_at: "",
    created_at: new Date().toISOString()
  };
}

function generateHeadline(cat, name) {
  const n = name || "Nossa casa";
  if (cat === "barber_shop") return `${n}: cabelo e barba feitos com tradicao.`;
  if (cat === "hair_salon" || cat === "beauty_salon") return `${n}: seu cabelo do jeito que voce sempre quis.`;
  if (cat === "restaurant") return `${n}: o sabor que faz voce voltar.`;
  if (cat === "cafe") return `${n}: cafe especial, ambiente acolhedor.`;
  if (cat === "bakery") return `${n}: pao quentinho todo dia.`;
  if (cat === "gym") return `${n}: treine com proposito.`;
  if (cat === "spa") return `${n}: pausa para voce respirar.`;
  return `${n}: atendimento que faz diferenca.`;
}

function generateTagline(cat, place) {
  const rating = place.rating ? ` Avaliacao ${place.rating.toFixed(1)} no Google` : "";
  const count = place.userRatingCount ? ` com mais de ${place.userRatingCount} avaliacoes` : "";
  const base = {
    barber_shop: "Cortes, barba e cuidado masculino com tecnica e ambiente.",
    hair_salon: "Tratamentos, cortes e coloracao com profissionais especialistas.",
    beauty_salon: "Beleza completa: cabelo, unhas e estetica num so lugar.",
    restaurant: "Pratos preparados na hora, ambiente para todo tipo de ocasiao.",
    cafe: "Cafes especiais, doces caseiros e wifi rapido.",
    bakery: "Padaria de bairro com produtos fresquinhos.",
    gym: "Equipamentos novos, instrutores qualificados, plano flexivel.",
    spa: "Massagens, terapias e relaxamento profissional."
  }[cat] || "Atendimento personalizado e qualidade comprovada.";
  return `${base}${rating}${count}.`;
}

function generateServicesForCategory(cat) {
  const map = {
    barber_shop: [
      { title: "Corte tradicional", description: "Corte na maquina ou tesoura, finalizado com produto." },
      { title: "Barba completa", description: "Toalha quente, navalha, balm de finalizacao." },
      { title: "Corte + barba", description: "Pacote completo para deixar voce no estilo." },
      { title: "Pezinho", description: "Manutencao rapida entre cortes." }
    ],
    hair_salon: [
      { title: "Corte e finalizacao", description: "Corte personalizado com escova ou cachos." },
      { title: "Coloracao", description: "Tinturas, mechas e reflexos com produto premium." },
      { title: "Hidratacao profunda", description: "Tratamento para devolver brilho e maciez." },
      { title: "Progressiva", description: "Alisamento com selagem termica." }
    ],
    beauty_salon: [
      { title: "Cabelo", description: "Corte, hidratacao, coloracao e finalizacao." },
      { title: "Manicure e pedicure", description: "Esmaltacao, alongamento, decoracoes." },
      { title: "Sobrancelhas", description: "Design, henna, micropigmentacao." },
      { title: "Estetica facial", description: "Limpeza de pele e tratamentos." }
    ],
    restaurant: [
      { title: "Pratos executivos", description: "Almoco rapido de segunda a sexta." },
      { title: "Especialidades da casa", description: "Receitas autorais preparadas na hora." },
      { title: "Sobremesas caseiras", description: "Para fechar a refeicao com classe." },
      { title: "Bebidas", description: "Vinhos, drinks e cervejas selecionadas." }
    ]
  };
  return map[cat] || [
    { title: "Atendimento especializado", description: "Equipe qualificada pronta para te atender." },
    { title: "Estrutura completa", description: "Ambiente preparado para sua melhor experiencia." },
    { title: "Localizacao privilegiada", description: "Facil de chegar, com estacionamento proximo." }
  ];
}

function serviceNavItems(cat) {
  const map = {
    barber_shop: ["Servicos", "Equipe", "Agendar", "Localizacao"],
    hair_salon: ["Servicos", "Equipe", "Promocoes", "Contato"],
    beauty_salon: ["Servicos", "Profissionais", "Agendar", "Onde estamos"],
    restaurant: ["Cardapio", "Ambiente", "Reservas", "Localizacao"],
    cafe: ["Cardapio", "Ambiente", "Eventos", "Contato"],
    bakery: ["Produtos", "Encomendas", "Sobre", "Contato"],
    gym: ["Planos", "Aulas", "Equipe", "Visite"],
    spa: ["Tratamentos", "Equipe", "Agendar", "Contato"]
  };
  return (map[cat] || ["Servicos", "Sobre", "Contato"]).map((l) => ({ label: l, href: "#" }));
}

function isDark(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 100;
}
