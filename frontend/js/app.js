const API_URL = 'http://localhost:4000/api/auth';

// Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const displayName = document.getElementById('displayName').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, displayName, password })
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('registerMessage').style.color = 'green';
        document.getElementById('registerMessage').innerText = 'Registration successful! Redirecting...';
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        document.getElementById('registerMessage').innerText = data.message || JSON.stringify(data);
      }
    } catch (err) {
      document.getElementById('registerMessage').innerText = err.message || 'Server error';
      console.error(err);
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'profile.html';
      } else {
        document.getElementById('loginMessage').innerText = data.message || JSON.stringify(data);
      }
    } catch (err) {
      document.getElementById('loginMessage').innerText = err.message || 'Server error';
      console.error(err);
    }
  });
}
