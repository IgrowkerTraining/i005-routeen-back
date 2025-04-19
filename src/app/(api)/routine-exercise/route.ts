/**
 * @swagger
 * /api/routine-exercise:
 *   post:
 *     tags:
 *       - RoutineExercise
 *     summary: Crear una nueva relación entre rutina y ejercicio
 *     description: Crea un nuevo ejercicio para una rutina, asignándole un orden y otros parámetros como repeticiones, series, peso y tiempo de descanso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routine_id:
 *                 type: string
 *                 description: ID de la rutina.
 *                 example: "661e44679aa304a9e269a0eb"
 *               exercise_id:
 *                 type: string
 *                 description: ID del ejercicio.
 *                 example: "661e44169aa304a9e269a0e4"
 *               reps:
 *                 type: number
 *                 description: Número de repeticiones.
 *                 example: 12
 *               series:
 *                 type: number
 *                 description: Número de series.
 *                 example: 3
 *               weight_kg:
 *                 type: number
 *                 description: Peso en kilogramos.
 *                 example: 20
 *               rest_time_s:
 *                 type: number
 *                 description: Tiempo de descanso en segundos.
 *                 example: 60
 *               desired_order:
 *                 type: number
 *                 description: Orden deseado del ejercicio en la rutina.
 *                 example: 2
 *     responses:
 *       201:
 *         description: Relación creada correctamente
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
 *         description: Error en la petición
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/routine-exercise:
 *   get:
 *     tags:
 *       - RoutineExercise
 *     summary: Obtener los ejercicios de una rutina
 *     description: Retorna todos los ejercicios asociados a una rutina, ordenados por su posición en la misma.
 *     parameters:
 *       - in: query
 *         name: routine_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la rutina
 *     responses:
 *       200:
 *         description: Lista de ejercicios de la rutina
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/RoutineExercise"
 *       400:
 *         description: Falta routine_id o es inválido
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

export async function GET(request: Request): Promise<NextResponse> {
  await connect();

  try {
    const { searchParams } = new URL(request.url);
    const routine_id = searchParams.get("routine_id");

    if (!routine_id) {
      return NextResponse.json(
        { message: "Missing routine_id in query" },
        { status: 400 }
      );
    }

    try {
      validate.isValidObjectId(routine_id);
    } catch (validationError) {
      return NextResponse.json(
        { message: (validationError as Error).message },
        { status: 400 }
      );
    }

    const exercises = await RoutineExercise.find({ routine_id })
      .sort({ order: 1 })
      .populate({ path: "exercise_id" });

    return NextResponse.json(
      { success: true, data: exercises },
      { status: 200 }
    );
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
}
