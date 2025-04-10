/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Registrar un nuevo administrador
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Administrador registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Error de validación o datos duplicados
 *       500:
 *         description: Error del servidor al registrar admin
 */


import { NextResponse } from "next/server";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";

export async function POST(req: Request) {
    try {
        await connect()
        const { email, password, repeat_password } = await req.json()

        validate.isValidEmail(email)
        validate.isValidPassword(password)

        if (password !== repeat_password) {
            return NextResponse.json({ message: "passwords dont match. It should be the same" }, { status: 400 })
        }

        const user = await Admin.findOne({ email })
        if (user) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const hash_password = bcrypt.hashSync(password, 10)
        const newAdmin = await Admin.create({ email, password: hash_password })

        return NextResponse.json({ message: "Admin had been created", newAdmin, status: 201 })
    } catch (error: any) {
        console.log(error)
        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "There was an error when trying to connect to Mongo" }, { status: 500 })
        }

        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}