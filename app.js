
/* ========================================
   aBAChat - A Behring Academy Chat
   JavaScript + Firebase
======================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


/* ========================================
   1. CONFIGURAÇÃO DO FIREBASE
======================================== */

// Substitua os valores abaixo pelos dados
// do seu projeto Firebase.


const firebaseConfig = {
    apiKey: "AIzaSyBUE-a-pftJTQCUmcTvKRzMDOMooNlVvk0",
    authDomain: "abachat-ff4ab.firebaseapp.com",
    projectId: "abachat-ff4ab",
    storageBucket: "abachat-ff4ab.firebasestorage.app",
    messagingSenderId: "289768997594",
    appId: "1:289768997594:web:613674940a238602f3dbe3",
    measurementId: "G-E5G9EQXREZ"
};



// Inicialização

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* ========================================
   2. ELEMENTOS PRINCIPAIS
======================================== */

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const googleLogin = document.getElementById("googleLogin");
const logoutButton = document.getElementById("logoutButton");

const loginFeedback = document.getElementById("loginFeedback");

let currentUser = null;
let currentProfile = null;
let communityUsers = [];
let selectedFilter = "todos";


/* ========================================
   3. FUNÇÕES AUXILIARES
======================================== */

function showFeedback(element, message, success = true) {
    if (!element) return;

    element.textContent = message;
    element.style.color = success ? "#527d3c" : "#c0392b";
}


function getDefaultPhoto(user) {
    return user?.photoURL ||
        "https://placehold.co/120x120?text=User";
}


function normalizeRole(role) {
    const allowedRoles = ["aluno", "mentor", "professor"];

    return allowedRoles.includes(role) ? role : "aluno";
}


function roleLabel(role) {
    const labels = {
        aluno: "Aluno",
        mentor: "Mentor",
        professor: "Professor"
    };

    return labels[normalizeRole(role)];
}


/* ========================================
   4. LOGIN COM GOOGLE
======================================== */

googleLogin.addEventListener("click", async () => {
    try {
        googleLogin.disabled = true;
        googleLogin.textContent = "Conectando...";

        showFeedback(loginFeedback, "");

        await signInWithPopup(auth, googleProvider);

    } catch (error) {
        console.error("Erro no login:", error);

        let message = "Não foi possível entrar. Tente novamente.";

        if (error.code === "auth/popup-closed-by-user") {
            message = "A janela de login foi fechada.";
        }

        if (error.code === "auth/popup-blocked") {
            message = "Seu navegador bloqueou a janela de login.";
        }

        if (error.code === "auth/unauthorized-domain") {
            message = "Este domínio não está autorizado no Firebase.";
        }

        showFeedback(loginFeedback, message, false);

    } finally {
        googleLogin.disabled = false;
        googleLogin.innerHTML = "<span>G</span> Entrar com Google";
    }
});


/* ========================================
   5. SAIR DA CONTA
======================================== */

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Não foi possível sair da conta.");
    }
});


/* ========================================
   6. OBSERVAR AUTENTICAÇÃO
======================================== */

onAuthStateChanged(auth, async (user) => {

    if (user) {
        currentUser = user;

        loginScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");

        await loadUserProfile();
        await loadCommunity();

    } else {
        currentUser = null;
        currentProfile = null;
        communityUsers = [];

        appScreen.classList.add("hidden");
        loginScreen.classList.remove("hidden");
    }

});


/* ========================================
   7. CARREGAR PERFIL
======================================== */

async function loadUserProfile() {

    if (!currentUser) return;

    try {
        const profileRef = doc(db, "profiles", currentUser.uid);

        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
            currentProfile = profileSnapshot.data();
        } else {
            currentProfile = {
                name: currentUser.displayName || "Novo usuário",
                email: currentUser.email || "",
                photo: getDefaultPhoto(currentUser),
                turma: "",
                description: "",
                role: "aluno"
            };

            await setDoc(profileRef, {
                ...currentProfile,
                criadoEm: serverTimestamp()
            });
        }

        updateProfileInterface();

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);

        alert(
            "Não foi possível carregar seu perfil. " +
            "Verifique as regras do Firestore."
        );
    }

}


/* ========================================
   8. ATUALIZAR INTERFACE DO PERFIL
======================================== */

function updateProfileInterface() {

    if (!currentUser || !currentProfile) return;

    const name =
        currentProfile.name ||
        currentUser.displayName ||
        "Usuário";

    const photo =
        currentProfile.photo ||
        getDefaultPhoto(currentUser);

    document.getElementById("headerUserName").textContent = name;

    document.getElementById("headerUserPhoto").src = photo;

    document.getElementById("welcomeName").textContent = name;

    document.getElementById("profileName").textContent = name;

    document.getElementById("profileEmail").textContent =
        currentUser.email || "";

    document.getElementById("profilePhoto").src = photo;

    document.getElementById("profileDisplayName").value = name;

    document.getElementById("profileClass").value =
        currentProfile.turma || "";

    document.getElementById("profileDescription").value =
        currentProfile.description || "";
}


/* ========================================
   9. SALVAR PERFIL
======================================== */

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser) return;

    const saveButton = document.getElementById("saveProfile");

    const feedback = document.getElementById("profileFeedback");

    const name =
        document.getElementById("profileDisplayName").value.trim();

    const turma =
        document.getElementById("profileClass").value.trim();

    const description =
        document.getElementById("profileDescription").value.trim();

    if (!name) {
        showFeedback(feedback, "Digite seu nome.", false);
        return;
    }

    try {
        saveButton.disabled = true;
        saveButton.textContent = "Salvando...";

        const profileRef = doc(db, "profiles", currentUser.uid);

        const updatedProfile = {
            name,
            email: currentUser.email || "",
            photo: currentProfile?.photo || getDefaultPhoto(currentUser),
            turma,
            description,
            role: normalizeRole(currentProfile?.role)
        };

        await setDoc(profileRef, updatedProfile, {
            merge: true
        });

        currentProfile = {
            ...currentProfile,
            ...updatedProfile
        };

        updateProfileInterface();

        showFeedback(feedback, "Perfil atualizado com sucesso!");

        await loadCommunity();

    } catch (error) {
        console.error("Erro ao salvar perfil:", error);

        showFeedback(
            feedback,
            "Não foi possível salvar. Verifique sua conexão e as regras do Firebase.",
            false
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Salvar alterações";
    }

});


/* ========================================
   10. CARREGAR COMUNIDADE
======================================== */

async function loadCommunity() {

    const communityGrid = document.getElementById("communityGrid");

    communityGrid.innerHTML =
        '<p class="empty-message">Carregando participantes...</p>';

    try {
        const profilesRef = collection(db, "profiles");

        const snapshot = await getDocs(profilesRef);

        communityUsers = [];

        snapshot.forEach((documentSnapshot) => {

            const data = documentSnapshot.data();

            communityUsers.push({
                id: documentSnapshot.id,
                name: data.name || "Usuário",
                photo: data.photo || "https://placehold.co/120x120?text=User",
                turma: data.turma || "",
                description: data.description || "",
                role: normalizeRole(data.role)
            });

        });

        renderCommunity();

    } catch (error) {
        console.error("Erro ao carregar comunidade:", error);

        communityGrid.innerHTML =
            '<p class="empty-message">Não foi possível carregar a comunidade.</p>';
    }

}


/* ========================================
   11. MOSTRAR PARTICIPANTES
======================================== */

function renderCommunity() {

    const communityGrid = document.getElementById("communityGrid");

    const search = document
        .getElementById("searchPeople")
        .value
        .trim()
        .toLowerCase();

    communityGrid.innerHTML = "";

    const filteredUsers = communityUsers.filter((person) => {

        const matchesSearch =
            person.name.toLowerCase().includes(search) ||
            person.turma.toLowerCase().includes(search);

        const matchesFilter =
            selectedFilter === "todos" ||
            person.role === selectedFilter;

        return matchesSearch && matchesFilter;

    });

    if (filteredUsers.length === 0) {
        communityGrid.innerHTML =
            '<p class="empty-message">Nenhuma pessoa encontrada.</p>';

        return;
    }

    filteredUsers.forEach((person) => {

        const card = document.createElement("article");
        card.className = "person-card";

        const photo = document.createElement("img");
        photo.src = person.photo;
        photo.alt = "Foto de " + person.name;
        photo.referrerPolicy = "no-referrer";

        const name = document.createElement("h3");
        name.textContent = person.name;

        const description = document.createElement("p");
        description.textContent =
            person.description || "Ainda não adicionou uma descrição.";

        const turma = document.createElement("p");
        turma.textContent = person.turma
            ? "Turma: " + person.turma
            : "";

        const role = document.createElement("span");
        role.className = "person-role";
        role.textContent = roleLabel(person.role);

        card.appendChild(photo);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(turma);
        card.appendChild(role);

        communityGrid.appendChild(card);

    });

}


/* ========================================
   12. BUSCAR PARTICIPANTES
======================================== */

document
    .getElementById("searchPeople")
    .addEventListener("input", renderCommunity);


/* ========================================
   13. FILTRAR PARTICIPANTES
======================================== */

document.querySelectorAll(".filter-button").forEach((button) => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-button").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedFilter = button.dataset.filter;

        renderCommunity();

    });

});


/* ========================================
   14. ENVIAR SUGESTÃO DE CONVERSA
======================================== */

const meetingForm = document.getElementById("meetingForm");

meetingForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser) return;

    const feedback = document.getElementById("meetingFeedback");

    const person =
        document.getElementById("meetingPerson").value.trim();

    const date =
        document.getElementById("meetingDate").value;

    const time =
        document.getElementById("meetingTime").value;

    const message =
        document.getElementById("meetingMessage").value.trim();

    if (!person || !date || !time) {
        showFeedback(feedback, "Preencha os campos obrigatórios.", false);
        return;
    }

    const selectedDate = new Date(date + "T" + time);

    if (selectedDate <= new Date()) {
        showFeedback(
            feedback,
            "Escolha uma data e horário futuros.",
            false
        );
        return;
    }

    const submitButton = meetingForm.querySelector(
        'button[type="submit"]'
    );

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        await addDoc(collection(db, "meetingRequests"), {

            usuarioId: currentUser.uid,

            usuarioNome:
                currentProfile?.name ||
                currentUser.displayName ||
                "Usuário",

            convidado: person,

            data: date,

            horario: time,

            mensagem: message,

            status: "pendente",

            criadoEm: serverTimestamp()

        });

        meetingForm.reset();

        showFeedback(
            feedback,
            "Sua sugestão foi enviada com sucesso!"
        );

    } catch (error) {
        console.error("Erro ao enviar sugestão:", error);

        showFeedback(
            feedback,
            "Não foi possível enviar sua sugestão. Tente novamente.",
            false
        );

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar sugestão →";
    }

});


/* ========================================
   15. DATA MÍNIMA DO FORMULÁRIO
======================================== */

const meetingDateInput = document.getElementById("meetingDate");

const today = new Date();

const localDate =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

meetingDateInput.min = localDate;


/* ========================================
   16. ROLETA
======================================== */

const spinButton = document.getElementById("spinButton");

const rouletteVisual = document.getElementById("rouletteVisual");

const rouletteResult = document.getElementById("rouletteResult");

let spinning = false;

spinButton.addEventListener("click", () => {

    if (spinning) return;

    const possibleUsers = communityUsers.filter((person) => {
        return person.id !== currentUser?.uid;
    });

    if (possibleUsers.length === 0) {
        rouletteResult.textContent =
            "Ainda não existem participantes suficientes.";

        return;
    }

    spinning = true;

    spinButton.disabled = true;
    spinButton.textContent = "Sorteando...";

    rouletteResult.textContent = "A roleta está girando...";

    rouletteVisual.classList.add("spinning");

    const winner =
        possibleUsers[Math.floor(Math.random() * possibleUsers.length)];

    setTimeout(() => {

        rouletteVisual.classList.remove("spinning");

        rouletteResult.textContent =
            "🥑 " + winner.name + " pode ser o próximo convidado!";

        spinning = false;

        spinButton.disabled = false;
        spinButton.textContent = "Girar novamente!";

    }, 2500);

});


/* ========================================
   17. NAVEGAÇÃO ENTRE PÁGINAS
======================================== */

function navigateTo(pageName) {

    const pages = document.querySelectorAll(".page");

    const navigationItems = document.querySelectorAll(".nav-item");

    pages.forEach((page) => {
        page.classList.remove("active");
    });

    navigationItems.forEach((item) => {
        item.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName);

    if (!selectedPage) return;

    selectedPage.classList.add("active");

    const selectedButton = document.querySelector(
        `.nav-item[data-page="${pageName}"]`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    const titles = {
        home: "Início",
        community: "Comunidade",
        meetings: "Conversas",
        roulette: "Roleta",
        profile: "Meu perfil"
    };

    document.getElementById("pageTitle").textContent =
        titles[pageName] || "aBAChat";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Menu lateral

document.querySelectorAll(".nav-item").forEach((button) => {

    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });

});


// Botões de navegação dos cartões

document.querySelectorAll("[data-go]").forEach((button) => {

    button.addEventListener("click", () => {
        navigateTo(button.dataset.go);
    });

});


/* ========================================
   18. FINALIZAÇÃO
======================================== */

console.log("🥑 aBAChat iniciado!");
