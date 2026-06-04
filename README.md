# Prospecção Google Automática

Sistema local para encontrar, qualificar e organizar leads de redesign/responsividade usando Google como fonte de descoberta.

Ele separa dois tipos de oportunidade:

- `ecommerce`: lojas online com chance de melhorar vitrine, mobile, produto e jornada de compra.
- `institucional`: sites comuns com chance de melhorar credibilidade, contato e pedido de orçamento.

## Fluxo

1. Gera buscas por nicho e cidade.
2. Consulta o Google Custom Search.
3. Salva leads novos em `data/leads.csv`.
4. Baixa o HTML do site.
5. Detecta sinais comerciais e técnicos.
6. Pontua o lead.
7. Gera diagnóstico e mensagem em `data/outbox.csv`.
8. Opcionalmente envia cada lead qualificado para um webhook de CRM/planilha.

## Configuração

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

Preencha:

```bash
GOOGLE_API_KEY=...
GOOGLE_CSE_ID=...
CRM_WEBHOOK_URL=...
```

O `CRM_WEBHOOK_URL` é opcional. Pode ser um webhook do Make, Zapier, n8n, HubSpot, Pipedrive ou um endpoint próprio que grave no Google Sheets.

## Comandos

Gerar lista de buscas:

```bash
npm run queries
```

Rodar uma coleta completa:

```bash
npm run run
```

Importar leads manualmente enquanto a API ainda nao esta ligada:

```bash
npm run import
npm run enrich
npm run score
npm run outbox
npm run kit
```

Ver status da operacao:

```bash
npm run status
```

Gerar pagina online com downloads para Excel:

```bash
npm run export:web
```

Rodar o dia inteiro em loop:

```bash
npm run daemon
```

## Arquivos principais

- `config/segments.json`: nichos, cidades, padrões de busca e score mínimo.
- `data/leads.csv`: base principal de leads.
- `data/site_audits.csv`: leitura técnica/comercial dos sites.
- `data/outbox.csv`: leads qualificados com diagnóstico e mensagem pronta.
- `data/history.json`: evita repetir URLs e reexportar leads.
- `kits/`: diagnostico em HTML, resumo, mensagem e roteiro de video por lead.

## Estrategia MindStay Digital

Veja [docs/mindstay-digital.md](docs/mindstay-digital.md) para o fluxo de PDF, video, validacao e prospeccao consultiva.

## Integração Recomendada

Para começar rápido:

1. Crie um cenário no Make ou Zapier com gatilho `Webhook`.
2. Cole a URL no `CRM_WEBHOOK_URL`.
3. Faça o webhook gravar os campos em uma planilha Google Sheets.
4. Use a planilha como CRM simples com status: `novo`, `revisado`, `contatado`, `respondeu`, `reunião`, `proposta`, `ganho`, `perdido`.

## Limite Comercial

O sistema prepara diagnóstico e mensagem, mas não envia WhatsApp automaticamente. Isso é intencional: a revisão humana reduz risco de spam, bloqueio e abordagem ruim.
