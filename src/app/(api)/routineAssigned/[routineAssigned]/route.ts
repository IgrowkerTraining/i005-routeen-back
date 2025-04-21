/**
 * @swagger
 * /routineAssigned/{routineAssigned_id}:
 *   delete:
 *     summary: Eliminar una rutina asignada por un entrenador
 *     tags:
 *       - RoutineAssigned
 *     parameters:
 *       - in: path
 *         name: routineAssigned_id
 *         required: true
 *         description: ID de la rutina asignada a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rutina asignada eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assigned routine deleted successfully"
 *       400:
 *         description: Error al intentar eliminar la rutina asignada (por ejemplo, si no se proporciona el ID de la rutina)
 *       403:
 *         description: Acceso denegado. Solo los entrenadores pueden eliminar rutinas asignadas
 *       404:
 *         description: Rutina asignada o rutina original no encontrada
 *       500:
 *         description: Error interno del servidor
 */



import { NextResponse } from "next/server";
import Routine from "@/models/Routine";
import RoutineAssigned from "@/models/RoutineAssigned";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE(req: Request, context: any) {
    try {
        await connect();
        const user = await getCurrentUser();
        const routineAssigned_id = context.params.routineAssigned;

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be a trainer to delete assigned routines." }, { status: 403 });
        }

        if (!routineAssigned_id) {
            return new NextResponse("routine_id is required", { status: 400 });
        }

        const routineAssigned = await RoutineAssigned.findById(routineAssigned_id);
        if (!routineAssigned) {
            return new NextResponse("Assigned routine not found", { status: 404 });
        }

        const originalRoutine = await Routine.findById(routineAssigned.routine_id);
        if (!originalRoutine) {
            return new NextResponse("Original routine not found", { status: 400 });
        }

        if (originalRoutine.trainer_id.toString() !== user.id) {
            return NextResponse.json({ message: "You can only delete routines you have assigned." }, { status: 403 });
        }

        await RoutineAssigned.deleteOne({ _id: routineAssigned_id });

        return NextResponse.json({ message: "Assigned routine deleted successfully" }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error deleting assigned routines" + error.message, { status: 500 })
    }
}