import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Booking } from '@/booking/schema/booking.schema';
import { Types } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async createReview(dto: CreateReviewDto, currentUserId: string) {
    // 1. Kiểm tra loại review: user hoặc product
    if (dto.type === 'user') {
      // 2. Kiểm tra booking đã hoàn tất chưa
      const booking = await this.bookingModel.findById(dto.bookingId);
      if (!booking || booking.status !== 'expired') {
        throw new BadRequestException(
          'Chỉ có thể đánh giá sau khi booking đã hoàn tất.',
        );
      }

      // 3. Kiểm tra quyền đánh giá: chỉ guest hoặc host mới được đánh giá
      if (
        (dto.role === 'user' &&
          booking.get('user').toString() !== currentUserId) ||
        (dto.role === 'business' &&
          booking.get('business').toString() !== currentUserId)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền đánh giá booking này.',
        );
      }

      // 4. Kiểm tra đã đánh giá hay chưa
      const existed = await this.reviewModel.findOne({
        bookingId: dto.bookingId,
        fromUserId: currentUserId,
      });

      if (existed) {
        throw new BadRequestException('Bạn đã đánh giá booking này rồi.');
      }
    }

    // 5. Đánh giá sản phẩm: check nếu booking đã hoàn tất
    if (dto.type === 'product') {
      const bookings = await this.bookingModel.find({
        productId: dto.productId,
        guestId: currentUserId,
        status: 'expried',
      });

      if (!bookings.length) {
        throw new ForbiddenException(
          'Bạn chưa từng đặt phòng này, không thể đánh giá.',
        );
      }

      const existed = await this.reviewModel.findOne({
        productId: dto.productId,
        fromUserId: currentUserId,
      });

      if (existed) {
        throw new BadRequestException('Bạn đã đánh giá phòng này rồi.');
      }
    }

    // Tạo mới review nếu tất cả kiểm tra thành công
    return this.reviewModel.create({
      ...dto,
      fromUserId: new Types.ObjectId(currentUserId),
    });
  }

  async getProductReviews(productId: string) {
    // Kiểm tra định dạng productId
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    // Tìm tất cả các review của sản phẩm với type là 'product'
    const reviews = await this.reviewModel
      .find({
        productId: productId,
        type: 'product',
      })
      .populate('fromUserId', 'name avatar') // Lấy thông tin người dùng đánh giá
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
      .exec();

    // Tính toán điểm đánh giá trung bình
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = totalRating / reviews.length;
    }

    // Thống kê số lượng đánh giá theo rating (1-5 sao)
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingCounts[review.rating]++;
    });

    return {
      reviews,
      totalReviews: reviews.length,
      averageRating,
      ratingCounts,
    };
  }

  async getUserReviews(userId: string) {
    // Kiểm tra định dạng userId
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    // Tìm tất cả các review của người dùng với type là 'user'
    const reviews = await this.reviewModel
      .find({
        toUserId: userId,
        type: 'user',
      })
      .populate('fromUserId', 'name avatar') // Lấy thông tin người đánh giá
      .populate('bookingId', 'startDate endDate') // Lấy thông tin booking liên quan
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
      .exec();

    // Tính toán điểm đánh giá trung bình
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = totalRating / reviews.length;
    }

    // Thống kê số lượng đánh giá theo rating (1-5 sao)
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingCounts[review.rating]++;
    });

    // Phân loại đánh giá theo vai trò (business/user)
    const hostReviews = reviews.filter((review) => review.role === 'business');
    const guestReviews = reviews.filter((review) => review.role === 'user');

    return {
      reviews,
      totalReviews: reviews.length,
      averageRating,
      ratingCounts,
      hostReviewCount: hostReviews.length,
      guestReviewCount: guestReviews.length,
    };
  }
}
