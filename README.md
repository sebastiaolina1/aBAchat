# 🥑 aBAChat — A Behring Academy Chat

**Conectando pessoas, experiências e conhecimentos.**

O aBAChat é uma iniciativa criada para aproximar os integrantes da Behring Academy por meio de conversas, compartilhamento de experiências e conexões entre estudantes, mentores e professores.

A plataforma busca fortalecer a comunidade, incentivar a colaboração e criar oportunidades para que os participantes conheçam pessoas com interesses e objetivos semelhantes.

---

## 🌱 Sobre o projeto

O aBAChat nasceu da ideia de criar um espaço digital no qual os integrantes da Behring Academy possam interagir de maneira simples e organizada.

Idealizado por Glenderson e Guilherme, estudantes da turma Nexus, o projeto pretende aproximar diferentes turmas e incentivar a troca de conhecimentos dentro da comunidade.

Inicialmente, os encontros são planejados para acontecer por videoconferência, com possibilidade de participação de alunos, professores, mentores e colaboradores da Behring Academy.

## ✨ Funcionalidades

- **Autenticação:** criação de contas e login com e-mail e senha.
- **Comunidade:** visualização dos participantes cadastrados.
- **Busca e filtros:** localização de participantes por nome, turma ou categoria.
- **Perfil pessoal:** personalização do nome de exibição, turma e descrição.
- **Sugestões de conversas:** envio de propostas de encontros com data, horário e assunto.
- **Roleta:** sorteio de participantes que poderão ser convidados para os próximos encontros.
- **Interface responsiva:** utilização em computadores, tablets e celulares.

## 🖥️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura da plataforma |
| CSS3 | Identidade visual e responsividade |
| JavaScript | Funcionalidades e interatividade |
| Firebase Authentication | Autenticação de usuários |
| Cloud Firestore | Armazenamento de dados |
| GitHub Pages | Hospedagem da aplicação |

## 📁 Estrutura do projeto

```text
aBAchate/
│
├── index.html
├── style.css
├── app.js
│
└── README.md
```

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/sebastiaolina1/aBAchate.git
```

### 2. Acesse a pasta

```bash
cd aBAchate
```

### 3. Configure o Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com/).

Ative os seguintes serviços:

- Authentication, com o provedor E-mail/senha.
- Cloud Firestore.

Insira as configurações do seu aplicativo Firebase no objeto `firebaseConfig`, localizado em `app.js`.

### 4. Execute a aplicação

Como o projeto utiliza módulos JavaScript, execute-o por meio de um servidor local, como a extensão Live Server do Visual Studio Code.

Também é possível publicar a aplicação utilizando o GitHub Pages.

## 🔥 Banco de dados

O projeto utiliza o Cloud Firestore para armazenar informações em coleções.

| Coleção | Finalidade |
|---|---|
| `profiles` | Informações dos participantes |
| `meetingRequests` | Sugestões de conversas |

A autenticação dos usuários é realizada pelo Firebase Authentication.

**Observação:** as regras de segurança do Firestore devem ser configuradas antes de disponibilizar a plataforma publicamente. O cadastro atualmente não possui aprovação automática ou restrição de acesso por domínio institucional.

## 🎯 Objetivos

- Aproximar estudantes de diferentes turmas.
- Incentivar a troca de experiências acadêmicas.
- Facilitar o contato entre alunos, mentores e professores.
- Criar oportunidades de colaboração.
- Fortalecer o senso de comunidade na Behring Academy.

## 🤝 Contribuições

Ideias, sugestões e melhorias são bem-vindas!

Caso queira contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua alteração.
3. Faça suas modificações.
4. Envie um pull request.

## 📬 Contato

**E-mail:** abachat.contato@gmail.com

**Aplicação:** https://sebastiaolina1.github.io/aBAchate/

---

<div align="center">

### 🥑 aBAChat

*Uma conversa pode ser o começo de uma grande conexão.*

**A Behring Academy Chat**

</div>
