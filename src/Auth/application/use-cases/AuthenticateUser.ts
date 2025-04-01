import { AuthRepository } from "@/Auth/domain";
import { TokenService } from "../services";

export class AuthenticateUser {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(email: string, password: string): Promise<string> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return this.tokenService.generateToken({ id: user.id, email: user.email });
  }
}
