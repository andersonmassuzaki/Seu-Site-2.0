import { htmlEscape } from "../kit.mjs";

function pickReadableInk(hex) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return "#111";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#111" : "#fff";
}

function isUsefulColor(hex) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) >= 20;
}

function firstUseful(palette) {
  return (palette || []).find(isUsefulColor) || null;
}

export function buildEcommerceFashionPreview(lead, brand) {
  const content = brand?.content || {};
  const products = (content.products || []).slice(0, 8);
  const gallery = (content.gallery || []).filter(
    (g) => g.url && !products.some((p) => p.image === g.url)
  );
  const navItems = (content.nav_items || []).slice(0, 6);
  const testimonials = (content.testimonials || []).slice(0, 3);
  const social = content.social || {};
  const contact = content.contact || {};

  const accent =
    (isUsefulColor(brand?.primary) && brand.primary) ||
    firstUseful(brand?.palette) ||
    "#7a5a3a";
  const accentInk = pickReadableInk(accent);

  const heroImage = content.hero_image || brand?.og_image || gallery[0]?.url || "";
  const logo = brand?.logo;
  const name = lead.name || "Marca";

  const headline =
    (brand?.headline && brand.headline.length < 80 && brand.headline) ||
    `${name} reimaginada para vender mais no mobile`;
  const tagline =
    brand?.description?.length > 30
      ? brand.description
      : "Uma coleção feita para combinar com a sua rotina — peças versáteis, caimento impecável e estilo sem esforço.";

  const whatsappHref = social.whatsapp ||
    (contact.whatsapp ? contact.whatsapp : null) ||
    (contact.phone
      ? `https://wa.me/55${contact.phone.replace(/\D/g, "")}`
      : "#");

  function productCard(p, i) {
    const span = i === 0 || i === 3 ? "tall" : i === 4 ? "wide" : "";
    return `<a class="product ${span}" href="${htmlEscape(p.url || "#")}" target="_blank" rel="noopener">
      <div class="product-img" style="background-image:url('${htmlEscape(p.image)}')"></div>
      <div class="product-meta">
        <span class="product-name">${htmlEscape(p.name)}</span>
        ${p.price ? `<span class="product-price">${htmlEscape(p.price)}</span>` : ""}
      </div>
    </a>`;
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(name)} — versão Seu Site 2.0</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #1a1714;
    --ink-soft: #4a4540;
    --muted: #8c847d;
    --line: #e7e1d8;
    --paper: #faf7f2;
    --paper-2: #f1ebe1;
    --accent: ${accent};
    --accent-ink: ${accentInk};
  }
  *,*::before,*::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    color: var(--ink);
    background: var(--paper);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  img { display: block; max-width: 100%; }
  a { color: inherit; text-decoration: none; }
  .container { width: min(1280px, calc(100% - 48px)); margin: 0 auto; }
  .h-serif {
    font-family: 'Fraunces', 'Cormorant Garamond', Georgia, serif;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.05;
  }

  /* announce bar */
  .announce {
    background: var(--ink);
    color: #f3ede2;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-align: center;
    padding: 10px 16px;
  }
  .announce span { opacity: 0.85; }

  /* nav */
  .nav-wrap {
    position: sticky; top: 0; z-index: 20;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    background: rgba(250,247,242,0.85);
    border-bottom: 1px solid var(--line);
  }
  .nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    min-height: 78px;
    gap: 24px;
  }
  .nav-links {
    display: flex;
    gap: 22px;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-soft);
    align-items: center;
  }
  .nav-links a:hover { color: var(--ink); }
  .brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brand-mark img { max-height: 38px; width: auto; }
  .brand-mark .wordmark {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    letter-spacing: 0.04em;
    font-weight: 500;
  }
  .nav-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 18px;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .icon-btn {
    width: 38px; height: 38px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center; justify-content: center;
    border: 1px solid var(--line);
    background: #fff;
  }
  .bag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 999px;
    background: var(--ink);
    color: #fff;
  }

  /* hero */
  .hero {
    position: relative;
    overflow: hidden;
    background: var(--paper-2);
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 48px;
    align-items: center;
    padding: 70px 0 80px;
  }
  .hero-eyebrow {
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 22px;
    font-weight: 600;
  }
  h1.hero-title {
    font-size: clamp(48px, 6.4vw, 96px);
    margin: 0 0 24px;
  }
  .hero-sub {
    color: var(--ink-soft);
    font-size: 17px;
    max-width: 480px;
    margin: 0 0 36px;
  }
  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 28px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.04em;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn-primary {
    background: var(--ink);
    color: #fff;
  }
  .btn-primary:hover { background: var(--accent); color: var(--accent-ink); }
  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--ink);
  }
  .hero-visual {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 4px;
    overflow: hidden;
    background: #ddd no-repeat center/cover;
  }
  .hero-visual::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.18));
  }
  .hero-badge {
    position: absolute;
    bottom: 22px; left: 22px;
    background: rgba(255,255,255,0.94);
    color: var(--ink);
    padding: 12px 18px;
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }
  .hero-meta {
    display: flex;
    gap: 28px;
    margin-top: 40px;
    padding-top: 28px;
    border-top: 1px solid var(--line);
    color: var(--ink-soft);
    font-size: 13px;
  }
  .hero-meta strong { color: var(--ink); font-weight: 600; display: block; font-size: 16px; }

  /* section heading */
  .section { padding: 96px 0; }
  .section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 44px;
    border-bottom: 1px solid var(--line);
    padding-bottom: 22px;
  }
  .section-head h2 {
    font-size: clamp(34px, 4vw, 56px);
    margin: 0;
  }
  .section-head .eyebrow {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
  }
  .section-head a {
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 4px;
  }

  /* product grid — editorial asymmetric */
  .grid-shop {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 360px;
    gap: 16px;
  }
  .product {
    position: relative;
    overflow: hidden;
    background: #ece6dc;
    display: flex;
    flex-direction: column;
    border-radius: 2px;
  }
  .product.tall { grid-row: span 2; }
  .product.wide { grid-column: span 2; }
  .product-img {
    flex: 1;
    background-size: cover;
    background-position: center;
    transition: transform .8s ease;
  }
  .product:hover .product-img { transform: scale(1.04); }
  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: var(--paper);
    gap: 12px;
  }
  .product-name {
    font-size: 13px;
    color: var(--ink);
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .product-price {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
  }
  .product .tag {
    position: absolute;
    top: 12px; left: 12px;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
  }

  /* category strip */
  .cat-strip {
    display: grid;
    grid-template-columns: repeat(${Math.min(navItems.length || 4, 4)}, 1fr);
    gap: 12px;
  }
  .cat {
    position: relative;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: #ddd center/cover no-repeat;
    border-radius: 2px;
  }
  .cat::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55));
  }
  .cat span {
    position: absolute;
    bottom: 18px; left: 18px;
    z-index: 2;
    color: #fff;
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 500;
  }

  /* manifesto */
  .manifesto {
    background: var(--ink);
    color: #f1ebe1;
  }
  .manifesto .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .manifesto h2 {
    color: #f7f0e3;
    margin: 0 0 24px;
    font-size: clamp(34px, 4vw, 54px);
  }
  .manifesto p {
    color: #c8bfb4;
    font-size: 17px;
    margin: 0 0 18px;
    max-width: 520px;
  }
  .manifesto .visual {
    aspect-ratio: 1/1;
    background: #2a2522 center/cover no-repeat;
    border-radius: 4px;
  }

  /* testimonials */
  .quotes {
    display: grid;
    grid-template-columns: repeat(${Math.min(testimonials.length || 1, 3)}, 1fr);
    gap: 24px;
  }
  .quote {
    padding: 32px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: #fff;
  }
  .quote p {
    font-family: 'Fraunces', serif;
    font-size: 20px;
    line-height: 1.35;
    margin: 0 0 18px;
    color: var(--ink);
  }
  .quote cite {
    font-style: normal;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .stars {
    color: var(--accent);
    font-size: 14px;
    letter-spacing: 2px;
    margin-bottom: 14px;
  }

  /* CTA band */
  .cta-band {
    background: var(--accent);
    color: var(--accent-ink);
    padding: 80px 0;
    text-align: center;
  }
  .cta-band h2 {
    font-size: clamp(32px, 4vw, 52px);
    margin: 0 0 18px;
  }
  .cta-band p { color: var(--accent-ink); opacity: 0.85; max-width: 540px; margin: 0 auto 28px; }
  .cta-band .btn-primary { background: var(--ink); color: #fff; }
  .cta-band .btn-primary:hover { background: #fff; color: var(--ink); }

  /* footer */
  footer {
    background: #f1ebe1;
    color: var(--ink-soft);
    padding: 64px 0 32px;
    font-size: 14px;
  }
  .foot-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .foot-grid h4 {
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin: 0 0 18px;
    color: var(--ink);
  }
  .foot-grid a { display: block; padding: 6px 0; color: var(--ink-soft); }
  .foot-grid a:hover { color: var(--ink); }
  .foot-bottom {
    border-top: 1px solid var(--line);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: var(--muted);
  }
  .social {
    display: flex;
    gap: 10px;
  }
  .social a {
    width: 36px; height: 36px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--ink);
  }
  .social a:hover { background: var(--ink); color: #fff; }

  /* whats sticky */
  .wa-fab {
    position: fixed;
    bottom: 20px; right: 20px;
    width: 56px; height: 56px;
    border-radius: 999px;
    background: #25d366;
    color: #fff;
    display: inline-flex;
    align-items: center; justify-content: center;
    box-shadow: 0 10px 30px rgba(37,211,102,0.45);
    z-index: 50;
  }

  /* preview banner */
  .preview-bar {
    background: ${accent};
    color: ${accentInk};
    text-align: center;
    padding: 8px 16px;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
  }

  @media (max-width: 960px) {
    .hero-grid { grid-template-columns: 1fr; padding: 48px 0 56px; }
    .grid-shop {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 280px;
    }
    .grid-shop .product.wide { grid-column: span 2; }
    .grid-shop .product.tall { grid-row: span 1; }
    .cat-strip { grid-template-columns: repeat(2, 1fr); }
    .manifesto .grid { grid-template-columns: 1fr; gap: 36px; }
    .quotes { grid-template-columns: 1fr; }
    .foot-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .nav { grid-template-columns: 1fr auto 1fr; }
    .nav-links { display: none; }
    .section { padding: 64px 0; }
  }
  @media (max-width: 540px) {
    .container { width: calc(100% - 28px); }
    .grid-shop {
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: 240px;
      gap: 10px;
    }
    .cat-strip { grid-template-columns: 1fr 1fr; }
    .nav-right .bag span { display: none; }
    h1.hero-title { font-size: 44px; }
    .foot-grid { grid-template-columns: 1fr; }
    .section-head { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
</style>
</head>
<body>

<div class="preview-bar">Pré-visualização Seu Site 2.0 · simulação com base na sua loja atual</div>
<div class="announce"><span>Frete grátis acima de R$ 299 · trocas e devoluções em 30 dias · parcele em até 6x</span></div>

<div class="nav-wrap">
  <div class="container nav">
    <div class="nav-links">
      ${navItems.slice(0, 4).map((n) => `<a href="#">${htmlEscape(n.label)}</a>`).join("")}
    </div>
    <div class="brand-mark">
      ${logo
        ? `<img src="${htmlEscape(logo)}" alt="${htmlEscape(name)}" onerror="this.outerHTML='<span class=\\'wordmark\\'>${htmlEscape(name).replace(/'/g, "\\'")}</span>'">`
        : `<span class="wordmark">${htmlEscape(name)}</span>`}
    </div>
    <div class="nav-right">
      <span>Buscar</span>
      <span>Entrar</span>
      <a class="bag" href="#"><span>Sacola</span> · 0</a>
    </div>
  </div>
</div>

<section class="hero">
  <div class="container hero-grid">
    <div>
      <div class="hero-eyebrow">Nova temporada</div>
      <h1 class="h-serif hero-title">${htmlEscape(headline)}</h1>
      <p class="hero-sub">${htmlEscape(tagline)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="#colecao">Ver coleção →</a>
        <a class="btn btn-ghost" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
      </div>
      <div class="hero-meta">
        <div><strong>4.8★</strong><span>+1.2k clientes</span></div>
        <div><strong>30 dias</strong><span>para trocar</span></div>
        <div><strong>6x s/ juros</strong><span>no cartão</span></div>
      </div>
    </div>
    <div class="hero-visual" style="background-image:url('${htmlEscape(heroImage)}')">
      <span class="hero-badge">Coleção atual</span>
    </div>
  </div>
</section>

${products.length >= 4 ? `
<section id="colecao" class="section">
  <div class="container">
    <div class="section-head">
      <div>
        <div class="eyebrow">Mais desejadas</div>
        <h2 class="h-serif">A coleção da semana</h2>
      </div>
      <a href="#">Ver tudo →</a>
    </div>
    <div class="grid-shop">
      ${products.map((p, i) => productCard(p, i)).join("")}
    </div>
  </div>
</section>` : ""}

${navItems.length >= 3 && gallery.length >= 3 ? `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head">
      <div>
        <div class="eyebrow">Explorar</div>
        <h2 class="h-serif">Comprar por categoria</h2>
      </div>
    </div>
    <div class="cat-strip">
      ${navItems.slice(0, 4).map((n, i) => `
        <a class="cat" href="#" style="background-image:url('${htmlEscape(gallery[i % gallery.length]?.url || heroImage)}')">
          <span>${htmlEscape(n.label.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span>
        </a>`).join("")}
    </div>
  </div>
</section>` : ""}

<section class="manifesto">
  <div class="container section">
    <div class="grid">
      <div class="visual" style="background-image:url('${htmlEscape(gallery[0]?.url || heroImage)}')"></div>
      <div>
        <div class="hero-eyebrow" style="color:${accent}">Sobre a ${htmlEscape(name)}</div>
        <h2 class="h-serif">Moda que combina com sua rotina, do trabalho ao fim de semana.</h2>
        <p>${htmlEscape(content.about?.slice(0, 280) || "Trabalhamos com peças versáteis, caimento impecável e materiais que duram — para você montar looks que funcionam todos os dias.")}</p>
        <p style="color:#9a9089">Peças desenhadas no Brasil. Coleções limitadas. Acabamento premium.</p>
        <a class="btn btn-primary" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener" style="margin-top:18px">Tirar dúvidas no WhatsApp</a>
      </div>
    </div>
  </div>
</section>

${testimonials.length ? `
<section class="section">
  <div class="container">
    <div class="section-head">
      <div>
        <div class="eyebrow">Quem já comprou</div>
        <h2 class="h-serif">Clientes apaixonadas</h2>
      </div>
    </div>
    <div class="quotes">
      ${testimonials.map((t) => `
        <article class="quote">
          <div class="stars">★★★★★</div>
          <p>"${htmlEscape((t.text || "").slice(0, 220))}"</p>
          ${t.author ? `<cite>— ${htmlEscape(t.author)}</cite>` : ""}
        </article>`).join("")}
    </div>
  </div>
</section>` : ""}

<section class="cta-band">
  <div class="container">
    <h2 class="h-serif">Pronta para a próxima peça?</h2>
    <p>Receba as novidades e ofertas em primeira mão. Sem spam, prometido.</p>
    <a class="btn btn-primary" href="#">Entrar na lista</a>
  </div>
</section>

<footer>
  <div class="container">
    <div class="foot-grid">
      <div>
        <h4>${htmlEscape(name)}</h4>
        <p style="margin:0 0 16px;max-width:320px;color:var(--muted)">${htmlEscape((content.about || "").slice(0, 160) || "Moda feminina pensada para o seu dia a dia.")}</p>
        <div class="social">
          ${social.instagram ? `<a href="${htmlEscape(social.instagram)}" target="_blank" aria-label="Instagram">IG</a>` : ""}
          ${social.facebook ? `<a href="${htmlEscape(social.facebook)}" target="_blank" aria-label="Facebook">f</a>` : ""}
          ${social.tiktok ? `<a href="${htmlEscape(social.tiktok)}" target="_blank" aria-label="TikTok">TT</a>` : ""}
          ${social.youtube ? `<a href="${htmlEscape(social.youtube)}" target="_blank" aria-label="YouTube">YT</a>` : ""}
        </div>
      </div>
      <div>
        <h4>Comprar</h4>
        ${navItems.slice(0, 5).map((n) => `<a href="#">${htmlEscape(n.label)}</a>`).join("")}
      </div>
      <div>
        <h4>Ajuda</h4>
        <a href="#">Trocas e devoluções</a>
        <a href="#">Frete e prazos</a>
        <a href="#">Tabela de medidas</a>
        <a href="#">Pagamento</a>
      </div>
      <div>
        <h4>Fale com a gente</h4>
        ${contact.phone ? `<a href="tel:${htmlEscape(contact.phone)}">${htmlEscape(contact.phone)}</a>` : ""}
        ${contact.email ? `<a href="mailto:${htmlEscape(contact.email)}">${htmlEscape(contact.email)}</a>` : ""}
        <a href="${htmlEscape(whatsappHref)}" target="_blank">WhatsApp</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} ${htmlEscape(name)} · Pré-visualização Seu Site 2.0</span>
      <span>Visa · Master · Pix · Boleto</span>
    </div>
  </div>
</footer>

${whatsappHref && whatsappHref !== "#" ? `<a class="wa-fab" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 01-5.07-1.39l-.36-.21-3.67.96.98-3.58-.23-.37A9.94 9.94 0 1122 12c0 5.52-4.48 10-10 10zm5.47-7.46c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.11 3.23 5.13 4.52.72.31 1.28.49 1.71.63.72.23 1.37.2 1.89.12.58-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.27-.2-.57-.35z"/></svg>
</a>` : ""}

</body>
</html>`;
}
