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
import { MongooseError } from "mongoose";
import Trainer from "@/models/Trainer";
import validate from "@/lib/validate";

export async function POST(req: Request) {
    try {
        await connect()
        const { name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id } = await req.json()

        validate.isValidName(name)
        validate.isValidEmail(email)
        validate.isValidPhone(phone)
        validate.isValidDate(date_birth)
        validate.isValidObjectId(trainer_id)

        const trainer = await Trainer.findById(trainer_id)
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
        }

        const emailUser = await Athlete.findOne({ email })
        if (emailUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const phoneUser = await Athlete.findOne({ phone })
        if (phoneUser) {
            return NextResponse.json({ phone: "phone already used" }, { status: 400 })
        }

        const newAthlete = await Athlete.create({ name, email, phone, date_birth, goals, weight, height, gender, injuries, trainer_id })

        return NextResponse.json({ message: "Athlete had been created", newStudent, status: 201 })

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }
        return NextResponse.json({ message: "There was an error creating a Student" + error.message }, { status: 500 })
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