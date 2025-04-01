import { AuthRepository, AuthUser } from "@/Auth/domain";

export class InMemoryAuthRepository implements AuthRepository {
  private users: AuthUser[] = [
    {
      id: "1",
      name: "miguel",
      last_name: "duran",
      email: "admin@example.com",
      password: "$2a$10$ENTL5G8GzSXORBWL2dhyhe9zVi99qHTJJ9HzyV1T8wMgpetRWom..",
    },
  ];
  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) || null;
  }
}
