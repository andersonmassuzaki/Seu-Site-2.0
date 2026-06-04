import { domainFromUrl } from "./url.mjs";

function sanitizeName(value) {
  return String(value || "lead")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
}

export function kitSlug(lead) {
  return `${sanitizeName(lead.name)}-${sanitizeName(domainFromUrl(lead.url))}`;
}

export function kitStrategy(lead) {
  if (lead.type === "ecommerce") {
    return {
      title: "Redesign responsivo para vender com mais clareza",
      promise:
        "Reposicionar a loja com uma experiencia mobile mais forte, vitrines mais claras e jornada de compra mais confiavel.",
      sections: [
        "Home com hierarquia premium",
        "Menu de categorias mais objetivo",
        "Vitrine com cards de produto mais fortes",
        "Pagina de produto com argumentos comerciais",
        "Fluxo de sacola/checkout validado"
      ],
      packages: [
        "Responsividade Essencial: R$ 4.500 a R$ 6.000",
        "Redesign Responsivo Premium: R$ 12.000 a R$ 15.000",
        "E-commerce Premium Completo: R$ 25.000+"
      ]
    };
  }

  return {
    title: "Redesign institucional para gerar mais confianca e contatos",
    promise:
      "Transformar o site em uma apresentacao comercial mais clara, profissional e orientada a WhatsApp/orcamento.",
    sections: [
      "Primeira dobra com posicionamento claro",
      "Servicos explicados com hierarquia",
      "Provas de credibilidade",
      "Contato e WhatsApp mais evidentes",
      "SEO local e paginas comerciais"
    ],
    packages: [
      "Ajustes Pontuais: R$ 1.500 a R$ 4.000",
      "Redesign Institucional: R$ 4.000 a R$ 12.000",
      "Site Premium: R$ 12.000 a R$ 25.000+"
    ]
  };
}

export function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildPdfHtml(lead) {
  const strategy = kitStrategy(lead);
  const generatedAt = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diagnostico Seu Site 2.0 - ${htmlEscape(lead.name)}</title>
  <style>
    :root {
      --ink: #161616;
      --muted: #666;
      --line: #dedede;
      --brand: #0f6b64;
      --accent: #d94f30;
      --paper: #fff;
      --soft: #f6f3ee;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background: var(--soft);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.45;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 22mm;
      background: var(--paper);
    }
    .brand {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    .brand strong {
      color: var(--brand);
      font-size: 20px;
      letter-spacing: 0;
    }
    .meta {
      color: var(--muted);
      font-size: 12px;
      text-align: right;
    }
    h1 {
      font-size: 34px;
      line-height: 1.05;
      margin: 0 0 12px;
      letter-spacing: 0;
    }
    h2 {
      font-size: 18px;
      margin: 30px 0 10px;
      letter-spacing: 0;
    }
    p { margin: 0 0 12px; }
    .lead-url { color: var(--muted); font-size: 13px; }
    .score {
      display: inline-block;
      margin: 18px 0;
      padding: 10px 14px;
      border-left: 4px solid var(--accent);
      background: #fbf2ee;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .box {
      border: 1px solid var(--line);
      padding: 16px;
      border-radius: 8px;
      break-inside: avoid;
    }
    ul {
      padding-left: 20px;
      margin: 8px 0 0;
    }
    li { margin: 6px 0; }
    .cta {
      margin-top: 28px;
      padding: 18px;
      background: var(--brand);
      color: #fff;
      border-radius: 8px;
    }
    .message {
      white-space: pre-wrap;
      background: #f8f8f8;
      border: 1px solid var(--line);
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
    }
    @media print {
      body { background: #fff; }
      .page { width: auto; min-height: auto; margin: 0; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="brand">
      <strong>Seu Site 2.0</strong>
      <div class="meta">Diagnostico de oportunidade<br>${htmlEscape(generatedAt)}</div>
    </header>

    <h1>${htmlEscape(lead.name)}</h1>
    <p class="lead-url">${htmlEscape(lead.url)}</p>
    <div class="score">Prioridade ${htmlEscape(lead.priority)} · Score ${htmlEscape(lead.score)}/100</div>

    <h2>Leitura rapida</h2>
    <p>${htmlEscape(lead.diagnosis)}</p>

    <h2>Direcao proposta</h2>
    <p><strong>${htmlEscape(strategy.title)}</strong></p>
    <p>${htmlEscape(strategy.promise)}</p>

    <div class="grid">
      <section class="box">
        <h2>O que mostrar no conceito</h2>
        <ul>
          ${strategy.sections.map((item) => `<li>${htmlEscape(item)}</li>`).join("\n")}
        </ul>
      </section>

      <section class="box">
        <h2>Faixas comerciais</h2>
        <ul>
          ${strategy.packages.map((item) => `<li>${htmlEscape(item)}</li>`).join("\n")}
        </ul>
      </section>
    </div>

    <h2>Mensagem inicial sugerida</h2>
    <div class="message">${htmlEscape(lead.message)}</div>

    <section class="cta">
      <strong>Proxima acao:</strong> enviar diagnostico personalizado e oferecer uma conversa rapida para validar escopo.
    </section>
  </main>
</body>
</html>`;
}

export function buildVideoStoryboard(lead) {
  const strategy = kitStrategy(lead);
  return {
    brand: "Seu Site 2.0",
    lead: {
      name: lead.name,
      url: lead.url,
      type: lead.type,
      score: lead.score,
      priority: lead.priority
    },
    format: "vertical 9:16 ou horizontal 16:9",
    duration_seconds: 45,
    scenes: [
      {
        title: "Abertura",
        duration_seconds: 5,
        narration: `Encontramos uma oportunidade clara no site da ${lead.name}.`,
        visual: "Logo Seu Site 2.0, nome do cliente e URL em tela limpa."
      },
      {
        title: "Diagnostico",
        duration_seconds: 10,
        narration: lead.diagnosis,
        visual: "Print do site atual com marcacoes discretas nos pontos de melhoria."
      },
      {
        title: "Nova direcao",
        duration_seconds: 12,
        narration: strategy.promise,
        visual: "Mockup conceitual da nova primeira dobra em desktop e mobile."
      },
      {
        title: "Experiencia",
        duration_seconds: 12,
        narration: `A proposta e melhorar ${strategy.sections.slice(0, 3).join(", ")}.`,
        visual: "Sequencia com home, secao principal e tela mobile."
      },
      {
        title: "Fechamento",
        duration_seconds: 6,
        narration: "Se fizer sentido, validamos juntos o melhor pacote antes de qualquer implementacao.",
        visual: "Chamada para reuniao curta com assinatura Seu Site 2.0."
      }
    ]
  };
}

export function buildOnePageMarkdown(lead) {
  const strategy = kitStrategy(lead);
  return `# ${lead.name}

URL: ${lead.url}
Tipo: ${lead.type}
Score: ${lead.score}
Prioridade: ${lead.priority}

## Diagnostico

${lead.diagnosis}

## Direcao Seu Site 2.0

${strategy.title}

${strategy.promise}

## Pontos para mostrar

${strategy.sections.map((item) => `- ${item}`).join("\n")}

## Mensagem

${lead.message}
`;
}

export function buildPreviewHtml(lead) {
  const strategy = kitStrategy(lead);
  const isEcommerce = lead.type === "ecommerce";
  const primaryCta = isEcommerce ? "Ver colecao" : "Solicitar orcamento";
  const secondaryCta = isEcommerce ? "Falar no WhatsApp" : "Falar com especialista";
  const eyebrow = isEcommerce ? "Nova experiencia de compra" : "Nova presenca digital";
  const headline = isEcommerce
    ? `${lead.name} em uma versao mais premium, clara e pronta para vender no mobile`
    : `${lead.name} com uma presenca mais moderna, confiavel e preparada para gerar contatos`;
  const subcopy = isEcommerce
    ? "Uma simulacao visual com vitrine mais organizada, CTAs evidentes, hierarquia comercial e experiencia responsiva para valorizar os produtos."
    : "Uma simulacao visual com posicionamento mais claro, prova de confianca, servicos organizados e chamada direta para conversa.";
  const navItems = isEcommerce
    ? ["Novidades", "Categorias", "Mais vendidos", "Trocas", "Contato"]
    : ["Inicio", "Servicos", "Diferenciais", "Depoimentos", "Contato"];
  const cards = isEcommerce
    ? [
        ["Produto destaque", "Foto maior, preco claro e chamada de compra mais evidente."],
        ["Vitrine responsiva", "Cards consistentes para facilitar comparacao no celular."],
        ["Confiança", "Frete, troca e parcelamento visiveis antes da decisao."]
      ]
    : [
        ["Oferta clara", "Primeira dobra explicando rapidamente o que a empresa resolve."],
        ["Servicos", "Blocos objetivos para o visitante entender e pedir orcamento."],
        ["Prova social", "Sinais de credibilidade para reduzir duvida e aumentar contato."]
      ];

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Previa Seu Site 2.0 - ${htmlEscape(lead.name)}</title>
  <style>
    :root {
      --bg: #f7f4ee;
      --ink: #151515;
      --muted: #67615b;
      --line: #ded7cc;
      --paper: #fffefa;
      --brand: #0f6b64;
      --accent: #d94f30;
      --gold: #b88a44;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      background: var(--bg);
      font-family: Arial, Helvetica, sans-serif;
    }
    .topbar {
      background: var(--ink);
      color: #fff;
      font-size: 13px;
      text-align: center;
      padding: 9px 16px;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 2;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 254, 250, 0.94);
      backdrop-filter: blur(12px);
    }
    .nav {
      width: min(1180px, calc(100% - 32px));
      min-height: 70px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo {
      color: var(--brand);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0;
      white-space: nowrap;
    }
    nav {
      display: flex;
      gap: 18px;
      align-items: center;
      color: var(--muted);
      font-size: 14px;
    }
    nav a {
      color: inherit;
      text-decoration: none;
      white-space: nowrap;
    }
    .nav-cta,
    .button {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 6px;
      background: var(--brand);
      color: #fff;
      padding: 0 18px;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }
    .button.secondary {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .hero {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      min-height: calc(100vh - 108px);
      display: grid;
      grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
      gap: 38px;
      align-items: center;
      padding: 46px 0 34px;
    }
    .eyebrow {
      color: var(--accent);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    h1 {
      margin: 0;
      font-size: clamp(42px, 7vw, 76px);
      line-height: 0.96;
      letter-spacing: 0;
    }
    .hero p {
      color: var(--muted);
      font-size: 18px;
      line-height: 1.55;
      max-width: 650px;
      margin: 20px 0 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }
    .visual {
      position: relative;
      min-height: 560px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--line);
      background:
        linear-gradient(145deg, rgba(15, 107, 100, 0.12), rgba(217, 79, 48, 0.08)),
        var(--paper);
    }
    .mock-browser {
      position: absolute;
      inset: 34px 34px 128px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 26px 70px rgba(29, 24, 18, 0.18);
      overflow: hidden;
    }
    .mock-bar {
      height: 38px;
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 14px;
      background: #f5f5f3;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--accent);
    }
    .dot:nth-child(2) { background: var(--gold); }
    .dot:nth-child(3) { background: var(--brand); }
    .mock-content {
      padding: 28px;
    }
    .mock-title {
      width: 80%;
      height: 28px;
      border-radius: 4px;
      background: var(--ink);
      margin-bottom: 14px;
    }
    .mock-line {
      width: 100%;
      height: 10px;
      border-radius: 10px;
      background: #ddd5c8;
      margin: 9px 0;
    }
    .mock-line.short { width: 62%; }
    .mock-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 24px;
    }
    .mock-card {
      min-height: 112px;
      border-radius: 6px;
      background: #f0ebe2;
      border: 1px solid var(--line);
    }
    .phone {
      position: absolute;
      right: 30px;
      bottom: 28px;
      width: 190px;
      height: 350px;
      border-radius: 26px;
      padding: 12px;
      background: var(--ink);
      box-shadow: 0 22px 50px rgba(29, 24, 18, 0.24);
    }
    .phone-screen {
      height: 100%;
      border-radius: 18px;
      background: #fff;
      padding: 18px;
      overflow: hidden;
    }
    .phone-hero {
      height: 86px;
      border-radius: 8px;
      background: var(--brand);
      margin-bottom: 12px;
    }
    .phone-row {
      height: 12px;
      border-radius: 10px;
      background: #ddd5c8;
      margin: 10px 0;
    }
    .section {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 54px 0;
    }
    .section h2 {
      margin: 0 0 20px;
      font-size: clamp(28px, 4vw, 44px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .card {
      min-height: 190px;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--paper);
    }
    .card strong {
      display: block;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .card p {
      color: var(--muted);
      line-height: 1.5;
      margin: 0;
    }
    .band {
      background: var(--ink);
      color: #fff;
      margin-top: 30px;
    }
    .band-inner {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: center;
    }
    .band h2 { color: #fff; margin: 0; max-width: 720px; }
    .band p { color: rgba(255,255,255,0.72); max-width: 620px; }
    @media (max-width: 860px) {
      nav { display: none; }
      .hero {
        min-height: auto;
        grid-template-columns: 1fr;
        padding-top: 34px;
      }
      .visual { min-height: 500px; }
      .cards { grid-template-columns: 1fr; }
      .band-inner {
        display: block;
      }
      .band .button { margin-top: 20px; }
    }
    @media (max-width: 560px) {
      .nav { min-height: 62px; }
      .logo { font-size: 18px; }
      .nav-cta { display: none; }
      h1 { font-size: 42px; }
      .hero p { font-size: 16px; }
      .visual { min-height: 430px; }
      .mock-browser {
        inset: 22px 16px 126px;
      }
      .mock-grid { grid-template-columns: 1fr; }
      .mock-card:nth-child(n+2) { display: none; }
      .phone {
        width: 150px;
        height: 280px;
        right: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="topbar">Previa visual demonstrativa criada pelo Seu Site 2.0</div>
  <header>
    <div class="nav">
      <div class="logo">${htmlEscape(lead.name)}</div>
      <nav>
        ${navItems.map((item) => `<a href="#">${htmlEscape(item)}</a>`).join("\n")}
      </nav>
      <a class="nav-cta" href="#">${htmlEscape(secondaryCta)}</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div>
        <div class="eyebrow">${htmlEscape(eyebrow)}</div>
        <h1>${htmlEscape(headline)}</h1>
        <p>${htmlEscape(subcopy)}</p>
        <div class="actions">
          <a class="button" href="#">${htmlEscape(primaryCta)}</a>
          <a class="button secondary" href="#">${htmlEscape(secondaryCta)}</a>
        </div>
      </div>
      <div class="visual" aria-label="Mockup visual">
        <div class="mock-browser">
          <div class="mock-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <div class="mock-content">
            <div class="mock-title"></div>
            <div class="mock-line"></div>
            <div class="mock-line short"></div>
            <div class="mock-grid">
              <div class="mock-card"></div>
              <div class="mock-card"></div>
              <div class="mock-card"></div>
            </div>
          </div>
        </div>
        <div class="phone">
          <div class="phone-screen">
            <div class="phone-hero"></div>
            <div class="phone-row"></div>
            <div class="phone-row"></div>
            <div class="phone-row"></div>
            <div class="phone-row"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>O que esta versao resolveria</h2>
      <div class="cards">
        ${cards
          .map(
            ([title, text]) => `<article class="card">
          <strong>${htmlEscape(title)}</strong>
          <p>${htmlEscape(text)}</p>
        </article>`
          )
          .join("\n")}
      </div>
    </section>

    <section class="section">
      <h2>Direcao de melhoria</h2>
      <div class="cards">
        ${strategy.sections
          .slice(0, 3)
          .map(
            (item) => `<article class="card">
          <strong>${htmlEscape(item)}</strong>
          <p>Bloco demonstrativo para mostrar como a informacao poderia ganhar mais clareza, ritmo e intencao comercial.</p>
        </article>`
          )
          .join("\n")}
      </div>
    </section>

    <section class="band">
      <div class="band-inner">
        <div>
          <h2>Esta e apenas uma previa visual, nao o site final.</h2>
          <p>A ideia e facilitar a visualizacao do potencial antes de qualquer proposta fechada.</p>
        </div>
        <a class="button" href="#">Conversar sobre a evolucao</a>
      </div>
    </section>
  </main>
</body>
</html>`;
}
