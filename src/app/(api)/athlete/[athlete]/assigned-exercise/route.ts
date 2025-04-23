import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import validate from "@/lib/validate";
import AssignedExercise from "@/models/AssignedExercise";
import RoutineAssigned from "@/models/RoutineAssigned";
import "@/models/Exercise";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  context: any
): Promise<NextResponse> => {
  try {
    await connect();

    const user = await getCurrentUser();
    const athleteId = context.params["athlete"];

    validate.isValidObjectId(athleteId);

    const isAthleteAccessingOwnData =
      user.role === "athlete" && user.id === athleteId;
    const isTrainer = user.role === "trainer";

    if (!isAthleteAccessingOwnData && !isTrainer) {
      return NextResponse.json(
        {
          message:
            "Unauthorized. Only the athlete or a trainer can access this data.",
        },
        { status: 403 }
      );
    }

    const routines = await RoutineAssigned.find({
      athlete_id: athleteId,
    }).select("_id");
    const routineIds = routines.map((r) => r._id);

    if (routineIds.length === 0) {
      return NextResponse.json({ assignedExercises: [] }, { status: 200 });
    }

    const assignedExercises = await AssignedExercise.find({
      assigned_routine_id: { $in: routineIds },
    }).populate({
      path: "exercise_id",
    });
    return NextResponse.json({ assignedExercises }, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
};
