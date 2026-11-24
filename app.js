
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
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
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";


// ==========================================
// FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyBUE-a-pftJTQCUmcTvKRzMDOMooNlVvk0",
    authDomain: "abachat-ff4ab.firebaseapp.com",
    projectId: "abachat-ff4ab",
    storageBucket: "abachat-ff4ab.firebasestorage.app",
    messagingSenderId: "289768997594",
    appId: "1:289768997594:web:613674940a238602f3dbe3",
    measurementId: "G-E5G9EQXREZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// ==========================================
// CONFIGURAÇÕES
// ==========================================

const ADMIN_EMAIL = "sebastiaolina1@gmail.com";
const DEFAULT_PHOTO = "https://placehold.co/160x160?text=Abachat";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

let isRegistering = false;
let currentUser = null;
let currentProfile = {};
let allProfiles = [];
let activeFilter = "todos";

let unsubscribeProfiles = null;
let unsubscribeMessages = null;


// ==========================================
// ELEMENTOS
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const loginForm = document.getElementById("emailLoginForm");
const loginFeedback = document.getElementById("loginFeedback");

const profileForm = document.getElementById("profileForm");
const meetingForm = document.getElementById("meetingForm");
const channelForm = document.getElementById("channelForm");


// ==========================================
// UTILITÁRIOS
// ==========================================

function showFeedback(element, message, success = false) {
    element.textContent = message;
    element.style.color = success ? "#365b2b" : "#b33c32";
}

function escapeText(value) {
    return String(value ?? "");
}

function getDisplayName(profile) {
    return profile.displayName || profile.name || "Participante";
}

function getPhoto(profile) {
    return profile.photoURL || DEFAULT_PHOTO;
}

function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) return "";

    return timestamp.toDate().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ==========================================
// LOGIN E CADASTRO
// ==========================================

document.getElementById("toggleAuthMode").addEventListener("click", () => {
    isRegistering = !isRegistering;

    document.getElementById("loginModeText").textContent =
        isRegistering ? "Criar sua conta" : "Entre na sua conta";

    document.getElementById("loginSubmit").textContent =
        isRegistering ? "Criar conta" : "Entrar";

    document.getElementById("loginSwitchText").textContent =
        isRegistering ? "Já possui uma conta?" : "Ainda não tem uma conta?";

    document.getElementById("toggleAuthMode").textContent =
        isRegistering ? "Fazer login" : "Criar conta";

    document.getElementById("loginPassword").autocomplete =
        isRegistering ? "new-password" : "current-password";

    loginFeedback.textContent = "";
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const button = document.getElementById("loginSubmit");

    button.disabled = true;
    button.textContent = "Aguarde...";

    try {
        if (isRegistering) {
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }

    } catch (error) {
        console.error(error);

        const errors = {
            "auth/email-already-in-use": "Este e-mail já possui uma conta.",
            "auth/invalid-email": "Digite um e-mail válido.",
            "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
            "auth/invalid-credential": "E-mail ou senha incorretos.",
            "auth/user-not-found": "Conta não encontrada.",
            "auth/wrong-password": "Senha incorreta.",
            "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde."
        };

        showFeedback(
            loginFeedback,
            errors[error.code] || "Não foi possível realizar a operação."
        );

    } finally {
        button.disabled = false;
        button.textContent = isRegistering ? "Criar conta" : "Entrar";
    }
});


// ==========================================
// AUTENTICAÇÃO
// ==========================================

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
        loginScreen.classList.remove("hidden");
        appScreen.classList.add("hidden");

        if (unsubscribeProfiles) unsubscribeProfiles();
        if (unsubscribeMessages) unsubscribeMessages();

        unsubscribeProfiles = null;
        unsubscribeMessages = null;

        return;
    }

    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    try {
        await loadProfile();
        startCommunityListener();
        startChannelListener();
        updateHeader();

    } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do perfil. Verifique as regras do Firestore.");
    }
});


// ==========================================
// PERFIL
// ==========================================

async function loadProfile() {
    const profileRef = doc(db, "profiles", currentUser.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
        currentProfile = {
            name: "",
            displayName: "",
            email: currentUser.email,
            photoURL: "",
            bannerURL: "",
            turma: "",
            trilha: "",
            instagram: "",
            description: ""
        };

        await setDoc(profileRef, {
            ...currentProfile,
            createdAt: serverTimestamp()
        });
    } else {
        currentProfile = profileSnap.data();
    }

    document.getElementById("profileName").value =
        currentProfile.name || "";

    document.getElementById("profileDisplayName").value =
        currentProfile.displayName || "";

    document.getElementById("profileClass").value =
        currentProfile.turma || "";

    document.getElementById("profileTrack").value =
        currentProfile.trilha || "";

    document.getElementById("profileInstagram").value =
        currentProfile.instagram || "";

    document.getElementById("profileDescription").value =
        currentProfile.description || "";

    document.getElementById("profilePreviewName").textContent =
        getDisplayName(currentProfile);

    document.getElementById("profilePhotoPreview").src =
        getPhoto(currentProfile);

    document.getElementById("bannerPreview").style.backgroundImage =
        currentProfile.bannerURL
            ? `url("${currentProfile.bannerURL}")`
            : "";

    document.getElementById("profileEmail")?.setAttribute(
        "value",
        currentUser.email || ""
    );

    updateHeader();
}


// ==========================================
// PRÉVIA DAS IMAGENS
// ==========================================

function previewImage(input, callback) {
    input.addEventListener("change", () => {
        const file = input.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem.");
            input.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            alert("A imagem deve ter no máximo 5 MB.");
            input.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => callback(reader.result);
        reader.readAsDataURL(file);
    });
}

const photoInput = document.getElementById("profilePhotoFile");
const bannerInput = document.getElementById("profileBannerFile");

previewImage(photoInput, (image) => {
    document.getElementById("profilePhotoPreview").src = image;
});

previewImage(bannerInput, (image) => {
    document.getElementById("bannerPreview").style.backgroundImage =
        `url("${image}")`;
});

document.getElementById("profileName").addEventListener("input", updateProfilePreview);
document.getElementById("profileDisplayName").addEventListener("input", updateProfilePreview);

function updateProfilePreview() {
    const displayName =
        document.getElementById("profileDisplayName").value.trim() ||
        document.getElementById("profileName").value.trim() ||
        "Seu nome";

    document.getElementById("profilePreviewName").textContent = displayName;
}


// ==========================================
// ENVIO DE IMAGENS PARA O STORAGE
// ==========================================

async function uploadProfileImage(file, type) {
    if (!file) return null;

    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
        throw new Error("Imagem inválida ou maior que 5 MB.");
    }

    const extension = file.type.split("/")[1].replace("jpeg", "jpg");

    const imageRef = ref(
        storage,
        `profilePhotos/${currentUser.uid}/${type}.${extension}`
    );

    await uploadBytes(imageRef, file, {
        contentType: file.type
    });

    return await getDownloadURL(imageRef);
}


// ==========================================
// SALVAR PERFIL
// ==========================================

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("saveProfile");
    const feedback = document.getElementById("profileFeedback");

    button.disabled = true;
    button.textContent = "Salvando...";

    try {
        let photoURL = currentProfile.photoURL || "";
        let bannerURL = currentProfile.bannerURL || "";

        if (photoInput.files[0]) {
            showFeedback(feedback, "Enviando foto de perfil...", true);
            photoURL = await uploadProfileImage(photoInput.files[0], "profile");
        }

        if (bannerInput.files[0]) {
            showFeedback(feedback, "Enviando banner...", true);
            bannerURL = await uploadProfileImage(bannerInput.files[0], "banner");
        }

        const name = document.getElementById("profileName").value.trim();
        const displayName = document.getElementById("profileDisplayName").value.trim();

        const instagram = document.getElementById("profileInstagram").value
            .trim()
            .replace(/^@/, "");

        const updatedProfile = {
            name,
            displayName,
            email: currentUser.email,
            photoURL,
            bannerURL,
            turma: document.getElementById("profileClass").value,
            trilha: document.getElementById("profileTrack").value,
            instagram,
            description: document.getElementById("profileDescription").value.trim(),
            updatedAt: serverTimestamp()
        };

        await setDoc(
            doc(db, "profiles", currentUser.uid),
            updatedProfile,
            { merge: true }
        );

        currentProfile = {
            ...currentProfile,
            ...updatedProfile
        };

        photoInput.value = "";
        bannerInput.value = "";

        updateHeader();
        startCommunityListener();

        showFeedback(feedback, "Perfil atualizado com sucesso!", true);

    } catch (error) {
        console.error(error);
        showFeedback(feedback, error.message || "Não foi possível salvar o perfil.");
    } finally {
        button.disabled = false;
        button.textContent = "Salvar perfil";
    }
});


// ==========================================
// CABEÇALHO
// ==========================================

function updateHeader() {
    const name = getDisplayName(currentProfile);

    document.getElementById("headerUserName").textContent = name;
    document.getElementById("welcomeName").textContent = name;
    document.getElementById("headerUserPhoto").src = getPhoto(currentProfile);
}


// ==========================================
// COMUNIDADE
// ==========================================

function startCommunityListener() {
    if (unsubscribeProfiles) unsubscribeProfiles();

    unsubscribeProfiles = onSnapshot(
        collection(db, "profiles"),
        (snapshot) => {
            allProfiles = snapshot.docs
                .map((item) => ({
                    uid: item.id,
                    ...item.data()
                }))
                .filter((profile) => profile.uid !== currentUser.uid);

            renderCommunity();
            updateMeetingOptions();
        },
        (error) => {
            console.error("Erro na comunidade:", error);
            document.getElementById("communityGrid").textContent =
                "Não foi possível carregar a comunidade.";
        }
    );
}

function renderCommunity() {
    const grid = document.getElementById("communityGrid");
    const search = document.getElementById("searchPeople").value
        .trim()
        .toLowerCase();

    grid.replaceChildren();

    const filtered = allProfiles.filter((profile) => {
        const name = getDisplayName(profile).toLowerCase();
        const turma = (profile.turma || "").toLowerCase();
        const trilha = (profile.trilha || "").toLowerCase();

        const matchesSearch =
            name.includes(search) ||
            turma.includes(search) ||
            trilha.includes(search);

        const matchesFilter =
            activeFilter === "todos" ||
            profile.turma === activeFilter;

        return matchesSearch && matchesFilter;
    });

    if (!filtered.length) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "Nenhum participante encontrado.";
        grid.appendChild(empty);
        return;
    }

    filtered.forEach((profile) => {
        const card = document.createElement("article");
        card.className = "person-card";

        const banner = document.createElement("div");
        banner.className = "person-banner";

        if (profile.bannerURL) {
            banner.style.backgroundImage = `url("${profile.bannerURL}")`;
        }

        const content = document.createElement("div");
        content.className = "person-content";

        const avatar = document.createElement("img");
        avatar.className = "person-avatar";
        avatar.src = getPhoto(profile);
        avatar.alt = "Foto de " + getDisplayName(profile);

        const name = document.createElement("h3");
        name.textContent = getDisplayName(profile);

        const meta = document.createElement("p");
        meta.className = "person-meta";
        meta.textContent =
            `${profile.turma || "Turma não informada"} · ${profile.trilha || "Trilha não informada"}`;

        const description = document.createElement("p");
        description.className = "person-description";
        description.textContent = profile.description || "";

        content.append(avatar, name, meta, description);

        if (profile.instagram) {
            const instagram = document.createElement("a");
            instagram.className = "person-instagram";
            instagram.textContent = "Instagram: @" + profile.instagram;
            instagram.href =
                "https://www.instagram.com/" +
                encodeURIComponent(profile.instagram);

            instagram.target = "_blank";
            instagram.rel = "noopener noreferrer";

            content.appendChild(instagram);
        }

        card.append(banner, content);
        grid.appendChild(card);
    });
}

document.getElementById("searchPeople").addEventListener("input", renderCommunity);

document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-button").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        activeFilter = button.dataset.filter;
        renderCommunity();
    });
});


// ==========================================
// OPÇÕES DE CONVERSA
// ==========================================

function updateMeetingOptions() {
    const select = document.getElementById("meetingPerson");
    const selected = select.value;

    select.replaceChildren();

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Selecione uma pessoa";
    select.appendChild(firstOption);

    allProfiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.uid;
        option.textContent = getDisplayName(profile);
        select.appendChild(option);
    });

    select.value = selected;
}


// ==========================================
// ENVIAR SUGESTÃO DE CONVERSA
// ==========================================

meetingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("meetingFeedback");

    try {
        const personId = document.getElementById("meetingPerson").value;
        const person = allProfiles.find((item) => item.uid === personId);

        if (!person) {
            showFeedback(feedback, "Selecione um participante válido.");
            return;
        }

        await addDoc(collection(db, "meetingRequests"), {
            senderId: currentUser.uid,
            senderName: getDisplayName(currentProfile),
            recipientId: personId,
            recipientName: getDisplayName(person),
            date: document.getElementById("meetingDate").value,
            time: document.getElementById("meetingTime").value,
            message: document.getElementById("meetingMessage").value.trim(),
            createdAt: serverTimestamp()
        });

        meetingForm.reset();
        showFeedback(feedback, "Sugestão enviada com sucesso!", true);

    } catch (error) {
        console.error(error);
        showFeedback(feedback, "Não foi possível enviar a sugestão.");
    }
});


// ==========================================
// ROLETA
// ==========================================

document.getElementById("spinButton").addEventListener("click", () => {
    const result = document.getElementById("rouletteResult");
    const visual = document.getElementById("rouletteVisual");
    const button = document.getElementById("spinButton");

    if (!allProfiles.length) {
        result.textContent = "Ainda não existem participantes suficientes.";
        return;
    }

    button.disabled = true;
    result.textContent = "Sorteando...";
    visual.style.transform = "rotate(720deg)";
    visual.style.transition = "transform 1.2s ease";

    setTimeout(() => {
        const chosen = allProfiles[
            Math.floor(Math.random() * allProfiles.length)
        ];

        result.textContent = "Próximo convidado: " + getDisplayName(chosen);
        visual.style.transform = "rotate(0deg)";
        button.disabled = false;
    }, 1200);
});


// ==========================================
// CANAL OFICIAL
// ==========================================

function startChannelListener() {
    if (unsubscribeMessages) unsubscribeMessages();

    const messagesQuery = query(
        collection(db, "channelMessages"),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
            const messages = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));

            renderChannelMessages(messages.reverse());
        },
        (error) => {
            console.error("Erro no canal:", error);
            document.getElementById("channelMessages").textContent =
                "Não foi possível carregar as mensagens do canal.";
        }
    );

    const isAdmin =
        currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    channelForm.classList.toggle("hidden", !isAdmin);
}

function renderChannelMessages(messages) {
    const container = document.getElementById("channelMessages");
    container.replaceChildren();

    if (!messages.length) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "Ainda não há comunicados publicados.";
        container.appendChild(empty);
        return;
    }

    messages.forEach((message) => {
        const article = document.createElement("article");
        article.className = "channel-message";

        const avatar = document.createElement("img");
        avatar.src = message.senderPhoto || DEFAULT_PHOTO;
        avatar.alt = "";

        const body = document.createElement("div");
        body.className = "channel-message-body";

        const top = document.createElement("div");
        top.className = "channel-message-top";

        const author = document.createElement("strong");
        author.textContent = message.senderName || "Participante";

        const date = document.createElement("time");
        date.textContent = formatDate(message.createdAt);

        const text = document.createElement("p");
        text.textContent = message.text || "";

        top.append(author, date);
        body.append(top, text);
        article.append(avatar, body);

        container.appendChild(article);
    });
}

channelForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const feedback = document.getElementById("channelFeedback");
    const input = document.getElementById("channelMessageInput");
    const button = channelForm.querySelector("button");

    const isAdmin =
        currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!isAdmin) {
        showFeedback(feedback, "Você não tem permissão para publicar.");
        return;
    }

    const message = input.value.trim();

    if (!message) {
        showFeedback(feedback, "Escreva uma mensagem antes de publicar.");
        return;
    }

    button.disabled = true;

    try {
        await addDoc(collection(db, "channelMessages"), {
            senderId: currentUser.uid,
            senderName: getDisplayName(currentProfile),
            senderPhoto: getPhoto(currentProfile),
            text: message,
            createdAt: serverTimestamp()
        });

        input.value = "";
        showFeedback(feedback, "Mensagem publicada!", true);

    } catch (error) {
        console.error(error);
        showFeedback(feedback, "Não foi possível publicar a mensagem.");
    } finally {
        button.disabled = false;
    }
});


// ==========================================
// NAVEGAÇÃO
// ==========================================

function navigateTo(page) {
    const pages = {
        home: "Início",
        community: "Comunidade",
        meetings: "Conversas",
        roulette: "Roleta",
        channel: "Canal oficial",
        profile: "Meu perfil"
    };

    if (!pages[page]) return;

    document.querySelectorAll(".page").forEach((item) => {
        item.classList.remove("active");
    });

    document.getElementById(page + "Page").classList.add("active");

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === page);
    });

    document.getElementById("pageTitle").textContent = pages[page];

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
        navigateTo(button.dataset.go);
    });
});


// ==========================================
// SAIR
// ==========================================

document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        alert("Não foi possível sair da conta.");
    }
});
