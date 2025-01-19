export async function addMovie() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const imgUrl = document.getElementById('img_url').value;
    if (!title || !description || !imgUrl) {
        showMessage('All fields are required!', 'error');
        return;
    }
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        throw new Error('Could not find user ID');
    }
    try {
        const res = await fetch(`http://localhost:3000/movies/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, img_url: imgUrl }),
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('addMovieForm').reset();
        } else {
            showMessage(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}
