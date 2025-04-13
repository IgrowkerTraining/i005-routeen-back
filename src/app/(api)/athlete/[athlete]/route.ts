/**
 * @swagger
 * /athlete/{athlete}:
 *   patch:
 *     summary: Actualizar datos del atleta y/o subir foto de perfil
 *     tags:
 *       - Athlete
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atleta
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
 *               phone:
 *                 type: string
 *               date_birth:
 *                 type: string
 *                 format: date
 *               goals:
 *                 type: string
 *               weight:
 *                 type: string
 *               height:
 *                 type: string
 *               gender:
 *                 type: string
 *               injuries:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *             required: []
 *     responses:
 *       200:
 *         description: Atleta actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Datos inválidos o sin campos para actualizar
 *       403:
 *         description: No autorizado para modificar este recurso
 *       404:
 *         description: Atleta no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /athlete/{athlete}:
 *   get:
 *     summary: Obtener información de un atleta por su ID
 *     tags:
 *       - Athlete
 *     parameters:
 *       - name: athlete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atleta
 *     responses:
 *       200:
 *         description: Datos del atleta obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Athlete'
 *       400:
 *         description: Atleta no encontrado
 *       500:
 *         description: Error del servidor
 */


import { NextResponse } from "next/server";
import Athlete, { AthleteType } from "@/models/Athlete";
import connect from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { v2 as cloudinary } from 'cloudinary';
import validate from "@/lib/validate";

export async function POST(req: Request, { params }: { params: { athlete: string } }) {
    try {
        await connect()
        const athleteId = params.athlete
        const user = await getCurrentUser()
        const data = await req.formData();
        const file = data.get("file") as File;

        if (user.id !== athleteId) {
            return NextResponse.json({ error: "You are not allow to do this change" }, { status: 403 });
        }

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 });
        }

        const existingUser = await Athlete.findById(user.id);
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const result = await uploadToCloudinary(file, {
            folder: "AthleteProfilePicture",
        });

        if (existingUser.profile_picture_id) {
            await cloudinary.uploader.destroy(existingUser.profile_picture_id);
        }

        const updateUser = await Athlete.findByIdAndUpdate(user.id, {
            profile_picture_url: result.secure_url,
            profile_picture_id: result.public_id,
        })

        if (!updateUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "File uploaded successfully",
            url: result.secure_url,
        }, { status: 201 })

    } catch (error: any) {

        return NextResponse.json({ message: "There was an error updating a profile picture" + error.message }, { status: 500 })
    }
}

export async function GET(
    req: Request,
    { params }: { params: { athlete: string } }
) {
    try {
        await connect();

        const athlete = await Athlete.findById(params.athlete);
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 });
        }
        return NextResponse.json(athlete, { status: 200 });
    } catch (error: any) {
        return new NextResponse("Error in fetching athlete: " + error.message, {
            status: 500,
        });
    }
}

export const PATCH = async (req: Request, { params }: { params: { athlete: string } }) => {
    try {
        await connect()
        const user = await getCurrentUser()
        const athleteId = params.athlete

        if (user.id !== athleteId) {
            return NextResponse.json({ error: "You are not allowed to make this change" }, { status: 403 });
        }

        const data = await req.formData();
        const updates: Partial<AthleteType> = {};

        const name = data.get("name")?.toString();
        const email = data.get("email")?.toString();
        const phone = data.get("phone")?.toString();
        const date_birth = data.get("date_birth")?.toString();
        const goals = data.get("goals")?.toString();
        const weight = data.get("weight")?.toString();
        const height = data.get("height")?.toString();
        const gender = data.get("gender")?.toString();
        const injuries = data.get("injuries")?.toString();

        if (name !== undefined && name !== null && name.trim() !== "") {
            validate.isValidName(name);
            updates.name = name;
        }

        if (email !== undefined && email !== null && email.trim() !== "") {
            validate.isValidEmail(email);
            updates.email = email;
        }

        if (phone !== undefined && phone !== null && phone.trim() !== "") {
            validate.isValidPhone(phone);
            updates.phone = phone;
        }

        if (date_birth !== undefined && date_birth !== null && date_birth.trim() !== "") {
            validate.isValidDate(date_birth);
            updates.date_birth = date_birth;
        }

        if (goals !== undefined && goals !== null && goals.trim() !== "") {
            validate.isValidString(goals, "Goals");
            updates.goals = goals;
        }

        if (weight !== undefined && weight !== null && weight.trim() !== "") {
            validate.isValidString(weight, "Weight");
            updates.weight = weight;
        }

        if (height !== undefined && height !== null && height.trim() !== "") {
            validate.isValidString(height, "Height");
            updates.height = height;
        }

        if (gender !== undefined && gender !== null && gender.trim() !== "") {
            validate.isValidString(gender, "Gender");
            updates.gender = gender;
        }

        if (injuries !== undefined && injuries !== null && injuries.trim() !== "") {
            validate.isValidString(injuries, "Injuries");
            updates.injuries = injuries;
        }

        const file = data.get("file") as File | null;
        if (file && file instanceof File) {
            const existingUser = await Athlete.findById(user.id);
            if (!existingUser) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const result = await uploadToCloudinary(file, {
                folder: "AthleteProfilePicture",
            });

            if (existingUser.profile_picture_id) {
                await cloudinary.uploader.destroy(existingUser.profile_picture_id);
            }

            updates.profile_picture_url = result.secure_url;
            updates.profile_picture_id = result.public_id;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { message: "No valid fields provided to update." },
                { status: 400 }
            );
        }

        const athlete = await Athlete.findByIdAndUpdate(athleteId, updates, {
            new: true,
            runValidators: true,
        });
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 404 })
        }
        return NextResponse.json(athlete, { status: 200 })
    } catch (error: any) {

        return new NextResponse("Error in updating athlete" + error.message, {
            status: 400
        })
    }
}

//TODO ver que hacer con delete