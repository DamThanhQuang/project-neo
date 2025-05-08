import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Trả về user ID từ request
    // Tùy thuộc vào cách bạn lưu trữ thông tin người dùng (thường là từ JWT token)
    return request.user?.id;
  },
);
