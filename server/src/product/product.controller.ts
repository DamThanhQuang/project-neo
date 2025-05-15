import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Put,
  RequestTimeoutException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Public } from '@/auth/decorators/customs.decorator';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get('get-all-product')
  @Public()
  async getAllProduct() {
    return this.productService.findAll();
  }

  @Get('get-product/:id')
  @Public()
  async getProduct(@Param('id') id: string) {
    try {
      console.log('Product ID:', id);
      return await this.productService.findProductById(id);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error.message);
      throw error;
    }
  }

  @Put('update-description/:id')
  @Public()
  async updateDescription(
    @Param('id') id: string,
    @Body() updateDescriptionDto: UpdateProductDto,
  ) {
    return this.productService.updateDescription(id, updateDescriptionDto);
  }

  @Get('get-product-for-booking/:id')
  @Public()
  async getProductForBooking(@Param('id') id: string) {
    console.log('Product ID:', id);
    return this.productService.findById(id);
  }
}
