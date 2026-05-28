import { Controller, Post, Get, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Register attempt: ${registerDto.email}`);
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.authService.getUserProfile(req.user.uid, req.user.storeId);
    return {
      success: true,
      data: user,
      timestamp: new Date(),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    const result = await this.authService.logout(req.user.uid);
    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }
}
