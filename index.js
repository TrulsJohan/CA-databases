import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const port = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'topsecret';
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, SECRET);
        res.json({ payload });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (rows.length > 0) {
            const user = rows[0];
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
            res.json({ message: 'success', accessToken: token, user_id: user.id });
        } else {
            res.status(401).json({ message: 'invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/movies', async (req, res) => {
    try {
        const [movies] = await connection.execute('SELECT * FROM movies');
        if (movies.length === 0) {
            return res.status(404).json({ message: 'No movies found.' });
        }
        res.json({ message: 'Movies retrieved successfully.', data: movies });
    } catch (error) {
        console.error('Error retrieving movies:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get('/movies/user/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID. User ID must be a number.' });
    }
    try {
        const [movies] = await connection.execute(
            `SELECT movies.*, users.username FROM movies
             JOIN users ON movies.user_id = users.id
             WHERE movies.user_id = ?`,
            [userId]
        );
        if (movies.length === 0) {
            return res.status(404).json({ message: `No movies found for user with ID ${userId}.`,});
        }
        res.json({ message: 'Movies retrieved successfully.', data: movies });
    } catch (error) {
        console.error('Error retrieving movies by user ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.delete('/movies/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await connection.execute(
            'DELETE FROM movies WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json({ message: `Movie with ID ${id} deleted successfully` });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/movies/user/:user_id', async (req, res) => {
    const userId = req.params.id;
    const { title, description, img_url } = req.body;
    if (!title || !description || !img_url) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const [result] = await connection.execute(
            'INSERT INTO movies (title, description, img_url, user_id) VALUES (?, ?, ?, ?)',
            [title, description, img_url, userId]
        );
        res.status(201).json({ message: 'Movie added successfully!', movieId: result.insertId });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/movies/:movie_id', async (req, res) => {
    const movie_id = Number(req.params.movie_id); // Correctly use movie_id here
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM movies WHERE id = ?',
            [movie_id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ message: `No movie found with ID ${movie_id}.` }); // Correctly use movie_id here
        }

        res.json({ message: 'Movie retrieved successfully.', data: rows[0] });
    } catch (error) {
        console.error('Error retrieving movie by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log('Server started on port: ', port);
});
