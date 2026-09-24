# Âncora de Carreira — WePeople

Instrumento Âncora de Carreira (Edgar Schein) em formato de link, com painel
interno para filtrar respostas e gerar os gráficos de todo mundo de uma vez.

- **Formulário (participante):** `index.html`
- **Painel (WePeople):** `admin.html`

---

## O que mudou nesta versão

| | Antes | Agora |
|---|---|---|
| Preenchimento | Excel por e-mail | link, no celular ou no computador |
| Identificação | 95 anexos chamados `Ancora de Carreira.xls` | cada resposta já vem com nome e empresa |
| Cálculo das 8 médias | na mão, no Excel | o site calcula e grava junto |
| Gráficos | macro, 5 s por pessoa, pasta única | ZIP com todos, em um clique |
| Sem nenhuma nota 6 | **travava**, não dava para enviar | cai para a maior nota, como o Excel manda |
| Menos de 3 notas no topo | escolhia menos de 3, média saía mais baixa | desce para a nota seguinte até completar 3 |

---

## Como funciona o cálculo

São 40 afirmativas em escala 1–6. Depois o participante escolhe **3** entre as
de maior nota, e essas passam a valer **10** — exatamente a instrução da linha 51
do `Ancora de Carreira.xls`.

A tela de escolha lista as afirmativas empatadas na maior nota que a pessoa usou
— 6, ou 5, ou 4, o que houver. Se menos de 3 empatarem no topo, a lista **desce
para a nota seguinte** até haver 3 candidatas. Assim todo participante aplica as
3 notas 10 e as médias ficam comparáveis entre si.

Cada âncora é a **média de 5 afirmativas**, no padrão rotativo do Schein:

| Âncora | Questões |
|---|---|
| Técnica Funcional | 1, 9, 17, 25, 33 |
| Competência Adm. Geral | 2, 10, 18, 26, 34 |
| Autonomia e Independência | 3, 11, 19, 27, 35 |
| Segurança e Estabilidade | 4, 12, 20, 28, 36 |
| Criatividade Empresarial | 5, 13, 21, 29, 37 |
| Dedicação a uma Causa | 6, 14, 22, 30, 38 |
| Desafio Puro | 7, 15, 23, 31, 39 |
| Estilo de Vida | 8, 16, 24, 32, 40 |

Esse mapa foi conferido contra a aba `calculos` do Excel, e as médias foram
validadas rodando o próprio Excel com vetores de teste: **32/32 bateram**.

> **Atenção à escala do gráfico.** Se as 3 notas 10 caírem na mesma âncora, a
> média chega a **8,4**. O gráfico do Excel travava o eixo em 7 e cortava esses
> casos (a `Média ancora.xlsx` tem 7,8 e 7,4 cortados). Aqui o eixo vai até 7 e
> se estica sozinho quando precisa.

---

## Ligar o Supabase

Enquanto `config.js` estiver sem as credenciais, o formulário continua gravando
no **Google Apps Script** de sempre. O painel só funciona com o Supabase ligado.

1. Crie um projeto em [supabase.com](https://supabase.com) (o plano gratuito atende).
2. Em **SQL Editor → New query**, cole e rode o conteúdo de `supabase/schema.sql`.
3. Em **Project Settings → API**, copie a *Project URL* e a chave **anon public**.
4. Cole as duas em `config.js`.
5. Em **Authentication → Users → Add user**, crie seu usuário (e-mail `@wepeople.com.br` e senha).

> A chave `anon public` fica visível no navegador — isso é esperado. Quem protege
> os dados é a Row Level Security do `schema.sql`: qualquer pessoa **insere** uma
> resposta, mas só quem está logado **lê**. Nunca use a chave `service_role` aqui.

### Antes de fazer o merge para produção

1. `config.js` preenchido com a URL e a chave **anon public**.
2. Abrir o formulário, responder uma vez e conferir que **não aparece** o aviso
   `[ancora] Supabase NAO configurado` no console (F12).
3. Conferir que essa resposta de teste apareceu no painel — e apagá-la no
   Supabase (**Table Editor → respostas**) depois.

> Se o merge for feito com o `config.js` vazio, o formulário continua
> funcionando, mas grava na planilha do Google e **o painel fica vazio**.
> Não há histórico a migrar: a base começa limpa no Supabase.

---

## Gerar os gráficos

No painel: filtre (nome, empresa, período) → marque quem quiser →
**Gerar imagens**. Sai um `ancora_AAAA-MM-DD.zip` com um PNG por pessoa, com
fundo transparente.

Os arquivos saem nomeados `Empresa_Nome_Sobrenome.png` — que é o padrão que a
skill `assessment-instrumentos` procura (`*_Nome_Sobrenome.png`). Depois de
distribuir os PNGs nas pastas dos participantes, ela insere cada um no
placeholder `ANCORA` do `*_VEXEC.pptx` sozinha.

O botão **Baixar CSV** exporta no mesmo formato da aba `Respostas` da macro
(`timestamp | nome | empresa | cargo | 1..40`), com as 8 médias no fim.

---

## Arquivos

```
index.html              formulário público
admin.html              painel interno
config.js               ÚNICO arquivo a editar (credenciais)
testes.html             suíte de testes — abra no navegador
preview-grafico.html    exemplo do gráfico, sem precisar de banco

assets/js/ancora.js     as 40 afirmativas, o mapa das 8 âncoras e o cálculo
assets/js/grafico.js    desenho do gráfico e exportação em PNG
assets/js/db.js         acesso a dados (Supabase ou Apps Script)
assets/js/form.js       fluxo do formulário
assets/js/admin.js      fluxo do painel
supabase/schema.sql     tabela + regras de segurança
```

Trocar de backend no futuro = mexer só em `db.js` e `config.js`.

---

## Testes

Abra `testes.html` no navegador. São 21 verificações do cálculo, do mapa das
âncoras, do comportamento sem nota 6, da descida quando faltam candidatas no
topo e da geração do PNG. O título da aba vira
`TESTES-OK` quando tudo passa.

## Publicação

O site é estático, sem build. A Vercel publica direto do branch no GitHub.
