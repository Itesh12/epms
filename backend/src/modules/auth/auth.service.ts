import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { User, UserRole } from '../users/schemas/user.schema';
import { Organization } from '../organizations/schemas/organization.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create Organization
    const organization = new this.orgModel({
      name: dto.organizationName,
      slug: dto.organizationName.toLowerCase().replace(/ /g, '-'),
    });
    await organization.save();

    // Create Admin User
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: organization._id,
    });
    await user.save();

    return {
      message: 'User and organization created successfully',
      userId: user._id,
      organizationId: organization._id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpires'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpires'),
    });

    // Store refresh token in Redis for rotation/revocation
    await this.redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60, // 7 days matching refresh expires
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        orgId: user.organizationId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists. 
      // Just say "If your email is in our grid, a protocol reset has been initialized."
      return { message: 'Protocol reset initialized' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    // Store in Redis with 15 minutes expiration
    await this.redis.set(`reset_token:${token}`, email, 'EX', 15 * 60);

    // In a real app, send an email here. 
    // For this project, we return the token so the user can "see" the functionality.
    return {
      message: 'Protocol reset initialized',
      resetToken: token, // This would normally be emailed
    };
  }

  async resetPassword(token: string, newPass: string) {
    const email = await this.redis.get(`reset_token:${token}`);
    if (!email) {
      throw new BadRequestException('Reset protocol expired or invalid');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Identity node not found');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    await user.save();

    // Clean up token
    await this.redis.del(`reset_token:${token}`);

    return { message: 'Identity synchronized successfully' };
  }
}
