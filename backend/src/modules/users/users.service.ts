import { Injectable, ConflictException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from './schemas/user.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private generateEmployeeId(): string {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `EP-${random}`;
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, organizationId: string): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userModel.findOne({ email: createEmployeeDto.email });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const defaultPassword = createEmployeeDto.password || 'Welcome@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Generate Unique ID
    let employeeId = this.generateEmployeeId();
    let idExists = await this.userModel.findOne({ employeeId, organizationId: new Types.ObjectId(organizationId) } as any);
    
    // Collision resistance
    while (idExists) {
      employeeId = this.generateEmployeeId();
      idExists = await this.userModel.findOne({ employeeId, organizationId: new Types.ObjectId(organizationId) } as any);
    }

    const newUser = new this.userModel({
      ...createEmployeeDto,
      employeeId,
      password: hashedPassword,
      role: createEmployeeDto.role || UserRole.EMPLOYEE,
      organizationId: new Types.ObjectId(organizationId),
      isActive: true,
    });

    await newUser.save();
    
    // Return user without password
    const { password, ...userObj } = newUser.toObject() as any;
    return userObj;
  }

  async findAllByOrg(organizationId: string): Promise<User[]> {
    const users = await this.userModel
      .find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    // Auto-backfill employeeId for any users that don't have one
    const needsId = users.filter((u: any) => !u.employeeId);
    if (needsId.length > 0) {
      await Promise.all(
        needsId.map(async (u: any) => {
          let newId = this.generateEmployeeId();
          // Ensure uniqueness within org
          let exists = await this.userModel.findOne({ employeeId: newId, organizationId: new Types.ObjectId(organizationId) } as any);
          while (exists) {
            newId = this.generateEmployeeId();
            exists = await this.userModel.findOne({ employeeId: newId, organizationId: new Types.ObjectId(organizationId) } as any);
          }
          u.employeeId = newId;
          await this.userModel.updateOne({ _id: u._id }, { $set: { employeeId: newId } }).exec();
        })
      );
    }

    return users;
  }

  async findById(id: string, organizationId: string): Promise<User> {
    const user = await this.userModel.findOne({ 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(organizationId) 
    } as any).select('-password').populate('reportingManager', 'firstName lastName email designation').exec();

    if (!user) {
      throw new NotFoundException('Employee not found');
    }
    return user;
  }

  async findPotentialManagers(organizationId: string): Promise<User[]> {
    return this.userModel
      .find({ 
        organizationId: new Types.ObjectId(organizationId),
        role: { $in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEADER] }
      } as any)
      .select('firstName lastName email designation')
      .exec();
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, organizationId: string): Promise<User> {
    const filter = { 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(organizationId) 
    } as any;

    const updatedUser = await this.userModel.findOneAndUpdate(
      filter,
      { $set: updateEmployeeDto },
      { new: true }
    ).select('-password').exec();

    if (!updatedUser) {
      throw new NotFoundException('Employee not found in your organization');
    }

    return updatedUser;
  }

  async removeEmployee(id: string, organizationId: string): Promise<void> {
    // You might want to prevent an admin from deleting themselves, but keeping it simple for now.
    const filter = { 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(organizationId) 
    } as any;

    const result = await this.userModel.deleteOne(filter).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Employee not found');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select('+password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isMatch) {
        throw new UnauthorizedException('Incorrect current password');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    return { success: true };
  }
}
