import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import validate from "@/lib/validate";
import AssignedExercise from "@/models/AssignedExercise";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  context: any
): Promise<NextResponse> => {
  try {
    await connect();

    const user = await getCurrentUser();

    if (user.role !== "trainer") {
      return NextResponse.json(
        { message: "Unauthorized. Trainer role required" },
        { status: 403 }
      );
    }

    const assignedExerciseId = context.params["assigned-exercise"];

    validate.isValidObjectId(assignedExerciseId);

    const { order, reps, series, weight_kg, rest_time_s, completed } =
      await req.json();

    if (order !== undefined) validate.isValidNumber(order);
    if (reps !== undefined) validate.isValidNumber(reps);
    if (series !== undefined) validate.isValidNumber(series);
    if (weight_kg !== undefined) {
      validate.isValidWeight(weight_kg);
    }
    if (rest_time_s !== undefined) validate.isValidNumber(rest_time_s);
    if (completed !== undefined && typeof completed !== "boolean") {
      throw new Error("Invalid completed value. It must be a boolean.");
    }

    const updatedExercise = await AssignedExercise.findByIdAndUpdate(
      assignedExerciseId,
      { order, reps, series, weight_kg, rest_time_s, completed },
      { new: true }
    );

    if (!updatedExercise) {
      return NextResponse.json(
        { message: "Assigned exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedExercise, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
};
