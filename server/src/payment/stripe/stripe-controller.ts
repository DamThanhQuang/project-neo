import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { StripeService } from './payment-stripe';
import { BookingService } from '../../booking/booking.service';

@Controller('payment')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingService,
  ) {}

  @Post('create-checkout-session')
  async checkoutSession(
    @Body() paymentData: { amount: number; email: string; bookingId: string },
  ) {
    console.log('Received payment data:', paymentData);
    console.log('bookingId received:', paymentData.bookingId);

    const session = await this.stripeService.createPayment({
      amount: paymentData.amount,
      email: paymentData.email,
      bookingId: paymentData.bookingId,
    });

    console.log('Stripe session created:', session);
    return session;
  }

  @Get('verify')
  async verifyPayment(@Query('session_id') sessionId: string) {
    try {
      console.log('Verifying payment with session ID:', sessionId);
      const result = await this.stripeService.verifyPayment(sessionId);

      console.log('Payment verification result:', result);

      // Nếu thanh toán thành công và có booking ID
      if (result.success && result.metadata && result.metadata.bookingId) {
        console.log(
          'Calling confirmPayment with bookingId:',
          result.metadata.bookingId,
        );

        try {
          const updatedBooking = await this.bookingService.confirmPayment(
            result.metadata.bookingId,
          );
          console.log('Booking updated successfully:', updatedBooking);
        } catch (confirmError) {
          console.error('Error in confirmPayment:', confirmError);
          // Không throw ở đây để vẫn trả về kết quả xác minh
        }
      }

      return result;
    } catch (error) {
      console.error('Error in verifyPayment endpoint:', error);
      throw new BadRequestException(
        'Failed to verify payment: ' + error.message,
      );
    }
  }

  @Get('success')
  async handleSuccess(@Query('session_id') sessionId: string) {
    try {
      const paymentResult = await this.stripeService.verifyPayment(sessionId);

      if (paymentResult.success) {
        // Kiểm tra metadata có bookingId không
        const bookingId = paymentResult.metadata?.bookingId;

        if (bookingId) {
          // Cập nhật trạng thái payment và booking
          await this.bookingService.updatePaymentStatus(bookingId, 'paid');
          await this.bookingService.confirmPayment(bookingId);

          console.log(
            `Đã cập nhật trạng thái thanh toán cho booking ${bookingId}`,
          );
        } else {
          console.error('Không tìm thấy bookingId trong metadata của session');
        }

        return { success: true, message: 'Thanh toán thành công' };
      } else {
        return { success: false, message: 'Thanh toán thất bại' };
      }
    } catch (error) {
      console.error('Lỗi xử lý thanh toán:', error);
      return { success: false, message: 'Lỗi xử lý thanh toán' };
    }
  }
}
