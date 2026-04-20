import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { WikiCategory, WikiCategorySchema } from './schemas/wiki-category.schema';
import { WikiArticle, WikiArticleSchema } from './schemas/wiki-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WikiCategory.name, schema: WikiCategorySchema },
      { name: WikiArticle.name, schema: WikiArticleSchema },
    ]),
  ],
  controllers: [WikiController],
  providers: [WikiService],
  exports: [WikiService],
})
export class WikiModule {}
