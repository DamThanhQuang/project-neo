import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { Booking } from '../booking/schema/booking.schema';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  create(createMailDto: CreateMailDto) {
    return 'This action adds a new mail';
  }

  findAll() {
    return `This action returns all mail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  update(id: number, updateMailDto: UpdateMailDto) {
    return `This action updates a #${id} mail`;
  }

  remove(id: number) {
    return `This action removes a #${id} mail`;
  }

  async sendBookingConfirmation(user: User, booking: Booking) {
    try {
      // Xử lý product một cách an toàn hơn
      let productName = 'Unknown Product';
      const product = booking.product || booking.productId;
      
      if (typeof product === 'object') {
        if (product?.name) {
          productName = product.name;
        }
      }
      
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Xác nhận đặt phòng thành công',
        template: './booking-confirmation', // Đảm bảo template này tồn tại trong thư mục templates
        context: {
          name: user.name || user.email,
          bookingId: booking._id || booking.id, // Sử dụng _id hoặc id tùy vào cấu trúc của booking
          productName: productName,
          checkIn: new Date(booking.checkIn).toLocaleDateString('vi-VN'),
          checkOut: new Date(booking.checkOut).toLocaleDateString('vi-VN'),
          totalAmount: booking.totalAmount,
          guestCount: booking.guestCount
        },
      });
      
      this.logger.log(`Đã gửi email xác nhận đặt phòng cho ${user.email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`);
      // Thêm chi tiết lỗi để debug dễ dàng hơn
      if (error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
    }
  }
}
