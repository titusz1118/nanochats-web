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