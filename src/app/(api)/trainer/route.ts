import { NextResponse } from "next/server";
import Trainer from "@/models/Trainer";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";

export async function POST(req: Request) {
    try {
        await connect()
        const { name, email, password, repeat_password, phone, date_birth } = await req.json()

        validate.isValidName(name)
        validate.isValidEmail(email)
        validate.isValidPassword(password)
        validate.isValidPassword(repeat_password)
        validate.isValidPhone(phone)
        validate.isValidDate(date_birth)

        if (password !== repeat_password) {
            return NextResponse.json({ message: "passwords dont match. It should be the same" }, { status: 400 })
        }

        const user = await Trainer.findOne({ email })
        if (user) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const hash_password = bcrypt.hashSync(password, 10)
        const newTrainer = await Trainer.create({ name, email, password: hash_password, phone, date_birth })

        return NextResponse.json({ message: "Trainer had been created", newTrainer, status: 201 })
    } catch (error: any) {
        console.log(error)
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }

        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}

export const GET = async () => {
    try {
        await connect()
        const users = await Trainer.find()
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching users" + error.message, {
            status: 500
        })
    }
}