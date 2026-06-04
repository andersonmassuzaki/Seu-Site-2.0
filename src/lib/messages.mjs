export function buildDiagnosis(lead, audit, scored) {
  const flags = [...scored.technicalFlags, ...scored.commercialFlags].filter(Boolean);
  const base = flags.length
    ? flags.slice(0, 3).join("; ")
    : "o site tem oportunidade de melhorar apresentacao, hierarquia e conversao";

  if (lead.type === "ecommerce") {
    return `Diagnostico rapido: ${base}. Para e-commerce, isso pode afetar a confianca, a navegacao mobile e a decisao de compra.`;
  }

  return `Diagnostico rapido: ${base}. Para site institucional, isso pode reduzir credibilidade e diminuir contatos via WhatsApp/orcamento.`;
}

export function buildMessage(lead, audit, scored) {
  if (lead.type === "ecommerce") {
    return `Oi, tudo bem? Encontrei a loja ${lead.name} pelo Google e vi que voces ja tem estrutura de e-commerce. Notei alguns pontos que podem ser melhorados em mobile, vitrine e jornada de compra. Trabalho com redesign responsivo para lojas online, mantendo a plataforma atual quando faz sentido. Posso te mandar um diagnostico rapido com 3 pontos de melhoria?`;
  }

  return `Oi, tudo bem? Encontrei a ${lead.name} pelo Google pesquisando empresas da area. Vi que o site pode comunicar melhor a qualidade da empresa e facilitar pedidos de contato/orcamento. Trabalho com redesign de sites institucionais focados em credibilidade e captacao. Posso te mandar um diagnostico rapido com 3 sugestoes?`;
}

export function nextAction(score) {
  if (score >= 75) return "Enviar abordagem personalizada com print do problema principal";
  if (score >= 55) return "Revisar manualmente e enviar diagnostico curto";
  return "Manter em base fria para reavaliar depois";
}
