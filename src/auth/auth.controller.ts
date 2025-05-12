import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
  } from '@nestjs/common';
  import { AuthGuard } from './auth.guard';
  import { AuthService } from './auth.service';
import { Public } from './decorators/public';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}
  
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: Record<string, any>) {
      return this.authService.signIn(signInDto.pseudo, signInDto.password);
    }
  
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) { //changer ANY 
      return req.user; 
    }

    @Public()
    @Post('verify-token')
    verifyToken(@Body() body: { token: string }) {
      return this.authService.verifyToken(body.token);
    }
  }
  