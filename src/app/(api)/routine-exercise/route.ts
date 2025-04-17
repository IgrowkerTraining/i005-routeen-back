import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import RoutineExercise from "@/models/RoutineExercise";
import { NextResponse } from "next/server";

interface RoutineExerciseBody {
  routine_id: string;
  exercise_id: string;
  reps?: number;
  series?: number;
  weight_kg?: number;
  rest_time_s?: number;
  desired_order?: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  await connect();

  try {
    const body: RoutineExerciseBody = await request.json();
    const {
      routine_id,
      exercise_id,
      reps,
      series,
      weight_kg,
      rest_time_s,
      desired_order,
    } = body;

    const exerciseData = {
      routine_id,
      exercise_id,
      reps,
      series,
      weight_kg,
      rest_time_s,
    };

    const existingExercises = await RoutineExercise.find({ routine_id }).sort({
      order: 1,
    });

    let newOrder: number;

    if (desired_order == null) {
      newOrder = existingExercises.length + 1;
    } else {
      newOrder = Math.max(
        1,
        Math.min(desired_order, existingExercises.length + 1)
      );

      for (let i = existingExercises.length - 1; i >= newOrder - 1; i--) {
        existingExercises[i].order = existingExercises[i].order + 1;
        await existingExercises[i].save();
      }
    }

    const newRoutineExercise = new RoutineExercise({
      ...exerciseData,
      order: newOrder,
    });

    await newRoutineExercise.save();
    await normalizeOrder(routine_id);

    return NextResponse.json(
      { success: true, data: newRoutineExercise },
      { status: 201 }
    );
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}

async function normalizeOrder(routine_id: string) {
  const exercises = await RoutineExercise.find({ routine_id }).sort({
    order: 1,
  });
  for (let i = 0; i < exercises.length; i++) {
    if (exercises[i].order !== i + 1) {
      exercises[i].order = i + 1;
      await exercises[i].save();
    }
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  await connect();

  try {
    const { searchParams } = new URL(request.url);
    const routine_id = searchParams.get("routine_id");
    const category_id = searchParams.get("category");

    if (!routine_id) {
      return NextResponse.json(
        { message: "Missing routine_id in query" },
        { status: 400 }
      );
    }

    const exercises = await RoutineExercise.find({ routine_id })
      .sort({ order: 1 })
      .populate({
        path: "exercise_id",
        populate: {
          path: "category_id",
          model: "Category",
        },
      });

    const filtered = category_id
      ? exercises.filter(
          (e) =>
            e.exercise_id &&
            e.exercise_id.category &&
            e.exercise_id.category._id.toString() === category_id
        )
      : exercises;

    return NextResponse.json(
      { success: true, data: filtered },
      { status: 200 }
    );
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  await connect();

  try {
    const { searchParams } = new URL(request.url);
    const routineExercise_id = searchParams.get("id");

    if (!routineExercise_id) {
      return NextResponse.json(
        { message: "Missing id in query" },
        { status: 400 }
      );
    }

    const body: RoutineExerciseBody = await request.json();
    const { desired_order, ...updateFields } = body;

    const routineExercise = await RoutineExercise.findById(routineExercise_id);
    if (!routineExercise) {
      return NextResponse.json(
        { message: "RoutineExercise not found" },
        { status: 404 }
      );
    }

    const routine_id = routineExercise.routine_id;

    if (desired_order != null) {
      const existingExercises = await RoutineExercise.find({ routine_id }).sort(
        { order: 1 }
      );

      const currentIndex = existingExercises.findIndex(
        (ex) => ex._id.toString() === routineExercise_id
      );

      if (currentIndex === -1) {
        return NextResponse.json(
          { message: "Exercise not found in routine" },
          { status: 404 }
        );
      }

      const currentOrder = existingExercises[currentIndex].order;
      const newOrder = Math.max(
        1,
        Math.min(desired_order, existingExercises.length)
      );

      if (newOrder !== currentOrder) {
        for (const ex of existingExercises) {
          if (ex._id.toString() === routineExercise_id) continue;

          if (
            newOrder < currentOrder &&
            ex.order >= newOrder &&
            ex.order < currentOrder
          ) {
            ex.order += 1;
            await ex.save();
          } else if (
            newOrder > currentOrder &&
            ex.order <= newOrder &&
            ex.order > currentOrder
          ) {
            ex.order -= 1;
            await ex.save();
          }
        }

        routineExercise.order = newOrder;
      }
    }

    Object.assign(routineExercise, updateFields);
    await routineExercise.save();

    await normalizeOrder(routine_id.toString());

    return NextResponse.json(
      { success: true, data: routineExercise },
      { status: 200 }
    );
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  await connect();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing id in query" },
        { status: 400 }
      );
    }

    const routineExercise = await RoutineExercise.findById(id);
    if (!routineExercise) {
      return NextResponse.json(
        { message: "RoutineExercise not found" },
        { status: 404 }
      );
    }

    const routine_id = routineExercise.routine_id;

    await routineExercise.deleteOne();

    await normalizeOrder(routine_id.toString());

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}
