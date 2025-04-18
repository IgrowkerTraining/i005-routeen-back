/**
 * @swagger
 * /athlete:
 *   get:
 *     summary: Buscar atletas por nombre
 *     tags:
 *       - Athlete
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Nombre del atleta para realizar la búsqueda.
 *         required: true
 *         schema:
 *           type: string
 *           example: "John Doe"
 *     responses:
 *       200:
 *         description: Atletas encontrados con el nombre proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 athletes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60d62b1f65b8b9f1f6b7d1c8"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *       400:
 *         description: El nombre del atleta es obligatorio.
 *       403:
 *         description: El usuario debe ser un entrenador para realizar esta búsqueda.
 *       404:
 *         description: No se encontraron atletas con el nombre proporcionado.
 *       500:
 *         description: Error en la base de datos o en la búsqueda de los atletas.
 */

import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { MongooseError } from "mongoose";

export async function GET(req: Request) {
    try {
        await connect();
        const user = await getCurrentUser();

        if (user.role !== 'trainer') {
            return NextResponse.json({ message: "You must be a trainer to search athletes." }, { status: 403 });
        }

        const url = new URL(req.url);
        const name = url.searchParams.get('name');

        if (!name) {
            return NextResponse.json({ message: "Athlete name is required" }, { status: 400 });
        }

        const athletes = await Athlete.find({ name: { $regex: name, $options: 'i' } });

        if (athletes.length === 0) {
            return NextResponse.json({ message: "No athletes found with this name." }, { status: 404 });
        }

        return NextResponse.json({ athletes }, { status: 200 });

    } catch (error: any) {
        if (error instanceof MongooseError) {
            return new NextResponse("Database error: " + error.message, { status: 500 });
        }
        return new NextResponse("Error in searching athletes: " + error.message, { status: 500 });
    }
}