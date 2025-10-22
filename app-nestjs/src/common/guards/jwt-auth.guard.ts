import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers.authorization;

      if (!authorization) {
        Logger.warn('[JwtAuthGuard] No authorization header found');
        return false;
      }
      const token = authorization.split(' ')[1];
      const isDeativate = await this.authService.isTokenDeactivate(token);
      if (isDeativate) {
        Logger.warn('[JwtAuthGuard] Token is deactivated');
        return false;
      }

      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return await result;
      }
      return result as boolean;
    } catch (error) {
      Logger.error(`[JwtAuthGuard][Guard]: ${JSON.stringify(error.message)}`);
      return false;
    }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      Logger.error(`[Guard][JwtAuthGuard]: ${JSON.stringify(err)}`);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
