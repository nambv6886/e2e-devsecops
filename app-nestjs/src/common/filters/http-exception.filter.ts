import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MessageCode } from '../constants/message-code.constant';
import { ResponseMessage } from 'src/models/interfaces/response.message.model';

@Catch()
export class ExceptionsFilterFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const exceptionResponse =
        exception instanceof HttpException
          ? (exception.getResponse() as any)
          : null;

      let message = exceptionResponse.message;
      if (exceptionResponse?.message) {
        if (Array.isArray(exceptionResponse.message)) {
          message = exceptionResponse.message.join(',');
        }
      } else {
        message = exceptionResponse?.message;
      }

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            messageCode: message,
          });
          break;
        case HttpStatus.NOT_FOUND:
          response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            messageCode: message,
          });
          break;
        case 403:
          response.status(HttpStatus.FORBIDDEN).json(
            new ResponseMessage({
              messageCode: MessageCode.AUTHORIZATION_FORBIDDEN_RESOURCE,
              status: HttpStatus.FORBIDDEN,
            }),
          );
          break;
        default:
          response.status(status).json({
            statusCode: status,
            messageCode: MessageCode.INTERNAL_SERVER_ERROR,
          });
      }
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        messageCode: MessageCode.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
