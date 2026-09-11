import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sanket_super_secret_jwt_key_sih2026';

/**
 * Strict authentication guard middleware
 */
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'Access Denied: Authentication token required. Please sign in with authorized credentials.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Access Denied: Session expired or invalid token. Please sign in again.' 
    });
  }
};

/**
 * Optional user attachment middleware (populates req.user if token present)
 */
export const optionalAuth = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token failure for optional endpoints
    }
  }

  next();
};
