// Show signup form
function showSignup() {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('signup-box').style.display = 'block';
    document.getElementById('auth-message').textContent = '';
}

// Show login form
function showLogin() {
    document.getElementById('signup-box').style.display = 'none';
    document.getElementById('login-box').style.display = 'block';
    document.getElementById('auth-message').textContent = '';
}

// Signup function
function signup() {
    let username = document.getElementById('signup-username').value;
    let password = document.getElementById('signup-password').value;

    if (username === '' || password === '') {
        showMessage('Please fill all fields!', 'red');
        return;
    }

    fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('Account created! Please login.', 'green');
            showLogin();
        } else {
            showMessage(data.message, 'red');
        }
    })
    .catch(() => showMessage('Server error!', 'red'));
}

// Login function
function login() {
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;

    if (username === '' || password === '') {
        showMessage('Please fill all fields!', 'red');
        return;
    }

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('username', data.username);
            window.location.href = 'dashboard.html';
        } else {
            showMessage(data.message, 'red');
        }
    })
    .catch(() => showMessage('Server error!', 'red'));
}

// Show message
function showMessage(msg, color) {
    let el = document.getElementById('auth-message');
    el.textContent = msg;
    el.style.color = color;
}