import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      Logger.warn(`[JwtStrategy] User not found: ${payload.email}`);
      return null;
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      const tokenIssuedAt = payload.iat; // JWT 'iat' (issued at) is in seconds

      // If password was changed after token was issued, invalidate the token
      if (passwordChangedTimestamp > tokenIssuedAt) {
        Logger.warn(
          `[JwtStrategy] Token invalidated - password was changed after token was issued for user ${user.email}`,
        );
        return null;
      }
    }

    return user;
  }
}
