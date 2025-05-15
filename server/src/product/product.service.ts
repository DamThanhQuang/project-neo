import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { Business, BusinessDocument } from '@/business/schemas/business.schema';
import { ErrorService } from '@/common/services/error.service';
import path from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    private errorService: ErrorService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      console.log('BusinessId received:', createProductDto.businessId);

      // Tìm business trước khi tạo sản phẩm
      const business = await this.businessModel
        .findOne({
          userId: new Types.ObjectId(createProductDto.businessId),
        })
        .exec();

      console.log('Business found:', business); // Debug log

      if (!business) {
        throw new NotFoundException(
          `Business not found with userId: ${createProductDto.businessId}`,
        );
      }

      // Tạo sản phẩm mới
      const newProduct = await this.productModel.create({
        ...createProductDto,
        businessId: business._id,
        _id: new Types.ObjectId(),
        image: createProductDto.images[0],
        reviews: [],
        totalReviews: 0,
        averageRating: 0,
      });

      console.log(newProduct);

      // Thêm Product Id vào mảng products của business
      business.products = business.products;
      business.products.push(newProduct._id.toString());
      await business.save();

      return newProduct;
    } catch (error) {
      console.error('Create product error details:', {
        businessId: createProductDto.businessId,
        error: error.message,
      });
      throw error;
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const products = await this.productModel.find().exec();
      if (!products || products.length === 0) {
        throw this.errorService.notFound('Product');
      }
      return products;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.errorService.serverError('Error fetching products', error);
    }
  }

  async findProductById(productId: string) {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        throw new BadRequestException('Invalid product ID');
      }

      // Find the product first
      const product = await this.productModel
        .findById(new Types.ObjectId(productId))
        .populate({
          path: 'reviews',
          select: 'rating comment fromUserId createdAt',
          populate: {
            path: 'fromUserId',
            select: 'name avatar',
          },
        })
        .exec();
      console.log('Product found:', product);

      if (!product) {
        throw this.errorService.notFound('Product', productId);
      }

      // Get business information using the businessId from the product
      const business = await this.businessModel
        .findById(product.businessId)
        .populate('userId', 'name email avatar')
        .exec();

      console.log('Business found:', business);

      if (!business) {
        throw this.errorService.notFound(
          'Business',
          product.businessId.toString(),
        );
      }

      return {
        product: {
          ...product.toJSON(),
          location: {
            ...product.location,
            latitude: product.location?.latitude || 21.0285, // Tọa độ mặc định nếu không có
            longitude: product.location?.longitude || 105.8542, // Tọa độ Hà Nội (mặc định)
          },
        },
        business: {
          id: business._id,
          name: business.name,
          description: business.description,
        },
        owner: business.owner,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.errorService.serverError(
        'Error fetching product with business info',
        {
          productId,
          error,
        },
      );
    }
  }

  async findOne(id: string) {
    return this.productModel.findById(id);
  }

  async findById(id: string) {
    try {
      const product = await this.productModel
        .findById(new Types.ObjectId(id))
        .populate({
          path: 'reviews',
          select: 'rating comment fromUserId createdAt',
          populate: {
            path: 'fromUserId',
            select: 'name avatar',
          },
        })
        .exec();
      if (!product) {
        throw this.errorService.notFound('Product', id);
      }
      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.errorService.serverError('Error fetching product', {
        productId: id,
        error,
      });
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    return this.productModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateProductDto },
      { new: true },
    );
  }

  async delete(id: string, userId: string) {
    return this.productModel.findOneAndDelete({ _id: id, userId });
  }

  async findByUser(userId: string) {
    return this.productModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async updateDescription(
    id: string,
    updateDescriptionDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.productModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        { $set: updateDescriptionDto },
        { new: true },
      );

      if (!product) {
        throw this.errorService.notFound('Product', id);
      }

      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.errorService.serverError('Error updating product', {
        productId: id,
        error,
      });
    }
  }
}
