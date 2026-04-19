import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalendarEvent, CalendarEventDocument, EventType } from './calendar.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private calendarEventModel: Model<CalendarEventDocument>,
  ) {}

  async findAll(organizationId: string) {
    return this.calendarEventModel
      .find({ organizationId, isActive: true })
      .sort({ startDate: 1 })
      .populate('createdBy', 'firstName lastName')
      .exec();
  }

  async create(data: any) {
    const newEvent = new this.calendarEventModel(data);
    return newEvent.save();
  }

  async update(id: string, data: any) {
    return this.calendarEventModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.calendarEventModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async seedHolidays(organizationId: string, userId: string) {
    const currentYear = 2026;
    const indianHolidays = [
      { title: 'Republic Day', date: `${currentYear}-01-26`, type: EventType.HOLIDAY },
      { title: 'Holi', date: `${currentYear}-03-14`, type: EventType.HOLIDAY },
      { title: 'Eid-ul-Fitr', date: `${currentYear}-03-20`, type: EventType.HOLIDAY }, // Approximate
      { title: 'Dr. Ambedkar Jayanti', date: `${currentYear}-04-14`, type: EventType.HOLIDAY },
      { title: 'Independence Day', date: `${currentYear}-08-15`, type: EventType.HOLIDAY },
      { title: 'Gandhi Jayanti', date: `${currentYear}-10-02`, type: EventType.HOLIDAY },
      { title: 'Dussehra', date: `${currentYear}-10-21`, type: EventType.HOLIDAY },
      { title: 'Diwali', date: `${currentYear}-11-09`, type: EventType.HOLIDAY },
      { title: 'Christmas Day', date: `${currentYear}-12-25`, type: EventType.HOLIDAY },
    ];

    const operations = indianHolidays.map(holiday => ({
      updateOne: {
        filter: { 
          title: holiday.title, 
          organizationId, 
          startDate: new Date(holiday.date) 
        },
        update: {
          $setOnInsert: {
            title: holiday.title,
            description: `Public Holiday: ${holiday.title}`,
            startDate: new Date(holiday.date),
            type: holiday.type,
            organizationId,
            createdBy: userId,
            isActive: true
          }
        },
        upsert: true
      }
    }));

    return this.calendarEventModel.bulkWrite(operations);
  }
}
