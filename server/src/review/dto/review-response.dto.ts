import { Types } from 'mongoose';

export class ReviewResponseDto {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}
