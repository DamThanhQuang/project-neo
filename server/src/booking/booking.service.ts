import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ProductService } from '../product/product.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private productService: ProductService,
    private userService: UserService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    this.logger.log(`Đang xử lý đặt phòng cho user: ${userId}`);
    this.logger.log(`Product ID: ${createBookingDto.productId}`);

    // Kiểm tra định dạng productId
    if (!Types.ObjectId.isValid(createBookingDto.productId)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    try {
      const user = await this.userService.findById(userId);
      if (!user || user.role !== 'user') {
        throw new ForbiddenException('Bạn không có quyền đặt phòng');
      }

      const product = await this.productService.findById(
        createBookingDto.productId,
      );
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Kiểm tra ngày đặt phòng
      if (
        new Date(createBookingDto.checkIn) >=
        new Date(createBookingDto.checkOut)
      ) {
        throw new BadRequestException(
          'Ngày check-in phải trước ngày check-out',
        );
      }

      // Kiểm tra phòng có sẵn cho ngày đã chọn
      const overlappingBookings = await this.bookingModel.find({
        productId: createBookingDto.productId,
        status: { $ne: 'cancelled' },
        $or: [
          {
            checkIn: { $lte: createBookingDto.checkIn },
            checkOut: { $gt: createBookingDto.checkIn },
          },
          {
            checkIn: { $lt: createBookingDto.checkOut },
            checkOut: { $gte: createBookingDto.checkOut },
          },
          {
            checkIn: { $gte: createBookingDto.checkIn },
            checkOut: { $lte: createBookingDto.checkOut },
          },
        ],
      });

      if (overlappingBookings.length > 0) {
        throw new BadRequestException(
          'Phòng này không khả dụng cho ngày đã chọn',
        );
      }

      // Tạo đặt phòng mới
      const newBooking = new this.bookingModel({
        ...createBookingDto,
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(createBookingDto.productId),
      });

      const savedBooking = await newBooking.save();
      this.logger.log(`Đặt phòng thành công: ${savedBooking._id}`);
      return savedBooking;
    } catch (error) {
      this.logger.error(`Lỗi khi đặt phòng: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(`Lỗi xử lý đặt phòng: ${error.message}`);
    }
  }

  async findAllByUser(userId: string) {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID đặt phòng không hợp lệ');
    }

    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đặt phòng`);
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đặt phòng này');
    }

    return booking;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);

    // Kiểm tra đặt phòng có thể hủy
    const currentDate = new Date();
    if (new Date(booking.checkIn) <= currentDate) {
      throw new BadRequestException('Không thể hủy đặt phòng đã bắt đầu');
    }

    booking.status = 'cancelled';
    return booking.save();
  }
}
