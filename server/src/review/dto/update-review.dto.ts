import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number; // Rating given by the user (1 to 5)

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  isLike?: boolean; // Indicates if the review is a like or dislike

  @IsNumber()
  @Min(0)
  @IsOptional()
  like?: number; // Number of likes for the review
}
