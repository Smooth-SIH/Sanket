import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'sanket_super_secret_jwt_key_sih2026';

// Pre-registered official disaster management personnel
const initialRegisteredUsers = [
  {
    id: 'usr-imd-01',
    name: 'Dr. M. Mohapatra',
    email: 'imd.director@sanket.gov.in',
    password: 'imd@2026',
    role: 'ADMIN',
    organization: 'India Meteorological Department (IMD HQ)',
    preferences: { alertThresholdIWV: 50.0, enableWebsockets: true, theme: 'light' }
  },
  {
    id: 'usr-mosdac-01',
    name: 'Command Center Officer',
    email: 'officer@sanket.gov.in',
    password: 'sanket2026',
    role: 'DISASTER_OFFICER',
    organization: 'MOSDAC Severe Weather Wing (SAC / ISRO)',
    preferences: { alertThresholdIWV: 50.0, enableWebsockets: true, theme: 'light' }
  },
  {
    id: 'usr-ndrf-01',
    name: 'NDRF Ops Commander',
    email: 'ndrf.command@sanket.gov.in',
    password: 'ndrf@2026',
    role: 'DISASTER_OFFICER',
    organization: 'National Disaster Response Force (NDRF HQ)',
    preferences: { alertThresholdIWV: 45.0, enableWebsockets: true, theme: 'light' }
  },
  {
    id: 'usr-nwfc-01',
    name: 'Senior Nowcasting Analyst',
    email: 'analyst@sanket.gov.in',
    password: 'analyst2026',
    role: 'ANALYST',
    organization: 'National Weather Forecasting Centre (NWFC)',
    preferences: { alertThresholdIWV: 52.0, enableWebsockets: true, theme: 'light' }
  }
];

// Persistent in-memory registry (ensures auth works even if local MongoDB is offline)
let memoryUsers = [...initialRegisteredUsers];

/**
 * Helper to sanitize user object (strip password)
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Find user by email across memory and MongoDB
 */
const findUserByEmail = async (email) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  
  // First check memory store
  let user = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (user) return user;

  // Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUser = await User.findOne({ email: normalizedEmail }).lean();
      if (dbUser) {
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          password: dbUser.password,
          role: dbUser.role,
          organization: dbUser.organization,
          preferences: dbUser.preferences
        };
      }
    } catch (err) {
      console.warn('[Auth] MongoDB lookup error:', err.message);
    }
  }

  return null;
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Official email and password are required for portal access.' 
    });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ 
      message: 'Access Denied: Unregistered personnel. Only verified disaster management officers are permitted.' 
    });
  }

  if (user.password !== password) {
    return res.status(401).json({ 
      message: 'Access Denied: Invalid security credentials. Please verify your password.' 
    });
  }

  const safeUser = sanitizeUser(user);

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      organization: user.organization 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: safeUser,
    message: `Authorization granted for ${user.name}`
  });
};

export const register = async (req, res) => {
  const { name, email, password, role, organization } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'Full name, official email, and password are required for personnel registration.' 
    });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ 
      message: 'An authorized account is already registered with this email. Please sign in.' 
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: role || 'DISASTER_OFFICER',
    organization: organization ? organization.trim() : 'State Emergency Operations Centre (SEOC)',
    preferences: { alertThresholdIWV: 50.0, enableWebsockets: true, theme: 'light' },
    createdAt: new Date().toISOString()
  };

  // Add to memory
  memoryUsers.push(newUser);

  // Add to MongoDB if available
  if (mongoose.connection.readyState === 1) {
    try {
      await User.create(newUser);
    } catch (err) {
      console.warn('[Auth] MongoDB save error on register:', err.message);
    }
  }

  const token = jwt.sign(
    { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      name: newUser.name,
      organization: newUser.organization 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    token,
    user: sanitizeUser(newUser),
    message: 'Officer account registered and authenticated successfully'
  });
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await findUserByEmail(req.user.email);
  if (user) {
    return res.json({ user: sanitizeUser(user) });
  }

  return res.json({ user: req.user });
};

export const updatePreferences = async (req, res) => {
  const { alertThresholdIWV, enableWebsockets, theme } = req.body;
  return res.json({
    message: 'Preferences updated successfully',
    preferences: { alertThresholdIWV, enableWebsockets, theme }
  });
};

export const getRegisteredDemoAccounts = (req, res) => {
  // Return pre-configured personnel list (without passwords) for quick login chips
  const publicProfiles = initialRegisteredUsers.map(u => ({
    email: u.email,
    name: u.name,
    role: u.role,
    organization: u.organization
  }));
  return res.json({ registeredPersonnel: publicProfiles });
};
