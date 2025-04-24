/**
 * @swagger
 * /routineAssigned:
 *   post:
 *     summary: Asignar una rutina a un atleta (solo accesible para entrenadores)
 *     tags:
 *       - RoutineAssigned
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               athlete_id:
 *                 type: string
 *                 description: ID del atleta al que se le asignará la rutina
 *               routine_id:
 *                 type: string
 *                 description: ID de la rutina que se va a asignar
 *               description:
 *                 type: string
 *                 description: Descripción personalizada de la rutina (opcional)
 *               assignment_date:
 *                 type: string
 *                 description: Fecha en que se asigna la rutina
 *     responses:
 *       201:
 *         description: Rutina asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine assigned was successfully assigned"
 *                 newRoutineAssigned:
 *                   type: object
 *                   properties:
 *                     routine_id:
 *                       type: string
 *                       example: "605c72ef153207001f7e2c39"
 *                     athlete_id:
 *                       type: string
 *                       example: "605c72ef153207001f7e2c31"
 *                     description:
 *                       type: string
 *                       example: "Strength training routine"
 *                     assignment_date:
 *                       type: string
 *                       example: "2025-04-18"
 *       400:
 *         description: El atleta no fue encontrado o los datos no son válidos
 *       403:
 *         description: El usuario debe ser un entrenador para asignar rutinas o la rutina no puede ser asignada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /routine-assigned:
 *   get:
 *     summary: Obtiene todas las rutinas asignadas
 *     tags:
 *       - RoutineAssigned
 *     responses:
 *       200:
 *         description: Lista de rutinas asignadas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   routine_id:
 *                     type: string
 *                   athlete_id:
 *                     type: string
 *                   description:
 *                     type: string
 *                   assignment_date:
 *                     type: string
 *       500:
 *         description: Error al obtener las rutinas asignadas
 */

import { NextResponse } from "next/server";
import RoutineAssigned from "@/models/RoutineAssigned";
import Routine from "@/models/Routine";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { MongooseError, Types } from "mongoose";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";
import RoutineExercise from "@/models/RoutineExercise";
import AssignedExercise from "@/models/AssignedExercise";

async function assignBaseExercisesToRoutine(
  assignedRoutineId: string,
  baseRoutineId: string
) {
  const baseExercises = await RoutineExercise.find({
    routine_id: baseRoutineId,
  });

  if (!baseExercises.length) {
    throw new Error("La rutina base no tiene ejercicios.");
  }

  const assignedExercises = baseExercises.map((exercise: any) => {
    return {
      order: exercise.order,
      reps: exercise.reps,
      series: exercise.series,
      weight_kg: exercise.weight_kg,
      rest_time_s: exercise.rest_time_s,
      exercise_id: exercise.exercise_id,
      assigned_routine_id: assignedRoutineId,
      completed: false,
    };
  });

  await AssignedExercise.insertMany(assignedExercises);
}

export async function POST(req: Request) {
  try {
    await connect();

    const data = await req.formData();
    const user = await getCurrentUser();

    const trainer_id = user.id;
    const athlete_id = data.get("athlete_id")?.toString() || "";
    const routine_id = data.get("routine_id")?.toString() || "";
    const customDescription = data.get("description")?.toString() || "";
    const assignment_date = data.get("assignment_date")?.toString() || "";

    validate.isValidDescription(customDescription);
    validate.isValidDate(assignment_date);

        if (!trainer_id) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be a trainer to assign routines." }, { status: 403 });
        }

        if (!athlete_id) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 })
        }

        if (!routine_id) {
            return NextResponse.json({ message: "routine_id is required" }, { status: 400 });
        }

        const athlete = await Athlete.findById(athlete_id);
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 404 });
        }
        if (athlete.trainer_id.toString() !== trainer_id) {
            return NextResponse.json({ message: "You can only assign routines to your own athletes." }, { status: 403 });
        }

        const originalRoutine = await Routine.findById(routine_id);
        if (!originalRoutine) {
            return NextResponse.json({ message: "Original routine not found" }, { status: 400 });
        }

        if (originalRoutine.trainer_id.toString() !== trainer_id) {
            return NextResponse.json({ message: "You can only assign routines that you created." }, { status: 403 });
        }

        const description = customDescription || originalRoutine.description;

        const newRoutineAssigned = await RoutineAssigned.create({
            routine_id,
            athlete_id,
            description,
            assignment_date,
        });

        console.log("OTP sending to:", `whatsapp:${athlete.phone}`);
        console.log("OTP fetch URL:", `${process.env.BASE_URL}/api/send-otp`);

        const otpResponse = await fetch(`http://localhost:3000/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "phoneNumber": athlete.phone,
                "athlete_id": athlete_id,
                "messageType": "routineAssigned"
            })
        });
        const otpResult = await otpResponse.json();

        if (!otpResponse.ok) {
            return NextResponse.json({
                message: "Routine assigned but message sending failed",
                newRoutineAssigned,
                error: otpResult.error || "Unknown error",
                status: 500
            })
        }

        return NextResponse.json({
            message: "Routine assigned was successfully assigned and message sent",
            newRoutineAssigned,
            otp: otpResult,
            status: 201
        });


    } catch (creationError: any) {
        console.error("Routine creation error:", creationError);

        if (creationError instanceof MongooseError) {
            return new NextResponse("Database error: " + creationError.message, { status: 500 });
        }

        return NextResponse.json({
            message: "Error creating routine: " + creationError.message, error: creationError,
        },
            { status: 400 });
    }
}

export async function GET() {
  try {
    await connect();
    const routineAssigned = await RoutineAssigned.find();
    return NextResponse.json(routineAssigned, { status: 200 });
  } catch (error: any) {
    if (error instanceof MongooseError) {
      return new NextResponse("Database error: " + error.message, {
        status: 500,
      });
    }

    return new NextResponse(
      "Error in fetching assigned routines" + error.message,
      { status: 500 }
    );
  }
}
