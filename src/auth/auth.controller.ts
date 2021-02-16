import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/signup")
    signUp(
        @Body(new ValidationPipe({ transform: true }))
        authCredentialsDto: AuthCredentialsDto
    ): Promise<void> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post("/signin")
    signIn(
        @Body(new ValidationPipe({ transform: true }))
        authCredentialsDto: AuthCredentialsDto
    ): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentialsDto);
    }
}
