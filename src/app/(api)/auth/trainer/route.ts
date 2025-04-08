import { corsOptionsResponse } from "@/lib/corsOptions";
import connect from "@/lib/db";
import validate from "@/lib/validate";
import Trainer from "@/models/Trainer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { email, password } = await req.json()
        validate.isValidEmail(email)

        const user = await Trainer.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 400 })
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Incorrect password" }, { status: 400 })
        }

        const payload = { id: user._id, role: user.role, name: user.name }

        const token = jwt.sign(payload, "hola", { expiresIn: "1d" })

        return NextResponse.json({ token, user }, { status: 200 })

    } catch (error: any) {
        return new NextResponse("Error in creating trainer" + error.message, {
            status: 500
        })
    }
}

export const OPTIONS = corsOptionsResponse