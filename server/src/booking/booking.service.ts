import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ProductService } from '../product/product.service';
import { UserService } from '@/user/user.service';
import { EmailService } from '@/mail/mail.service';
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private productService: ProductService,
    private userService: UserService,
    private emailService: EmailService,
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

      console.log('Product found:', product.title);

      createBookingDto.productName = product.title;
      createBookingDto.name = user.name || user.email;

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
        // Format các booking bị trùng lịch để hiển thị
        const conflictDetails = overlappingBookings
          .map((booking) => {
            const checkIn = new Date(booking.checkIn).toLocaleDateString(
              'vi-VN',
            );
            const checkOut = new Date(booking.checkOut).toLocaleDateString(
              'vi-VN',
            );
            return `${checkIn} đến ${checkOut}`;
          })
          .join(', ');

        throw new BadRequestException(
          `Phòng "${product.title}" không khả dụng cho ngày đã chọn. Phòng đã được đặt trong khoảng thời gian: ${conflictDetails}`,
        );
      }

      // Tạo đặt phòng mới
      const newBooking = new this.bookingModel({
        ...createBookingDto,
        productName: product.title,
        name: user.name || user.email,
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(createBookingDto.productId),
      });

      console.log('New booking:', newBooking);

      const savedBooking = await newBooking.save();
      this.logger.log(`Đặt phòng thành công: ${savedBooking._id}`);

      this.emailService
        .sendBookingConfirmation(savedBooking, user.email)
        .then((result) => {
          this.logger.log(
            `Kết quả gửi email: ${result ? 'Thành công' : 'Thất bại'}`,
          );
        })
        .catch((error) => {
          this.logger.error(`Lỗi khi gửi email: ${error.message}`);
        });

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
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }
    try {
      return this.bookingModel
        .find({ userId })
        .populate('productId')
        .sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Không tìm thấy đặt phòng');
      }
      throw new BadRequestException('Không thể lấy danh sách đặt phòng');
    }
  }

  async findOneById(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID đặt phòng không hợp lệ');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    try {
      // Thêm log để debug
      this.logger.log(`Đang tìm booking với ID: ${id} cho user: ${userId}`);

      // Kiểm tra xem booking có tồn tại không (không quan tâm userId)
      const bookingExists = await this.bookingModel.findById(id);
      if (!bookingExists) {
        this.logger.warn(`Không tìm thấy booking với ID: ${id}`);
        throw new NotFoundException('Không tìm thấy đặt phòng');
      }

      // Nếu booking tồn tại nhưng không thuộc về user hiện tại
      if (bookingExists.userId.toString() !== userId) {
        this.logger.warn(
          `Booking thuộc về user: ${bookingExists.userId}, không phải ${userId}`,
        );
        throw new ForbiddenException(
          'Bạn không có quyền truy cập đặt phòng này',
        );
      }

      // Tìm booking với đầy đủ thông tin
      const booking = await this.bookingModel
        .findOne({
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        })
        .populate('productId');

      return booking;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin đặt phòng');
    }
  }
}
