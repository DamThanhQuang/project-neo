import { Type } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsPositive,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  @IsMongoId({ message: 'ID sản phẩm phải là MongoDB ObjectId hợp lệ' })
  productId: string;

  @IsNotEmpty({ message: 'Ngày check-in không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày check-in phải là kiểu Date hợp lệ' })
  checkIn: Date;

  @IsNotEmpty({ message: 'Ngày check-out không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày check-out phải là kiểu Date hợp lệ' })
  checkOut: Date;

  @IsNotEmpty({ message: 'Số khách không được để trống' })
  @IsNumber({}, { message: 'Số khách phải là số' })
  @IsPositive({ message: 'Số khách phải là số dương' })
  @Min(1, { message: 'Số khách ít nhất phải là 1' })
  guests: number;

  @IsNotEmpty({ message: 'Giá tổng không được để trống' })
  @IsNumber({}, { message: 'Giá tổng phải là số' })
  @IsPositive({ message: 'Giá tổng phải là số dương' })
  totalPrice: number;
}
