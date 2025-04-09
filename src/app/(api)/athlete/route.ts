import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import Trainer from "@/models/Trainer";
import validate from "@/lib/validate";

export async function POST(req: Request) {
    try {
        await connect()
        const { name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id } = await req.json()

        validate.isValidName(name)
        validate.isValidEmail(email)
        validate.isValidPhone(phone)
        validate.isValidDate(date_birth)
        validate.isValidObjectId(trainer_id)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const emailUser = await Athlete.findOne({ email })
        if (emailUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const phoneUser = await Athlete.findOne({ phone })
        if (phoneUser) {
            return NextResponse.json({ phone: "phone already used" }, { status: 400 })
        }

        const newAthlete = await Athlete.create({ name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id })

        return NextResponse.json({ message: "Student had been created", newAthlete, status: 201 })

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }
        return NextResponse.json({ message: "There was an error creating a Student" + error.message }, { status: 500 })
    }
}
export const GET = async () => {
    try {
        await connect()
        const users = await Athlete.find()
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching users" + error.message, {
            status: 500
        })
    }
}