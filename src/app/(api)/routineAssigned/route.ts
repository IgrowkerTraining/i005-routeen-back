/**
 * @swagger
 * /routineAssigned:
 *   post:
 *     summary: Asignar una rutina a un atleta específico
 *     tags:
 *       - RoutineAssigned
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               athlete_id:
 *                 type: string
 *                 example: "605c72ef1532072fb79e3c8d"
 *               routine_id:
 *                 type: string
 *                 example: "605c72ef1532072fb79e3c9f"
 *               description:
 *                 type: string
 *                 example: "Rutina personalizada para el atleta."
 *               assignment_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-01"
 *             required:
 *               - athlete_id
 *               - routine_id
 *     responses:
 *       201:
 *         description: Routine successfully assigned to athlete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine assigned successfully"
 *                 newRoutineAssigned:
 *                   type: object
 *                   properties:
 *                     routine_id:
 *                       type: string
 *                     athlete_id:
 *                       type: string
 *                     description:
 *                       type: string
 *                     assignment_date:
 *                       type: string
 *       400:
 *         description: Invalid request or missing parameters
 *       403:
 *         description: You are not authorized to assign routines to this athlete
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /routine-assigned:
 *   get:
 *     summary: Obtiene todas las rutinas asignadas
 *     tags:
 *       - RoutineAssigned
 *     responses:
 *       200:
 *         description: Lista de rutinas asignadas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   routine_id:
 *                     type: string
 *                   athlete_id:
 *                     type: string
 *                   description:
 *                     type: string
 *                   assignment_date:
 *                     type: string
 *       500:
 *         description: Error al obtener las rutinas asignadas
 */

import { NextResponse } from "next/server";
import RoutineAssigned from "@/models/RoutineAssigned";
import Routine from "@/models/Routine";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req:Request) {
    try { 
        await connect()

        const data = await req.formData();
        const user = await getCurrentUser();

        const trainer_id = user.id
        const athlete_id = data.get("athlete_id")?.toString() || "";
        const routine_id = data.get("routine_id")?.toString() || "";
        const customDescription  = data.get("description")?.toString() || "";
        const assignment_date  = data.get("assignment_date")?.toString() || "";
        
        validate.isValidDescription(customDescription)
        validate.isValidDate(assignment_date)

        if (!trainer_id) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be a trainer to assign assigned routines." }, { status: 403 });
        }

        if (!athlete_id) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        if (!routine_id) {
            return NextResponse.json({ message: "routine_id is required" }, { status: 400 });
        }

        const athlete = await Athlete.findById(athlete_id);
        if (athlete.trainer_id.toString() !== trainer_id) {
            return NextResponse.json({ message: "You can only assign routines to your own athletes." }, { status: 403 });
        }

        const originalRoutine = await Routine.findById(routine_id);
        if (!originalRoutine) {
            return NextResponse.json({ message: "Original routine not found" }, { status: 400 });
        }
        const description = customDescription || originalRoutine.description;

        const newRoutineAssigned = await RoutineAssigned.create({
            routine_id,
            athlete_id,
            description,
            assignment_date,
        });

        return NextResponse.json({ message: "Routine assigned was successfully assigned", newRoutineAssigned, status: 201 });

        
    } catch (creationError: any) {
        console.error("Routine creation error:", creationError);

        if (creationError instanceof MongooseError) {
            return new NextResponse("Database error: " + creationError.message, { status: 500 });
        }

        return NextResponse.json({
            message: "Error creating routine: " + creationError.message, error: creationError,}, 
            { status: 400 });
    }
}

export async function GET() {
    try {
        await connect()
        const routineAssigned = await RoutineAssigned.find()
        return NextResponse.json(routineAssigned, { status: 200 })

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error in fetching assigned routines" + error.message, {status: 500})
    }
}
