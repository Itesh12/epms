import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocialPost, SocialPostType } from './schemas/social-post.schema';
import { SocialComment } from './schemas/social-comment.schema';
import { CreateSocialPostDto, UpdateSocialPostDto, CreateSocialCommentDto } from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(SocialPost.name) private postModel: Model<SocialPost>,
    @InjectModel(SocialComment.name) private commentModel: Model<SocialComment>,
  ) {}

  async createPost(userId: string, organizationId: string, dto: CreateSocialPostDto) {
    const post = new this.postModel({
      ...dto,
      authorId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      reactions: new Map([
        ['LOVE', []],
        ['ROCKET', []],
        ['CLAP', []],
        ['COFFEE', []],
      ]),
    });
    return post.save();
  }

  async findAll(organizationId: string) {
    // Show pinned posts first, then newest
    return this.postModel.find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .populate('authorId', 'firstName lastName avatar role')
      .sort({ isPinned: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate('authorId', 'firstName lastName avatar role');
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deletePost(id: string, organizationId: string, userId: string, isAdmin: boolean) {
    const post = await this.postModel.findOne({ _id: id, organizationId } as any);
    if (!post) throw new NotFoundException('Post not found');
    
    if (!isAdmin && post.authorId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.deleteOne({ _id: id });
    await this.commentModel.deleteMany({ postId: new Types.ObjectId(id) as any });
    return { success: true };
  }

  async togglePin(id: string, organizationId: string, userId: string) {
    const post = await this.postModel.findOne({ _id: id, organizationId } as any);
    if (!post) throw new NotFoundException('Post not found');

    post.isPinned = !post.isPinned;
    post.pinnedBy = post.isPinned ? new Types.ObjectId(userId) as any : undefined;
    
    return post.save();
  }

  async toggleReaction(id: string, userId: string, reactionType: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    const reactionMap = post.reactions;
    if (!reactionMap.has(reactionType)) {
      reactionMap.set(reactionType, []);
    }

    const userIds = reactionMap.get(reactionType) || [];
    const index = userIds.findIndex(id => id.toString() === userId);

    if (index > -1) {
      userIds.splice(index, 1);
    } else {
      userIds.push(new Types.ObjectId(userId) as any);
    }

    post.markModified('reactions');
    return post.save();
  }

  async addComment(postId: string, userId: string, dto: CreateSocialCommentDto) {
    const comment = new this.commentModel({
      ...dto,
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(userId),
    });
    return comment.save();
  }

  async getComments(postId: string) {
    return this.commentModel.find({ postId: new Types.ObjectId(postId) } as any)
      .populate('authorId', 'firstName lastName avatar role')
      .sort({ createdAt: 1 })
      .exec();
  }
}
