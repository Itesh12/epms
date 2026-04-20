import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateAssetDto, UpdateAssetDto, CreateAssetRequestDto, UpdateAssetRequestDto } from './dto/assets.dto';
import { AssetType } from './schemas/asset.schema';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Assets Management (Admin Only)
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Request() req: any, @Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(req.user.orgId, dto);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  findAll(@Request() req: any, @Query('type') type?: AssetType) {
    return this.assetsService.findAll(req.user.orgId, type);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateAssetDto) {
    return this.assetsService.updateAsset(id, req.user.orgId, dto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  getSummary(@Request() req: any) {
    return this.assetsService.getInventorySummary(req.user.orgId);
  }

  // Requests (Admin Only for management)
  @Get('requests')
  @Roles(UserRole.ADMIN)
  findAllRequests(@Request() req: any) {
    return this.assetsService.findAllRequests(req.user.orgId);
  }

  @Patch('requests/:id')
  @Roles(UserRole.ADMIN)
  updateRequestStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateAssetRequestDto,
  ) {
    return this.assetsService.updateRequestStatus(id, req.user.orgId, req.user.userId, dto);
  }

  // Employee Endpoints
  @Get('my')
  getMyAssets(@Request() req: any) {
    return this.assetsService.findMyAssets(req.user.userId, req.user.orgId);
  }

  @Post('request')
  createRequest(@Request() req: any, @Body() dto: CreateAssetRequestDto) {
    return this.assetsService.createRequest(req.user.userId, req.user.orgId, dto);
  }
}
