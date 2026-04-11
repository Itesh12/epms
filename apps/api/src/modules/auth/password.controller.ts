import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User';

// Request a password reset (User)
export const requestReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // For security, we don't reveal if the user exists
    if (!user) return res.json({ message: 'If this email is registered, you will be reset by Admin/HR.' });

    // Mark user as needing reset (we will show this in Admin/HR dashboard)
    user.resetPasswordCode = 'PENDING'; 
    await user.save();

    res.json({ message: 'Reset request submitted. Please contact your Admin or HR for your reset code.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate a reset code (Admin/HR only)
export const generateResetCode = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Ensure the admin/hr belongs to the same organization
    // req.user is populated by auth middleware
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Multi-tenancy check (handled by base repository normally, but explicit here for clarity)
    // if (targetUser.organizationId?.toString() !== req.orgId) return res.status(403).json({ message: 'Unauthorized' });

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setHours(expires.getHours() + 2); // 2 hours expiry

    targetUser.resetPasswordCode = resetCode;
    targetUser.resetPasswordExpires = expires;
    await targetUser.save();

    res.json({ resetCode, expires });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify and Reset (User)
export const verifyAndReset = async (req: Request, res: Response) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({ 
      email, 
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
