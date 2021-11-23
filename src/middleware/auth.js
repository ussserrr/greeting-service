import jwt from 'jsonwebtoken';

import config from '../config.js';
import fakeUsers from '../../fakeUsers.js';


function extractToken(req) {
  const data = req.get('Authorization');
  if (data) {
    const [bearer, token] = data.split(' ');
    if (bearer === 'Bearer') {
      return token;
    }
  }
}


export default function(req, res, next) {
  const tokenData = extractToken(req);
  if (!tokenData) {
    return res.status(401).send('No credentials supplied');
  }

  jwt.verify(tokenData, config.jwt.signatureSecret, async (error, decoded) => {
    if (error) {
      return res.status(401).send('Authentication error');
    }

    const user = await fakeUsers.find(u => u.id === decoded.sub);
    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).send('User not found');
    }
  });
};
