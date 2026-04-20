import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Poll, PollStatus } from './schemas/poll.schema';
import { Feedback, FeedbackStatus } from './schemas/feedback.schema';
import { CreatePollDto, VoteDto, CreateFeedbackDto, UpdateFeedbackDto } from './dto/polls.dto';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<Poll>,
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  // Poll Logic
  async createPoll(creatorId: string, organizationId: string, dto: CreatePollDto) {
    const poll = new this.pollModel({
      ...dto,
      options: dto.options.map(text => ({ text, count: 0 })),
      creatorId: new Types.ObjectId(creatorId),
      organizationId: new Types.ObjectId(organizationId),
      status: PollStatus.ACTIVE,
    });
    return poll.save();
  }

  async findAllPolls(organizationId: string) {
    // Automatically expire polls on fetch for consistency
    await this.pollModel.updateMany(
      { 
        organizationId: new Types.ObjectId(organizationId), 
        expiresAt: { $lt: new Date() },
        status: PollStatus.ACTIVE 
      } as any,
      { status: PollStatus.EXPIRED }
    );

    return this.pollModel.find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .sort({ createdAt: -1 })
      .exec();
  }

  async vote(pollId: string, userId: string, organizationId: string, dto: VoteDto) {
    const poll = await this.pollModel.findOne({ _id: pollId, organizationId } as any);
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.status === PollStatus.EXPIRED) throw new BadRequestException('Poll has expired');
    
    const userObjectId = new Types.ObjectId(userId);
    if (poll.votedUserIds.includes(userObjectId as any)) {
      throw new BadRequestException('You have already voted in this poll');
    }

    if (dto.optionIndex < 0 || dto.optionIndex >= poll.options.length) {
      throw new BadRequestException('Invalid option index');
    }

    // Atomic increment
    return this.pollModel.findOneAndUpdate(
      { _id: pollId } as any,
      { 
        $inc: { [`options.${dto.optionIndex}.count`]: 1 },
        $push: { votedUserIds: userObjectId }
      },
      { new: true }
    ).exec();
  }

  // Feedback Logic
  async submitFeedback(userId: string, organizationId: string, dto: CreateFeedbackDto) {
    const feedback = new this.feedbackModel({
      ...dto,
      organizationId: new Types.ObjectId(organizationId),
      userId: dto.isAnonymous ? null : new Types.ObjectId(userId),
      status: FeedbackStatus.OPEN,
    });
    return feedback.save();
  }

  async findAllFeedback(organizationId: string) {
    return this.feedbackModel.find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateFeedbackStatus(id: string, organizationId: string, dto: UpdateFeedbackDto) {
    const feedback = await this.feedbackModel.findOne({ _id: id, organizationId } as any);
    if (!feedback) throw new NotFoundException('Feedback entry not found');

    feedback.status = dto.status;
    if (dto.adminNote) feedback.adminNote = dto.adminNote;

    return feedback.save();
  }

  async deletePoll(id: string, organizationId: string) {
    return this.pollModel.findOneAndDelete({ _id: id, organizationId } as any).exec();
  }
}
