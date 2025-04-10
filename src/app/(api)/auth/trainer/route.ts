/**
 * @swagger
 * /auth/trainer:
 *   post:
 *     summary: Iniciar sesión del entrenador
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: entrenador@correo.com
 *               password:
 *                 type: string
 *                 example: yourPassword123
 *     responses:
 *       200:
 *         description: Devuelve el token JWT y datos del entrenador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Trainer'
 *       400:
 *         description: Usuario no encontrado o contraseña incorrecta
 *       500:
 *         description: Error interno del servidor
 */
import connect from "@/lib/db";
import validate from "@/lib/validate";
import Trainer from "@/models/Trainer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { createTokenCookie } from "@/lib/cookies";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { email, password } = await req.json()
        validate.isValidEmail(email)

        const user = await Trainer.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 400 })
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Incorrect password" }, { status: 400 })
        }

        const payload = { id: user._id, role: user.role, name: user.name }


        const token = jwt.sign(payload, "hola", { expiresIn: "1d" });

        const res = NextResponse.json({ user }, { status: 200 });
        res.headers.set("Set-Cookie", createTokenCookie(token));

        return res;

    } catch (error: any) {
        return new NextResponse("Error in creating trainer" + error.message, {
            status: 500
        })
    }
}