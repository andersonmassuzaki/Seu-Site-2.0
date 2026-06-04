# Operação Rodando o Dia Inteiro

## Modo simples

No terminal:

```bash
cd /Users/andersonmassuzaki/prospeccao-google-automatica
npm run daemon
```

Por padrão, ele roda a cada 45 minutos. Para alterar:

```bash
DAEMON_INTERVAL_MINUTES=90
```

Ou edite o `.env`.

## Modo recomendado no Mac com launchd

Instale o arquivo automaticamente:

```bash
npm run install:launchd
```

Ou crie um arquivo manualmente em:

```text
~/Library/LaunchAgents/com.anderson.prospeccao-google.plist
```

Use o modelo em `templates/com.anderson.prospeccao-google.plist`.

Depois rode:

```bash
launchctl load ~/Library/LaunchAgents/com.anderson.prospeccao-google.plist
launchctl start com.anderson.prospeccao-google
```

Para parar:

```bash
launchctl stop com.anderson.prospeccao-google
launchctl unload ~/Library/LaunchAgents/com.anderson.prospeccao-google.plist
```

## Rotina Diária

Manhã:

- Abrir `data/outbox.csv`.
- Revisar leads com prioridade `alta`.
- Tirar print manual do problema mais evidente.
- Enviar abordagem personalizada.

Durante o dia:

- Atualizar status no CRM/planilha.
- Marcar respostas e reuniões.

Fim do dia:

- Revisar leads `media`.
- Ajustar nichos e cidades em `config/segments.json`.
- Remover buscas que geram leads ruins.

## Cuidados

- Não automatize envio massivo de WhatsApp.
- Não envie a mesma mensagem sem personalização.
- Não prometa corrigir gateway, estoque, ERP ou checkout externo.
- Use o diagnóstico como porta de entrada para reunião.
