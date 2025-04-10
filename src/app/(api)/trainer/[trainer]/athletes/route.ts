/**
 * @swagger
 * /trainer/{trainer}/athletes:
 *   get:
 *     summary: Obtener todos los atletas asignados a un entrenador
 *     tags:
 *       - Trainer
 *     parameters:
 *       - name: trainer
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del entrenador
 *     responses:
 *       200:
 *         description: Lista de atletas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Entrenador o atletas no encontrados
 *       500:
 *         description: Error del servidor al obtener los atletas
 */


import connect from "@/lib/db";
import Trainer from "@/models/Trainer";
import Athlete from "@/models/Athlete";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export const GET = async (req: Request, { params }: { params: { trainer: string } }) => {
    try {
        const trainerId = params.trainer;
        validate.isValidObjectId(trainerId)
        await connect()

        const trainer = await Trainer.findById(trainerId)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const athlete = await Athlete.find({ trainer_id: trainerId })
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        return NextResponse.json(athlete, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching trainer" + error.message, {
            status: 500
        })
    }
}