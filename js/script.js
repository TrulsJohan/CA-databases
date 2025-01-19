import { getMovies } from "./api/movies.js";
import { getMovieId } from "./api/movies.js";
import { login } from "./api/login.js";
import { deleteMovie } from './api/delete.js';
import { addMovie } from "./api/post.js";
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
                    <button class="deleteBtn" data-id="${movie.id}">Delete Movie</button>
                    <button class="editBtn" data-id="${movie.id}">Edit Movie</button>
                </div>
            `;
            })
            .join('');
        moviesContainer.innerHTML = movies;
        const deleteBtn = document.querySelectorAll('.deleteBtn');
        deleteBtn.forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                if (id) {
                    deleteMovie(id);
                    /*localStorage.setItem('movie_id', id);
                    console.log(`Movie ID ${id} saved to localStorage.`);*/
                } else {
                    console.error('Movie ID not found.');
                }
            });
        });
        const editBtn = document.querySelectorAll('.editBtn');
        editBtn.forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                if (id) {
                    localStorage.setItem('movie_id', id);
                    window.location.href = "./edit.html";
                } else {
                    console.error('Movie ID not found.');
                }
            });
        });
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
                    <button class="deleteBtn" data-id="${movie.id}">Delete Movie</button>
                    <button class="editBtn" data-id="${movie.id}">Edit Movie</button>
            `;
            })
            .join('');
        moviesContainer.innerHTML = movies;
        const deleteBtn = document.querySelectorAll('.deleteBtn');
        deleteBtn.forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                if (id) {
                    deleteMovie(id);
                    /*localStorage.setItem('movie_id', id);
                    console.log(`Movie ID ${id} saved to localStorage.`);*/
                } else {
                    console.error('Movie ID not found.');
                }
            });
        });
        const editBtn = document.querySelectorAll('.editBtn');
        editBtn.forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                if (id) {
                    localStorage.setItem('movie_id', id);
                    window.location.href = './edit.html';
                } else {
                    console.error('Movie ID not found.');
                }
            });
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

document.getElementById('addMovieForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    addMovie();
});

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    login();
});

document.getElementById('getMovies').addEventListener('click', displayMovies);
document.getElementById('getMovieId').addEventListener('click', displayMovie);
