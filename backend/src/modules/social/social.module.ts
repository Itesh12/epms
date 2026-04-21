import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialPost, SocialPostSchema } from './schemas/social-post.schema';
import { SocialComment, SocialCommentSchema } from './schemas/social-comment.schema';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialPost.name, schema: SocialPostSchema },
      { name: SocialComment.name, schema: SocialCommentSchema },
    ]),
    UsersModule,
    ProjectsModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
