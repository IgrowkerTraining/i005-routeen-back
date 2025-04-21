/**
 * @swagger
 * /athlete/{athlete}/weightHistory:
 *   post:
 *     summary: Agrega una entrada al historial de peso del atleta
 *     tags:
 *       - Weight History
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 example: 75.5
 *                 description: Peso del atleta
 *             required:
 *               - weight
 *     responses:
 *       201:
 *         description: Historial de peso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     athlete_id:
 *                       type: string
 *                     weight:
 *                       type: number
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: number
 *       400:
 *         description: Datos inválidos o atleta no encontrado
 *       403:
 *         description: No autorizado para realizar esta acción
 *       500:
 *         description: Error en la base de datos
 */

/**
 * @swagger
 * /athlete/{athlete}/weightHistory:
 *   get:
 *     summary: Obtener historial de peso de un atleta
 *     tags:
 *       - Weight History
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de peso obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weightProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       athlete_id:
 *                         type: string
 *                       weight:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: number
 *       404:
 *         description: No se encontró historial de peso para este atleta
 *       500:
 *         description: Error interno del servidor
 */

import { NextResponse } from "next/server";
import Athlete, { AthleteType } from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import WeightHistory from "@/models/WeightHistory";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";

export async function POST(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const athleteId = context.params.athlete
        const { weight } = await req.json();

        validate.isValidWeight(weight);

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

        const date = new Date();

        const newWeghtHistory = await WeightHistory.create({ athlete_id: athleteId, weight, date });
        return NextResponse.json(
            { message: "Category created successfully", category: newWeghtHistory },
            { status: 201 }
        );

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "Database Error" + error.message }, { status: 500 });
        }

        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function GET(req: Request, context: any) {
    try {
        await connect();
        const athlete_id = context.params.athlete

        const weightProgress = await WeightHistory.find({ athlete_id })

        if (weightProgress.length === 0) {
            return NextResponse.json({ message: "No weight progress to this athlete." }, { status: 404 });
        }

        return NextResponse.json({ weightProgress }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in fetching weight progress: " + error.message, { status: 500 });
    }
}