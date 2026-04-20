import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WikiCategory } from './schemas/wiki-category.schema';
import { WikiArticle } from './schemas/wiki-article.schema';
import { CreateWikiCategoryDto, CreateWikiArticleDto, UpdateWikiArticleDto } from './dto/wiki.dto';

@Injectable()
export class WikiService implements OnModuleInit {
  constructor(
    @InjectModel(WikiCategory.name) private categoryModel: Model<WikiCategory>,
    @InjectModel(WikiArticle.name) private articleModel: Model<WikiArticle>,
  ) {}

  async onModuleInit() {
    // We could seed global templates here if needed, 
    // but usually better to do it per-organization or in a seed script.
  }

  // Categories
  async createCategory(organizationId: string, dto: CreateWikiCategoryDto) {
    const category = new this.categoryModel({
      ...dto,
      organizationId: new Types.ObjectId(organizationId),
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
    });
    return category.save();
  }

  async findAllCategories(organizationId: string) {
    return this.categoryModel.find({ organizationId: new Types.ObjectId(organizationId) } as any).exec();
  }

  // Articles
  async createArticle(userId: string, organizationId: string, dto: CreateWikiArticleDto) {
    const article = new this.articleModel({
      ...dto,
      authorId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      categoryId: new Types.ObjectId(dto.categoryId),
      currentVersion: 1,
      history: [],
    });
    return article.save();
  }

  async updateArticle(userId: string, id: string, organizationId: string, dto: UpdateWikiArticleDto) {
    const article = await this.articleModel.findOne({ _id: id, organizationId } as any);
    if (!article) throw new NotFoundException('Article not found');

    // Archive current version into history
    article.history.push({
      version: article.currentVersion,
      content: article.content,
      authorId: article.authorId,
      createdAt: (article as any).updatedAt || new Date(),
    } as any);

    // Update with new content
    if (dto.title) article.title = dto.title;
    if (dto.content) article.content = dto.content;
    if (dto.categoryId) article.categoryId = new Types.ObjectId(dto.categoryId) as any;
    if (dto.tags) article.tags = dto.tags;
    if (dto.status) article.status = dto.status;

    article.currentVersion += 1;
    article.authorId = new Types.ObjectId(userId) as any;

    return article.save();
  }

  async findOne(id: string, organizationId: string) {
    const article = await this.articleModel.findOne({ _id: id, organizationId } as any)
      .populate('authorId', 'firstName lastName')
      .populate('categoryId', 'name icon')
      .exec();
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async findAllArticles(organizationId: string, categoryId?: string, query?: string) {
    const filter: any = { organizationId: new Types.ObjectId(organizationId) };
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ];
    }
    return this.articleModel.find(filter)
      .populate('authorId', 'firstName lastName')
      .populate('categoryId', 'name')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async removeArticle(id: string, organizationId: string) {
    // Strict requirement: Only admin removes. Enforced in controller.
    return this.articleModel.findOneAndDelete({ _id: id, organizationId } as any).exec();
  }
}
