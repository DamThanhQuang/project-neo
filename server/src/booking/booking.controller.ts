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

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.bookingService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req) {
    return this.bookingService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Req() req) {
    return this.bookingService.cancel(id, req.user.id);
  }
}
