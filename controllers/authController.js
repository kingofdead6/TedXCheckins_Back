import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1h' }
  );
};

export const register = async (req, res) => {
  const { name, email, phone, password, role, team, roleInTeam } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !team || !roleInTeam) {
      return res.status(400).json({ message: 'Name, email, password, team, and role in team are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role: ['user', 'admin'].includes(role) ? role : 'user',
      team,
      roleInTeam
    });

    await user.save();

    // Generate token and respond
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        team: user.team,
        roleInTeam: user.roleInTeam
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token and respond
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        team: user.team,
        roleInTeam: user.roleInTeam
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      team: req.user.team,
      roleInTeam: req.user.roleInTeam
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};
