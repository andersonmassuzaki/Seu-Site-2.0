# Arquitetura da Automação

## Camadas

### 1. Descoberta

Fonte principal: Google Custom Search API.

Entrada:

- Segmento.
- Nicho.
- Cidade.
- Padrão de busca.

Saída:

- Nome.
- URL.
- Query de origem.
- Tipo do lead.

### 2. Auditoria

O script `enrich-sites.mjs` acessa cada site e procura sinais objetivos:

- Meta viewport.
- WhatsApp.
- Instagram.
- Termos de carrinho/sacola/checkout.
- Termos de produto/frete/troca.
- Plataforma de e-commerce.
- Rodapé antigo por ano de copyright.

### 3. Scoring

O score mede oportunidade comercial, não qualidade absoluta do negócio.

Um lead sobe de prioridade quando:

- Parece e-commerce real.
- Usa plataforma identificável.
- Pode ter problema mobile.
- Tem sinais de site antigo.
- Tem contato pouco evidente.
- Tem oportunidade clara de conversão.

### 4. Outbox

Gera uma linha por lead qualificado com:

- Diagnóstico.
- Mensagem inicial.
- Oferta sugerida.
- Próxima ação.

### 5. Integração

Qualquer lead qualificado pode ser enviado via `CRM_WEBHOOK_URL`.

Isso permite integrar com:

- Google Sheets.
- Notion.
- Airtable.
- Pipedrive.
- HubSpot.
- Make.
- Zapier.
- n8n.

## Separação por Tipo

### E-commerce

Critério comercial:

> A loja pode estar perdendo venda por experiência ruim, mobile fraco, vitrine desorganizada ou jornada de compra pouco confiável.

Oferta principal:

> Redesign responsivo e melhoria de jornada de compra mantendo a plataforma atual.

### Institucional

Critério comercial:

> A empresa pode estar perdendo contato por site antigo, baixa clareza, pouca autoridade e chamada fraca para orçamento.

Oferta principal:

> Redesign institucional com foco em credibilidade e captação.
