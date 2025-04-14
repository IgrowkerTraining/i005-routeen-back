/**
 * @swagger
 * /trainer:
 *   post:
 *     summary: Crear un nuevo entrenador con imagen de perfil opcional
 *     tags:
 *       - Trainer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               repeat_password:
 *                 type: string
 *               phone:
 *                 type: string
 *               date_birth:
 *                 type: string
 *                 format: date
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - name
 *               - email
 *               - password
 *               - repeat_password
 *               - phone
 *               - date_birth
 *     responses:
 *       201:
 *         description: Entrenador creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trainer'
 *       400:
 *         description: Error en la validación o en la creación
 *       500:
 *         description: Error del servidor al conectar con la base de datos
 */

/**
 * @swagger
 * /trainer:
 *   get:
 *     summary: Obtener todos los entrenadores registrados
 *     tags:
 *       - Trainer
 *     responses:
 *       200:
 *         description: Lista de entrenadores obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trainer'
 *       500:
 *         description: Error del servidor al obtener entrenadores
 */

import { NextResponse } from "next/server";
import Trainer from "@/models/Trainer";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";

export async function POST(req: Request) {
    try {
        await connect()
        const data = await req.formData();

        const name = data.get("name")?.toString() || "";
        const email = data.get("email")?.toString() || "";
        const password = data.get("password")?.toString() || "";
        const repeat_password = data.get("repeat_password")?.toString() || "";
        const phone = data.get("phone")?.toString() || "";
        const date_birth = data.get("date_birth")?.toString() || "";
        const file = data.get("file") as File | null;

        validate.isValidName(name)
        validate.isValidEmail(email)
        validate.isValidPassword(password)
        validate.isValidPhone(phone)
        validate.isValidDate(date_birth)

        if (password !== repeat_password) {
            return NextResponse.json({ message: "passwords dont match. It should be the same" }, { status: 400 })
        }

        const existingUser = await Trainer.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const hash_password = bcrypt.hashSync(password, 10)

        let profile_picture_url = "";
        let profile_picture_id = "";

        if (file && file instanceof File) {
            const result = await uploadToCloudinary(file, {
                folder: "TrainerProfilePicture",
            });

            profile_picture_url = result.secure_url;
            profile_picture_id = result.public_id;
        }

        const newTrainer = await Trainer.create({
            name, email, password: hash_password, phone, date_birth, profile_picture_url, profile_picture_id
        })

        return NextResponse.json({ message: "Trainer had been created", newTrainer, status: 201 })
    } catch (error: any) {
        console.log(error)
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }

        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}

export const GET = async () => {
    try {
        await connect()
        const users = await Trainer.find()
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return new NextResponse("Error in fetching users" + error.message, {
            status: 500
        })
    }
}