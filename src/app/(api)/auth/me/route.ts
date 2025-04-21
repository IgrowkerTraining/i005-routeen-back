/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Token no encontrado o inválido
 *       500:
 *         description: Error del servidor al obtener el usuario
 */


import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get("token")?.value

        if (!token) {
            return NextResponse.json({ message: "Token not found" }, { status: 400 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        return NextResponse.json({ user: decoded }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Error in fetching user" }, { status: 500 })
    }
}