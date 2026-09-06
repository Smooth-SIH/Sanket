import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sanket_super_secret_jwt_key';

export const login = async (req, res) => {
  const { email } = req.body;
  
  const token = jwt.sign(
    { id: 'usr-1', email: email || 'officer@sanket.gov.in', role: 'DISASTER_OFFICER', name: 'Command Officer' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: 'usr-1',
      name: 'Command Officer',
      email: email || 'officer@sanket.gov.in',
      role: 'DISASTER_OFFICER',
      organization: 'MOSDAC Severe Weather Wing',
      preferences: { alertThresholdIWV: 50.0, enableWebsockets: true, theme: 'dark' }
    }
  });
};

export const register = async (req, res) => {
  const { name, email, role, organization } = req.body;
  const token = jwt.sign(
    { id: `usr-${Date.now()}`, email, role: role || 'ANALYST', name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    token,
    user: {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'ANALYST',
      organization: organization || 'State Emergency Operation Centre',
      preferences: { alertThresholdIWV: 50.0, enableWebsockets: true, theme: 'dark' }
    }
  });
};

export const getMe = async (req, res) => {
  return res.json({
    user: req.user || {
      id: 'usr-1',
      name: 'Command Officer',
      email: 'officer@sanket.gov.in',
      role: 'DISASTER_OFFICER',
      organization: 'MOSDAC Severe Weather Wing'
    }
  });
};

export const updatePreferences = async (req, res) => {
  const { alertThresholdIWV, enableWebsockets, theme } = req.body;
  return res.json({
    message: 'Preferences updated successfully',
    preferences: { alertThresholdIWV, enableWebsockets, theme }
  });
};
