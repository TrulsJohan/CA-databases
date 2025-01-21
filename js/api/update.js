let title = document.getElementById('title');
let description = document.getElementById('description');
let img_url = document.getElementById('img_url');

async function getSelectedMovie() {
    const movie_id = localStorage.getItem('movie_id');
    if (!movie_id) {
        console.error('Movie ID not found in localStorage.');
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/movies/${movie_id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
            throw new Error(
                `Failed to fetch movie with ID ${movie_id}: ${res.status}`
            );
        }
        const data = await res.json();
        console.log(data);
        title.value = data.data.title;
        description.value = data.data.description;
        img_url.value = data.data.img_url;
    } catch (error) {
        console.error('Error fetching movie:', error);
    }
}

async function updateMovie() {
    const movie_id = localStorage.getItem('movie_id');
    const user_id = localStorage.getItem('user_id');
    if (!movie_id || !user_id) {
        console.error('Movie ID not found in localStorage.');
        return;
    }
    try {
        const res = await fetch(
            `http://localhost:3000/movies/update/${movie_id}/${user_id}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, img_url }),
            }
        );
        const data = res.json();
        if (!data) {
            throw new Error(
                `Failed to update movie with ID ${movie_id}: ${res.status}`
            );
        }
        console.log(data);
    } catch (error) {
        console.error('Error fetching movie:', error);
    }
}

document.getElementById('updateMovieForm').addEventListener('submit', (event) => {
    event.preventDefault();
    updateMovie();
});

getSelectedMovie();
