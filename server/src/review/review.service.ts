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
import { Product } from '@/product/schemas/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Product.name) private productModel: Model<Product>,
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
          booking.get('userId').toString() !== currentUserId) ||
        (dto.role === 'business' &&
          booking.get('business').toString() !== currentUserId)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền đánh giá booking này.',
        );
      }

      // 4. Kiểm tra đã đánh giá hay chưa
      const existed = await this.reviewModel.findOne({
        fromUserId: new Types.ObjectId(currentUserId),
        toUserId: new Types.ObjectId(dto.toUserId),
        bookingId: new Types.ObjectId(dto.bookingId),
      });

      console.log('Existed review:', existed);

      if (existed) {
        throw new BadRequestException('Bạn đã đánh giá booking này rồi.');
      }
    }

    // 5. Đánh giá sản phẩm: check nếu booking đã hoàn tất
    if (dto.type === 'product') {
      console.log('Current user ID:', currentUserId);
      console.log('Product ID:', dto.productId);

      // Đảm bảo currentUserId không phải undefined
      if (!currentUserId) {
        throw new ForbiddenException('Bạn cần đăng nhập để đánh giá.');
      }

      //Kiem tra sp co ton tai khong
      const product = await this.productModel.findById(
        new Types.ObjectId(dto.productId),
      );

      if (!product) {
        throw new BadRequestException('Sản phẩm không tồn tại.');
      }

      try {
        // Chỉ tìm booking có trạng thái 'expired' của sản phẩm cụ thể
        const bookings = await this.bookingModel.find({
          userId: new Types.ObjectId(currentUserId),
          productId: new Types.ObjectId(dto.productId),
          status: 'expired',
        });

        console.log('Found bookings:', bookings);

        // Nếu không có booking nào đã expired
        if (!bookings.length) {
          throw new ForbiddenException(
            'Bạn chưa từng đặt phòng này hoặc chưa hoàn thành kỳ nghỉ, không thể đánh giá.',
          );
        }

        // Kiểm tra đã đánh giá hay chưa
        const existed = await this.reviewModel.findOne({
          fromUserId: new Types.ObjectId(currentUserId),
          productId: new Types.ObjectId(dto.productId),
          type: 'product',
        });

        if (existed) {
          throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
        }
      } catch (error) {
        if (
          error instanceof ForbiddenException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }
        console.error('Error checking bookings:', error);
        throw new BadRequestException('Lỗi khi kiểm tra thông tin đặt phòng.');
      }
    }

    // Tạo mới review nếu tất cả kiểm tra thành công
    const reviewData = await this.reviewModel.create({
      ...dto,
      fromUserId: new Types.ObjectId(currentUserId),
    });

    if (dto.toUserId) {
      reviewData.toUserId = new Types.ObjectId(dto.toUserId);
    }

    if (dto.bookingId) {
      reviewData.bookingId = new Types.ObjectId(dto.bookingId);
    }

    if (dto.productId) {
      reviewData.productId = new Types.ObjectId(dto.productId);
    }

    const newReview = await this.reviewModel.create(reviewData);
    return newReview;
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
