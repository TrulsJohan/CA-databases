import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

let pool;

async function initializeDbConnection() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'movies_db',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        console.log('Database connection pool established successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

const SECRET = process.env.SECRET || 'your-jwt-secret';
const app = express();

app.use(cors());

app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

app.post('/registration', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password are required' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            return res
                .status(400)
                .json({ message: 'Username is already taken' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: 'Username and password required.' });
    }

    console.log('Login attempt:', username);

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            const user = rows[0];
            console.log('User found:', user);

            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', passwordMatch);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET,
                { expiresIn: '3h' }
            );

            return res.json({
                message: 'Success',
                accessToken: token,
                user_id: user.id,
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/movies', async (req, res) => {
    try {
        const [movies] = await pool.execute('SELECT * FROM movies');
        if (movies.length === 0)
            return res.status(404).json({ message: 'No movies found.' });

        res.json({ message: 'Movies retrieved successfully.', data: movies });
    } catch (error) {
        console.error('Error retrieving movies:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get('/movies/user/:user_id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    if (isNaN(userId))
        return res.status(400).json({ message: 'Invalid user ID.' });

    try {
        const [movies] = await pool.execute(
            `SELECT movies.*, users.username FROM movies 
             JOIN users ON movies.user_id = users.id 
             WHERE movies.user_id = ?`,
            [userId]
        );

        if (movies.length === 0)
            return res
                .status(404)
                .json({
                    message: `No movies found for user with ID ${userId}.`,
                });

        res.json({ message: 'Movies retrieved successfully.', data: movies });
    } catch (error) {
        console.error('Error retrieving movies by user ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/movies/user/:user_id', authenticateToken, async (req, res) => {
    const userId = req.params.user_id;
    const { title, description, img_url } = req.body;

    if (!title || !description || !img_url)
        return res.status(400).json({ message: 'All fields are required' });

    try {
        const [result] = await pool.execute(
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

app.get('/movies/:movie_id', authenticateToken, async (req, res) => {
    const movie_id = Number(req.params.movie_id);

    try {
        const [rows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [
            movie_id,
        ]);
        if (rows.length === 0)
            return res
                .status(404)
                .json({ message: `No movie found with ID ${movie_id}.` });

        res.json({ message: 'Movie retrieved successfully.', data: rows[0] });
    } catch (error) {
        console.error('Error retrieving movie by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.put(
    '/movies/update/:movie_id/:user_id',
    authenticateToken,
    async (req, res) => {
        const movie_id = Number(req.params.movie_id);
        const user_id = Number(req.params.user_id);
        const { title, description, img_url } = req.body;

        if (!title || !description || !img_url)
            return res
                .status(400)
                .json({ message: 'All fields are required.' });

        try {
            const [result] = await pool.execute(
                'UPDATE movies SET title = ?, description = ?, img_url = ?, user_id = ? WHERE id = ?',
                [title, description, img_url, user_id, movie_id]
            );

            if (result.affectedRows === 0)
                return res
                    .status(404)
                    .json({ message: `No movie found with ID ${movie_id}.` });

            res.status(200).json({
                message: `Movie with ID ${movie_id} updated successfully.`,
            });
        } catch (error) {
            console.error('Error updating movie:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
);

app.delete('/movies/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await pool.execute('DELETE FROM movies WHERE id = ?', [
            id,
        ]);
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Movie not found' });

        res.json({ message: `Movie with ID ${id} deleted successfully` });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

async function startServer() {
    try {
        await initializeDbConnection();
        app.listen(3000, () => console.log('Server running on port 3000'));
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
