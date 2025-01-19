import { getMovies } from "./api/movies.js";
import { getMovieId } from "./api/movies.js";
import { login } from "./api/login.js";
//import { getData } from "./api/auth.js";

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    login();
});

document.getElementById('getMovies').addEventListener('click', getMovies);
document.getElementById('getMovieId').addEventListener('click', getMovieId);
