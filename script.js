// ====== 1️⃣ LISTA DE PERGUNTAS ======
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

// ====== 2️⃣ GERAR PERGUNTAS NA ETAPA 1 ======
function gerarPerguntas() {
  const container = document.getElementById("perguntasContainer");
  perguntas.forEach((texto, idx) => {
    const div = document.createElement("div");
    div.className = "question-item";

    const label = document.createElement("label");
    label.textContent = `${idx + 1}. ${texto}`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 6;
    input.required = true;
    input.id = `q${idx + 1}-score`;
    input.name = `q${idx + 1}-score`;

    div.appendChild(label);
    div.appendChild(input);
    container.appendChild(div);
  });
}

// ====== 3️⃣ FLUXO PRINCIPAL ======
document.addEventListener("DOMContentLoaded", () => {
  gerarPerguntas();

  const mainEvaluationSection = document.getElementById("mainEvaluationSection");
  const selectionStepSection = document.getElementById("selectionStepSection");
  const topScoresContainer = document.getElementById("topScoresContainer");
  const submitSelectionButton = document.getElementById("submitSelectionButton");
  const backButton = document.getElementById("backToEvaluationButton");
  const form = document.getElementById("evaluationForm");

  let respostas = [];
  let indicesNotaSeis = [];

  // --- SUBMISSÃO ETAPA 1 ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const clientInfo = {
      nome: document.getElementById("clientName").value.trim(),
      empresa: document.getElementById("companyName").value.trim(),
      cargo: document.getElementById("clientRole").value.trim()
    };

    respostas = [];
    indicesNotaSeis = [];
    let algumVazio = false;

    for (let i = 0; i < perguntas.length; i++) {
      const input = document.getElementById(`q${i + 1}-score`);
      const val = Number(input.value);

      if (!val || val < 1 || val > 6) {
        input.classList.add("input-erro");
        algumVazio = true;
      } else {
        input.classList.remove("input-erro");
        respostas.push(val);
        if (val === 6) {
          indicesNotaSeis.push(i); // guarda posição das notas 6
        }
      }
    }

    if (algumVazio) {
      alert("Preencha todas as notas de 1 a 6 antes de continuar.");
      return;
    }

    if (indicesNotaSeis.length === 0) {
      alert("Nenhuma afirmação recebeu nota 6. Avalie novamente ou ajuste suas notas.");
      return;
    }

    // Prepara a etapa 2
    topScoresContainer.innerHTML = ""; // limpa antes
    indicesNotaSeis.forEach((idx) => {
      const div = document.createElement("div");
      div.className = "question-item";
      div.innerHTML = `
        <input type="checkbox" id="check${idx}" name="choices" value="${idx}">
        <label for="check${idx}">${perguntas[idx]}</label>
      `;
      topScoresContainer.appendChild(div);
    });

    // Troca de telas
    mainEvaluationSection.classList.add("hidden");
    selectionStepSection.classList.remove("hidden");
  });

  // --- BOTÃO VOLTAR ---
  backButton.addEventListener("click", () => {
    selectionStepSection.classList.add("hidden");
    mainEvaluationSection.classList.remove("hidden");
  });

 // --- SUBMISSÃO ETAPA 2 ---
submitSelectionButton.addEventListener("click", async () => {
  const escolhidos = Array.from(document.querySelectorAll("input[name='choices']:checked"));
// REGRAS de seleção das afirmativas mais importantes
if (escolhidos.length === 0) {
  alert("Marque ao menos uma afirmação.");
  return;
}

const totalCandidatas = indicesNotaSeis.length;

// 💡 Novo cálculo da quantidade obrigatória
const obrigatorias = Math.min(totalCandidatas, 3);

if (escolhidos.length < obrigatorias) {
  alert(`Você precisa selecionar exatamente ${obrigatorias} afirmações mais importantes.`);
  return;
}

if (escolhidos.length > 3) {
  alert("Escolha no máximo 3 afirmações mais importantes.");
  return;
}


  const indicesEscolhidos = escolhidos.map(el => Number(el.value));

  // 👉 coloca as 3 com nota 10 automaticamente
  for (let i of indicesEscolhidos) {
    respostas[i] = 10;
  }

  const payload = {
    nome: document.getElementById("clientName").value.trim(),
    empresa: document.getElementById("companyName").value.trim(),
    cargo: document.getElementById("clientRole").value.trim(),
    respostas: respostas
  };

  const scriptURL = "https://script.google.com/macros/s/AKfycbz3H4vmWGIWKqib0oNXbAKUqIdibuFlkTcl608-vDqr8i0XQvzSdpGN8vCEag-dUGS0/exec";

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // esconde tudo e mostra tela final
      mainEvaluationSection.classList.add("hidden");
      selectionStepSection.classList.add("hidden");
      document.getElementById("thanksSection").classList.remove("hidden");
    } else {
      alert("Falha ao enviar as respostas. Tente novamente.");
    }
  } catch (err) {
    console.error("Erro:", err);
    alert("Ocorreu um erro ao enviar os dados.");
  }
});

function mostrarResultado() {
  selectionStepSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  const respostasTxt = respostas.join(", ");
  answersArea.value = respostasTxt;
}

copyButton.addEventListener("click", () => {
  answersArea.select();
  document.execCommand("copy");
  alert("Respostas copiadas! Agora é só colar no Excel‑modelo 😊");
});

backHomeButton.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  mainEvaluationSection.classList.remove("hidden");
  form.reset();
  document.getElementById("perguntasContainer").innerHTML = "";
  gerarPerguntas();
});
}); // fecha o DOMContentLoaded
