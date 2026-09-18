/**
 * db.js — camada de dados. Todo acesso a backend passa por aqui.
 *
 * Duas implementacoes atras da mesma interface:
 *   - Supabase  (quando config.js tiver url + anonKey)
 *   - Apps Script (fallback, mantem o site funcionando como hoje)
 *
 * Trocar de backend no futuro = mexer so neste arquivo.
 */

import { CONFIG, usandoSupabase } from "../../config.js";
import { calcularMedias, ranquear, VERSAO_INSTRUMENTO } from "./ancora.js";

const URL_SDK = "https://esm.sh/@supabase/supabase-js@2.45.4";

let _cliente = null;
async function cliente() {
  if (_cliente) return _cliente;
  const { createClient } = await import(URL_SDK);
  _cliente = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  return _cliente;
}

/**
 * Monta o registro gravado. As 8 medias vao JA CALCULADAS: e isso que
 * elimina a planilha intermediaria no fluxo de geracao dos graficos.
 */
export function montarRegistro({ nome, empresa, cargo, respostas }) {
  const medias = calcularMedias(respostas);
  const top = ranquear(respostas);
  const registro = {
    nome: nome.trim(),
    empresa: empresa.trim(),
    cargo: cargo.trim(),
    respostas,
    versao_instrumento: VERSAO_INSTRUMENTO,
    ancora_1: top[0].nome,
    ancora_2: top[1].nome,
    ancora_3: top[2].nome,
  };
  for (const m of medias) registro[`media_${m.id}`] = Number(m.media.toFixed(2));
  return registro;
}

/* ─────────────── gravar (site publico) ─────────────── */

export async function salvarResposta(dados) {
  const registro = montarRegistro(dados);

  if (usandoSupabase()) {
    const sb = await cliente();
    const { error } = await sb.from("respostas").insert(registro);
    if (error) throw new Error(`Supabase: ${error.message}`);
    return registro;
  }

  // Fallback Apps Script. Ele ignora campos que nao conhece, entao os
  // extras (medias, versao) so passam a ser gravados quando o Code.gs
  // for atualizado — sem quebrar nada nesse meio tempo.
  const resp = await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(registro),
  });
  if (!resp.ok) throw new Error(`Apps Script respondeu ${resp.status}`);
  return registro;
}

/* ─────────────── ler (admin) ─────────────── */

export async function entrar(email, senha) {
  const sb = await cliente();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(traduzErroLogin(error.message));
  return data.user;
}

export async function sair() {
  const sb = await cliente();
  await sb.auth.signOut();
}

export async function usuarioAtual() {
  if (!usandoSupabase()) return null;
  const sb = await cliente();
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Lista as respostas, com filtros opcionais.
 * @param {{empresa?:string, busca?:string, de?:string, ate?:string}} filtros
 */
export async function listarRespostas(filtros = {}) {
  const sb = await cliente();
  let q = sb.from("respostas").select("*").order("criado_em", { ascending: false });

  if (filtros.empresa) q = q.eq("empresa", filtros.empresa);
  if (filtros.busca) q = q.ilike("nome", `%${filtros.busca}%`);
  if (filtros.de) q = q.gte("criado_em", `${filtros.de}T00:00:00`);
  if (filtros.ate) q = q.lte("criado_em", `${filtros.ate}T23:59:59`);

  const { data, error } = await q;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ?? [];
}

/** Empresas distintas, para alimentar o filtro. */
export async function listarEmpresas() {
  const sb = await cliente();
  const { data, error } = await sb.from("respostas").select("empresa");
  if (error) throw new Error(`Supabase: ${error.message}`);
  return [...new Set((data ?? []).map((r) => r.empresa).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR")
  );
}

function traduzErroLogin(msg = "") {
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  return msg;
}
