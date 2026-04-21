import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialPost, SocialPostSchema } from './schemas/social-post.schema';
import { SocialComment, SocialCommentSchema } from './schemas/social-comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialPost.name, schema: SocialPostSchema },
      { name: SocialComment.name, schema: SocialCommentSchema },
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
