/**
 * @swagger
 * /send-otp:
 *   post:
 *     summary: Enviar OTP por WhatsApp
 *     tags:
 *       - OTP
 *     description: Genera un código OTP y lo envía al número de teléfono proporcionado vía WhatsApp. También guarda el OTP en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - athlete_id
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "whatsapp:+5491123456789"
 *                 description: Número de WhatsApp con el prefijo 'whatsapp:'
 *               athlete_id:
 *                 type: string
 *                 example: "661d4e78fbe146285aa866b4"
 *                 description: ID del atleta al que se enviará el OTP
 *     responses:
 *       200:
 *         description: OTP enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "123456"
 *       400:
 *         description: Parámetros faltantes o formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number and athleteId are required"
 *       500:
 *         description: Error al enviar el mensaje o guardar en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error sending message or saving OTP"
 */


import { NextResponse } from "next/server";
import twilio from "twilio";
import connect from "@/lib/db";
import { generateOTP } from "@/lib/otp";
import Otp from "@/models/Otp";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
    await connect();

    const body = await req.json();
    const { phoneNumber, athlete_id, messageType } = body;

    if (!phoneNumber || !athlete_id) {
        return NextResponse.json({ error: "Phone number and athleteId are required" }, { status: 400 });
    }

    
    if (!phoneNumber.startsWith("whatsapp:")) {
        return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const existingOtp = await Otp.findOne({ athlete_id, active: true });

    if (existingOtp) {
        const currentDate = new Date();
        const otpExpiryDate = new Date(existingOtp.otp_end_date);

        if (currentDate < otpExpiryDate) {
            
            return NextResponse.json({ error: "An active OTP already exists for this athlete." }, { status: 400 });
        } else {
            
            existingOtp.active = false;
            await existingOtp.save();
        }
    }

    const { code, otp_end_date } = generateOTP();
    const otp_start_date = new Date();

    try {
        // Guardar en MongoDB
        const newOtp = await Otp.create({
            athlete_id: athlete_id,
            otp_code: code,
            otp_start_date,
            otp_end_date,
            active: true,
        });

        
        //const messageText = `👋 Hola! Tu código OTP es: *${code}*\nAccedé a tu rutina aquí: http://localhost:3000/rutina?otp=${code}\nVálido hasta el ${otp_end_date.toLocaleDateString()}`;
        let messageText = "";
        if(messageType ==="routineAssigned"){
            messageText=`🏋️ ¡Hola! Se te asignó una nueva rutina.\nAccedé a ella aquí: http://localhost:3000/rutina?otp=${code}\n`;
        }else {
            messageText=`👋 Hola! Tu código OTP es: *${code}*\nAccedé a tu rutina aquí: http://localhost:3000/rutina?otp=${code}\nVálido hasta el ${otp_end_date.toLocaleDateString()}`;
        }
        await client.messages.create({
            from: whatsappFrom, // Número de WhatsApp de Twilio
            to: phoneNumber, // Número de teléfono del usuario con el prefijo 'whatsapp:'
            body: messageText,
        });

        return NextResponse.json({ success: true, code });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error sending message or saving OTP" }, { status: 500 });
    }
}
