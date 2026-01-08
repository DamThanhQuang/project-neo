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
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Login } from './dto/login.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public } from './decorators/customs.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly cfg: ConfigService,
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const token = await this.authService.loginWithGoogle(req.user);

    return res.redirect(
      `http://localhost:3000/login-success?token=${token}`,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req) {
    return req.user;
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return res.send({ ok: true });
  }
}
