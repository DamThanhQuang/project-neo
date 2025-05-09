import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  propertyType: string; // Apartment, House, Villa, ...

  @Prop({ type: Object, required: true })
  description: {
    description: string; // Mô tả ngắn về chỗ ở của bạn
    descriptionDetail: string; // Mô tả chi tiết về chỗ ở của bạn
    guestsAmenities: string; // Tiện nghi cho khách
    interactionWithGuests: string; // Tương tác với khách
    otherThingsToNote: string; // Những điều khác cần lưu ý
  };

  @Prop({ required: true })
  price: number;

  @Prop()
  discountedPrice: number;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ required: true })
  image: string; // Main image/thumbnail

  @Prop({ required: true, type: Types.ObjectId, ref: 'Business' })
  businessId: Types.ObjectId;

  // Location details
  @Prop({ type: Object, required: true })
  location: {
    address: string;
    apartment?: string;
    district: string;
    city: string;
    country: string;
    postalCode?: string;
  };

  // Privacy type
  @Prop({
    required: true,
    enum: ['entire_place', 'private_room', 'shared_room', 'public'],
  })
  privacyType: string;

  // Floor plan details
  @Prop({ required: true })
  livingRooms: number;

  @Prop({ required: true })
  bedrooms: number;

  @Prop({ required: true })
  beds: number;

  @Prop({ required: true })
  bathrooms: number;

  @Prop({ type: Types.ObjectId, ref: 'Property' })
  propertyId: Types.ObjectId;

  // Amenities
  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews: Types.ObjectId[];

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: false })
  isNew: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
