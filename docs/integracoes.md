# Integrações

## Google Sheets via Make

1. Crie um cenário no Make.
2. Use o módulo `Custom webhook`.
3. Copie a URL gerada.
4. Cole no `.env`:

```bash
CRM_WEBHOOK_URL=https://hook.us1.make.com/...
```

5. Adicione um módulo `Google Sheets > Add a row`.
6. Mapeie os campos recebidos:

- `lead_id`
- `type`
- `name`
- `url`
- `score`
- `priority`
- `diagnosis`
- `message`
- `offer`
- `next_action`
- `created_at`

## CRM

Use o mesmo webhook para:

- Pipedrive: criar pessoa/organização/deal.
- HubSpot: criar contato/empresa.
- Airtable: criar registro.
- Notion: criar página em database.

## WhatsApp

Recomendação:

- Use o sistema para gerar mensagem.
- Revise manualmente.
- Envie com personalização.

Automatizar WhatsApp sem opt-in pode gerar bloqueio e prejudicar reputação.
