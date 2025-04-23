/**
 * @swagger
 * /athlete/{athlete}/weightHistory:
 *   post:
 *     summary: Agrega una entrada al historial de peso del atleta
 *     tags:
 *       - Weight History
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 example: 75.5
 *                 description: Peso del atleta
 *             required:
 *               - weight
 *     responses:
 *       201:
 *         description: Historial de peso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     athlete_id:
 *                       type: string
 *                     weight:
 *                       type: number
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: number
 *       400:
 *         description: Datos inválidos o atleta no encontrado
 *       403:
 *         description: No autorizado para realizar esta acción
 *       500:
 *         description: Error en la base de datos
 */

/**
 * @swagger
 * /athlete/{athlete}/weightHistory:
 *   get:
 *     summary: Obtener historial de peso de un atleta
 *     tags:
 *       - Weight History
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de peso obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weightProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       athlete_id:
 *                         type: string
 *                       weight:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: number
 *       404:
 *         description: No se encontró historial de peso para este atleta
 *       500:
 *         description: Error interno del servidor
 */

import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { MongooseError } from "mongoose";
import ExerciseHistory from "@/models/ExerciseHistory";
import RoutineAssigned from "@/models/RoutineAssigned";
import AssignedExercise from "@/models/AssignedExercise";

export async function POST(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const athlete_id = context.params.athlete
        const routineAssigned_id = context.params.routineAssigned

        if (user.id !== athlete_id) {
            return NextResponse.json(
                { error: "You are not allowed to make this action" },
                { status: 403 }
            );
        }

        const athlete = await Athlete.findById(athlete_id)
        if (!athlete) {
            return NextResponse.json({ message: "Athelete not found" }, { status: 400 })
        }

        const routineAssigned = await RoutineAssigned.findById(routineAssigned_id)
        if (!routineAssigned) {
            return NextResponse.json({ message: "Routine Assigned not found" }, { status: 400 })
        }

        const assignedExercises = await AssignedExercise.find({ assigned_routine_id: routineAssigned_id });

        console.log(assignedExercises)
        if (!assignedExercises.length) {
            return NextResponse.json({ message: "No assigned exercises found" }, { status: 404 });
        }

        const exerciseHistoryEntries = await Promise.all(
            assignedExercises.map(async (exercise: any) => {
                return ExerciseHistory.create({
                    athlete_id,
                    exercise_id: exercise.exercise_id,
                    exercise_assigned_id: exercise._id,
                    reps: exercise.reps,
                    series: exercise.series,
                    weight_kg: exercise.weight_kg,
                    completed: exercise.completed,
                });
            })
        );

        return NextResponse.json(
            { message: "Exercise history created successfully", exerciseHistoryEntries },
            { status: 201 }
        );

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "Database Error" + error.message }, { status: 500 });
        }

        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}