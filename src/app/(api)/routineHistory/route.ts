/**
 * @swagger
 * /routine-history:
 *   post:
 *     summary: Finalizar rutina asignada y guardar en el historial (solo accesible para atletas con OTP válido)
 *     tags:
 *       - RoutineHistory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigned_routine_id:
 *                 type: string
 *                 description: ID de la rutina asignada que se está finalizando
 *               current_routine_id:
 *                 type: string
 *                 description: ID de la rutina que el atleta está realizando actualmente
 *     responses:
 *       201:
 *         description: Rutina terminada y guardada correctamente en el historial
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine history saved successfully"
 *                 routineHistory:
 *                   type: object
 *                   properties:
 *                     athlete_id:
 *                       type: string
 *                       example: "62b8fc2fddfd183b2f446c7d"
 *                     assigned_routine_id:
 *                       type: string
 *                       example: "62b8fd39ddfd183b2f446c8f"
 *                     name:
 *                       type: string
 *                       example: "Full Body Workout"
 *                     description:
 *                       type: string
 *                       example: "A complete full-body workout focusing on strength and endurance."
 *       400:
 *         description: Faltan datos requeridos o el atleta no tiene un OTP válido
 *       403:
 *         description: El atleta no tiene un OTP válido o está intentando finalizar una rutina incorrecta
 *       404:
 *         description: La rutina asignada no se encuentra
 *       500:
 *         description: Error interno en la base de datos
 */

/**
 * @swagger
 * /routine-history:
 *   get:
 *     summary: Obtener el historial de rutinas de los atletas
 *     tags:
 *       - RoutineHistory
 *     responses:
 *       200:
 *         description: Historial de rutinas obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   athlete_id:
 *                     type: string
 *                   assigned_routine_id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       500:
 *         description: Error interno del servidor al obtener el historial de rutinas
 */

import { NextResponse, userAgent } from "next/server";
import RoutineAssigned from "@/models/RoutineAssigned";
import RoutineHistory from "@/models/RoutineHistory";
import Otp from "@/models/Otp";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req:Request) {
    try {
        await connect()
        const user = await getCurrentUser();

        if (user.role !== 'athlete') {
            return NextResponse.json({ message: "You must be an athlete to finish a routine." }, { status: 403 });
        }

        const { assigned_routine_id, current_routine_id } = await req.json();

        if (!assigned_routine_id || !current_routine_id) {
            return NextResponse.json({ message: "Assigned routine ID and current routine ID are required." }, { status: 400 });
        }

        const otp = await Otp.findOne({ athlete_id: user.id, active: true });
        if (!otp || otp.otp_end_date < new Date()) {
            return NextResponse.json({ message: "You must have a valid OTP to finish a routine." }, { status: 403 });
        }

        const routineAssigned = await RoutineAssigned.findById(assigned_routine_id);
        if (!routineAssigned) {
            return NextResponse.json({ message: "Routine not found." }, { status: 404 });
        }

        if (routineAssigned.routine_id.toString() !== current_routine_id) {
            return NextResponse.json({ message: "You can only finish the routine you are currently doing." }, { status: 403 });
        }

        const newRoutineHistory = await RoutineHistory.create({
            athlete_id: user.id,
            assigned_routine_id: routineAssigned._id,
            name: routineAssigned.routine_id.name,
            description: routineAssigned.description,
        });

        return NextResponse.json({ message: "Routine history saved successfully", routineHistory: newRoutineHistory }, { status: 201 });

    } catch (creationError: any) {
        if (creationError instanceof MongooseError) {
            return new NextResponse("Database error: " + creationError.message, { status: 500 });
        }

        return NextResponse.json({
            message: "Error creating routine history: " + creationError.message,
            error: creationError,
        }, { status: 400 });
    }
} 

export async function GET() {
    try {
        await connect()
        const routineHistory = await RoutineHistory.find()
        return NextResponse.json(routineHistory, { status: 200 })

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error in fetching routines history" + error.message, {status: 500})
    }
}
