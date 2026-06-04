import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const downloadsDir = path.join(root, "docs/downloads");
fs.mkdirSync(downloadsDir, { recursive: true });

const files = [
  ["leads.csv", "Leads"],
  ["outbox.csv", "Outbox comercial"],
  ["site_audits.csv", "Auditorias"],
  ["history.json", "Historico tecnico"]
];

for (const [fileName] of files) {
  const source = path.join(root, "data", fileName);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(downloadsDir, fileName));
  }
}

const generatedAt = new Date().toLocaleString("pt-BR", {
  timeZone: "America/Sao_Paulo"
});

const links = files
  .map(([fileName, label]) => {
    const href = `downloads/${fileName}`;
    return `<a class="download" href="${href}" download>${label}<span>${fileName}</span></a>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Seu Site 2.0 - Downloads</title>
  <style>
    :root {
      --bg: #f4f1ec;
      --panel: #ffffff;
      --ink: #161616;
      --muted: #686868;
      --line: #dedbd4;
      --brand: #0f6b64;
      --accent: #d94f30;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background: var(--bg);
      font-family: Arial, Helvetica, sans-serif;
    }
    main {
      width: min(920px, calc(100% - 32px));
      margin: 0 auto;
      padding: 56px 0;
    }
    header {
      border-bottom: 1px solid var(--line);
      padding-bottom: 22px;
      margin-bottom: 28px;
    }
    .brand {
      color: var(--brand);
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 14px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: clamp(32px, 5vw, 54px);
      line-height: 1;
      letter-spacing: 0;
    }
    p {
      color: var(--muted);
      font-size: 16px;
      margin: 0;
      max-width: 680px;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .download {
      display: flex;
      min-height: 118px;
      flex-direction: column;
      justify-content: space-between;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--ink);
      background: var(--panel);
      font-size: 18px;
      font-weight: 700;
      text-decoration: none;
    }
    .download:hover {
      border-color: var(--brand);
      box-shadow: 0 8px 24px rgba(15, 107, 100, 0.12);
    }
    .download span {
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
    }
    footer {
      color: var(--muted);
      border-top: 1px solid var(--line);
      margin-top: 28px;
      padding-top: 18px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="brand">Seu Site 2.0</div>
      <h1>Downloads da prospeccao</h1>
      <p>Arquivos exportados para abrir no Excel, Google Sheets ou importar em CRM. Atualizado em ${generatedAt}.</p>
    </header>
    <section class="grid">
      ${links}
    </section>
    <footer>Para atualizar estes arquivos, rode <strong>npm run export:web</strong> antes de enviar para o GitHub.</footer>
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(root, "docs/index.html"), html);
console.log(`Exported web downloads to ${path.join(root, "docs")}`);
