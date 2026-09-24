/**
 * admin.js — painel interno.
 *
 * Fluxo: login → lista as respostas → filtra → seleciona → "Gerar imagens",
 * que baixa um unico ZIP `ancora_AAAA-MM-DD.zip` com um PNG por pessoa.
 *
 * Os PNGs saem nomeados `Empresa_Nome_Sobrenome.png`, que e exatamente o
 * padrao que a skill `assessment-instrumentos` procura (`*_Nome_Sobrenome.png`)
 * depois que voce distribui os arquivos nas pastas dos participantes.
 */

import { usandoSupabase, CONFIG } from "../../config.js";
import { entrar, sair, usuarioAtual, listarRespostas, listarEmpresas } from "./db.js";
import { desenharGrafico, gerarPng, nomeArquivo } from "./grafico.js";
import { ANCORAS, ranquear } from "./ancora.js";

const URL_JSZIP = "https://esm.sh/jszip@3.10.1";

const $ = (id) => document.getElementById(id);
const estado = { registros: [], selecionados: new Set() };

/* ─────────────── telas ─────────────── */

function mostrarTela(qual) {
  for (const t of ["telaConfig", "telaLogin", "telaPainel"]) {
    $(t).classList.toggle("oculto", t !== qual);
  }
  $("btnSair").classList.toggle("oculto", qual !== "telaPainel");
}

async function iniciar() {
  $("ano").textContent = String(new Date().getFullYear());

  if (!usandoSupabase()) { mostrarTela("telaConfig"); return; }

  const usuario = await usuarioAtual();
  if (usuario) await abrirPainel(usuario);
  else mostrarTela("telaLogin");
}

async function abrirPainel(usuario) {
  $("usuarioAtual").textContent = usuario.email;
  mostrarTela("telaPainel");
  await carregarEmpresas();
  await carregar();
}

/* ─────────────── login ─────────────── */

$("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = $("erroLogin");
  const botao = $("btnEntrar");
  erro.classList.add("oculto");
  botao.disabled = true;
  botao.textContent = "Entrando...";

  try {
    const email = $("email").value.trim();
    if (CONFIG.dominioAdmin && !email.toLowerCase().endsWith(`@${CONFIG.dominioAdmin}`)) {
      throw new Error(`Use seu e-mail @${CONFIG.dominioAdmin}.`);
    }
    const usuario = await entrar(email, $("senha").value);
    await abrirPainel(usuario);
  } catch (err) {
    erro.textContent = err.message;
    erro.classList.remove("oculto");
  } finally {
    botao.disabled = false;
    botao.textContent = "Entrar";
  }
});

$("btnSair").addEventListener("click", async () => {
  await sair();
  location.reload();
});

/* ─────────────── carregar e filtrar ─────────────── */

function filtrosAtuais() {
  return {
    busca: $("filtroBusca").value.trim(),
    empresa: $("filtroEmpresa").value,
    de: $("filtroDe").value,
    ate: $("filtroAte").value,
  };
}

async function carregarEmpresas() {
  try {
    const seletor = $("filtroEmpresa");
    const empresas = await listarEmpresas();
    seletor.innerHTML = '<option value="">Todas</option>';
    for (const e of empresas) {
      const op = document.createElement("option");
      op.value = e; op.textContent = e;
      seletor.appendChild(op);
    }
  } catch (err) { console.error(err); }
}

async function carregar() {
  const status = $("statusPainel");
  status.textContent = "Carregando...";
  status.className = "aviso aviso--info";
  try {
    estado.registros = await listarRespostas(filtrosAtuais());
    estado.selecionados.clear();
    desenharTabela();
    status.classList.add("oculto");
  } catch (err) {
    status.textContent = `Não consegui carregar: ${err.message}`;
    status.className = "aviso aviso--erro";
  }
}

let timer;
const recarregarComPausa = () => { clearTimeout(timer); timer = setTimeout(carregar, 300); };

$("filtroBusca").addEventListener("input", recarregarComPausa);
["filtroEmpresa", "filtroDe", "filtroAte"].forEach((id) =>
  $(id).addEventListener("change", carregar)
);
$("btnLimpar").addEventListener("click", () => {
  $("filtroBusca").value = ""; $("filtroEmpresa").value = "";
  $("filtroDe").value = ""; $("filtroAte").value = "";
  carregar();
});

/* ─────────────── tabela ─────────────── */

const formatarData = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function desenharTabela() {
  const corpo = $("corpoTabela");
  corpo.innerHTML = "";
  $("vazio").classList.toggle("oculto", estado.registros.length > 0);

  for (const reg of estado.registros) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-check"><input type="checkbox" data-id="${reg.id}"></td>
      <td class="celula-nome"></td>
      <td class="celula-empresa"></td>
      <td class="celula-cargo"></td>
      <td><span class="etiqueta-ancora"></span></td>
      <td class="col-data">${formatarData(reg.criado_em)}</td>
      <td class="col-acao">
        <button type="button" class="botao botao--secundario botao--mini" data-ver="${reg.id}">Ver</button>
      </td>`;

    // textContent (e nao innerHTML) para nome/empresa/cargo: sao texto digitado
    // pelo participante e nao podem virar HTML.
    tr.querySelector(".celula-nome").textContent = reg.nome;
    tr.querySelector(".celula-empresa").textContent = reg.empresa;
    tr.querySelector(".celula-cargo").textContent = reg.cargo || "—";
    tr.querySelector(".etiqueta-ancora").textContent =
      reg.ancora_1 || ranquear(reg.respostas)[0].nome;

    tr.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) estado.selecionados.add(reg.id);
      else estado.selecionados.delete(reg.id);
      tr.classList.toggle("linha--marcada", e.target.checked);
      atualizarSelecao();
    });
    tr.querySelector("[data-ver]").addEventListener("click", () => verGrafico(reg));

    corpo.appendChild(tr);
  }
  atualizarSelecao();
}

function atualizarSelecao() {
  const n = estado.selecionados.size;
  $("resumoSelecao").textContent =
    n === 0 ? "Nenhum selecionado"
      : n === 1 ? "1 selecionado"
        : `${n} selecionados`;
  $("btnGerar").disabled = n === 0;
  $("marcarTodos").checked = n > 0 && n === estado.registros.length;
}

$("marcarTodos").addEventListener("change", (e) => {
  const marcar = e.target.checked;
  estado.selecionados.clear();
  document.querySelectorAll("#corpoTabela input[type=checkbox]").forEach((c) => {
    c.checked = marcar;
    c.closest("tr").classList.toggle("linha--marcada", marcar);
    if (marcar) estado.selecionados.add(c.dataset.id);
  });
  atualizarSelecao();
});

/* ─────────────── pré-visualização ─────────────── */

let regAtual = null;
function verGrafico(reg) {
  regAtual = reg;
  $("tituloGrafico").textContent = `${reg.nome} — ${reg.empresa}`;
  desenharGrafico($("canvasPreview"), reg.respostas);
  $("dialogoGrafico").showModal();
}
$("btnFecharDialogo").addEventListener("click", () => $("dialogoGrafico").close());
$("btnBaixarUm").addEventListener("click", async () => {
  if (!regAtual) return;
  const blob = await gerarPng(regAtual.respostas);
  baixar(blob, nomeArquivo(regAtual.nome, regAtual.empresa));
});

/* ─────────────── gerar ZIP ─────────────── */

$("btnGerar").addEventListener("click", async () => {
  const escolhidos = estado.registros.filter((r) => estado.selecionados.has(r.id));
  if (!escolhidos.length) return;

  const botao = $("btnGerar");
  const status = $("statusPainel");
  botao.disabled = true;
  status.className = "aviso aviso--info";
  status.classList.remove("oculto");

  try {
    const { default: JSZip } = await import(URL_JSZIP);
    const zip = new JSZip();
    const usados = new Map();

    for (const [i, reg] of escolhidos.entries()) {
      status.textContent = `Gerando ${i + 1} de ${escolhidos.length}: ${reg.nome}...`;
      const blob = await gerarPng(reg.respostas);

      // dois participantes homônimos não podem sobrescrever um ao outro
      let nome = nomeArquivo(reg.nome, reg.empresa);
      const vezes = (usados.get(nome) || 0) + 1;
      usados.set(nome, vezes);
      if (vezes > 1) nome = nome.replace(/\.png$/, `_${vezes}.png`);

      zip.file(nome, blob);
    }

    status.textContent = "Compactando...";
    const arquivo = await zip.generateAsync({ type: "blob" });
    baixar(arquivo, `ancora_${hoje()}.zip`);

    status.className = "aviso aviso--ok";
    status.textContent =
      `Pronto: ${escolhidos.length} ${escolhidos.length === 1 ? "imagem gerada" : "imagens geradas"} em ancora_${hoje()}.zip`;
  } catch (err) {
    console.error(err);
    status.className = "aviso aviso--erro";
    status.textContent = `Falhou ao gerar: ${err.message}`;
  } finally {
    botao.disabled = estado.selecionados.size === 0;
  }
});

/* ─────────────── CSV ─────────────── */

$("btnCsv").addEventListener("click", () => {
  const alvo = estado.selecionados.size
    ? estado.registros.filter((r) => estado.selecionados.has(r.id))
    : estado.registros;
  if (!alvo.length) return;

  // Mesmas colunas da aba "Respostas" da macro (timestamp|nome|empresa|cargo|1..40),
  // com as 8 medias no fim — assim o CSV serve nos dois fluxos.
  const cabecalho = [
    "timestamp", "nome", "empresa", "cargo",
    ...Array.from({ length: 40 }, (_, i) => String(i + 1)),
    ...ANCORAS.map((a) => a.nome),
  ];
  const linhas = alvo.map((r) => [
    r.criado_em, r.nome, r.empresa, r.cargo || "",
    ...r.respostas,
    ...ranquear(r.respostas)
      .sort((a, b) => a.ordemExcel - b.ordemExcel)
      .map((m) => m.media.toFixed(2).replace(".", ",")),
  ]);

  const csv = [cabecalho, ...linhas]
    .map((l) => l.map(celulaCsv).join(";"))
    .join("\r\n");
  // BOM para o Excel abrir os acentos corretamente
  baixar(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), `ancora_${hoje()}.csv`);
});

const celulaCsv = (v) => {
  const s = String(v ?? "");
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/* ─────────────── utilidades ─────────────── */

function hoje() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

iniciar();
