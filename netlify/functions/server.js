import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import serverless from 'serverless-http';

let connection;

// Initialize the database connection
async function initializeDbConnection() {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

const SECRET = process.env.SECRET || 'topsecret';
const app = express();

app.use(cors());
app.use(express.json());

// Middleware to authenticate tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!connection) {
        return res
            .status(500)
            .json({ message: 'Database connection not initialized.' });
    }
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (rows.length > 0) {
            const user = rows[0];
            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET,
                { expiresIn: '3h' }
            );
            res.json({
                message: 'success',
                accessToken: token,
                user_id: user.id,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Helper function to get all movies
async function getAllMovies() {
    if (!connection) {
        throw new Error('Database connection not initialized.');
    }
    const [movies] = await connection.execute('SELECT * FROM movies');
    return movies;
}

// Route to get all movies
app.get(
    '/movies',
    authenticateToken,
    async (req, res) => {
        try {
            const movies = await getAllMovies();
            if (movies.length === 0) {
                return res.status(404).json({ message: 'No movies found.' });
            }
            res.json({
                message: 'Movies retrieved successfully.',
                data: movies,
            });
        } catch (error) {
            console.error('Error retrieving movies:', error);
            if (error.message === 'Database connection not initialized.') {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
);

// Get Movies by User
app.get('/movies/user/:user_id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    if (isNaN(userId)) {
        return res
            .status(400)
            .json({ message: 'Invalid user ID. User ID must be a number.' });
    }
    try {
        const [movies] = await connection.execute(
            `SELECT movies.*, users.username FROM movies
             JOIN users ON movies.user_id = users.id
             WHERE movies.user_id = ?`,
            [userId]
        );
        if (movies.length === 0) {
            return res.status(404).json({
                message: `No movies found for user with ID ${userId}.`,
            });
        }
        res.json({ message: 'Movies retrieved successfully.', data: movies });
    } catch (error) {
        console.error('Error retrieving movies by user ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add Movie
app.post('/movies/user/:user_id', authenticateToken, async (req, res) => {
    const userId = req.params.user_id;
    const { title, description, img_url } = req.body;
    if (!title || !description || !img_url) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const [result] = await connection.execute(
            'INSERT INTO movies (title, description, img_url, user_id) VALUES (?, ?, ?, ?)',
            [title, description, img_url, userId]
        );
        res.status(201).json({
            message: 'Movie added successfully!',
            movieId: result.insertId,
        });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Single Movie
app.get('/movies/:movie_id', authenticateToken, async (req, res) => {
    const movie_id = Number(req.params.movie_id);
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM movies WHERE id = ?',
            [movie_id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ message: `No movie found with ID ${movie_id}.` });
        }
        res.json({ message: 'Movie retrieved successfully.', data: rows[0] });
    } catch (error) {
        console.error('Error retrieving movie by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update Movie
app.put(
    '/movies/update/:movie_id/:user_id',
    authenticateToken,
    async (req, res) => {
        const movie_id = Number(req.params.movie_id);
        const user_id = Number(req.params.user_id);
        const { title, description, img_url } = req.body;
        if (!title || !description || !img_url) {
            return res.status(400).json({
                message:
                    'All fields (title, description, img_url) are required.',
            });
        }
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM movies WHERE id = ?',
                [movie_id]
            );
            if (rows.length === 0) {
                return res
                    .status(404)
                    .json({ message: `No movie found with ID ${movie_id}.` });
            }
            const [result] = await connection.execute(
                'UPDATE movies SET title = ?, description = ?, img_url = ?, user_id = ? WHERE id = ?',
                [title, description, img_url, user_id, movie_id]
            );
            if (result.affectedRows === 0) {
                return res.status(500).json({
                    message: `Failed to update movie with ID ${movie_id}.`,
                });
            }
            res.status(200).json({
                message: `Movie with ID ${movie_id} updated successfully.`,
            });
        } catch (error) {
            console.error('Error updating movie:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
);

// Delete Movie
app.delete('/movies/:id', authenticateToken, async (req, res) => {
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

// Initialize the database connection before starting the server
async function startServer() {
    try {
        await initializeDbConnection();
        console.log('Server is ready');
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1); // Exit the process if DB connection fails
    }
}

// Call the startServer function asynchronously to ensure DB connection is established
startServer();

// Export serverless handler
export const handler = serverless(app);
