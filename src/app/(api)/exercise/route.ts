/**
 * @swagger
 * /exercise:
 *   get:
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

// //Endpoint para obtener todos los ejercicios
// export const GET = async () => {
//   try {
//     await connect();
//     const exercises = await Exercise.find();

//     return new NextResponse(JSON.stringify(exercises), { status: 200 });
//   } catch (error: any) {
//     return new NextResponse("Error in fetching exercises" + error.message, {
//       status: 500,
//     });
//   }
// };

//Endpoint para obtener los ejercicios con una categoría en concreto
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
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while getting the exercises: ${errorMessage}`,
      { status: 500 }
    );
  }
};

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
    const body = await request.json();

    const { name, description, category_id, img_url } = body;

    validate.isValidString(name, "Name");
    validate.isValidObjectId(category_id);
    if (description) validate.isValidString(description, "Description");

    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return new NextResponse("Category not found", { status: 404 });
    }

    if (!name || !category_id) {
      return NextResponse.json(
        { message: "Name and category_id are required" },
        { status: 400 }
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
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while creating the exercise: ${errorMessage}`,
      { status: 500 }
    );
  }
};
