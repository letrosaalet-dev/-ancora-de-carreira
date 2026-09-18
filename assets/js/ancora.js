/**
 * ancora.js — nucleo do instrumento Ancora de Carreira (Edgar Schein).
 *
 * Fonte da verdade: "Ancora de Carreira.xls" (aba "calculos").
 * As 40 afirmativas foram conferidas uma a uma contra o Excel:
 * 32 identicas, 5 com ajuste de acordo ortografico ("ideias", "contribui")
 * e 3 corrigindo erro de digitacao do proprio Excel (Q4, Q28, Q40).
 *
 * Regra de pontuacao (instrucao do Excel, linha 51):
 *   escala 1 a 6; depois o participante escolhe 3 afirmativas entre as de
 *   maior nota e elas passam a valer 10.
 *
 * Cada ancora e a MEDIA de 5 afirmativas (soma / 5), no padrao rotativo
 * do Schein: a ancora N agrupa as questoes N, N+8, N+16, N+24, N+32.
 */

const perguntas = [
  "Sonho em ser tão bom no que faço que minha opinião de especialista será sempre solicitada.",
  "Sinto-me mais realizado em meu trabalho quando consigo integrar e administrar o trabalho de outras pessoas.",
  "Sonho em ter uma carreira que me permitirá executar meu trabalho livremente, a meu modo e dentro do meu horário.",
  "Segurança e estabilidade são mais importantes para mim do que a liberdade e a autonomia.",
  "Estou sempre procurando ideias que me permitirão iniciar o meu próprio negócio.",
  "Sentirei sucesso na minha carreira se sentir que contribuí verdadeiramente para o bem-estar da sociedade.",
  "Sonho com uma carreira na qual possa solucionar problemas ou vencer em situações muito desafiadoras.",
  "Preferiria sair da empresa onde estou a ser colocado em uma atividade que prejudique a possibilidade de satisfazer meus interesses pessoais e familiares.",
  "Só sentirei o sucesso na minha carreira se puder desenvolver minhas habilidades técnicas e funcionais até o mais alto nível de competência.",
  "Sonho em ser responsável por uma organização complexa e tomar decisões que afetem muitas pessoas.",
  "Sinto-me mais realizado em meu trabalho quando tenho inteira liberdade de definir minhas tarefas, horários e métodos.",
  "Prefiro sair definitivamente da empresa onde estou a aceitar uma tarefa que coloque em risco minha segurança naquela empresa.",
  "Construir meu próprio negócio é mais importante do que ocupar um alto cargo administrativo em uma empresa alheia.",
  "Sinto-me mais realizado em minha carreira quando tenho a oportunidade de usar meus talentos a serviço de meus semelhantes.",
  "Sentirei sucesso em minha carreira se enfrentar e superar situações muito difíceis.",
  "Sonho com uma carreira que me permitirá integrar minhas necessidades pessoais, familiares e profissionais.",
  "Tornar-me diretor técnico na minha área de especialidade me atrai mais do que tornar-me diretor geral.",
  "Sentirei que minha carreira é um sucesso somente se me tornar diretor geral de uma organização.",
  "Sentirei sucesso em minha carreira somente se alcançar completa autonomia e liberdade.",
  "Procuro empregos em organizações que me proporcionem segurança e estabilidade.",
  "Sinto-me mais realizado na minha carreira quando sou capaz de construir alguma coisa que seja inteiramente resultado de minhas ideias e esforços.",
  "Usar minhas habilidades para fazer do mundo um lugar melhor para se viver e trabalhar é mais importante para mim do que alcançar um alto cargo administrativo.",
  "Sinto-me mais realizado na minha carreira quando resolvo problemas aparentemente insolúveis ou venço sobre coisas que são aparentemente impossíveis.",
  "Sentirei sucesso na vida se conseguir equilibrar exigências pessoais, familiares e profissionais.",
  "Prefiro sair da empresa onde estou a aceitar um cargo em esquema rotativo que me afaste da minha área de especialidade.",
  "Tornar-me diretor geral é mais interessante para mim do que ocupar o cargo de diretor técnico na minha área de especialidade.",
  "A chance de fazer um trabalho do meu jeito, livre de regras e pressões, é mais importante para mim do que segurança.",
  "Sou mais realizado no meu trabalho quando acho que tenho total segurança financeira e estabilidade no emprego.",
  "Sentirei sucesso na minha carreira somente se conseguir criar ou construir algo que seja uma produção ou ideia inteiramente minha.",
  "Sonho em ter uma carreira que faça uma verdadeira contribuição para a humanidade e a sociedade.",
  "Procuro oportunidades profissionais que desafiem fortemente minha habilidade de resolver problemas e/ou competitividade.",
  "Equilibrar minhas necessidades pessoais e profissionais é mais importante para mim do que alcançar um alto cargo administrativo.",
  "Sou mais realizado no meu trabalho quando sou capaz de utilizar minhas aptidões especiais e talentos.",
  "Prefiro sair da empresa onde estou a aceitar um cargo que me afaste do caminho da diretoria geral.",
  "Prefiro sair da empresa onde estou a aceitar um cargo que reduza minha autonomia e liberdade.",
  "Sonho em ter uma carreira que me permita sentir segurança e estabilidade.",
  "Sonho em começar e construir meu próprio negócio.",
  "Prefiro sair da empresa onde estou a aceitar um cargo que prejudique minha habilidade de ser útil aos outros.",
  "Trabalhar com problemas quase insolúveis é mais importante do que alcançar uma alta posição administrativa.",
  "Estou sempre procurando oportunidades profissionais que interfiram o mínimo possível em meus interesses pessoais e familiares."
];

/**
 * As 8 ancoras, na ordem em que aparecem na aba "calculos" do Excel.
 * `questoes` usa numeracao 1..40 (igual ao Excel), nao indice de array.
 */
export const ANCORAS = [
  { id: "tecnica_funcional", nome: "Técnica Funcional",            questoes: [1, 9, 17, 25, 33] },
  { id: "adm_geral",         nome: "Competência Adm. Geral",       questoes: [2, 10, 18, 26, 34] },
  { id: "autonomia",         nome: "Autonomia e Independência",    questoes: [3, 11, 19, 27, 35] },
  { id: "seguranca",         nome: "Segurança e Estabilidade",     questoes: [4, 12, 20, 28, 36] },
  { id: "criatividade",      nome: "Criatividade Empresarial",     questoes: [5, 13, 21, 29, 37] },
  { id: "dedicacao",         nome: "Dedicação a uma Causa",        questoes: [6, 14, 22, 30, 38] },
  { id: "desafio",           nome: "Desafio Puro",                 questoes: [7, 15, 23, 31, 39] },
  { id: "estilo_vida",       nome: "Estilo de Vida",               questoes: [8, 16, 24, 32, 40] },
];

export const PERGUNTAS = perguntas;
export const TOTAL_PERGUNTAS = 40;
export const NOTA_MIN = 1;
export const NOTA_MAX = 6;
export const NOTA_DESTAQUE = 10;
export const QTD_DESTAQUES = 3;
export const VERSAO_INSTRUMENTO = "2026.1";

/** Rotulos da escala, conforme a imagem "escala ancora.png". */
export const ESCALA = [
  { valor: 1, rotulo: "Jamais se aplica a você" },
  { valor: 2, rotulo: "Ocasionalmente se aplica a você" },
  { valor: 3, rotulo: "Ocasionalmente se aplica a você" },
  { valor: 4, rotulo: "Frequentemente se aplica a você" },
  { valor: 5, rotulo: "Frequentemente se aplica a você" },
  { valor: 6, rotulo: "Sempre se aplica a você" },
];

/**
 * Calcula a media de cada ancora.
 * @param {number[]} respostas 40 notas, na ordem das questoes 1..40.
 * @returns {{id:string,nome:string,media:number}[]} na ordem do Excel.
 */
export function calcularMedias(respostas) {
  if (!Array.isArray(respostas) || respostas.length !== TOTAL_PERGUNTAS) {
    throw new Error(`Esperava ${TOTAL_PERGUNTAS} respostas, recebi ${respostas?.length}`);
  }
  return ANCORAS.map((a) => {
    const soma = a.questoes.reduce((s, q) => s + Number(respostas[q - 1] || 0), 0);
    return { id: a.id, nome: a.nome, media: soma / a.questoes.length };
  });
}

/**
 * Mesmas medias, ordenadas da maior para a menor — e o desempate e estavel,
 * caindo na ordem do Excel, para que duas rodadas iguais deem o mesmo grafico.
 */
export function ranquear(respostas) {
  return calcularMedias(respostas)
    .map((m, i) => ({ ...m, ordemExcel: i }))
    .sort((a, b) => b.media - a.media || a.ordemExcel - b.ordemExcel)
    .map((m, i) => ({ ...m, posicao: i + 1 }));
}

/**
 * Quais afirmativas podem receber a nota 10.
 *
 * O Excel diz "releia as respostas cuja pontuacao foi 6 OU AS MAIORES".
 * A versao anterior do site so aceitava 6 e travava quem respondeu no
 * maximo 5 — por isso aqui caimos para a maior nota existente.
 *
 * @returns {{indices:number[], nota:number}} indices base 0.
 */
export function candidatasDestaque(respostas) {
  const maior = Math.max(...respostas.map(Number));
  const nota = Math.min(maior, NOTA_MAX);
  const indices = respostas.reduce((acc, v, i) => (Number(v) === nota ? [...acc, i] : acc), []);
  return { indices, nota };
}

/** Aplica a nota 10 nas afirmativas escolhidas, sem mutar o array original. */
export function aplicarDestaques(respostas, indices) {
  const saida = [...respostas];
  for (const i of indices) saida[i] = NOTA_DESTAQUE;
  return saida;
}
