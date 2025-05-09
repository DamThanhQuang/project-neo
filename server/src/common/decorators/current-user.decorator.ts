import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('Request user in decorator:', request.user); // Thêm log để debug
    // Kiểm tra đảm bảo request.user và request.user.id tồn tại
    if (!request.user) {
      console.error('User not found in request!');
      return null;
    }
    // Trả về user ID từ request
    return request.user.id || request.user._id;
  },
);
