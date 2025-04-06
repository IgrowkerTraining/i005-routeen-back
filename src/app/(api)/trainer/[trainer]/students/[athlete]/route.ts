import connect from "@/lib/db";
import Trainer from "@/models/Trainer";
import Athlete from "@/models/Athlete";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export const GET = async (req: Request, { params }: { params: { trainer: string, student: string } }) => {
    try {
        const trainerId = params.trainer;
        const athleteId = params.student;
        validate.isValidObjectId(trainerId)
        validate.isValidObjectId(athleteId)
        await connect()

        const trainer = await Trainer.findById(trainerId)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const athlete = await Athlete.findById(athleteId)
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        return NextResponse.json(athlete, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in getting athlete" + error.message, {
            status: 500
        })
    }
}