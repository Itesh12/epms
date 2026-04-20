import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateWikiCategoryDto, CreateWikiArticleDto, UpdateWikiArticleDto } from './dto/wiki.dto';

@Controller('wiki')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  // Categories
  @Post('categories')
  @Roles(UserRole.ADMIN)
  createCategory(@Request() req: any, @Body() dto: CreateWikiCategoryDto) {
    return this.wikiService.createCategory(req.user.orgId, dto);
  }

  @Get('categories')
  getCategories(@Request() req: any) {
    return this.wikiService.findAllCategories(req.user.orgId);
  }

  // Articles
  @Post('articles')
  createArticle(@Request() req: any, @Body() dto: CreateWikiArticleDto) {
    return this.wikiService.createArticle(req.user.userId, req.user.orgId, dto);
  }

  @Get('articles')
  getArticles(
    @Request() req: any,
    @Query('category') categoryId?: string,
    @Query('q') query?: string,
  ) {
    return this.wikiService.findAllArticles(req.user.orgId, categoryId, query);
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string, @Request() req: any) {
    return this.wikiService.findOne(id, req.user.orgId);
  }

  @Patch('articles/:id')
  updateArticle(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateWikiArticleDto) {
    return this.wikiService.updateArticle(req.user.userId, id, req.user.orgId, dto);
  }

  @Delete('articles/:id')
  @Roles(UserRole.ADMIN)
  removeArticle(@Param('id') id: string, @Request() req: any) {
    return this.wikiService.removeArticle(id, req.user.orgId);
  }
}
