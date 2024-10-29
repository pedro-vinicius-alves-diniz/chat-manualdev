// LOGIN ELEMENTS
const login = document.querySelector('.login');
const loginForm = login.querySelector('.login__form');
const loginInput = login.querySelector('.login__input');


// CHAT ELEMENTS
const chat = document.querySelector('.chat');
const chatForm = chat.querySelector('.chat__form');
const chatInput = chat.querySelector('.chat__input');
const chatMessages = chat.querySelector('.chat__messages');


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

const scrollScreen = () =>{
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
    }

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


// EVENTS
loginForm.addEventListener('submit', handleLogin);
chatForm.addEventListener('submit', sendMessage);