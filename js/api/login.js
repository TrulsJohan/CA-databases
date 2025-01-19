export async function login() {
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            throw new Error(`Login failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (!data.accessToken) {
            throw new Error('Login response does not contain an access token.');
        }
        console.log(data);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user_id', data.user_id);
    } catch (error) {
        console.error('Could not log in:', error.message);
    }
}
