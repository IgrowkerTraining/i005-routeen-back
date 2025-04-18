import { NextResponse } from "next/server";
import connect from "@/lib/db";
import RoutineAssigned from "@/models/RoutineAssigned";
import { otp_validate } from "@/lib/otp_validate";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: { athlete_id: string } }) {
    try {
        await connect();

        const user = await getCurrentUser();

        if (user.role == 'athlete' || user.role == 'trainer') {
            return NextResponse.json({ message: "You must be an athlete or a trainer to view routine history." }, { status: 403 });
        }

        const athlete_id = user.id;

        const isValidOtp = await otp_validate(user.id);
        if (!isValidOtp) {
            return NextResponse.json({ message: "OTP has expired or is invalid." }, { status: 403 });
        }

        const routinesAssigned = await RoutineAssigned.find({ athlete_id }).populate('routine_id');

        if (routinesAssigned.length === 0) {
            return NextResponse.json({ message: "No routines assigned to this athlete." }, { status: 404 });
        }

        return NextResponse.json({ routinesAssigned }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching assigned routines: " + error.message, { status: 500 });
    }
}