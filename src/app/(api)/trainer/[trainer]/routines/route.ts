import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Routine from "@/models/Routine";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: { trainer_id: string } }) {
    try {
        await connect();
        const user = await getCurrentUser();

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be an trainer to view your created routines." }, { status: 403 });
        }

        const trainer_id = user.id; 
        
        const routines = await Routine.find({ trainer_id });

        if (routines.length === 0) {
            return NextResponse.json({ message: "No routines created for this trainer." }, { status: 404 });
        }

        return NextResponse.json({ routines }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching routines: " + error.message, { status: 500 });
    }
}