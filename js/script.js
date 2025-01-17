async function getData() {
    const res = await fetch('http://localhost:3000', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    const data = await res.json();
    console.log(data);
}

async function login() {
    try {
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
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
    } catch (error) {
        console.error('Could not log in:', error.message);
    }
}

/*async function getPosts() {
    try {
        const res = await fetch('http://localhost:3000/post/4', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}*/

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    login();
});

getData();
//getPosts();
