import { createParamDecorator, ExecutionContext } from "@nestjs/common";

type JwtUser = {
  sub: string;
  email: string;
  role: string;
};

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
