import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { Public } from '@/auth/decorators/customs.decorator';
import { Types } from 'mongoose';
import { UpdateProductDto } from '@/product/dto/update-product.dto';
import { UpdatePropertyProductDto } from '@/product/dto/update-property-product.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @Public()
  findAll() {
    return this.businessService.findAll();
  }

  @Get('products')
  @Public()
  getAllProducts() {
    return this.businessService.findAllProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    const objectId = new Types.ObjectId(id);
    return this.businessService.findProductsByUserId(objectId.toString());
  }

  @Get('detail-product/:id')
  @Public()
  findOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    const objectId = new Types.ObjectId(id);
    return this.businessService.getDetailProduct(objectId.toString());
  }
  @Put('update-product/:id')
  @Public()
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    const objectId = new Types.ObjectId(id);
    return this.businessService.updateProduct(
      objectId.toString(),
      updateProductDto,
    );
  }

  @Put('update-property-product/:id')
  @Public()
  updatePropertyProduct(
    @Param('id') id: string,
    @Body() updatePropertyProductDto: UpdatePropertyProductDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    const objectId = new Types.ObjectId(id);
    return this.businessService.updatePropertyProduct(
      objectId.toString(),
      updatePropertyProductDto,
    );
  }
}
