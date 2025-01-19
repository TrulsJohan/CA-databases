export async function getMovies() {
    try {
        const res = await fetch('http://localhost:3000/movies', {
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

export async function getMovieId() {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('Could not find user_id in localStorage.');
        }
        const res = await fetch(`http://localhost:3000/movies/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch movie: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Movie data:', data);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
    }
}
