import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Organization from '../../models/Organization';
import User from '../../models/User';
import { generateAccessToken } from '../../utils/jwt';

export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Organization name is required' });

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Create new organization
    const org = await Organization.create({
      name,
      slug: name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
      adminId: userId
    });

    // Optionally update user's active organizationId
    const user = await User.findById(userId);
    if (user) {
      user.organizationId = org._id as any;
      await user.save();
    }

    // Generate new token for the new org context
    const token = generateAccessToken(userId, org.id, req.user?.role || 'ADMIN');

    res.status(201).json({ 
      message: 'Organization created successfully',
      organization: org,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgs = await Organization.find({ adminId: userId });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
