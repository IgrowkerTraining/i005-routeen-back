/**
 * @swagger
 * /api/athletes/{athlete}/exercise-history:
 *   get:
 *     summary: Obtener historial de ejercicios de un atleta
 *     tags:
 *       - ExerciseHistory
 *     parameters:
 *       - in: path
 *         name: athlete
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del atleta
 *     responses:
 *       200:
 *         description: Historial de ejercicios recuperado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExerciseHistory'
 *       400:
 *         description: Error de solicitud (ej. atleta no encontrado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Usuario no autorizado a ver esta información
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You can only view your own assigned routines.
 *       404:
 *         description: No se encontró historial de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No exercise history found for this athlete
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { MongooseError } from "mongoose";
import ExerciseHistory from "@/models/ExerciseHistory";

export async function GET(req: Request, context: any) {
  try {
    await connect();
    const user = await getCurrentUser();
    const athlete_id = context.params.athlete;

    const athlete = await Athlete.findById(athlete_id);
    console.log("Athlete found: ", athlete);
    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 400 }
      );
    }

    if (user.role === "athlete") {
      if (user.id !== athlete_id) {
        return NextResponse.json(
          { message: "You can only view your own assigned routines." },
          { status: 403 }
        );
      }
    }

    if (user.role === "trainer") {
      if (athlete.trainer_id.toString() !== user.id) {
        return NextResponse.json(
          {
            message:
              "You can only view the assigned routines of this specific athlete.",
          },
          { status: 403 }
        );
      }
    }

    const history = await ExerciseHistory.find({ athlete_id })
      .sort({ date: -1 })
      .populate("exercise_id", "name");

    if (!history.length) {
      return NextResponse.json(
        { message: "No exercise history found for this athlete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ history }, { status: 200 });
  } catch (error: any) {
    if (error instanceof MongooseError) {
      return NextResponse.json(
        { message: "Database Error: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
