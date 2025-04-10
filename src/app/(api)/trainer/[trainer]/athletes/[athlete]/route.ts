/**
 * @swagger
 * /trainer/{trainer}/athletes/{student}:
 *   get:
 *     summary: Obtener un atleta específico asignado a un entrenador
 *     tags:
 *       - Trainer
 *     parameters:
 *       - name: trainer
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del entrenador
 *       - name: student
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atleta
 *     responses:
 *       200:
 *         description: Información del atleta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Entrenador o atleta no encontrado
 *       500:
 *         description: Error del servidor al obtener el atleta
 */


import connect from "@/lib/db";
import Trainer from "@/models/Trainer";
import Athlete from "@/models/Athlete";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export const GET = async (req: Request, { params }: { params: { trainer: string, athlete: string } }) => {
    try {
        const trainerId = params.trainer;
        const athleteId = params.athlete;
        validate.isValidObjectId(trainerId)
        validate.isValidObjectId(athleteId)
        await connect()

        const trainer = await Trainer.findById(trainerId)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const athlete = await Athlete.findById(athleteId)
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        return NextResponse.json(athlete, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in getting athlete" + error.message, {
            status: 500
        })
    }
}