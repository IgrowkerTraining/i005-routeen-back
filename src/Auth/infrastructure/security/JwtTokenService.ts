import jwt from "jsonwebtoken";
import { TokenService } from "@/Auth/application";

export class JwtTokenService implements TokenService {
  generateToken<T>(payload: T): string {
    return jwt.sign(payload as object, "jwt_secret", {
      expiresIn: "2h",
    });
  }
}
