import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get("token")?.value

        if (!token) {
            return NextResponse.json({ message: "Token not found" }, { status: 400 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        return NextResponse.json({ user: decoded }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Error in fetching user" }, { status: 500 })
    }
}