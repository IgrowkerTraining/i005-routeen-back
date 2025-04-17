/**
 * @swagger
 * /routine-assigned:
 *   post:
 *     summary: Asigna una rutina a un atleta
 *     tags:
 *       - RoutineAssigned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               athlete_id:
 *                 type: string
 *                 description: ID del atleta al que se le asigna la rutina
 *               routine_id:
 *                 type: string
 *                 description: ID de la rutina que se asigna
 *               description:
 *                 type: string
 *                 description: Descripción personalizada de la rutina para el atleta (opcional)
 *               assignment_date:
 *                 type: string
 *                 description: Fecha de asignación de la rutina (formato YYYY-MM-DD)
 *             required:
 *               - athlete_id
 *               - routine_id
 *               - assignment_date
 *     responses:
 *       201:
 *         description: La rutina ha sido asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine assigned was successfully assigned"
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
 *         description: Error en la creación de la rutina asignada o datos incorrectos
 *       500:
 *         description: Error en el servidor
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

        if (!athlete_id) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        if (!routine_id) {
            return NextResponse.json({ message: "routine_id is required" }, { status: 400 });
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
