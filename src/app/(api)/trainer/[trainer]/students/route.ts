import connect from "@/lib/db";
import Trainer from "@/models/Trainer";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export const GET = async (req: Request, { params }: { params: { trainer: string } }) => {
    try {
        const trainerId = params.trainer;
        validate.isValidObjectId(trainerId)
        await connect()

        const trainer = await Trainer.findById(trainerId)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const students = await Student.find({ trainer_id: trainerId })
        if (!students) {
            return NextResponse.json({ message: "Students not found" }, { status: 400 })
        }

        return NextResponse.json(students, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching trainer" + error.message, {
            status: 500
        })
    }
}