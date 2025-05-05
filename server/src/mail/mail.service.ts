import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Booking } from '@/booking/schema/booking.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

 async sendBookingConfirmation(booking: Booking, email: string): Promise<boolean> {
  try {
    const bookingObj = (booking as any).toObject ? (booking as any).toObject() : booking;
    
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
        formatDate: function(date: Date) {
          return new Date(date).toLocaleDateString('vi-VN');
        },
        formatCurrency: function(amount: number) {
          return amount.toLocaleString('vi-VN');
        }
      }
    });
    return true;
  } catch (error) {
    this.logger.error(`Lỗi khi gửi email xác nhận đặt phòng: ${error.message}`);
    return false;
  }
}
}
