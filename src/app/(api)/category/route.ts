/**
 * @swagger
 * /category:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
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
 *                   example: Category created successfully
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: El campo name es obligatorio o hay un error de validación
 *       500:
 *         description: Error interno del servidor o error con la base de datos
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
import { Jwt } from "jsonwebtoken";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import Admin from "@/models/Admin";
import { get } from "http";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();


        if (!user || user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized, admin role required" }, { status: 403 });
        }
        await connect();

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { message: "The name is obligatory" },
                { status: 400 }
            );
        }
        const newCategory = await Category.create({ name });
        return NextResponse.json(
            { message: "Category created successfully", category: newCategory },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating category");
        if (error instanceof MongooseError) {
            return NextResponse.json(
                { message: "Database Error" },
                { status: 500 }
            );
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


