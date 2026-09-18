import { Response } from 'express';
import validator from 'validator';
import { User } from '../models/User.model';
import { signToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler.middleware';
import { AuthRequest } from '../types';

export const signup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Email, password, and name are required');
  }
  if (!validator.isEmail(email)) {
    throw new ApiError(400, 'Invalid email address');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = new User({ email, password, name });
  await user.save();

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const logout = (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { ...(name && { name }), ...(avatar && { avatar }) },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }, message: 'Profile updated' });
});
