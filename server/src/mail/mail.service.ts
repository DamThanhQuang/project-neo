import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Booking } from '@/booking/schema/booking.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendBookingConfirmation(booking: Booking, userEmail: string) {
    this.logger.log(`Đang gửi email xác nhận đặt phòng cho: ${userEmail}`);

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Xác nhận đặt phòng - ${booking.productName}`,
        template: 'booking-confirmation', // Sử dụng template thay vì text
        context: {
          name: booking.name,
          nameProduct: booking.productName,
          bookingId: booking.productId,
          checkIn: new Date(booking.checkIn).toLocaleDateString('vi-VN'),
          checkOut: new Date(booking.checkOut).toLocaleDateString('vi-VN'),
          guestCount: booking.guests,
          totalAmount: booking.totalPrice,
        },
      });

      this.logger.log(`Đã gửi email xác nhận thành công cho: ${userEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`);
      this.logger.error(`Chi tiết lỗi: ${JSON.stringify(error)}`);
      return false;
    }
  }
}
