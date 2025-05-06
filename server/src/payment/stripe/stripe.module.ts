import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './payment-stripe';
import { StripeController } from './stripe-controller';
import { BookingModule } from '../../booking/booking.module';

@Module({
  imports: [ConfigModule, BookingModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
