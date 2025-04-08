import connect from "@/lib/db";
import validate from "@/lib/validate";
import Athlete from "@/models/Athlete";
import Otp from "@/models/Otp";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { otp_code } = await req.json()
        validate.isValidOTP(otp_code)

        const otp = await Otp.findOne({ otp_code })
        if (!otp) {
            return NextResponse.json({ message: "OTP not found" }, { status: 400 });
        }

        const now = new Date();
        if (otp.otp_end_date < now) {
            return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
        }

        const athlete = await Athlete.findById(otp.athlete_id);
        if (!athlete) {
            return NextResponse.json({ message: "Associated student not found" }, { status: 400 });
        }

        const payload = { id: athlete._id, role: athlete.role, name: athlete.name }

        const token = jwt.sign(payload, "hola", { expiresIn: "1d" })

        return NextResponse.json({ token, athlete }, { status: 200 })

    } catch (error: any) {
        return new NextResponse("Error in fetching student" + error.message, {
            status: 500
        })
    }
}