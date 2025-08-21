import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, BCRYPT_ROUNDS } from '../config/config.js';

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const passwordHash = await bcrypt.hash(password, Number(BCRYPT_ROUNDS));
    const user = await User.create({ name, email, passwordHash });

    const accessToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}
