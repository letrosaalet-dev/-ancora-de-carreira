/**
 * grafico.js — desenha o grafico de ancoras num <canvas> e devolve PNG.
 *
 * Reproduz o grafico que a macro "DeixarGrafRoxo" produzia no Excel:
 *   barras horizontais (barDir="bar"), ancoras ranqueadas, eixo 0..7,
 *   gap de 50%, gradiente vertical roxo claro no centro / escuro nas bordas,
 *   rotulos em negrito preto, sem titulo e com fundo transparente.
 *
 * Diferenca proposital: o eixo cresce alem de 7 quando alguma media passa
 * disso. No Excel o maximo era fixo em 7 e as medias altas ficavam cortadas
 * (a planilha "Media ancora.xlsx" tem 7,8 e 7,4 clipados).
 */

import { ranquear } from "./ancora.js";

export const ROXO_CLARO = "#AE8EE2"; // centro da barra
export const ROXO_ESCURO = "#39265E"; // bordas da barra

const PADRAO = {
  largura: 1000,
  altura: 620,
  escala: 2, // densidade do PNG exportado
  margemEsq: 250, // espaco para o nome das ancoras
  margemDir: 60,
  margemTopo: 24,
  margemBase: 48,
  gapWidth: 0.5, // 50%, igual ao ChartGroups(1).GapWidth = 50
  eixoMax: 7,
  fonte: "Lexend, 'Segoe UI', Arial, sans-serif",
};

/** Gradiente vertical: escuro nas bordas, claro no centro (msoGradientVertical). */
function gradienteBarra(ctx, topo, altura) {
  const g = ctx.createLinearGradient(0, topo, 0, topo + altura);
  g.addColorStop(0, ROXO_ESCURO);
  g.addColorStop(0.5, ROXO_CLARO);
  g.addColorStop(1, ROXO_ESCURO);
  return g;
}

/**
 * Desenha o grafico no canvas informado.
 * @param {HTMLCanvasElement} canvas
 * @param {number[]} respostas as 40 notas (ja com as notas 10 aplicadas)
 * @param {object} [opcoes]
 */
export function desenharGrafico(canvas, respostas, opcoes = {}) {
  const o = { ...PADRAO, ...opcoes };
  const dados = ranquear(respostas); // maior no topo

  // O eixo vai ate 7, mas acompanha se alguma media estourar.
  const maiorMedia = Math.max(...dados.map((d) => d.media));
  const eixoMax = Math.max(o.eixoMax, Math.ceil(maiorMedia));

  const ctx = canvas.getContext("2d");
  canvas.width = o.largura * o.escala;
  canvas.height = o.altura * o.escala;
  canvas.style.width = `${o.largura}px`;
  canvas.style.height = `${o.altura}px`;
  ctx.setTransform(o.escala, 0, 0, o.escala, 0, 0);
  ctx.clearRect(0, 0, o.largura, o.altura); // fundo transparente

  const areaX = o.margemEsq;
  const areaY = o.margemTopo;
  const areaL = o.largura - o.margemEsq - o.margemDir;
  const areaA = o.altura - o.margemTopo - o.margemBase;

  const faixa = areaA / dados.length;
  const alturaBarra = faixa / (1 + o.gapWidth);
  const paraX = (v) => areaX + (v / eixoMax) * areaL;

  // ── grade e eixo de valores ────────────────────────────────
  ctx.strokeStyle = "#D8D4E4";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6B6580";
  ctx.font = `13px ${o.fonte}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let v = 0; v <= eixoMax; v++) {
    const x = Math.round(paraX(v)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, areaY);
    ctx.lineTo(x, areaY + areaA);
    ctx.stroke();
    ctx.fillText(String(v), x, areaY + areaA + 10);
  }

  // ── barras ─────────────────────────────────────────────────
  dados.forEach((d, i) => {
    const topo = areaY + i * faixa + (faixa - alturaBarra) / 2;
    const comprimento = Math.max(paraX(d.media) - areaX, 0);

    // nome da ancora, alinhado a direita junto da barra
    ctx.fillStyle = "#2A084B";
    ctx.font = `500 15px ${o.fonte}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(d.nome, areaX - 14, topo + alturaBarra / 2);

    if (comprimento > 0) {
      ctx.save();
      ctx.shadowColor = "rgba(128,128,128,0.4)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = -3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = gradienteBarra(ctx, topo, alturaBarra);
      ctx.beginPath();
      ctx.rect(areaX, topo, comprimento, alturaBarra);
      ctx.fill();
      ctx.restore();
    }

    // rotulo de dados: negrito, preto, uma casa decimal (igual ao Excel)
    ctx.fillStyle = "#000000";
    ctx.font = `bold 15px ${o.fonte}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      d.media.toFixed(1).replace(".", ","),
      areaX + comprimento + 10,
      topo + alturaBarra / 2
    );
  });

  // linha do zero, por cima das barras
  ctx.strokeStyle = "#9A93AD";
  ctx.beginPath();
  ctx.moveTo(Math.round(areaX) + 0.5, areaY);
  ctx.lineTo(Math.round(areaX) + 0.5, areaY + areaA);
  ctx.stroke();

  return dados;
}

/** Gera o PNG (Blob) do grafico, fora da tela. */
export async function gerarPng(respostas, opcoes = {}) {
  const canvas = document.createElement("canvas");
  desenharGrafico(canvas, respostas, opcoes);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/**
 * Nome do arquivo no padrao que a skill `assessment-instrumentos` procura
 * (`*_Nome_Sobrenome.png`), para que ela ache a imagem sozinha depois que
 * voce mover para a pasta do participante.
 */
export function nomeArquivo(nome, empresa) {
  const limpar = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  const emp = limpar(empresa) || "SemEmpresa";
  const pes = limpar(nome) || "SemNome";
  return `${emp}_${pes}.png`;
}
