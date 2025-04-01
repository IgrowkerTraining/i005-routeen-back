import { AuthenticateUser } from "@/Auth/application";
import { NextResponse } from "next/server";

export class AuthController {
  constructor(private readonly authenticateUser: AuthenticateUser) {}

  async login(req: Request) {
    try {
      const { email, password } = await req.json();
      const token = await this.authenticateUser.execute(email, password);
      return NextResponse.json({ token }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }
}
