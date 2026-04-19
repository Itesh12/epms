import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const message = 'Request successful'; // Can be customized if needed
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: data?.message || message,
        data: data?.data !== undefined ? data.data : data,
      })),
    );
  }
}
