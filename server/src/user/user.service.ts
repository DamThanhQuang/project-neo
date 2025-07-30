import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterAsBusinessDto } from './dto/register-business';
import { Business, BusinessDocument } from '@/business/schemas/business.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}

  async registerBusiness(
    userId: string,
    dto: RegisterAsBusinessDto,
  ): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // ktra xem user la business chua
    if (user.isBusiness) {
      throw new Error('User is already a business');
    }

    //Tao mot ban ghi moi
    const newBusiness = await this.businessModel.create({
      userId: user._id, // Link to user
      name: dto.name,
      description: dto.description,
      owner: dto.owner,
      email: user.email, // Add user email
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      city: dto.city,
      country: dto.country,
      products: [],
    });

    // Cap nhat vai tro cua user
    user.isBusiness = true;
    user.role = 'business';
    user.businessId = newBusiness._id;
    await user.save();

    return {
      message: 'Success',
      business: newBusiness,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(new Types.ObjectId(id)).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user');
    }
  }

  async updateAvatar(
    id: string,
    updateAvatarDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const updateUser = await this.userModel.findByIdAndUpdate(
        id,
        { avatar: updateAvatarDto.avatar },
        { new: true },
      );
      if (!updateUser) {
        throw new NotFoundException('User not found');
      }
      return updateUser;
    } catch (error) {
      console.error('Error updating avatar', error);
      throw new InternalServerErrorException('Error updating avatar');
    }
  }

  async updateCoverImage(
    id: number | Types.ObjectId,
    coverImageUrl: string,
  ): Promise<User> {
    await this.userModel.findByIdAndUpdate(id, { coverImage: coverImageUrl });
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const updateUser = await this.userModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (!updateUser) {
        throw new NotFoundException('User not found');
      }
      return updateUser;
    } catch (error) {
      console.error('Error updating user', error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user', error);
      throw new InternalServerErrorException('Error fetching user');
    }
  }

  async upsertGoogleUser(profile: {
    providerId: string;
    email?: string;
    name?: string;
    avatar?: string;
  }) {
    // Find user by providerId
    let user = await this.userModel.findOne({
      provider: 'google',
      providerId: profile.providerId,
    });
    if (user) {
      user.lastLoginAt = new Date();
      if (!user.avatar && profile.avatar) user.avatar = profile.avatar;
      if (!user.email && profile.email) user.email = profile.email;
      if (!user.name && profile.name) user.name = profile.name;
      await user.save();
      return user.toObject();
    }

    // If not found, try to find by email
    if (profile.email) {
      user = await this.userModel.findOne({ email: profile.email });
      if (user) {
        user.provider = 'google';
        user.providerId = profile.providerId;
        user.emailVerified = true;
        user.lastLoginAt = new Date();
        if (!user.avatar && profile.avatar) user.avatar = profile.avatar;
        if (!user.name && profile.name) user.name = profile.name;
        await user.save();
        return user.toObject();
      }
    }

    // If still not found, create a new user OAuth, (no password required)
    const created = await this.userModel.create({
      provider: 'google',
      providerId: profile.providerId,
      email: profile.email ?? undefined,
      emailVerified: true,
      name: profile.name,
      avatar: profile.avatar,
      role: 'user',
      lastLoginAt: new Date(),
    });

    return created.toObject();
  }
}
