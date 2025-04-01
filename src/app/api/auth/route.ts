import { AuthenticateUser } from "@/Auth/application";
import {
  AuthController,
  InMemoryAuthRepository,
  JwtTokenService,
} from "@/Auth/infrastructure";

const authRepository = new InMemoryAuthRepository();
const tokenService = new JwtTokenService();
const authenticateUser = new AuthenticateUser(authRepository, tokenService);
const authController = new AuthController(authenticateUser);

export const POST = async (request: Request) => authController.login(request);
