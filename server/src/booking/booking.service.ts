import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  HttpException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ProductService } from '../product/product.service';
import { UserService } from '@/user/user.service';
import { EmailService } from '@/mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private productService: ProductService,
    private userService: UserService,
    private emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    // Lên lịch lại cho tất cả booking active khi khởi động ứng dụng
    this.rescheduleActiveBookings();

    // Đăng ký listener khi booking hết hạn
    this.eventEmitter.on('booking-expired', async (bookingId: string) => {
      await this.completeBooking(bookingId);
    });
  }

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

      // Lên lịch hết hạn
      this.scheduleExpiration(savedBooking);

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

  // Lên lịch hết hạn
  scheduleExpiration(booking: BookingDocument) {
    const now = new Date();
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt phòng');
    }

    const checkOut = new Date(booking.checkOut);
    const timeUntilExpiry = checkOut.getTime() - now.getTime();

    // Bao gồm cả trạng thái 'confirmed' trong điều kiện
    if (
      timeUntilExpiry > 0 &&
      (booking.status === 'active' ||
        booking.status === 'pending' ||
        booking.status === 'confirmed')
    ) {
      this.logger.log(
        `Lên lịch hết hạn cho booking ${booking._id} sau ${timeUntilExpiry}ms`,
      );

      setTimeout(() => {
        this.eventEmitter.emit('booking-expired', booking._id);
      }, timeUntilExpiry);
    }
  }

  // Cập nhật booking thành completed
  async completeBooking(bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (
      (booking && booking.status === 'active') ||
      booking?.status === 'confirmed'
    ) {
      booking.status = 'completed';
      await booking.save();

      // Gửi email thông báo
      const user = await this.userService.findById(booking.userId.toString());
      await this.emailService.sendBookingConfirmation(booking, user.email);
    }
  }

  // Hoàn thiện phương thức confirmPayment
  async confirmPayment(bookingId: string) {
    try {
      this.logger.log(`Đang xác nhận thanh toán cho booking: ${bookingId}`);

      if (!Types.ObjectId.isValid(bookingId)) {
        throw new BadRequestException('ID đặt phòng không hợp lệ');
      }

      const booking = await this.bookingModel.findById(bookingId);

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt phòng');
      }

      // Kiểm tra trạng thái hiện tại
      this.logger.log(
        `Trạng thái hiện tại: ${booking.status}, Payment status: ${
          booking.paymentStatus || 'undefined'
        }`,
      );

      // Chỉ cập nhật nếu đang ở trạng thái 'pending' hoặc 'active'
      if (booking.status === 'pending' || booking.status === 'active') {
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.paymentDate = new Date();

        this.logger.log(
          `Cập nhật booking: status=${booking.status}, paymentStatus=${booking.paymentStatus}`,
        );

        try {
          const updatedBooking = await booking.save();
          this.logger.log(
            `Đã lưu booking thành công: ${updatedBooking._id}, paymentStatus=${updatedBooking.paymentStatus}`,
          );

          // Lên lịch hết hạn cho booking đã được xác nhận
          this.scheduleExpiration(updatedBooking);

          // Gửi email xác nhận thanh toán thành công
          const user = await this.userService.findById(
            booking.userId.toString(),
          );
          await this.emailService.sendBookingConfirmation(booking, user.email);

          this.logger.log(`Thanh toán thành công cho booking: ${bookingId}`);

          return updatedBooking;
        } catch (saveError) {
          this.logger.error(`Lỗi khi lưu booking: ${saveError.message}`);
          throw new BadRequestException(
            `Không thể lưu booking: ${saveError.message}`,
          );
        }
      } else {
        this.logger.log(
          `Booking đã ở trạng thái ${booking.status}, không cập nhật`,
        );
      }

      return booking;
    } catch (error) {
      this.logger.error(`Lỗi khi xác nhận thanh toán: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        `Không thể xác nhận thanh toán: ${error.message}`,
      );
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

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt phòng');
      }

      console.log('Booking found:', booking);

      // Kiểm tra và cập nhật trạng thái nếu cần
      const now = new Date();
      const checkOut = new Date(booking.checkOut);

      if (booking && now > checkOut && booking.status === 'active') {
        if (booking && typeof booking._id === 'string') {
          await this.completeBooking(booking._id);
        }
      }

      return booking;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin đặt phòng');
    }
  }

  // Lên lịch lại các booking đang active khi khởi động
  async rescheduleActiveBookings() {
    const activeBookings = await this.bookingModel.find({ status: 'active' });
    for (const booking of activeBookings) {
      this.scheduleExpiration(booking);
    }
  }

  async updatePaymentStatus(bookingId: string, status: string) {
    try {
      // Cập nhật trạng thái thanh toán trong database
      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        bookingId,
        { paymentStatus: status },
        { new: true },
      );
      console.log(
        `Đã cập nhật trạng thái thanh toán cho booking ${bookingId} thành ${status}`,
      );
      return updatedBooking;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      throw new Error('Không thể cập nhật trạng thái thanh toán');
    }
  }
}
