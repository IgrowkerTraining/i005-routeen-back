/**
 * @swagger
 * /athlete/{athlete}/weightHistory/{weightHistory}:
 *   delete:
 *     summary: Eliminar un historial de peso de un atleta
 *     tags:
 *       - Weight History
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta
 *         schema:
 *           type: string
 *       - name: weightHistory
 *         in: path
 *         required: true
 *         description: ID del historial de peso que se desea eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de peso eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Weight history deleted successfully"
 *       400:
 *         description: Datos inválidos o historial de peso no encontrado
 *       403:
 *         description: No autorizado para eliminar este historial
 *       500:
 *         description: Error en la base de datos
 */

import { NextResponse } from "next/server";
import Athlete, { AthleteType } from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import WeightHistory from "@/models/WeightHistory";
import { MongooseError } from "mongoose";

export async function DELETE(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const athleteId = context.params.athlete
        const weightHistoryId = context.params.weightHistory

        const weightHistory = await WeightHistory.findById(weightHistoryId)
        if (!weightHistory) {
            return NextResponse.json({ message: "Weight history not found" }, { status: 400 })
        }

        const athlete = await Athlete.findById(athleteId)
        if (!athlete) {
            return NextResponse.json({ message: "Athelete not found" }, { status: 400 })
        }

        if (user.id !== athleteId) {
            return NextResponse.json(
                { error: "You are not allowed to make this action" },
                { status: 403 }
            );
        }

        await WeightHistory.findByIdAndDelete(weightHistoryId)
        return NextResponse.json(
            { message: "Weight history deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "Database Error" }, { status: 500 });
        }

        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}