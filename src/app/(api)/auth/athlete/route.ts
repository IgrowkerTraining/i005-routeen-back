/**
 * @swagger
 * /auth/athlete:
 *   post:
 *     summary: Obtener información del usuario autenticado desde el token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Datos del usuario extraídos del token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     role:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Token no encontrado o inválido
 *       500:
 *         description: Error del servidor al obtener el usuario
 */

import connect from "@/lib/db";
import validate from "@/lib/validate";
import Athlete from "@/models/Athlete";
import Otp from "@/models/Otp";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { createTokenCookie } from "@/lib/cookies";

export const POST = async (req: Request) => {
    try {
        await connect()
        const { otp_code } = await req.json()
        validate.isValidOTP(otp_code)

        const otp = await Otp.findOne({ otp_code })
        if (!otp) {
            return NextResponse.json({ message: "OTP not found" }, { status: 400 });
        }

        const now = new Date();
        if (otp.otp_end_date < now) {
            return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
        }

        const athlete = await Athlete.findById(otp.athlete_id);
        if (!athlete) {
            return NextResponse.json({ message: "Associated student not found" }, { status: 400 });
        }

        const payload = { id: athlete._id, role: athlete.role, name: athlete.name }

        const token = jwt.sign(payload, "hola", { expiresIn: "1d" });

        const res = NextResponse.json({ token }, { status: 200 });
        res.headers.set("Set-Cookie", createTokenCookie(token));
        return res;

    } catch (error: any) {
        return new NextResponse("Error in fetching student" + error.message, {
            status: 500
        })
    }
}