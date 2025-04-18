/**
 * @swagger
 * /athlete/{athlete_id}/routineHistory:
 *   get:
 *     summary: Obtener el historial de rutinas de un atleta
 *     tags:
 *       - RoutineHistory
 *     parameters:
 *       - name: athlete_id
 *         in: path
 *         required: true
 *         description: ID del atleta para obtener su historial de rutinas
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de rutinas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routineHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assigned_routine_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *       403:
 *         description: Acceso denegado, el usuario debe ser un atleta o entrenador
 *       404:
 *         description: No se encontró historial de rutinas para el atleta
 *       500:
 *         description: Error interno al obtener el historial de rutinas
 */

import { NextResponse } from "next/server";
import connect from "@/lib/db";
import RoutineHistory from "@/models/RoutineHistory";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, context: any) {
    try {
        await connect();

        const user = await getCurrentUser();

        if (user.role !== 'athlete' && user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be an athlete or a trainer to view routine history." }, { status: 403 });
        }

        const athlete_id = context.params.athlete_id;

        const routineHistory = await RoutineHistory.find({ athlete_id }).sort({ createdAt: -1 });

        if (routineHistory.length === 0) {
            return NextResponse.json({ message: "No routine history found for this athlete." }, { status: 404 });
        }

        return NextResponse.json({ routineHistory }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching routine history: " + error.message, { status: 500 });
    }
}
