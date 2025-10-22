import { PartialType } from '@nestjs/swagger';
import { CreateUserFavoriteDto } from './create-user-favorite.dto';

export class UpdateUserFavoriteDto extends PartialType(CreateUserFavoriteDto) {}
