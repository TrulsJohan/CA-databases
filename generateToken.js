import jwt from 'jsonwebtoken';

const SECRET = 'topsecret';
const token = jwt.sign({ email: 'truls@gmail.com', username: 'truls' }, SECRET);
console.log(token);
