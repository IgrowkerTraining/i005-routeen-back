import connect from "@/lib/db";
import Trainer from "@/models/Trainer";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export const GET = async (req: Request, { params }: { params: { trainer: string, student: string } }) => {
    try {
        const trainerId = params.trainer;
        const studentId = params.student;
        validate.isValidObjectId(trainerId)
        validate.isValidObjectId(studentId)
        await connect()

        const trainer = await Trainer.findById(trainerId)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const student = await Student.findById(studentId)
        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 400 })
        }

        return NextResponse.json(student, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in getting student" + error.message, {
            status: 500
        })
    }
}