import jwt from 'jsonwebtoken';

const SECRET = 'shhhh';
const token = jwt.sign(
    {
        email: 'ludvig@noroff.no',
        username: 'ludvig',
        avatar: 'example.com/image.png',
    },
    SECRET
);

console.log(token);
