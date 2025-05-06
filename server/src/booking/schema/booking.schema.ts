import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ required: true, type: Number })
  guests: number;

  @Prop({ required: true, type: Number })
  totalPrice: number;

  @Prop({
    type: String,
    enum: ['pending', 'active', 'comfirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  })
  paymentStatus: string;

  @Prop()
  paymentDate: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
