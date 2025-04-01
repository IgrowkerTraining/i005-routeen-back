export interface TokenService {
  generateToken<T>(payload: T): string;
}
