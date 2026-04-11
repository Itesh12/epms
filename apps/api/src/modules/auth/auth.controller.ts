import mongoose from 'mongoose';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User';
import Organization from '../../models/Organization';
import Invite from '../../models/Invite';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name, orgName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await User.create({ email, name, passwordHash, role: 'ADMIN' });

    const org = await Organization.create({ 
      name: orgName, 
      slug: orgName.toLowerCase().replace(/ /g, '-'),
      adminId: user._id 
    });

    user.organizationId = org._id as mongoose.Types.ObjectId;
    await user.save();

    const accessToken = generateAccessToken(user.id, org.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user: { id: user.id, name, email, role: 'ADMIN', organizationId: org.id }, token: accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const registerEmployee = async (req: Request, res: Response) => {
  try {
    const { email, password, name, inviteCode } = req.body;

    const invite = await Invite.findOne({ code: inviteCode, isUsed: false });
    if (!invite || invite.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired invite code' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate Sequential Employee ID
    const org = await Organization.findById(invite.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    
    const prefix = org.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const userCount = await User.countDocuments({ organizationId: org._id });
    const employeeId = `${prefix}-${(userCount + 1).toString().padStart(3, '0')}`;

    const user = await User.create({ 
        email, 
        name, 
        passwordHash, 
        role: invite.role, 
        organizationId: invite.organizationId,
        employeeId,
        status: 'ACTIVE',
        joinedAt: new Date()
    });

    invite.isUsed = true;
    await invite.save();

    const accessToken = generateAccessToken(user.id, user.organizationId?.toString(), user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user: { id: user.id, name, email, role: user.role, organizationId: user.organizationId }, token: accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const orgId = user.organizationId?.toString();
    const accessToken = generateAccessToken(user.id, orgId, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      user: { id: user.id, name: user.name, email, role: user.role, organizationId: orgId }, 
      token: accessToken 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = generateAccessToken(user.id, user.organizationId?.toString(), user.role);
    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
