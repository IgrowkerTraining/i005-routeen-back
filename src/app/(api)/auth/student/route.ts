import connect from "@/lib/db";
import { otp_validate } from "@/lib/otp_validate";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { otp_code } = await req.json()

        const user = await Student.findOne({ otp_code })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 400 })
        }

        const otp = await otp_validate(user.otp_code)

        if (!otp) {
            return NextResponse.json({ message: "OTP code is not valid" }, { status: 400 })
        }

        const payload = { id: user._id, email: user.email, name: user.name }

        const token = jwt.sign(payload, "hola", { expiresIn: "1d" })

        return NextResponse.json({ token, user }, { status: 200 })

    } catch (error: any) {
        return new NextResponse("Error in fetching users" + error.message, {
            status: 500
        })
    }
}