import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Res,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Login } from './dto/login.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public } from './decorators/customs.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: Login, @Res() response: Response) {
    return this.authService.login(loginDto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getProfile(@Request() req) {
    return req.user;
  }
}
