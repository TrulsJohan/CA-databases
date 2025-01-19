async function getSelectedMovie() {
    const movie_id = localStorage.getItem('movie_id');
    if (!movie_id) {
        console.error('Movie ID not found in localStorage.');
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/movies/${movie_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            throw new Error(
                `Failed to fetch movie with ID ${movie_id}: ${res.status}`
            );
        }
        const data = await res.json();
        console.log('Movie fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching movie:', error);
    }
}

getSelectedMovie();
