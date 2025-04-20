/**
 * @swagger
 * /athlete/{athlete_id}/routineAssigned:
 *   get:
 *     summary: Obtener todas las rutinas asignadas a un atleta específico
 *     tags:
 *       - RoutineAssigned
 *     parameters:
 *       - name: athlete_id
 *         in: path
 *         required: true
 *         description: ID del atleta cuyas rutinas asignadas se desean obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de rutinas asignadas al atleta
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
 *                       description:
 *                         type: string
 *                         description: Descripción de la rutina asignada
 *       403:
 *         description: Acceso denegado. Solo un atleta puede ver sus rutinas y un entrenador solo puede ver las rutinas de un atleta específico.
 *       404:
 *         description: No se encontraron rutinas asignadas para el atleta.
 *       500:
 *         description: Error en el servidor al obtener las rutinas asignadas.
 */


import { NextResponse } from "next/server";
import connect from "@/lib/db";
import RoutineAssigned from "@/models/RoutineAssigned";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const athlete_id = context.params.athlete_id;

        if (user.role === 'athlete') {
            if (user.id !== athlete_id) {
                return NextResponse.json({ message: "You can only view your own assigned routines." }, { status: 403 });
            }
        }

        if (user.role === 'trainer') {
            if (user.id !== athlete_id) {
                return NextResponse.json({ message: "You can only view the assigned routines of this specific athlete." }, { status: 403 });
            }
        }

        const routinesAssigned = await RoutineAssigned.find({ athlete_id }).populate('routine_id');

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



