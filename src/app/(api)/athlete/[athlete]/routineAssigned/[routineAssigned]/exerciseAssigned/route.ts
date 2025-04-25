import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import validate from "@/lib/validate";
import AssignedExercise from "@/models/AssignedExercise";
import RoutineAssigned from "@/models/RoutineAssigned";
import { NextResponse } from "next/server";


export const GET = async (
    req: Request,
    context: any
): Promise<NextResponse> => {
    try {
        await connect();

        const athleteId = context.params["athlete"];
        const routineId = context.params["routineAssigned"];

        validate.isValidObjectId(athleteId);
        validate.isValidObjectId(routineId);

        const routine = await RoutineAssigned.findOne({
            _id: routineId,
            athlete_id: athleteId,
        });

        if (!routine) {
            return NextResponse.json(
                { message: "Routine not found for this athlete." },
                { status: 404 }
            );
        }

        const assignedExercises = await AssignedExercise.find({
            assigned_routine_id: routineId,
        }).populate({
            path: "exercise_id",
        });

        return NextResponse.json({ assignedExercises }, { status: 200 });

    } catch (error: unknown) {
        const { message, status } = handleError(error);
        return NextResponse.json({ message }, { status });
    }
};
