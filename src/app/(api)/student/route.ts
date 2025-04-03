import { NextResponse } from "next/server";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { MongooseError, Types } from "mongoose";
import Trainer from "@/models/Trainer";

const { ObjectId } = Types

export async function POST(req: Request) {
    try {
        await connect()
        const { name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id } = await req.json()

        if (!ObjectId.isValid(trainer_id)) {
            return NextResponse.json({ message: "ObjectId is not valid" }, { status: 400 })
        }

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const emailUser = await Student.findOne({ email })
        if (emailUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const phoneUser = await Student.findOne({ phone })
        if (phoneUser) {
            return NextResponse.json({ phone: "phone already used" }, { status: 400 })
        }

        const newStudent = await Student.create({ name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id })

        return NextResponse.json({ message: "Student had been created", status: 201 })

    } catch (error) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }
        return new NextResponse("There was an error creating a Student")
    }
}