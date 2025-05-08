import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Booking } from '@/booking/schema/booking.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendBookingConfirmation(
    booking: Booking,
    email: string,
  ): Promise<boolean> {
    try {
      const bookingObj = (booking as any).toObject
        ? (booking as any).toObject()
        : booking;

      // Tạo URL xem chi tiểt phòng đặt
      const viewBookingUrl = `${process.env.FRONTEND_URL}/trip/${bookingObj._id}/details`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác nhận đặt phòng',
        template: './booking', // Đường dẫn đến template email
        context: {
          name: bookingObj.name,
          booking: bookingObj,
          viewBookingUrl: viewBookingUrl,
          formatDate: function (date: Date) {
            return new Date(date).toLocaleDateString('vi-VN');
          },
          formatCurrency: function (amount: number) {
            return amount.toLocaleString('vi-VN');
          },
        },
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Lỗi khi gửi email xác nhận đặt phòng: ${error.message}`,
      );
      return false;
    }
  }

  async sendBookingExpiredNotification(
    booking: any,
    email: string,
  ): Promise<boolean> {
    try {
      const checkIn = new Date(booking.checkIn).toLocaleDateString('vi-VN');
      const checkOut = new Date(booking.checkOut).toLocaleDateString('vi-VN');

      await this.mailerService.sendMail({
        to: email,
        subject: 'Thông báo: Đặt phòng của bạn đã hết hạn',
        template: 'booking-expired', // Tạo template này trong thư mục templates
        context: {
          name: booking.name,
          productName: booking.productName,
          checkIn: checkIn,
          checkOut: checkOut,
          bookingId: booking._id,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Lỗi khi gửi email thông báo hết hạn: ${error.message}`,
      );
      return false;
    }
  }
}
