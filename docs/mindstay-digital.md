# Estrategia MindStay Digital

## Ideia Central

A prospeccao nao deve parecer uma mensagem fria generica. A MindStay Digital entra com uma amostra concreta de valor:

1. Encontramos uma empresa com oportunidade.
2. Geramos um diagnostico objetivo.
3. Criamos um PDF bonito com leitura comercial.
4. Criamos um roteiro de video demonstrando como o site/app poderia funcionar melhor.
5. Enviamos para o cliente validar interesse.
6. Se ele responde, a conversa vira reuniao e proposta.

## Kit por Lead

Cada lead qualificado gera uma pasta em `kits/` com:

- `diagnostico-pdf.html`: pagina pronta para imprimir/salvar como PDF.
- `resumo.md`: resumo interno para voce revisar rapido.
- `mensagem.txt`: abordagem inicial.
- `roteiro-video.json`: roteiro para video curto de demonstracao.

## Como Usar na Segunda-feira

1. Abra `data/outbox.csv`.
2. Escolha os leads de maior score.
3. Abra o kit em `kits/nome-do-cliente/`.
4. Revise `resumo.md`.
5. Abra `diagnostico-pdf.html` no navegador e exporte como PDF.
6. Use `roteiro-video.json` para criar um video curto quando o lead justificar mais personalizacao.
7. Envie uma mensagem curta oferecendo o diagnostico.
8. So envie PDF/video completo quando fizer sentido ou quando o cliente responder.

## Proxima Evolucao

O proximo modulo deve gerar automaticamente:

- Prints desktop/mobile do site atual.
- Mockup conceitual da nova home.
- Video MP4 curto com identidade MindStay Digital.
- PDF final com print, diagnostico e proposta visual.

Para isso, os melhores caminhos sao:

- Playwright/Chromium para screenshots.
- HTML/CSS para PDF.
- Remotion para video programatico.
- Um template visual fixo da MindStay Digital para manter consistencia.
