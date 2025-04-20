import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import AssignedExercise from "@/models/AssignedExercise";
import RoutineAssigned from "@/models/RoutineAssigned";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any): Promise<NextResponse> {
  try {
    await connect();

    const user = await getCurrentUser();

    if (user.role !== "athlete") {
      return NextResponse.json(
        { message: "Unauthorized. Athlete role required" },
        { status: 403 }
      );
    }

    if (user.id !== context.params.athlete) {
      return NextResponse.json(
        { message: "Forbidden. Cannot access other athlete's data" },
        { status: 403 }
      );
    }

    const athleteId = context.params["athlete"];

    const routines = await RoutineAssigned.find({ athleteId }).select("_id");
    const routineIds = routines.map((r) => r._id);

    const assignedExercises = await AssignedExercise.find({
      assigned_routine_id: { $in: routineIds },
    }).populate("exercise_id");
    return NextResponse.json({ assignedExercises }, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}
