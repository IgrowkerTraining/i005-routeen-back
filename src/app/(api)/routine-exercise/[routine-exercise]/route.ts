/**
 * @swagger
 * /api/routine-exercise/{routine-exercise}:
 *   patch:
 *     tags:
 *       - RoutineExercise
 *     summary: Actualizar la relación entre rutina y ejercicio
 *     description: Permite actualizar los detalles de un ejercicio dentro de una rutina, como repeticiones, series, peso, descanso y orden.
 *     parameters:
 *       - in: path
 *         name: routine-exercise
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ejercicio de la rutina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reps:
 *                 type: number
 *                 description: Número de repeticiones.
 *                 example: 15
 *               series:
 *                 type: number
 *                 description: Número de series.
 *                 example: 4
 *               weight_kg:
 *                 type: number
 *                 description: Peso en kilogramos.
 *                 example: 25
 *               rest_time_s:
 *                 type: number
 *                 description: Tiempo de descanso en segundos.
 *                 example: 90
 *               desired_order:
 *                 type: number
 *                 description: Nuevo orden deseado del ejercicio en la rutina.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Relación actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/RoutineExercise"
 *       400:
 *         description: Error en la petición (falta ID o parámetros incorrectos)
 *       404:
 *         description: No se encontró el ejercicio en la rutina
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/routine-exercise/{routine-exercise}:
 *   get:
 *     tags:
 *       - RoutineExercise
 *     summary: Obtener los detalles de un ejercicio dentro de una rutina
 *     description: Retorna la información completa de un ejercicio dentro de una rutina, incluyendo los detalles del ejercicio asociado.
 *     parameters:
 *       - in: path
 *         name: routine-exercise
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ejercicio de la rutina
 *     responses:
 *       200:
 *         description: Detalles del ejercicio dentro de la rutina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/RoutineExercise"
 *       400:
 *         description: Error en la solicitud (falta ID o es inválido)
 *       404:
 *         description: No se encontró el ejercicio en la rutina
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/routine-exercise/{routine-exercise}:
 *   delete:
 *     tags:
 *       - RoutineExercise
 *     summary: Eliminar un ejercicio de una rutina
 *     description: Permite eliminar un ejercicio de la rutina y ajustar el orden de los ejercicios restantes.
 *     parameters:
 *       - in: path
 *         name: routine-exercise
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ejercicio de la rutina
 *     responses:
 *       200:
 *         description: Ejercicio eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error en la solicitud (falta ID o es inválido)
 *       404:
 *         description: No se encontró el ejercicio en la rutina
 *       500:
 *         description: Error interno del servidor
 */

import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { normalizeOrder } from "@/lib/normalizeOrder";
import validate from "@/lib/validate";
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

export async function PATCH(
  request: Request,
  context: any
): Promise<NextResponse> {
  await connect();

  try {
    const routineExerciseId = context.params["routine-exercise"];

    if (!routineExerciseId) {
      return NextResponse.json(
        { message: "Missing routineExercise ID in route" },
        { status: 400 }
      );
    }

    try {
      validate.isValidObjectId(routineExerciseId);
    } catch (validationError) {
      return NextResponse.json(
        { message: (validationError as Error).message },
        { status: 400 }
      );
    }

    const body: RoutineExerciseBody = await request.json();
    const { desired_order, ...updateFields } = body;

    const routineExercise = await RoutineExercise.findById(routineExerciseId);
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
        (ex) => ex._id.toString() === routineExerciseId
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
          if (ex._id.toString() === routineExerciseId) continue;

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

export async function GET(
  request: Request,
  context: any
): Promise<NextResponse> {
  await connect();

  try {
    const routineExerciseId = context.params["routine-exercise"];

    if (!routineExerciseId) {
      return NextResponse.json(
        { message: "Missing routineExercise ID in route" },
        { status: 400 }
      );
    }

    try {
      validate.isValidObjectId(routineExerciseId);
    } catch (validationError) {
      return NextResponse.json(
        { message: (validationError as Error).message },
        { status: 400 }
      );
    }

    const routineExercise = await RoutineExercise.findById(
      routineExerciseId
    ).populate("exercise_id");

    if (!routineExercise) {
      return NextResponse.json(
        { message: "RoutineExercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: routineExercise },
      { status: 200 }
    );
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: Request,
  context: any
): Promise<NextResponse> {
  await connect();

  try {
    const routineExerciseId = context.params["routine-exercise"];

    if (!routineExerciseId) {
      return NextResponse.json(
        { message: "Missing routineExercise ID in route" },
        { status: 400 }
      );
    }

    try {
      validate.isValidObjectId(routineExerciseId);
    } catch (validationError) {
      return NextResponse.json(
        { message: (validationError as Error).message },
        { status: 400 }
      );
    }

    const routineExercise = await RoutineExercise.findById(routineExerciseId);
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
