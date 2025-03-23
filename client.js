const socket = io('https://nanochats-backend.onrender.com');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const loginMessage = document.getElementById('login-message');
const userInfo = document.getElementById('user-info');

let localStream, peerConnection, username, userId;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        socket.emit('login', { username, password });
    } else {
        document.getElementById('login-message').textContent = '請輸入用戶名同密碼'; // 第 20 行
    }
}

// 註冊
function register() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (user && pass) {
        socket.emit('register', { username: user, password: pass });
    } else {
        loginMessage.textContent = '請輸入用戶名同密碼';
    }
}

// 後端回應
socket.on('loginResponse', (data) => {
    if (data.success) {
        username = data.username;
        userId = data.userId;
        loginSection.style.display = 'none';
        mainSection.style.display = 'flex';
        userInfo.innerHTML = `${username} <span class="user-tag">#${userId}</span>`;
    } else {
        loginMessage.textContent = data.message;
    }
});

socket.on('registerResponse', (data) => {
    loginMessage.textContent = data.message;
    if (data.success) {
        login();
    }
});

// 聊天功能
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', { username, message });
        messageInput.value = '';
    }
}

socket.on('chatMessage', (data) => {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.innerHTML = `${data.username} <span class="user-tag">#${data.userId}</span>: ${data.message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// 視訊功能
function startVideoCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;
            initPeerConnection();
        })
        .catch(err => console.error('Error:', err));
}

function initPeerConnection() {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => { remoteVideo.srcObject = event.streams[0]; };
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) socket.emit('iceCandidate', { username, candidate: event.candidate });
    };
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => socket.emit('offer', { username, offer: peerConnection.localDescription }));
}

socket.on('offer', (data) => {
    if (!peerConnection) initPeerConnection();
    peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => socket.emit('answer', { username, answer: peerConnection.localDescription }));
});

socket.on('answer', (data) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});

socket.on('iceCandidate', (data) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
});

function stopVideoCall() {
    if (peerConnection) peerConnection.close();
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }
    remoteVideo.srcObject = null;
    peerConnection = null;
}