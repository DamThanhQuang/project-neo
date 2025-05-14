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
    // Tạo review mới với một lần gọi
    const newReview = await this.reviewModel.create({
      ...dto,
      fromUserId: new Types.ObjectId(currentUserId),
      toUserId: dto.toUserId ? new Types.ObjectId(dto.toUserId) : undefined,
      bookingId: dto.bookingId ? new Types.ObjectId(dto.bookingId) : undefined,
      productId: dto.productId ? new Types.ObjectId(dto.productId) : undefined,
    });

    // if this is a product review, update the product document
    if (dto.type === 'product' && dto.productId) {
      try {
        // Xác thực định dạng ObjectId trước
        if (!Types.ObjectId.isValid(dto.productId)) {
          console.error(`ID sản phẩm không hợp lệ: ${dto.productId}`);
          throw new BadRequestException('ID sản phẩm không hợp lệ');
        }

        console.log('Attempting to find product with ID:', dto.productId);

        // Tạo ObjectId một cách rõ ràng
        const productObjectId = new Types.ObjectId(dto.productId);

        // Kiểm tra sản phẩm tồn tại trước khi cập nhật
        const productExists = await this.productModel.findById(productObjectId);

        if (!productExists) {
          console.error(`Không tìm thấy sản phẩm với ID: ${dto.productId}`);
          throw new BadRequestException(
            'Sản phẩm không tồn tại hoặc đã bị xóa',
          );
        }

        console.log('Product found before update:', {
          id: productExists._id.toString(),
          title: productExists.title,
        });

        // Sử dụng cập nhật atomic
        const updateResult = await this.productModel.updateOne(
          { _id: productObjectId },
          {
            $push: { reviews: newReview._id },
            $inc: { totalReviews: 1 },
          },
        );

        if (updateResult.modifiedCount === 0) {
          console.error('Không thể cập nhật sản phẩm:', updateResult);
          throw new Error('Không thể cập nhật sản phẩm với review mới');
        }

        console.log('Product updated successfully:', updateResult);

        // Tính lại điểm trung bình
        const avgResult = await this.reviewModel.aggregate([
          { $match: { productId: productObjectId, type: 'product' } },
          { $group: { _id: null, average: { $avg: '$rating' } } },
        ]);

        if (avgResult.length > 0) {
          await this.productModel.updateOne(
            { _id: productObjectId },
            { averageRating: avgResult[0].average },
          );
        }
      } catch (error) {
        console.error('Error updating product with review:', error);
        throw error;
      }
    }

    return newReview;
  }

  async getProductReviews(productId: string) {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    // Sử dụng aggregation để lấy reviews và tính toán thống kê trong 1 query
    const results = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), type: 'product' } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'fromUserId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1,
          type: 1,
          isLike: 1,
          like: 1,
          'fromUserId._id': '$user._id',
          'fromUserId.name': '$user.name',
          'fromUserId.avatar': '$user.avatar',
        },
      },
      {
        $facet: {
          reviews: [{ $match: {} }],
          stats: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    const { reviews, stats } = results[0];
    const statsData = stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    return {
      reviews,
      totalReviews: statsData.totalReviews,
      averageRating: statsData.averageRating || 0,
      ratingCounts: {
        1: statsData.rating1,
        2: statsData.rating2,
        3: statsData.rating3,
        4: statsData.rating4,
        5: statsData.rating5,
      },
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
      .populate('fromUserId', 'name avatar')
      .populate('bookingId', 'startDate endDate')
      .sort({ createdAt: -1 })
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
