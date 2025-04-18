import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";

export async function GET(req: Request) {
    try {
        await connect();
        const user = await getCurrentUser();

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be a trainer to search athletes." }, { status: 403 });
        }

        const url = new URL(req.url);
        const name = url.searchParams.get('name');

        if (!name) {
            return NextResponse.json({ message: "Athlete name is required" }, { status: 400 });
        }

        const athletes = await Athlete.find({ name: { $regex: name, $options: 'i' } });

        if (athletes.length === 0) {
            return NextResponse.json({ message: "No athletes found with this name." }, { status: 404 });
        }

        return NextResponse.json({ athletes }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in searching athletes: " + error.message, { status: 500 });
    }
}
