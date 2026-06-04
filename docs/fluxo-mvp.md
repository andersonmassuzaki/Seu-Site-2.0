# Fluxo MVP Atual

## O que roda hoje

1. Lead entra por CSV manual ou busca Google Custom Search.
2. O sistema audita o site.
3. O lead recebe score e prioridade.
4. O lead qualificado vai para `data/outbox.csv`.
5. O kit é gerado em `kits/{lead}/`.
6. A página `docs/index.html` lista downloads e previews.

## Kit Gerado

Cada pasta de kit contém:

- `diagnostico-pdf.html`: diagnóstico pronto para virar PDF.
- `resumo.md`: leitura interna.
- `mensagem.txt`: abordagem sugerida.
- `roteiro-video.json`: roteiro base para vídeo.
- `preview/index.html`: prévia fake responsiva do site modernizado.

## Operação Manual Recomendada

Para cada lead bom:

1. Abrir `preview/index.html`.
2. Tirar print desktop e mobile.
3. Abrir `diagnostico-pdf.html`.
4. Ajustar a mensagem, se necessário.
5. Enviar uma abordagem curta perguntando se pode mandar o vídeo/preview.
6. Se responder, mandar vídeo, PDF ou link da prévia.

## Próximo Bloco Técnico

O próximo passo é automatizar:

- Screenshot do site atual.
- Screenshot da prévia.
- Comparação antes/depois.
- Render de vídeo MP4 entre 45 e 90 segundos.
- Página pública individual por lead, com link compartilhável.
