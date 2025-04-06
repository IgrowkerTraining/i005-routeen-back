import connect from "@/lib/db";
import { generateOTP } from "@/lib/otp";
import validate from "@/lib/validate";
import Otp from "@/models/Otp";
import Student from "@/models/Athlete";
import Trainer from "@/models/Trainer";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        await connect()

        const { trainer_id, athlete_id } = await req.json()

        validate.isValidObjectId(trainer_id)
        validate.isValidObjectId(athlete_id)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const athlete = await Student.findById(athlete_id)
        if (!athlete) {
            return NextResponse.json({ message: "Athelete not found" }, { status: 400 })
        }

        let otp;
        let isDuplicate;
        const MAX_ATTEMPTS = 10;
        let attempts = 0;

        do {
            otp = generateOTP()

            const existingOtp = await Otp.findOne({ code_otp: otp.code });
            isDuplicate = !!existingOtp;
            attempts++;

            if (attempts >= MAX_ATTEMPTS && isDuplicate) {
                return NextResponse.json({ message: "Failed to generate a unique OTP after several attempts" }, { status: 400 });
            }
        } while (isDuplicate)

        const otpRecord = await Otp.create({
            athlete_id: athlete_id,
            otp_code: otp.code,
            otp_start_date: new Date(),
            otp_end_date: otp.otp_end_date,
        })

        return NextResponse.json({ message: "OTP successfully created", otpRecord, status: 201 })
    } catch (error: any) {
        return new NextResponse("Error in creating otp " + error.message, {
            status: 500
        })
    }
}