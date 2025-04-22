import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Tạo class con cho phần description
class Description {
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  descriptionDetail: string;

  @IsString()
  @IsOptional()
  guestsAmenities: string;

  @IsString()
  @IsOptional()
  interactionWithGuests: string;

  @IsString()
  @IsOptional()
  otherThingsToNote: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Description)
  @IsOptional()
  description?: Description;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  propertyType?: string;

  @IsObject()
  @IsOptional()
  location?: {
    address: string;
    apartment?: string;
    district: string;
    city: string;
    country: string;
    postalCode?: string;
  };

  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsOptional()
  privacyType?: 'entire_place' | 'private_room' | 'shared_room' | 'public';

  @IsNumber()
  @IsOptional()
  livingRooms?: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  beds?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;
}
