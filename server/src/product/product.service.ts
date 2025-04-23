import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddReviewDto } from './dto/add-review.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schemas';
import { Business, BusinessDocument } from '@/business/schemas/business.schema';
import { ErrorService } from '@/common/services/error.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    private errorService: ErrorService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      console.log('BusinessId received:', createProductDto.businessId); // Debug log

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

  async addReview(addReviewDto: AddReviewDto): Promise<Product> {
    try {
      const product = await this.productModel
        .findById(new Types.ObjectId(addReviewDto.productId))
        .exec();

      console.log('Product search result:', product);

      if (!product) {
        throw new NotFoundException(
          `Product not found with productId: ${addReviewDto.productId}`,
        );
      }

      // Thêm review
      product.reviews.push({
        userId: addReviewDto.userId,
        rating: addReviewDto.rating,
        comment: addReviewDto.comment,
        createdAt: new Date(),
      });

      // Tính rating trung bình
      product.averageRating =
        product.reviews.reduce((total, review) => total + review.rating, 0) /
        product.reviews.length;

      // Lưu và trả về sản phẩm đã cập nhật
      return await product.save();
    } catch (error) {
      console.error('Add review error:', {
        productId: addReviewDto.productId,
        error: error.message,
        collection: this.productModel.collection.name,
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

  async findProductById(productId: string): Promise<Product> {
    try {
      // Validate the ID format first before querying
      if (!productId || !Types.ObjectId.isValid(productId)) {
        throw this.errorService.badRequest(
          'Invalid product ID format',
          'INVALID_PRODUCT_ID',
        );
      }

      const product = await this.productModel
        .findById(new Types.ObjectId(productId))
        .exec();

      console.log('Product search result:', product);

      if (!product) {
        throw this.errorService.notFound('Product', productId);
      }

      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.errorService.serverError('Error fetching product', {
        productId,
        error,
      });
    }
  }

  async findOne(id: string) {
    return this.productModel.findById(id);
  }

  async findById(id: string) {
    try {
      const product = await this.productModel
        .findById(new Types.ObjectId(id))
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
