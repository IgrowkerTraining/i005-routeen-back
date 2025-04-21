/**
 * @swagger
 * /category:
 *   post:
 *     summary: Crear una nueva categoría (solo accesible para administradores)
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la nueva categoría (se normaliza a minúsculas)
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 category:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "fitness"
 *       400:
 *         description: El nombre es obligatorio o los datos no son válidos
 *       403:
 *         description: Acceso no autorizado, se requiere rol de administrador
 *       409:
 *         description: Ya existe una categoría con el mismo nombre
 *       500:
 *         description: Error interno del servidor
 */


/**
 * @swagger
 * /category:
 *   get:
 *     summary: Obtiene todas las categorías disponibles
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: No se encontraron categorías
 *       500:
 *         description: Error del servidor al obtener las categorías
 */

import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
    try {
        await connect();
        const user = await getCurrentUser();
        const { name } = await req.json();

        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized, admin role required" }, { status: 403 });
        }

        if (!name) {
            return NextResponse.json({ message: "Name is obligatory" }, { status: 400 });
        }

        const normalizedName = name.trim().toLowerCase();
        const existingCategory = await Category.findOne({ name: normalizedName });
        if (existingCategory) {
            return NextResponse.json({ message: "A category with this name already exists." }, { status: 409 });
        }

        const newCategory = await Category.create({ name:normalizedName });
        return NextResponse.json(
            { message: "Category created successfully", category: newCategory },
            { status: 201 }
        );

    } catch (error: any) {
        if(error.code ===11000){
            return NextResponse.json(
                {message:"A category whit this name already exists."},
                {status:409}
            )
        }

        if (error instanceof MongooseError) {
            return NextResponse.json({ message: "Database Error" },{ status: 500 });
        }

        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function GET() {
    try {
        await connect();
        const categories = await Category.find();
        if (!categories || categories.length === 0) {
            return NextResponse.json({ message: "No categories found" }, { status: 404 });
        }


        return NextResponse.json(categories, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
    }
}


