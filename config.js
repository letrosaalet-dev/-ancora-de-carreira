/**
 * config.js — o unico arquivo que voce precisa editar para trocar de backend.
 *
 * ENQUANTO `supabase.url` estiver vazio, o site continua gravando no Google
 * Apps Script de sempre. Assim que voce colar a URL e a chave do Supabase,
 * ele passa a gravar la — sem mexer em mais nada.
 *
 * A chave `anonKey` e PUBLICA por design (fica visivel no navegador). Quem
 * protege os dados e a Row Level Security definida em supabase/schema.sql:
 * qualquer um pode inserir uma resposta, mas so quem esta logado le.
 * NUNCA coloque aqui a `service_role key`.
 */

export const CONFIG = {
  supabase: {
    // So o endereco do projeto, SEM /rest/v1 no fim: o SDK acrescenta esse
    // caminho sozinho, e com ele aqui a URL sai duplicada e responde 404.
    url: "https://behxkrznzorwmemyhqwu.supabase.co",
    anonKey: "sb_publishable_CED-6KrgbplTd0Bo-ciCFA_d_wPqV1Z",
  },

  /** Endpoint atual, usado como backend enquanto o Supabase nao estiver ligado. */
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycbz3H4vmWGIWKqib0oNXbAKUqIdibuFlkTcl608-vDqr8i0XQvzSdpGN8vCEag-dUGS0/exec",

  /** Dominio permitido no login do admin. */
  dominioAdmin: "wepeople.com.br",
};

export const usandoSupabase = () =>
  Boolean(CONFIG.supabase.url && CONFIG.supabase.anonKey);
