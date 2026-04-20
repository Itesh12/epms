import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { Poll, PollSchema } from './schemas/poll.schema';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Poll.name, schema: PollSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
