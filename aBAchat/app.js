
// ==========================================
// aBAchat - Behring Academy
// JavaScript principal
// ==========================================


// ALUNOS DE DEMONSTRAÇÃO

const students = [

    {
        id: 1,
        name: "Marina Costa",
        initials: "MC",
        area: "Matemática",
        bio: "Gosto de desafios, olimpíadas científicas e de aprender coisas novas.",
        color: "linear-gradient(135deg,#f09ab2,#bb5b8d)"
    },

    {
        id: 2,
        name: "Pedro Henrique",
        initials: "PH",
        area: "Programação",
        bio: "Estudando algoritmos, C++ e desenvolvimento de projetos.",
        color: "linear-gradient(135deg,#75b9ef,#4778c7)"
    },

    {
        id: 3,
        name: "Ana Clara",
        initials: "AC",
        area: "Ciências",
        bio: "Curiosa por ciência, pesquisa e inovação.",
        color: "linear-gradient(135deg,#72d5bb,#299b89)"
    },

    {
        id: 4,
        name: "Lucas Almeida",
        initials: "LA",
        area: "Robótica",
        bio: "Construindo projetos com eletrônica e programação.",
        color: "linear-gradient(135deg,#f2bd77,#ce8245)"
    },

    {
        id: 5,
        name: "Beatriz Souza",
        initials: "BS",
        area: "Empreendedorismo",
        bio: "Ideias, negócios de impacto e tecnologia.",
        color: "linear-gradient(135deg,#aa9af2,#6954c7)"
    },

    {
        id: 6,
        name: "Rafael Mendes",
        initials: "RM",
        area: "Programação",
        bio: "Quero conhecer pessoas para estudar e criar projetos juntos.",
        color: "linear-gradient(135deg,#83c7d7,#458b9d)"
    }

];


// ELEMENTOS HTML

const $ = (id) => document.getElementById(id);


// DADOS LOCAIS

let bookings = JSON.parse(
    localStorage.getItem("abachat_bookings") || "[]"
);

let profile = JSON.parse(
    localStorage.getItem("abachat_profile") ||
    '{"name":"Guilherme","bio":"","interest":"Programação"}'
);


// ==========================================
// FUNÇÕES GERAIS
// ==========================================


// Salvar agendamentos

function saveBookings() {

    localStorage.setItem(
        "abachat_bookings",
        JSON.stringify(bookings)
    );

    updateCounts();

}


// Atualizar contadores

function updateCounts() {

    $("scheduleCount").textContent = bookings.length;

    $("homeMeetings").textContent = bookings.length;

}


// Notificações temporárias

function toast(message) {

    $("toast").textContent = message;

    $("toast").classList.add("show");

    setTimeout(() => {

        $("toast").classList.remove("show");

    }, 2600);

}


// ==========================================
// NAVEGAÇÃO
// ==========================================

function go(page) {

    document.querySelectorAll(".page").forEach(p => {

        p.classList.remove("active");

    });

    $("page-" + page).classList.add("active");


    document.querySelectorAll(".nav-link[data-page]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });


    const names = {

        home: "Início",

        discover: "Descobrir alunos",

        schedule: "Agendamentos",

        messages: "Conversas",

        profile: "Meu perfil"

    };


    $("pageTitle").textContent = names[page];


    if (page === "schedule") {

        renderSchedule();

    }

    if (page === "discover") {

        renderUsers();

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==========================================
// ALUNOS
// ==========================================


// Cartão de aluno

function studentCard(student) {

    return `

        <article class="person-card">

            <div class="person-top">

                <div
                    class="avatar"
                    style="background:${student.color}"
                >
                    ${student.initials}
                </div>

                <div>

                    <strong>${student.name}</strong>

                    <small>
                        Aluno(a) da Behring Academy
                    </small>

                </div>

            </div>

            <span class="tag">
                ${student.area}
            </span>

            <p>
                ${student.bio}
            </p>

            <button
                class="outline-btn"
                data-book="${student.id}"
            >
                + Convidar para conversar
            </button>

        </article>

    `;

}


// Linha de aluno

function userRow(student) {

    return `

        <div class="user-row">

            <div
                class="avatar"
                style="background:${student.color}"
            >
                ${student.initials}
            </div>

            <div class="user-info">

                <strong>${student.name}</strong>

                <small>
                    ${student.area} · Behring Academy
                </small>

            </div>

            <button
                class="outline-btn"
                data-book="${student.id}"
            >
                Convidar
            </button>

        </div>

    `;

}


// Pesquisar e filtrar alunos

function renderUsers() {

    $("suggestedUsers").innerHTML = students
        .slice(0, 4)
        .map(userRow)
        .join("");


    const search = $("searchInput").value.toLowerCase();

    const area = $("interestFilter").value;


    const filtered = students.filter(student => {

        const content = (

            student.name +
            " " +
            student.area +
            " " +
            student.bio

        ).toLowerCase();


        return content.includes(search) &&
            (!area || student.area === area);

    });


    $("allUsers").innerHTML = filtered.length

        ? filtered.map(studentCard).join("")

        : `
            <div class="panel empty-state">
                Nenhum aluno encontrado com esses filtros.
            </div>
        `;

}


// ==========================================
// AGENDAMENTOS
// ==========================================


// Mostrar agendamentos

function renderSchedule() {

    if (!bookings.length) {

        $("scheduleList").innerHTML = `

            <div class="panel empty-state">

                <div class="empty-icon">▦</div>

                <strong>
                    Nenhuma conversa agendada ainda
                </strong>

                <p>
                    Descubra alunos e envie um convite
                    para marcar o primeiro encontro.
                </p>

                <button
                    class="primary-btn"
                    data-go="discover"
                >
                    Descobrir alunos
                </button>

            </div>

        `;


        $("homeSchedule").innerHTML = `

            <div class="empty-icon">▦</div>

            <strong>
                Nenhuma conversa marcada
            </strong>

            <p>
                Convide alguém para uma conversa
                e troque experiências.
            </p>

        `;

        return;

    }


    const sorted = [...bookings].sort((a, b) => {

        return (a.date + a.time).localeCompare(b.date + b.time);

    });


    $("scheduleList").innerHTML = sorted.map(booking => {

        const date = new Date(booking.date + "T12:00:00");

        return `

            <article class="schedule-item">

                <div class="date-tile">

                    <b>${date.getDate()}</b>

                    <small>
                        ${date.toLocaleDateString("pt-BR", {
                            month: "short"
                        })}
                    </small>

                </div>

                <div class="schedule-detail">

                    <strong>${booking.name}</strong>

                    <p>${booking.topic}</p>

                    <small>
                        ${date.toLocaleDateString("pt-BR")}
                        às ${booking.time}
                    </small>

                </div>

                <button
                    class="outline-btn"
                    data-cancel="${booking.id}"
                >
                    Cancelar
                </button>

            </article>

        `;

    }).join("");


    $("homeSchedule").innerHTML = sorted
        .slice(0, 2)
        .map(booking => `

            <div class="user-row">

                <div class="date-tile">

                    <b>${booking.date.slice(8, 10)}</b>

                    <small>
                        ${booking.date.slice(5, 7)}
                    </small>

                </div>

                <div class="user-info">

                    <strong>${booking.name}</strong>

                    <small>
                        ${booking.date} · ${booking.time}
                    </small>

                </div>

            </div>

        `).join("");

}


// ==========================================
// MODAL DE AGENDAMENTO
// ==========================================


function openBooking(id) {

    const student = students.find(
        s => s.id === Number(id)
    );

    if (!student) return;


    $("bookingUser").value = student.id;

    $("modalTitle").textContent =
        "Convidar " + student.name;

    $("modalDescription").textContent =
        "Escolha uma data e um horário para sugerir uma conversa.";


    const today = new Date();

    $("bookingDate").min = today.toISOString().slice(0, 10);

    $("bookingDate").value = today.toISOString().slice(0, 10);

    $("bookingTime").value = "18:00";


    $("modalBackdrop").classList.add("show");

}


// Fechar modal

function closeBooking() {

    $("modalBackdrop").classList.remove("show");

}


// Confirmar agendamento

$("bookingForm").addEventListener("submit", event => {

    event.preventDefault();


    const student = students.find(
        s => s.id === Number($("bookingUser").value)
    );


    if (!student) return;


    const date = $("bookingDate").value;

    const time = $("bookingTime").value;


    if (!date || !time) return;


    if (new Date(date + "T" + time) < new Date()) {

        toast("Escolha um horário futuro.");

        return;

    }


    bookings.push({

        id: Date.now(),

        studentId: student.id,

        name: student.name,

        date: date,

        time: time,

        topic: $("bookingTopic").value

    });


    saveBookings();

    renderSchedule();

    closeBooking();

    toast("Convite registrado neste dispositivo!");

});


// ==========================================
// CLIQUES E EVENTOS
// ==========================================


document.addEventListener("click", event => {


    // Navegação

    const nav = event.target.closest("[data-page]");

    if (nav) {

        go(nav.dataset.page);

    }


    // Botões de navegação interna

    const goButton = event.target.closest("[data-go]");

    if (goButton) {

        go(goButton.dataset.go);

    }


    // Convidar aluno

    const book = event.target.closest("[data-book]");

    if (book) {

        openBooking(book.dataset.book);

    }


    // Cancelar agendamento

    const cancel = event.target.closest("[data-cancel]");

    if (cancel) {

        bookings = bookings.filter(

            booking => booking.id !== Number(cancel.dataset.cancel)

        );

        saveBookings();

        renderSchedule();

        toast("Agendamento cancelado.");

    }

});


// Fechar pelo botão

$("closeModal").addEventListener(
    "click",
    closeBooking
);


// Fechar clicando fora

$("modalBackdrop").addEventListener("click", event => {

    if (event.target === $("modalBackdrop")) {

        closeBooking();

    }

});


// ==========================================
// PESQUISA E FILTROS
// ==========================================

$("searchInput").addEventListener(
    "input",
    renderUsers
);

$("interestFilter").addEventListener(
    "change",
    renderUsers
);


// ==========================================
// PERFIL
// ==========================================

$("profileForm").addEventListener("submit", event => {

    event.preventDefault();


    profile = {

        name: $("profileName").value.trim(),

        bio: $("profileBio").value.trim(),

        interest: $("profileInterest").value

    };


    localStorage.setItem(

        "abachat_profile",

        JSON.stringify(profile)

    );


    $("sideName").textContent = profile.name;

    toast("Perfil salvo neste navegador.");

});


// ==========================================
// NOTIFICAÇÕES
// ==========================================

$("notificationsBtn").addEventListener("click", () => {

    toast("Você está em dia! Nenhuma notificação nova.");

});


// ==========================================
// INICIALIZAÇÃO
// ==========================================


// Recuperar perfil salvo

$("profileName").value = profile.name;

$("profileBio").value = profile.bio || "";

$("profileInterest").value =
    profile.interest || "Programação";

$("sideName").textContent = profile.name;


// Renderizar dados

renderUsers();

renderSchedule();

updateCounts();


// FIM DO aBAchat
