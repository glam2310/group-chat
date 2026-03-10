var userName = "";
var socket = new WebSocket('ws://localhost:8080');

// --- Functions ---

function joinChat() {
    var input = document.getElementById('nameInput');
    var name = input.value.trim();
    userName = (name !== "") ? name : "Guest_" + Math.floor(Math.random()*100);
    
    document.getElementById('loginOverlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loginOverlay').style.display = 'none';
    }, 400);
    
    document.getElementById('headerTitle').textContent = "Logged in as: " + userName;
}

socket.onmessage = function(event) {
    if (event.data instanceof Blob) {
        event.data.text().then(text => processIncoming(text));
    } else {
        processIncoming(event.data);
    }
};

function processIncoming(jsonString) {
    try {
        var data = JSON.parse(jsonString);
        renderMessage(data.user, data.text, "others");
    } catch (e) {
        console.error("Failed to parse message", e);
    }
}

function sendMessage() {
    var input = document.getElementById("messageInput");
    if (input.value.trim() !== "" && socket.readyState === WebSocket.OPEN) {
        var payload = { user: userName, text: input.value };
        socket.send(JSON.stringify(payload));
        renderMessage("Me", input.value, "mine");
        input.value = "";
    }
}

function renderMessage(user, text, type) {
    var win = document.getElementById("chatWindow");
    var div = document.createElement("div");
    div.className = "message " + type;

    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ":" + 
               now.getMinutes().toString().padStart(2, '0');

    div.innerHTML = `
        <span class="username-label">
            ${user} <span class="timestamp">${time}</span>
        </span>
        ${text}
    `;

    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

// --- Event Listeners ---

// Use window.onload to make sure elements exist before adding listeners
window.onload = function() {
    document.getElementById('messageInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('nameInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') joinChat();
    });
};