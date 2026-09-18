/**
 * form.js — fluxo do formulario publico.
 *
 * Etapa 1: dados + 40 afirmativas (escala 1..6 clicavel)
 * Etapa 2: escolher 3 entre as de maior nota, que passam a valer 10
 * Etapa 3: agradecimento (o resultado nao e mostrado ao participante)
 *
 * O rascunho fica no localStorage: se a pessoa fechar a aba no meio,
 * recupera de onde parou.
 */

import {
  PERGUNTAS, TOTAL_PERGUNTAS, NOTA_MIN, NOTA_MAX, QTD_DESTAQUES,
  candidatasDestaque, aplicarDestaques,
} from "./ancora.js";
import { salvarResposta } from "./db.js";

const CHAVE_RASCUNHO = "ancora-wepeople:rascunho:v2026.1";

const $ = (id) => document.getElementById(id);
const el = {
  etapaFormulario: $("etapaFormulario"),
  etapaDestaques: $("etapaDestaques"),
  etapaConclusao: $("etapaConclusao"),
  listaPerguntas: $("listaPerguntas"),
  listaDestaques: $("listaDestaques"),
  textoDestaques: $("textoDestaques"),
  erroDestaques: $("erroDestaques"),
  rodapeFixo: $("rodapeFixo"),
  blocoProgresso: $("blocoProgresso"),
  progressoAtual: $("progressoAtual"),
  progressoTotal: $("progressoTotal"),
  progressoBarra: $("progressoBarra"),
  progressoRotulo: $("progressoRotulo"),
  btnAvancar: $("btnAvancar"),
  btnVoltar: $("btnVoltar"),
  nome: $("nome"), empresa: $("empresa"), cargo: $("cargo"),
};

/** Estado unico da aplicacao. */
const estado = {
  etapa: 1,
  respostas: new Array(TOTAL_PERGUNTAS).fill(null),
  destaques: [],
  notaDestaque: NOTA_MAX,
  enviando: false,
};

/* ─────────────── montagem ─────────────── */

function montarPerguntas() {
  const frag = document.createDocumentFragment();

  PERGUNTAS.forEach((texto, i) => {
    const bloco = document.createElement("div");
    bloco.className = "pergunta";
    bloco.id = `pergunta-${i}`;

    const linha = document.createElement("p");
    linha.className = "pergunta__texto";
    linha.innerHTML = `<span class="pergunta__num">${i + 1}</span><span>${texto}</span>`;
    bloco.appendChild(linha);

    const notas = document.createElement("div");
    notas.className = "notas";
    notas.setAttribute("role", "radiogroup");
    notas.setAttribute("aria-label", `Afirmação ${i + 1}: ${texto}`);

    for (let n = NOTA_MIN; n <= NOTA_MAX; n++) {
      const id = `q${i}n${n}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${i}`;
      input.id = id;
      input.value = String(n);
      input.addEventListener("change", () => registrarNota(i, n));

      const rotulo = document.createElement("label");
      rotulo.setAttribute("for", id);
      rotulo.textContent = String(n);

      notas.append(input, rotulo);
    }

    bloco.appendChild(notas);
    frag.appendChild(bloco);
  });

  el.listaPerguntas.appendChild(frag);
  el.progressoTotal.textContent = String(TOTAL_PERGUNTAS);
}

function registrarNota(indice, nota) {
  estado.respostas[indice] = nota;
  const bloco = $(`pergunta-${indice}`);
  bloco.classList.add("pergunta--respondida");
  bloco.classList.remove("pergunta--pendente");
  atualizarProgresso();
  salvarRascunho();
}

function atualizarProgresso() {
  const feitas = estado.respostas.filter((v) => v !== null).length;
  el.progressoAtual.textContent = String(feitas);
  el.progressoBarra.style.width = `${(feitas / TOTAL_PERGUNTAS) * 100}%`;
}

/* ─────────────── rascunho ─────────────── */

function salvarRascunho() {
  try {
    localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({
      respostas: estado.respostas,
      nome: el.nome.value, empresa: el.empresa.value, cargo: el.cargo.value,
    }));
  } catch { /* modo privado / cota cheia: seguir sem rascunho */ }
}

function lerRascunho() {
  let dados;
  try {
    dados = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || "null");
  } catch { return; }
  if (!dados) return;

  el.nome.value = dados.nome || "";
  el.empresa.value = dados.empresa || "";
  el.cargo.value = dados.cargo || "";

  (dados.respostas || []).forEach((nota, i) => {
    if (nota === null || nota === undefined) return;
    const alvo = document.querySelector(`input[name="q${i}"][value="${nota}"]`);
    if (!alvo) return;
    alvo.checked = true;
    estado.respostas[i] = nota;
    $(`pergunta-${i}`)?.classList.add("pergunta--respondida");
  });

  atualizarProgresso();
  if (estado.respostas.some((v) => v !== null)) avisarRetomada();
}

function avisarRetomada() {
  const aviso = document.createElement("div");
  aviso.className = "aviso aviso--ok";
  aviso.innerHTML =
    "<span aria-hidden='true'>✓</span><span>Recuperamos as respostas que você já tinha preenchido neste navegador.</span>";
  el.listaPerguntas.parentElement.insertBefore(aviso, el.listaPerguntas);
}

function limparRascunho() {
  try { localStorage.removeItem(CHAVE_RASCUNHO); } catch { /* ignora */ }
}

/* ─────────────── validacao da etapa 1 ─────────────── */

function validarDados() {
  let ok = true;
  for (const [campoId, input] of [["campoNome", el.nome], ["campoEmpresa", el.empresa], ["campoCargo", el.cargo]]) {
    const vazio = !input.value.trim();
    $(campoId).classList.toggle("campo--erro", vazio);
    if (vazio && ok) { input.focus(); ok = false; }
  }
  return ok;
}

function validarRespostas() {
  const pendentes = estado.respostas.reduce((acc, v, i) => (v === null ? [...acc, i] : acc), []);
  document.querySelectorAll(".pergunta--pendente").forEach((n) => n.classList.remove("pergunta--pendente"));
  if (!pendentes.length) return true;

  pendentes.forEach((i) => $(`pergunta-${i}`).classList.add("pergunta--pendente"));
  $(`pergunta-${pendentes[0]}`).scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}

/* ─────────────── etapa 2 ─────────────── */

function abrirDestaques() {
  const { indices, nota } = candidatasDestaque(estado.respostas);
  estado.notaDestaque = nota;
  estado.destaques = [];

  const alvo = Math.min(indices.length, QTD_DESTAQUES);
  el.textoDestaques.textContent =
    nota === NOTA_MAX
      ? `Entre as afirmações que você avaliou com ${NOTA_MAX}, escolha ${alvo} — as mais importantes para você.`
      : `Nenhuma afirmação recebeu ${NOTA_MAX}. Entre as que você avaliou com ${nota}, sua nota mais alta, escolha ${alvo}.`;

  el.listaDestaques.innerHTML = "";
  indices.forEach((indice) => {
    const item = document.createElement("label");
    item.className = "destaque";
    item.innerHTML =
      `<input type="checkbox" value="${indice}"><span>${PERGUNTAS[indice]}</span>`;
    const caixa = item.querySelector("input");
    caixa.addEventListener("change", () => alternarDestaque(indice, item, caixa));
    el.listaDestaques.appendChild(item);
  });

  irParaEtapa(2);
}

function alternarDestaque(indice, item, caixa) {
  if (caixa.checked) estado.destaques.push(indice);
  else estado.destaques = estado.destaques.filter((i) => i !== indice);

  item.classList.toggle("destaque--marcado", caixa.checked);
  el.erroDestaques.classList.add("oculto");

  // trava o resto quando ja bateu o limite
  const cheio = estado.destaques.length >= QTD_DESTAQUES;
  el.listaDestaques.querySelectorAll(".destaque").forEach((n) => {
    const c = n.querySelector("input");
    const bloquear = cheio && !c.checked;
    c.disabled = bloquear;
    n.classList.toggle("destaque--bloqueado", bloquear);
  });

  atualizarProgressoDestaques();
}

function atualizarProgressoDestaques() {
  const alvo = Math.min(
    candidatasDestaque(estado.respostas).indices.length, QTD_DESTAQUES
  );
  el.progressoAtual.textContent = String(estado.destaques.length);
  el.progressoTotal.textContent = String(alvo);
  el.progressoBarra.style.width = `${(estado.destaques.length / alvo) * 100}%`;
}

/* ─────────────── envio ─────────────── */

async function enviar() {
  const alvo = Math.min(candidatasDestaque(estado.respostas).indices.length, QTD_DESTAQUES);
  if (estado.destaques.length !== alvo) {
    el.erroDestaques.textContent =
      `Selecione ${alvo} ${alvo === 1 ? "afirmação" : "afirmações"} para continuar.`;
    el.erroDestaques.classList.remove("oculto");
    return;
  }

  estado.enviando = true;
  el.btnAvancar.disabled = true;
  el.btnAvancar.textContent = "Enviando...";

  try {
    await salvarResposta({
      nome: el.nome.value,
      empresa: el.empresa.value,
      cargo: el.cargo.value,
      respostas: aplicarDestaques(estado.respostas, estado.destaques),
    });
    limparRascunho();
    irParaEtapa(3);
  } catch (erro) {
    console.error(erro);
    el.erroDestaques.textContent =
      "Não conseguimos enviar suas respostas. Verifique sua conexão e tente de novo — nada foi perdido.";
    el.erroDestaques.classList.remove("oculto");
    el.btnAvancar.disabled = false;
    el.btnAvancar.textContent = "Enviar respostas";
  } finally {
    estado.enviando = false;
  }
}

/* ─────────────── navegacao ─────────────── */

function irParaEtapa(n) {
  estado.etapa = n;
  el.etapaFormulario.classList.toggle("oculto", n !== 1);
  el.etapaDestaques.classList.toggle("oculto", n !== 2);
  el.etapaConclusao.classList.toggle("oculto", n !== 3);

  el.rodapeFixo.classList.toggle("oculto", n === 3);
  el.btnVoltar.classList.toggle("oculto", n !== 2);
  el.blocoProgresso.classList.toggle("oculto", n === 3);

  if (n === 1) {
    el.progressoRotulo.textContent = "Respondidas";
    el.btnAvancar.textContent = "Continuar";
    el.progressoTotal.textContent = String(TOTAL_PERGUNTAS);
    atualizarProgresso();
  } else if (n === 2) {
    el.progressoRotulo.textContent = "Selecionadas";
    el.btnAvancar.textContent = "Enviar respostas";
    el.btnAvancar.disabled = false;
    atualizarProgressoDestaques();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ─────────────── inicializacao ─────────────── */

montarPerguntas();
lerRascunho();
$("ano").textContent = String(new Date().getFullYear());

[el.nome, el.empresa, el.cargo].forEach((campo) => {
  campo.addEventListener("input", () => {
    campo.closest(".campo").classList.remove("campo--erro");
    salvarRascunho();
  });
});

el.btnAvancar.addEventListener("click", () => {
  if (estado.enviando) return;
  if (estado.etapa === 1) {
    if (!validarDados() || !validarRespostas()) return;
    abrirDestaques();
  } else if (estado.etapa === 2) {
    enviar();
  }
});

el.btnVoltar.addEventListener("click", () => irParaEtapa(1));
