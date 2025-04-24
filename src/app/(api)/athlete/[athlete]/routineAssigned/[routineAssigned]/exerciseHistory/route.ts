/**
 * @swagger
 * /api/athletes/{athlete}/routineAssigned/{routineAssigned}/exerciseHistory:
 *   post:
 *     summary: Crea el historial de ejercicios desde una rutina asignada
 *     tags:
 *       - ExerciseHistory
 *     parameters:
 *       - in: path
 *         name: athlete
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del atleta
 *       - in: path
 *         name: routineAssigned
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la rutina asignada
 *     responses:
 *       201:
 *         description: Historial de ejercicios creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exercise history created successfully
 *                 exerciseHistoryEntries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       athlete_id:
 *                         type: string
 *                       exercise_id:
 *                         type: string
 *                       exercise_assigned_id:
 *                         type: string
 *                       reps:
 *                         type: number
 *                       series:
 *                         type: number
 *                       weight_kg:
 *                         type: number
 *                       completed:
 *                         type: boolean
 *       400:
 *         description: Error de solicitud o entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Acción no permitida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You are not allowed to make this action
 *       404:
 *         description: No se encontraron ejercicios asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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