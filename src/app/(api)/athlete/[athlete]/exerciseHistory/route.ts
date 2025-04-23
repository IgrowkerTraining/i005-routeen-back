import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { MongooseError } from "mongoose";
import ExerciseHistory from "@/models/ExerciseHistory";

export async function GET(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const athlete_id = context.params.athlete;

        const athlete = await Athlete.findById(athlete_id)
        console.log("Athlete found: ", athlete);
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        if (user.role === 'athlete') {
            if (user.id !== athlete_id) {
                return NextResponse.json({ message: "You can only view your own assigned routines." }, { status: 403 });
            }
        }

        if (user.role === 'trainer') {
            if (athlete.trainer_id.toString() !== user.id) {
                return NextResponse.json({ message: "You can only view the assigned routines of this specific athlete." }, { status: 403 });
            }
        }

        const history = await ExerciseHistory.find({ athlete_id }).sort({ date: -1 });

        if (!history.length) {
            return NextResponse.json({ message: "No exercise history found for this athlete" }, { status: 404 });
        }

        return NextResponse.json({ history }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "Database Error: " + error.message }, { status: 500 });
        }

        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}