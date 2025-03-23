const socket = io('https://nanochats-backend.onrender.com');

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        socket.emit('register', { username, password });
    } else {
        document.getElementById('login-message').textContent = '請輸入用戶名同密碼';
    }
}

socket.on('registerResponse', (data) => {
    document.getElementById('login-message').textContent = data.message;
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        socket.emit('login', { username, password });
    } else {
        document.getElementById('login-message').textContent = '請輸入用戶名同密碼';
    }
}

socket.on('loginResponse', (data) => {
    if (data.success) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-section').style.display = 'block';
    } else {
        document.getElementById('login-message').textContent = data.message;
    }
});

function sendMessage() {
    const message = document.getElementById('message-input').value;
    if (message) {
        socket.emit('chatMessage', { message });
        document.getElementById('message-input').value = '';
    }
}

socket.on('chatMessage', (data) => {
    const chatBox = document.getElementById('chat-box');
    const msgElement = document.createElement('p');
    msgElement.textContent = data.message;
    chatBox.appendChild(msgElement);
});

function startVideoCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = stream;
            socket.emit('startVideo', { streamId: socket.id });
        })
        .catch((err) => {
            console.error('Video call error:', err);
        });
}

socket.on('videoStream', (data) => {
    console.log('Received video stream from:', data.streamId);
});

function stopVideoCall() {
    const localVideo = document.getElementById('local-video');
    const stream = localVideo.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        socket.emit('stopVideo');
    }
}