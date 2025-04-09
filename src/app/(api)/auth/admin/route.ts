import connect from "@/lib/db";
import validate from "@/lib/validate";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { createTokenCookie } from "@/lib/cookies";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { email, password } = await req.json()
        validate.isValidEmail(email)

        const user = await Admin.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: "Admin not found" }, { status: 400 })
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Incorrect password" }, { status: 400 })
        }

        const payload = { id: user._id, role: user.role, name: user.name }


        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });

        const res = NextResponse.json({ message: "Admin logged", user }, { status: 200 });
        res.headers.set("Set-Cookie", createTokenCookie(token));

        return res;

    } catch (error: any) {
        return new NextResponse("Error in logging Admin" + error.message, {
            status: 500
        })
    }
}
