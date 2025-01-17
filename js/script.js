async function getData() {
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:3000', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    const data = await res.json();
    console.log(data);
}
getData();

async function login() {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await res.json();
    console.log(data);
    localStorage.setItem('token', data.accessToken);
}

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    login();
});

async function getPosts() {
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
}

getPosts();
