import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import usersDB from '../fakeUsers.js';
import config from './config.js';

import auth from './middleware/auth.js';
import role, { UserRole } from './middleware/role.js';


const app = express();
app.use(express.json());  // разрешаем application/json
app.use(express.urlencoded({ extended: true }));  // разрешаем application/x-www-form-urlencoded


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.sendStatus(400);
  }

  const user = await usersDB.find(u => u.email === email);
  if (user) {

    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {

      // В TypeScript данный интерфейс нужно вынести и использовать также в auth middleware
      const payload = { email: user.email, sub: user.id };

      jwt.sign(
        payload,
        config.jwt.signatureSecret,
        { expiresIn: config.jwt.expiresIn },
        (error, token) => {
          if (error) {
            res.status(500).send('Authentication error');
          } else {
            res.send({ token });
          }
        }
      );
    } else {
      res.status(401).send('Incorrect password');
    }
  } else {
    res.status(404).send('User not found');
  }
});


app.get('/greeting', auth, role(UserRole.OrdinaryUser), (req, res) => {
  // Эта строка по сути является бизнес-логикой, поэтому в настоящем приложении должна быть вынесена в сервис
  const result = `Hello, ${req.user?.name || 'Anonym'}!`;

  res.send(result);
});


app.listen(config.port, () => {
  console.log(`
    Sample app listening at http://${config.host}:${config.port}\n
    Sign in at /login, say hello at /greeting
  `);
});
