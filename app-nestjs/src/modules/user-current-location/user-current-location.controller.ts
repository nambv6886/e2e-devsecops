import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Query,
  Logger,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserCurrentLocationService } from './user-current-location.service';
import { UpdateUserCurrentLocationDto } from './dto/update-user-current-location.dto';
import { GetUserLocationDto } from './dto/get-user-location.dto';
import {
  UpdateLocationResponse,
  GetLocationResponse,
} from './dto/location-responses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../users/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserCurrentLocationController {
  private readonly logger = new Logger(UserCurrentLocationController.name);

  constructor(
    private readonly userCurrentLocationService: UserCurrentLocationService,
  ) {}

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user location' })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: UpdateLocationResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Location update in progress, concurrent request detected',
  })
  async updateMyLocation(
    @Req() req: any,
    @Body() updateLocationDto: UpdateUserCurrentLocationDto,
    @CurrentUser() user: UserEntity,
  ): Promise<UpdateLocationResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} updating location`);
    return this.userCurrentLocationService.updateLocation(
      userId,
      updateLocationDto,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user location' })
  @ApiResponse({
    status: 200,
    description: 'Location retrieved successfully',
    type: GetLocationResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found',
  })
  async getMyLocation(
    @CurrentUser() user: UserEntity,
  ): Promise<GetLocationResponse> {
    const userId = user.id;
    this.logger.log(`User ${userId} fetching their location`);
    return this.userCurrentLocationService.getLocation(userId);
  }
}
