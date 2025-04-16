/**
 * @swagger
 * /routine:
 *   post:
 *     summary: Crear una nueva rutina asociada al entrenador
 *     tags:
 *       - Routine
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rutina de fuerza"
 *               description:
 *                 type: string
 *                 example: "Rutina para aumentar la fuerza en piernas"
 *             required:
 *               - name
 *               - description
 *     responses:
 *       201:
 *         description: Rutina creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine had been created"
 *                 newRoutine:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Error en la validación de los datos
 *       500:
 *         description: Error interno del servidor al crear la rutina
 */
/**
 * @swagger
 * /routine:
 *   get:
 *     summary: Obtener todas las rutinas
 *     tags:
 *       - Routine
 *     responses:
 *       200:
 *         description: Lista de rutinas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       500:
 *         description: Error al obtener las rutinas
 */


import { NextResponse } from "next/server";
import Routine from "@/models/Routine";
import Trainer from "@/models/Trainer";
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
        const name = data.get("name")?.toString() || "";
        const description = data.get("description")?.toString() || "";

        validate.isValidName(name)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const newRoutine = await Routine.create({ name, description, trainer_id })

        return NextResponse.json({ message: "Routine had been created", newRoutine, status: 201 })

    } catch (creationError: any) {
        console.error("Routine creation error:", creationError);

        if (creationError instanceof MongooseError) {
            return new NextResponse("Database error: " + creationError.message, { status: 500 });
        }

        return NextResponse.json({
            message: "Error creating routine: " + creationError.message,
            error: creationError,
        }, { status: 400 });
    }
}


export async function GET() {
    try {
        await connect()
        const routine = await Routine.find()
        return NextResponse.json(routine, { status: 200 })

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error in fetching routines" + error.message, {status: 500})
    }
}