import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBookingDto: CreateBookingDto, @Req() req) {
    const userId = req.user?._id;
    if (!userId) {
      this.logger.error('Không tìm thấy ID người dùng trong yêu cầu');
      throw new Error('Không tìm thấy ID người dùng trong yêu cầu');
    }
    this.logger.log(`ID người dùng: ${userId}`);
    this.logger.log(`Dữ liệu: ${JSON.stringify(createBookingDto)}`);
    return this.bookingService.create(createBookingDto, userId);
  }

  @Get('expired-check')
  @UseGuards(JwtAuthGuard)
  checkExpiredBookings() {
    return this.bookingService.checkExpiredBooking();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    const userId = req.user?._id;
    return this.bookingService.findAllByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    const userId = req.user?._id;
    const objectId = new Types.ObjectId(id);
    return this.bookingService.findOneById(objectId.toString(), userId);
  }
}
