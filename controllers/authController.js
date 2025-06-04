import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Validate role, default to 'user' if not provided or invalid
    const validRole = ['user', 'admin'].includes(role) ? role : 'user';
    user = new User({ name, email, phone, password: hashedPassword, role: validRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name, email, phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    profilePicture: req.user.profilePicture,
    role: req.user.role,
  });
};

export const updateProfile = async (req, res) => {
  const { name, phone, profilePicture } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, profilePicture },
      { new: true }
    );
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};