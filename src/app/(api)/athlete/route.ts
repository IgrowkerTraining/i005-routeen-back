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
 *         multipart/form-data:  # Cambié a multipart/form-data para que coincida con formData en el código
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan.perez@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               date_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               goals:
 *                 type: string
 *                 example: "Aumentar masa muscular"
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - date_birth
 *               - goals
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
 *                   example: "Athlete has been created"
 *                 newAthlete:
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
import Trainer from "@/models/Trainer";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";


export async function POST(req: Request) {
    try {
        await connect()
        const user = await getCurrentUser();
        const data = await req.formData();

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

        const emailUser = await Athlete.findOne({ email })
        if (emailUser) {
            return NextResponse.json({ message: "email already used" }, { status: 400 })
        }

        const phoneUser = await Athlete.findOne({ phone })
        if (phoneUser) {
            return NextResponse.json({ phone: "phone already used" }, { status: 400 })
        }

        const newAthlete = await Athlete.create({ name, email, phone, date_birth, goals, trainer_id })

        
        const otpResponse = await fetch(`http://localhost:3000/send-otp`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                "phoneNumber": newAthlete.phone,
                "athlete_id": newAthlete._id,
                "messageType": "signup"
            })
        });
        const otpResult = await otpResponse.json();
        if (!otpResponse.ok) {
            return NextResponse.json({
                message: "Athlete created, but OTP failed to send.",
                newAthlete,
                error: otpResult.error || "Unknown error",
                status: 500
            });
        }


        return NextResponse.json({
            message: "Athlete had been created and OTP sent successfully",
            newAthlete,
            otp: otpResult,
            status: 201
        });

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