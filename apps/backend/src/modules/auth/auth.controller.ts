import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, UpdateProfileDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { sub: string }) {
    return this.authService.getProfile(user.sub);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  patchMe(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.sub, dto);
  }
}
