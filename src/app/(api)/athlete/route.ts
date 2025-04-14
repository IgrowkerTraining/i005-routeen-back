/**
 * @swagger
 * /athlete:
 *   post:
 *     summary: Registra un nuevo atleta en el sistema
 *     tags:
 *       - Athlete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Athlete'
 *     responses:
 *       201:
 *         description: Atleta creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newStudent:
 *                   $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Error de validación o datos duplicados
 *       500:
 *         description: Error del servidor al crear el atleta
 */


/**
 * @swagger
 * /athlete:
 *   get:
 *     summary: Obtener todos los atletas registrados
 *     tags:
 *       - Athlete
 *     responses:
 *       200:
 *         description: Lista de atletas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Error al obtener la lista de atletas
 */

import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { MongooseError, Types } from "mongoose";
import Trainer from "@/models/Trainer";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
    try {
        await connect()
        console.log("Connected to DB");
        const user = await getCurrentUser();
        const data = await req.formData();
        console.log(user);

        const trainer_id = user.id
        const name = data.get("name")?.toString() || "";
        const email = data.get("email")?.toString() || "";
        const phone = data.get("phone")?.toString() || "";
        const date_birth = data.get("date_birth")?.toString() || "";
        const goals = data.get("goals")?.toString() || "";

        validate.isValidName(name)
        validate.isValidEmail(email)
        validate.isValidPhone(phone)
        validate.isValidDate(date_birth)
        validate.isValidObjectId(trainer_id)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }
        console.log("1");

        const emailUser = await Athlete.findOne({ email })
        if (emailUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }
        console.log("2");

        const phoneUser = await Athlete.findOne({ phone })
        if (phoneUser) {
            return NextResponse.json({ phone: "phone already used" }, { status: 400 })
        }
        console.log("3");

        const newAthlete = await Athlete.create({ name, email, phone, date_birth, goals, trainer_id })
        console.log("4");

        return NextResponse.json({ message: "Athlete had been created", newAthlete, status: 201 })

    } catch (creationError: any) {
        console.error("Athlete creation error:", creationError);
        return NextResponse.json({
            message: "Error creating athlete: " + creationError.message,
            error: creationError,
        }, { status: 400 });
    }
}

export async function GET() {
    try {
        await connect()
        const users = await Athlete.find()
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching athletes" + error.message, {
            status: 400
        })
    }
}