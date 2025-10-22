import { PartialType } from '@nestjs/swagger';
import { CreateUserCurrentLocationDto } from './create-user-current-location.dto';

export class UpdateUserCurrentLocationDto extends PartialType(CreateUserCurrentLocationDto) {}
