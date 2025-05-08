// src/reviews/schemas/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, enum: ['user', 'product'] })
  type: 'user' | 'product';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  toUserId?: Types.ObjectId; // dùng khi type = user (host hoặc guest)

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: Types.ObjectId; // dùng khi type = user

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId; // dùng khi type = product

  @Prop({ enum: ['user', 'business'], required: false })
  role?: 'user' | 'business'; // dùng khi type = user

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment?: string;

  @Prop({ default: false })
  isLike: boolean;

  @Prop({ default: 0 })
  like: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
