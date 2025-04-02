import { NextResponse } from "next/server";
import Trainer from "@/models/Trainer";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";

export async function GET() {
    return NextResponse.json({ error: "Hola" }, { status: 200 });
}

export async function POST(req: Request) {
    try {
        await connect()
        const { name, email, password, repeat_password, phone, date_birth } = await req.json()

        if (password !== repeat_password) {
            return NextResponse.json({ message: "passwords dont match. It should be the same" }, { status: 400 })
        }

        const user = await Trainer.findOne({ email })
        if (user) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const hash_password = bcrypt.hashSync(password, 10)
        const newTrainer = await Trainer.create({ name, email, password: hash_password, phone, date_birth })

        return NextResponse.json({ message: "Trainer had been created", status: 201 })
    } catch (error) {
        console.log(error)
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }
        return new NextResponse("There was an error creating a Trainer")
    }
}
