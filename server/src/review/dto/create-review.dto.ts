// src/reviews/dto/create-review.dto.ts
import {
  IsMongoId,
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateReviewDto {
  @IsEnum(['user', 'product'], {
    message: 'type phải là "user" hoặc "product"',
  })
  type: 'user' | 'product';

  // Đánh giá người dùng (host hoặc guest)
  @ValidateIf((o) => o.type === 'user')
  @IsMongoId()
  bookingId?: string;

  @ValidateIf((o) => o.type === 'user')
  @IsMongoId()
  toUserId?: string;

  @ValidateIf((o) => o.type === 'user')
  @IsEnum(['user', 'business'], {
    message: 'role phải là "user" hoặc "business"',
  })
  role?: 'user' | 'business';

  // Đánh giá sản phẩm (phòng)
  @ValidateIf((o) => o.type === 'product')
  @IsMongoId()
  productId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
