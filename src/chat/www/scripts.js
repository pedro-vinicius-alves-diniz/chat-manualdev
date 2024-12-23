document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    // EVENTS
    loginForm.addEventListener('submit', handleLogin);
    chatForm.addEventListener('submit', sendMessage);
}


// LOGIN ELEMENTS
const login = document.querySelector('.login');
const loginForm = login.querySelector('.login__form');
const loginInput = login.querySelector('.login__input');


// CHAT ELEMENTS
const chat = document.querySelector('.chat');
const chatForm = chat.querySelector('.chat__form');
const chatInput = chat.querySelector('.chat__input');
const chatMessages = chat.querySelector('.chat__messages');
const sender = chat.querySelector('.message-sender');


// VARIABLES
const user = { id: "", name: "", color: "" };

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

let websocket

// FUNCTIONS
function tocarNotificacao() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();


    // Configura o oscilador para criar uma onda senoidal (som suave)
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequência em Hz (440 Hz = nota A)

    // Configura o ganho para controlar o volume e fazer o som decair
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume inicial
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1); // Decai em 1 segundo

    // Conecta o oscilador ao ganho e depois ao contexto de áudio
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Inicia e para o som
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1); // Som dura 1 segundo
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const createMessageSelf = (content) => {
    const div = document.createElement("div");

    div.classList.add("self-message");
    div.innerHTML = content;

    return div;
}

const createMessageOther = (content, name) => {
    const div = document.createElement("div");

    div.classList.add("other-message");

    div.innerHTML = `
        <span class="message-sender" style="color: ${getRandomColor()}">${name}</span>
        <p class="content">${content}</p>
    `

    return div;
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    console.log(JSON.parse(data));

    const { userId, userName, userColor, content } = JSON.parse(data);

    if (userId === user.id) {
        const elementSelf = createMessageSelf(content);

        chatMessages.appendChild(elementSelf);
        scrollScreen();
    } else {
        const elementOther = createMessageOther(content, userName);


        chatMessages.appendChild(elementOther);
        scrollScreen();
        

        if (document.hidden === true) {
            tocarNotificacao();
            
            cordova.plugins.notification.local.schedule({
                id: new Date().getTime(), // ID único baseado no timestamp
                title: userName,
                text: content,
                badge: 1, // Incrementar o badge
                sound: 'file://soundfile.mp3',
                data: { messageID: 123 } // Dados personalizados para cada notificação
            });
        }


    }

    console.log(document.hidden)
}

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://chat-manualdev-backend.onrender.com");
    websocket.onmessage = processMessage
}

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = ""

}


