/**
 * @swagger
 * /routineAssigned:
 *   delete:
 *     summary: Eliminar una rutina asignada a un atleta
 *     tags:
 *       - RoutineAssigned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routineAssigned_id:
 *                 type: string
 *                 example: "605c72ef1532072fb79e3c9f"
 *             required:
 *               - routineAssigned_id
 *     responses:
 *       200:
 *         description: Routine successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assigned routine deleted successfully"
 *       400:
 *         description: Invalid request or missing routineAssigned_id
 *       403:
 *         description: Unauthorized. Only the trainer who assigned the routine can delete it.
 *       404:
 *         description: Assigned routine not found
 *       500:
 *         description: Internal server error
 */


import { NextResponse } from "next/server";
import RoutineAssigned from "@/models/RoutineAssigned";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE(req: Request) {
    try {
        await connect();
        const user = await getCurrentUser();
        const { routineAssigned_id } = await req.json();

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

        if (routineAssigned.trainer_id.toString() !== user.id) {
            return NextResponse.json({ message: "You can only delete routines you have assigned." }, { status: 403 });
        }

        await RoutineAssigned.deleteOne({ _id: routineAssigned_id });

        return NextResponse.json({ message: "Assigned routine deleted successfully" }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }

        return new NextResponse("Error deleting assigned routines" + error.message, {status: 500})
    }
}