import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ResetPasswordRequest,
} from './dto/auth.dto';
import { LoginResponse } from './dto/auth.dto';
import { ResponseMessage } from '../../models/interfaces/response.message.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    description: 'login',
  })
  @ApiResponse({
    status: 200,
    type: LoginResponse,
  })
  @Post('login')
  login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(loginRequest);
  }

  @ApiOperation({
    description: 'forgot password',
  })
  @ApiResponse({
    status: 200,
    type: ForgotPasswordResponse,
  })
  @Post('forgot-password')
  refreshToken(
    @Body() forgotPasswordRequest: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(forgotPasswordRequest);
  }

  @ApiOperation({
    description: 'User reset password',
  })
  @ApiResponse({
    status: 200,
    type: ResponseMessage,
    isArray: false,
  })
  @Put('/resetPassword')
  public userResetPassword(
    @Body() request: ResetPasswordRequest,
  ): Promise<ResponseMessage> {
    return this.authService.resetPassword(request);
  }
}
