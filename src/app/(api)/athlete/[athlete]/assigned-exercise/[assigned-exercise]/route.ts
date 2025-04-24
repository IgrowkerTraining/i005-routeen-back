/**
 * @swagger
 * /athlete/{athlete}/assigned-exercise/{assigned-exercise}:
 *   patch:
 *     summary: Actualiza un ejercicio asignado
 *     description: Permite que el atleta actualice campos específicos y que el entrenador actualice todos excepto `completed`.
 *     tags:
 *       - AssignedExercise
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         description: ID del atleta (usado para validar acceso)
 *         schema:
 *           type: string
 *           example: "661e50019aa304a9e269a100"
 *       - name: assigned-exercise
 *         in: path
 *         required: true
 *         description: ID del ejercicio asignado
 *         schema:
 *           type: string
 *           example: "661f20019aa304a9e269b1f0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: number
 *                 example: 1
 *               reps:
 *                 type: number
 *                 example: 10
 *               series:
 *                 type: number
 *                 example: 3
 *               weight_kg:
 *                 type: number
 *                 example: 20
 *               rest_time_s:
 *                 type: number
 *                 example: 60
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ejercicio asignado actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignedExercise'
 *       403:
 *         description: No autorizado para realizar la modificación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trainers cannot modify the 'completed' field."
 *       404:
 *         description: Ejercicio asignado no encontrado
 *       400:
 *         description: Datos no válidos
 *       500:
 *         description: Error del servidor
 */

import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import validate from "@/lib/validate";
import AssignedExercise from "@/models/AssignedExercise";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  context: any
): Promise<NextResponse> => {
  try {
    await connect();

    const user = await getCurrentUser();
    const assignedExerciseId = context.params["assigned-exercise"];
    validate.isValidObjectId(assignedExerciseId);

    const updateData = await req.json();

    if (updateData.order !== undefined)
      validate.isValidNumber(updateData.order);
    if (updateData.reps !== undefined) validate.isValidNumber(updateData.reps);
    if (updateData.series !== undefined)
      validate.isValidNumber(updateData.series);
    if (updateData.weight_kg !== undefined) {
      validate.isValidWeight(updateData.weight_kg);
    }
    if (updateData.rest_time_s !== undefined)
      validate.isValidNumber(updateData.rest_time_s);
    if (
      updateData.completed !== undefined &&
      typeof updateData.completed !== "boolean"
    ) {
      throw new Error("Invalid completed value. It must be a boolean.");
    }

    const assignedExercise = await AssignedExercise.findById(
      assignedExerciseId
    ).populate({
      path: "assigned_routine_id",
      select: "athlete_id",
    });

    if (!assignedExercise) {
      return NextResponse.json(
        { message: "Assigned exercise not found" },
        { status: 404 }
      );
    }

    const athleteId =
      assignedExercise.assigned_routine_id.athlete_id.toString();

    if (user.role === "trainer") {
      if ("completed" in updateData) {
        return NextResponse.json(
          { message: "Trainers cannot modify the 'completed' field." },
          { status: 403 }
        );
      }

      const updatedExercise = await AssignedExercise.findByIdAndUpdate(
        assignedExerciseId,
        updateData,
        { new: true }
      );
      return NextResponse.json(updatedExercise, { status: 200 });
    }

    const isOwnerAthlete = user.role === "athlete" && user.id === athleteId;

    const allowedFieldsForAthlete = [
      "reps",
      "series",
      "weight_kg",
      "rest_time_s",
      "completed",
    ];

    const isTryingToUpdateInvalidField = Object.keys(updateData).some(
      (key) => !allowedFieldsForAthlete.includes(key)
    );

    if (isOwnerAthlete && !isTryingToUpdateInvalidField) {
      const updatedExercise = await AssignedExercise.findByIdAndUpdate(
        assignedExerciseId,
        updateData,
        { new: true }
      );
      return NextResponse.json(updatedExercise, { status: 200 });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
};
