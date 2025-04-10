import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { User, UserDocument } from '@/user/schemas/user.schema';
import { Product, ProductDocument } from '@/product/schemas/product.schemas';
import { UpdateProductDto } from '@/product/dto/update-product.dto';
import { UpdatePropertyProductDto } from '@/product/dto/update-property-product.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<any> {
    try {
      const businesses = await this.userModel.find({ role: 'business' });

      const businessesWithProducts = await Promise.all(
        businesses.map(async (business) => {
          let businessRecord = await this.businessModel.findOne({
            userId: business._id,
          });

          if (!businessRecord) {
            businessRecord = await this.businessModel.create({
              userId: business._id,
              name: business.email.split('@')[0],
              email: business.email,
              description: 'Default business description',
              owner: business.email,
              products: [],
            });
          }

          const products = await this.productModel.find({
            businessId: business._id,
          });

          return {
            business: {
              _id: business._id,
              name: businessRecord.name,
              email: business.email,
              description: businessRecord.description,
              owner: businessRecord.owner,
            },
            products: products,
          };
        }),
      );

      return businessesWithProducts;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to fetch businesses');
    }
  }

  async findAllProducts(): Promise<any> {
    try {
      const products = await this.productModel.find().lean();
      if (!products || products.length === 0) {
        return [];
      }

      // In your findAllProducts method
      const formattedProducts = products.map((product) => ({
        id: product._id.toString(),
        title: product.title || product.title,
        description: product.description || '',
        price: product.price || 0,
        image: product.image || 'https://via.placeholder.com/300x200',
        location:
          typeof product.location === 'object'
            ? ` ${product.location.city || ''}, ${
                product.location.country || ''
              }`
            : product.location || 'Long Biên, Hà Nội',
        // status: product.status || 'Đang thực hiện',
        // createdAt: product.createdAt,
        // actionRequired:
        //   product.needsAttention || product.actionRequired || false,
      }));
      return formattedProducts;
    } catch (error) {
      console.error('Error in findAllProducts:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async getDetailProduct(id: string): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid product id: ${id}`);
    }
    try {
      const product = await this.productModel.findById(new Types.ObjectId(id));
      if (!product) {
        throw new NotFoundException(`Product not found with id: ${id}`);
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in detailProduct:', error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid product id: ${id}`);
    }
    try {
      const product = await this.productModel
        .findByIdAndUpdate(
          new Types.ObjectId(id),
          { $set: updateProductDto },
          { new: true },
        )
        .exec();
      if (!product) {
        throw new NotFoundException(`Product not found with id: ${id}`);
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in updateProduct:', error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async updatePropertyProduct(
    id: string,
    updatePropertyProductDto: UpdatePropertyProductDto,
  ): Promise<any> {
    if (!isValidObjectId) {
      throw new NotFoundException(`Invalid product id: ${id}`);
    }
    try {
      const product = await this.productModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: updatePropertyProductDto },
        { new: true },
      );
      if (!product) {
        throw new NotFoundException(`Product not found with id: ${id}`);
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in updatePropertyProduct:', error);
      throw new InternalServerErrorException(
        'Failed to update property product',
      );
    }
  }

  async findProductsByUserId(userId: string): Promise<any> {
    if (!isValidObjectId(userId)) {
      throw new NotFoundException(`Invalid user id: ${userId}`);
    }

    try {
      const products = await this.productModel
        .find({ businessId: new Types.ObjectId(userId) })
        .lean();

      if (!products || products.length === 0) {
        return [];
      }

      const formattedProducts = products.map((product) => ({
        id: product._id.toString(),
        title: product.title || product.title,
        description: product.description || '',
        price: product.price || 0,
        image: product.image || 'https://via.placeholder.com/300x200',
        location:
          typeof product.location === 'object'
            ? ` ${product.location.city || ''}, ${
                product.location.country || ''
              }`
            : product.location || 'Long Biên, Hà Nội',
      }));

      return formattedProducts;
    } catch (error) {
      console.error('Error in findProductsByUserId:', error);
      throw new InternalServerErrorException(
        'Failed to fetch products for user',
      );
    }
  }
}
