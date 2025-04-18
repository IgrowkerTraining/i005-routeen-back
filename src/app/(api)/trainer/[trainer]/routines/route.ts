/**
 * @swagger
 * /trainer/{trainer_id}/routines:
 *   get:
 *     summary: Obtener todas las rutinas creadas por el entrenador
 *     tags:
 *       - Trainer
 *     parameters:
 *       - in: path
 *         name: trainer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del entrenador cuya rutinas queremos obtener.
 *     responses:
 *       200:
 *         description: Rutinas obtenidas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: El ID de la rutina
 *                       name:
 *                         type: string
 *                         description: El nombre de la rutina
 *                       description:
 *                         type: string
 *                         description: La descripción de la rutina
 *                       trainer_id:
 *                         type: string
 *                         description: El ID del entrenador que creó la rutina
 *       403:
 *         description: Acceso no autorizado, se requiere el rol de entrenador
 *       404:
 *         description: No se encontraron rutinas creadas por este entrenador
 *       500:
 *         description: Error en el servidor al obtener las rutinas
 */

import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Routine from "@/models/Routine";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: Request, { params }: { params: { trainer_id: string } }) {
    try {
        await connect();
        const user = await getCurrentUser();

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be an trainer to view your created routines." }, { status: 403 });
        }

        const trainer_id = user.id; 

        const routines = await Routine.find({ trainer_id }).sort({ createdAt: -1 });

        if (routines.length === 0) {
            return NextResponse.json({ message: "No routines created for this trainer." }, { status: 404 });
        }

        return NextResponse.json({ routines }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching routines: " + error.message, { status: 500 });
    }
}