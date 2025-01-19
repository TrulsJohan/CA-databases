import { getMovies } from "./api/movies.js";
import { getMovieId } from "./api/movies.js";
import { login } from "./api/login.js";
//import { getData } from "./api/auth.js";

const moviesContainer = document.getElementById('moviesContainer');

async function displayMovies() {
    try {
        const data = await getMovies();
        if (!data || !data.data || data.data.length === 0) {
            throw new Error('No movies found');
        }
        console.log(data);
        moviesContainer.innerHTML = '';
        const movies = data.data
            .map((movie) => {
                return `
                <div class="movie">
                    <h3>${movie.title}</h3>
                    <p>${movie.description}</p>
                    <img src="${movie.img_url}" alt="${movie.title}" style="width: 100px; height: 100px;"/>
                </div>
            `;
            })
            .join('');
        moviesContainer.innerHTML = movies;
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function displayMovie() {
    try {
        const data = await getMovieId();
        if (!data || !data.data || data.data.length === 0) {
            throw new Error('No movies found');
        }
        console.log(data);
        moviesContainer.innerHTML = '';
        const movies = data.data
            .map((movie) => {
                return `
                <div class="movie">
                    <h3>${movie.title}</h3>
                    <p>${movie.description}</p>
                    <img src="${movie.img_url}" alt="${movie.title}" style="width: 100px; height: 100px;"/>
                    <p>Posted by: ${movie.username}</p>
                </div>
            `;
            })
            .join('');
        moviesContainer.innerHTML = movies;
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    login();
});

document.getElementById('getMovies').addEventListener('click', displayMovies);
document.getElementById('getMovieId').addEventListener('click', displayMovie);
