import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateSocialPostDto, CreateSocialCommentDto } from './dto/social.dto';

@Controller('social')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('posts')
  createPost(@Request() req: any, @Body() dto: CreateSocialPostDto) {
    return this.socialService.createPost(req.user.userId, req.user.orgId, dto);
  }

  @Get('posts')
  findAll(@Request() req: any) {
    return this.socialService.findAll(req.user.orgId);
  }

  @Get('posts/:id')
  findOne(@Param('id') id: string) {
    return this.socialService.findOne(id);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.socialService.deletePost(id, req.user.orgId, req.user.userId, isAdmin);
  }

  @Patch('posts/:id/pin')
  @Roles(UserRole.ADMIN)
  togglePin(@Param('id') id: string, @Request() req: any) {
    return this.socialService.togglePin(id, req.user.orgId, req.user.userId);
  }

  @Post('posts/:id/react/:type')
  toggleReaction(@Param('id') id: string, @Param('type') type: string, @Request() req: any) {
    return this.socialService.toggleReaction(id, req.user.userId, type);
  }

  @Post('posts/:id/comments')
  addComment(@Param('id') id: string, @Request() req: any, @Body() dto: CreateSocialCommentDto) {
    return this.socialService.addComment(id, req.user.userId, dto);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') id: string) {
    return this.socialService.getComments(id);
  }
}
