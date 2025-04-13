import { NextResponse } from "next/server";
import Routine from "@/models/Routine";
import Trainer from "@/models/Trainer";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req:Request) {
    try {
        await connect()
        const data = await req.formData();
        const user = await getCurrentUser();

        const trainer_id = user.id
        const name = data.get("name")?.toString() || "";
        const description = data.get("description")?.toString() || "";

        validate.isValidName(name)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const newRoutine = await Routine.create({ name, description, trainer_id })

        return NextResponse.json({ message: "Routine had been created", newRoutine, status: 201 })

    } catch (creationError: any) {
        console.error("Routine creation error:", creationError);
        
        return NextResponse.json({
            message: "Error creating routine: " + creationError.message,
            error: creationError,
        }, { status: 400 });
    }
}