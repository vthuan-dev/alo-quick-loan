import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserInfo {
  phoneNumber: string;
  userId: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
