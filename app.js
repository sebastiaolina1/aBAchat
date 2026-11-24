
const pessoas = [
  {
    nome: "Glenderson",
    turma: "Nexus",
    descricao: "Idealizador do aBAChat",
    inicial: "G"
  },
  {
    nome: "Guilherme",
    turma: "Nexus",
    descricao: "Idealizador do aBAChat",
    inicial: "G"
  },
  {
    nome: "Novo participante",
    turma: "Comunidade BA",
    descricao: "Em breve, novas conexões",
    inicial: "+"
  }
];

// Menu mobile
const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", () => {
  navigation.classList.toggle("open");
});

navigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
  });
});

// Carregar participantes
const peopleGrid = document.getElementById("peopleGrid");

pessoas.forEach(pessoa => {
  const card = document.createElement("article");
  card.className = "person-card";

  const avatar = document.createElement("div");
  avatar.className = "person-avatar";
  avatar.textContent = pessoa.inicial;

  const nome = document.createElement("h3");
  nome.textContent = pessoa.nome;

  const turma = document.createElement("p");
  turma.textContent = pessoa.turma;

  const descricao = document.createElement("span");
  descricao.className = "person-tag";
  descricao.textContent = pessoa.descricao;

  card.append(avatar, nome, turma, descricao);
  peopleGrid.appendChild(card);
});

// Roleta de convidados
const spinButton = document.getElementById("spinButton");
const rouletteWheel = document.getElementById("rouletteWheel");
const rouletteResult = document.getElementById("rouletteResult");

const convidados = [
  "Glenderson",
  "Guilherme",
  "Um aluno da comunidade BA",
  "Um professor da BA",
  "Um mentor da BA",
  "Um integrante da equipe BA"
];

spinButton.addEventListener("click", () => {
  if (spinButton.disabled) return;

  spinButton.disabled = true;
  rouletteResult.textContent = "Escolhendo o próximo convidado...";

  rouletteWheel.classList.remove("spinning");
  void rouletteWheel.offsetWidth;
  rouletteWheel.classList.add("spinning");

  setTimeout(() => {
    const sorteado =
      convidados[Math.floor(Math.random() * convidados.length)];

    rouletteResult.textContent = "Próximo convidado: " + sorteado;
    spinButton.disabled = false;
  }, 1500);
});
