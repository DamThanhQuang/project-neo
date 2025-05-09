// src/reviews/review.controller.ts
import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() currentUserId: string,
  ) {
    return this.reviewService.createReview(dto, currentUserId);
  }

  // Lấy danh sách đánh giá cho user (host hoặc guest)
  @Get('/user/:userId')
  async getReviewsForUser(@Param('userId') userId: string) {
    return this.reviewService.getUserReviews(userId);
  }

  // Lấy danh sách đánh giá cho sản phẩm (phòng)
  @Get('/product/:productId')
  async getReviewsForProduct(@Param('productId') productId: string) {
    return this.reviewService.getProductReviews(productId);
  }
}
