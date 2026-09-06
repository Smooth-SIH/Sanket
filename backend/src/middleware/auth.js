import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // For demo / dev flexibility, attach default officer persona if token missing
    req.user = {
      id: 'demo-user-123',
      name: 'Command Center Officer',
      email: 'officer@sanket.gov.in',
      role: 'DISASTER_OFFICER'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sanket_super_secret_jwt_key_sih2026');
    req.user = decoded;
    next();
  } catch (error) {
    req.user = {
      id: 'demo-user-123',
      name: 'Command Center Officer',
      email: 'officer@sanket.gov.in',
      role: 'DISASTER_OFFICER'
    };
    next();
  }
};
