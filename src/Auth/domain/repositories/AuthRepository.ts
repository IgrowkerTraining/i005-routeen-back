import { AuthUser } from "../entities";

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
}
