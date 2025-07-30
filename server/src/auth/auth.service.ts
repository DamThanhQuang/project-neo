import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Req,
  Res,
  Scope,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Login } from './dto/login.dto';
import { PasswordHelper } from './helpers/utils';
import { EmailHelper } from './helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
//import { RegisterBusinessDto } from './dto/register-business.dto';
import { Business, BusinessDocument } from '@/business/schemas/business.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private readonly users: UserService,
  ) {}

  async signup(signupDto: SignupDto): Promise<User> {
    const { firstName, lastName, email, password, role } = signupDto;

    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Password không hợp lệ');
    }

    const hashedPassword = await PasswordHelper.hashPassword(password);
    const newUser = new this.userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Neo Booking',
      template: './welcome',
      context: {
        name: firstName,
      },
    });

    return newUser.save();
  }

  async login(login: Login, @Res() response: Response): Promise<any> {
    const { email, password } = login;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return response.status(400).json({ message: 'User not found!' });
    }

    const isPasswordValid = await PasswordHelper.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return response.status(400).json({ message: 'Invalid password!' });
    }

    // Tạo JWT token
    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Lưu token vào HTTP-Only Cookie
    response.cookie('token', token, {
      httpOnly: false, // Keep token HttpOnly for security
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    response.cookie('userId', user._id.toString(), {
      httpOnly: false, // Changed to false so JavaScript can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return response.status(200).json({
      message: 'Login Successful',
      role: user.role,
      userId: user._id.toString(),
      token,
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    // Tìm user theo email trong db
    const user = await this.userModel.findOne({ email: email });
    // So sánh password nhập vào với password đã mã hóa (bcrypt)
    if (
      user &&
      (await PasswordHelper.comparePassword(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  // Tạo method để tạo JWT token riêng (có thể sử dụng khi cần)
  async generateToken(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async handleGoogleLogin(oauthUser: any) {
    const user = await this.users.upsertGoogleUser({
      providerId: oauthUser.providerId,
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.avatar,
    });
    return user;
  }

  signToken(user: any) {
    return this.jwtService.sign(
      {
        sub: String(user._id),
        email: user.email ?? null,
        role: user.role ?? 'user',
      },
      {
        expiresIn: process.env.JWT_EXPIRES,
        secret: process.env.JWT_SECRET,
      },
    );
  }
}
