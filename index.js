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

const port = process.env.PORT || 3000; //uses .env port 3000
const SECRET = process.env.SECRET || 'shhhh';
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const payload = jwt.verify(token, SECRET);
  res.json({ payload });
});

//prettier-ignore
const users = [
    {
      username: "ludvig",
      password: "password",
    },
    { 
      username: "admin",
      password: "admin123",
    },
    {
      username: "user",
      password: "user123",
    },
  ];

function checkPassword(username, password) {
  for (const user of users) {
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
}
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (checkPassword(username, password)) {
    res.json({
      message: "success",
      accessToken: jwt.sign({ username }, SECRET),
    });
  } else {
    res.json({
      message: "invalid credentials",
    });
  }
});

app.get('/post/:id', async (req, res) => {
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
});

app.listen(port, () => {
    console.log('Server started on port: ', port);
});
