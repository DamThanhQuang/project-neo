import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking, BookingSchema } from '@/booking/schema/booking.schema';
import { ProductModule } from '../product/product.module';
import { UserModule } from '@/user/user.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ProductModule,
    UserModule,
    MailModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
