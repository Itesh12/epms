import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket, TicketComment } from './schemas/support-ticket.schema';
import { CreateSupportTicketDto, UpdateSupportTicketDto, CreateTicketCommentDto, TicketStatus } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicket>,
    @InjectModel(TicketComment.name) private commentModel: Model<TicketComment>,
  ) {}

  async createTicket(userId: string, organizationId: string, dto: CreateSupportTicketDto) {
    const ticket = new this.ticketModel({
      ...dto,
      requesterId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      status: TicketStatus.OPEN,
    });
    return ticket.save();
  }

  async findAll(organizationId: string, isAdmin: boolean, userId?: string) {
    const query: any = { organizationId: new Types.ObjectId(organizationId) };
    
    // If not admin, only see their own tickets
    if (!isAdmin) {
      query.requesterId = new Types.ObjectId(userId);
    }

    return this.ticketModel.find(query)
      .populate('requesterId', 'firstName lastName avatar')
      .populate('assignedTo', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, organizationId: string, userId: string, isAdmin: boolean) {
    const ticket = await this.ticketModel.findOne({ _id: id, organizationId } as any)
      .populate('requesterId', 'firstName lastName avatar email')
      .populate('assignedTo', 'firstName lastName avatar');

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Security: non-admins can only see their own tickets
    if (!isAdmin && ticket.requesterId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Mask requester if anonymous and viewer is not the requester themselves
    const ticketObject = ticket.toObject() as any;
    if (ticketObject.isAnonymous && ticketObject.requesterId?._id?.toString() !== userId) {
      ticketObject.requesterId = {
        _id: ticketObject.requesterId?._id,
        firstName: 'Anonymous',
        lastName: 'User',
        avatar: '',
      };
    }

    return ticketObject;
  }

  async updateTicket(id: string, organizationId: string, adminId: string, dto: UpdateSupportTicketDto) {
    const ticket = await this.ticketModel.findOne({ _id: id, organizationId } as any);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Enforce resolution note when closing
    if (dto.status === TicketStatus.CLOSED && !dto.resolutionNote && !ticket.resolutionNote) {
      throw new BadRequestException('A resolution note is required to close this ticket');
    }

    if (dto.status) ticket.status = dto.status;
    if (dto.assignedTo) ticket.assignedTo = new Types.ObjectId(dto.assignedTo) as any;
    if (dto.resolutionNote) ticket.resolutionNote = dto.resolutionNote;
    if (dto.adminNote) ticket.adminNote = dto.adminNote;

    return ticket.save();
  }

  async addComment(ticketId: string, userId: string, dto: CreateTicketCommentDto) {
    const comment = new this.commentModel({
      ...dto,
      ticketId: new Types.ObjectId(ticketId),
      authorId: new Types.ObjectId(userId),
    });
    return comment.save();
  }

  async getComments(ticketId: string, isAdmin: boolean) {
    const query: any = { ticketId: new Types.ObjectId(ticketId) };
    
    // Non-admins only see non-internal comments
    if (!isAdmin) {
      query.isInternal = false;
    }

    return this.commentModel.find(query)
      .populate('authorId', 'firstName lastName avatar role')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getStats(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    const [open, inProgress, resolved] = await Promise.all([
      this.ticketModel.countDocuments({ organizationId: orgId, status: TicketStatus.OPEN } as any),
      this.ticketModel.countDocuments({ organizationId: orgId, status: TicketStatus.IN_PROGRESS } as any),
      this.ticketModel.countDocuments({ organizationId: orgId, status: TicketStatus.RESOLVED } as any),
    ]);

    return { open, inProgress, resolved };
  }
}
