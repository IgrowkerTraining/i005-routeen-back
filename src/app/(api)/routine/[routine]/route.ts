/**
 * @swagger
 * /routine/{routine}:
 *   get:
 *     summary: Obtener información de una rutina específica
 *     tags:
 *       - Routine
 *     parameters:
 *       - name: routine
 *         in: path
 *         required: true
 *         description: ID de la rutina a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información de la rutina obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 trainer_id:
 *                   type: string
 *       404:
 *         description: Rutina no encontrada
 *       500:
 *         description: Error interno del servidor al obtener la rutina
 */

/**
 * @swagger
 * /routine/{routine}:
 *   patch:
 *     summary: Actualizar una rutina específica
 *     tags:
 *       - Routine
 *     parameters:
 *       - name: routine
 *         in: path
 *         required: true
 *         description: ID de la rutina a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routine_id:
 *                 type: string
 *                 example: "60c72b2f9b1e8e2b88a5b3b8"  # ID de la rutina a actualizar
 *               newName:
 *                 type: string
 *                 example: "Rutina avanzada de fuerza"
 *               newDescription:
 *                 type: string
 *                 example: "Descripción actualizada para aumentar la fuerza en piernas"
 *             required:
 *               - routine_id
 *               - newName
 *     responses:
 *       200:
 *         description: Rutina actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine updated successfully"
 *                 updatedRoutine:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Falta uno de los campos 'newName' o 'newDescription'
 *       404:
 *         description: Rutina no encontrada
 *       500:
 *         description: Error interno del servidor al actualizar la rutina
 */

/**
 * @swagger
 * /routine/{routine}:
 *   delete:
 *     summary: Eliminar una rutina específica
 *     tags:
 *       - Routine
 *     parameters:
 *       - name: routine
 *         in: path
 *         required: true
 *         description: ID de la rutina a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rutina eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine deleted successfully"
 *       400:
 *         description: ID de la rutina no proporcionado
 *       404:
 *         description: Rutina no encontrada
 *       500:
 *         description: Error interno del servidor al eliminar la rutina
 */



import { NextResponse } from "next/server";
import Routine from "@/models/Routine";
import Trainer from "@/models/Trainer";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";


export async function GET(req: Request, { params }: { params: { routine: string } }) {
    try {
        await connect();

        const routine = await Routine.findById(params.routine);
        
        if (!routine) {
            return NextResponse.json({ message: "Routine not found" }, { status: 404 });
        }

        return NextResponse.json(routine, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error fetching routine: " + error.message, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connect();
        
        const { routine_id, newName, newDescription } = await req.json();

        validate.isValidName(newName)
        validate.isValidDescription(newDescription)

        if (!newName && !newDescription) {
            return NextResponse.json(
                { message: "At least one of 'newName' or 'newDescription' is required" },
                { status: 400 }
            );
        }

        const routine = await Routine.findOne({ routine_id });
        if (!routine) {
            return NextResponse.json({ message: "Routine not found" },{ status: 404 });
        }

        const updatedFields: any = {};
        if (newName) updatedFields.name = newName;
        if (newDescription) updatedFields.description = newDescription;

        const updatedRoutine = await Routine.findOneAndUpdate({ routine_id },updatedFields,{ new: true });

        return NextResponse.json({ message: "Routine updated successfully", updatedRoutine },{ status: 200 });

    } catch (error: any) {
        console.error("Error updating routine:", error);

        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return NextResponse.json(
            { message: "Failed to update routine", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await connect();
        const { routine_id } = await req.json();

        if (!routine_id) {
            return new NextResponse("routine_id is required", { status: 400 });
        }

        const routine = await Routine.findById(routine_id);
        if (!routine) {
            return new NextResponse("Routine not found", { status: 404 });
        }

        await Routine.deleteOne({ _id: routine_id });

        return NextResponse.json({ message: "Routine deleted successfully" }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error deleting routines" + error.message, {status: 500})
    }
}