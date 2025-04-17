/**
 * @swagger
 * /athlete/{athlete_id}/routineAssigned:
 *   get:
 *     summary: Obtener las rutinas asignadas a un atleta específico
 *     tags:
 *       - Athlete
 *     parameters:
 *       - name: athlete_id
 *         in: path
 *         required: true
 *         description: ID del atleta que desea ver sus rutinas asignadas
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rutinas asignadas al atleta obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routinesAssigned:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       routine_id:
 *                         type: string
 *                         description: ID de la rutina asignada
 *                       athlete_id:
 *                         type: string
 *                         description: ID del atleta
 *                       description:
 *                         type: string
 *                         description: Descripción de la rutina asignada
 *                       assignment_date:
 *                         type: string
 *                         description: Fecha en la que se asignó la rutina
 *       403:
 *         description: El usuario debe ser un atleta y solo puede ver sus propias rutinas asignadas
 *       404:
 *         description: El atleta no tiene rutinas asignadas o el atleta no existe
 *       500:
 *         description: Error interno del servidor
 */

import { NextResponse } from "next/server";
import connect from "@/lib/db";
import RoutineAssigned from "@/models/RoutineAssigned";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: { athlete_id: string } }) {
    try {
        await connect();

        const user = await getCurrentUser();

        if (user.role !== 'athlete') {
            return NextResponse.json({ message: "You must be an athlete to view your assigned routines." }, { status: 403 });
        }

        const athlete_id = user.id;

        const routinesAssigned = await RoutineAssigned.find({ athlete_id }).populate('routine_id');
        console.log(athlete_id)
        if (routinesAssigned.length === 0) {
            return NextResponse.json({ message: "No routines assigned to this athlete." }, { status: 404 });
        }

        return NextResponse.json({ routinesAssigned }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching assigned routines: " + error.message, { status: 500 });
    }
}

