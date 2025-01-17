import express from 'express';
import cors from 'cors';
//import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { users } from './users.js';

/*const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});*/

const port = process.env.PORT || 3000; //uses .env port 3000
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

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username && user.password === password);
    if (user) {
        res.json({ message: 'success', accessToken: jwt.sign({ username }, SECRET) });
    } else { 
        res.json({ message: 'invalid credentials' });
    }
});

/*app.get('/post/:id', async (req, res) => {
    const id = Number(req.params.id);
    const [post] = await connection.query(`
        SELECT * FROM post WHERE id=${id}
    `);
    const [comment] = await connection.query(`
        SELECT  comment.content, user.name
        FROM comment
        JOIN user on comment.user_id = user.id
        WHERE comment.post_id=${id}
    `);
    res.json({ post, comment });
});*/

app.listen(port, () => {
    console.log('Server started on port: ', port);
});
