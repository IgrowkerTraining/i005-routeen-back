/**
 * @swagger
 * /exercise:
 *   get:
 *     tags:
 *       - Exercise
 *     summary: Obtener ejercicios por categoría
 *     description: Retorna todos los ejercicios asociados a una categoría
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Falta category_id
 *       500:
 *         description: Error del servidor
 */
/**
 * @swagger
 * /exercise:
 *   post:
 *     tags:
 *       - Exercise
 *     summary: Crear un nuevo ejercicio
 *     description: Solo admins pueden crear ejercicios. Puede incluir imagen (url base64).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exercise'
 *     responses:
 *       201:
 *         description: Ejercicio creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       403:
 *         description: Usuario no autorizado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */

import { cloudinary } from "@/lib/cloudinary/cloudinary";
import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Category from "@/models/Category";
import Exercise from "@/models/Exercise";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";
import { rejectForbiddenFields } from "@/lib/rejectForbiddenFields";

interface ExerciseInput {
  name: string;
  description?: string;
  category_id: string;
  img_url?: string;
}

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const user = await getCurrentUser();

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized, admin role required" },
        { status: 403 }
      );
    }

    await connect();

    const body: ExerciseInput = await request.json();

    const forbidden = rejectForbiddenFields(body, ["img_id", "_id", "__v"]);
    if (forbidden) {
      return NextResponse.json({ message: forbidden }, { status: 400 });
    }

    const { name, description, category_id, img_url } = body;

    validate.isValidString(name, "Name");
    validate.isValidObjectId(category_id);
    if (description) validate.isValidString(description, "Description");

    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    let imgUrl = "";
    let imgId = "";
    if (img_url) {
      const uploadedImage = await cloudinary.uploader.upload(img_url, {
        folder: "exercises",
      });
      imgUrl = uploadedImage.secure_url;
      imgId = uploadedImage.public_id;
    }

    const newExercise = new Exercise({
      name,
      description,
      category_id,
      img_url: imgUrl,
      img_id: imgId,
    });

    await newExercise.save();

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
};

export const GET = async (request: Request): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    await connect();

    const exercises = await Exercise.find({ category_id: categoryId }).populate(
      "category_id"
    );

    return NextResponse.json(exercises, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleError(error);
    return NextResponse.json({ message }, { status });
  }
};
