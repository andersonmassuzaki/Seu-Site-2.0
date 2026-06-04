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
  <title>Diagnostico MindStay Digital - ${htmlEscape(lead.name)}</title>
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
      <strong>MindStay Digital</strong>
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
    brand: "MindStay Digital",
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
        visual: "Logo MindStay Digital, nome do cliente e URL em tela limpa."
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
        visual: "Chamada para reuniao curta com assinatura MindStay Digital."
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

## Direcao MindStay Digital

${strategy.title}

${strategy.promise}

## Pontos para mostrar

${strategy.sections.map((item) => `- ${item}`).join("\n")}

## Mensagem

${lead.message}
`;
}
