/**
 * @swagger
 * /exercise/{exercise_id}:
 *   patch:
 *     tags:
 *       - Exercise
 *     summary: Actualizar un ejercicio
 *     description: Solo usuarios con rol admin pueden actualizar ejercicios. También puede actualizar la imagen si se proporciona una nueva.
 *     parameters:
 *       - in: path
 *         name: exercise_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ejercicio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *               img_url:
 *                 type: string
 *             example:
 *               name: "Plancha"
 *               description: "Ejercicio para el core"
 *               category_id: "661c2a0f3b2e8a541242d5f6"
 *               img_url: "data:image/jpeg;base64,..."
 *     responses:
 *       200:
 *         description: Ejercicio actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Datos inválidos o ID de categoría inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Ejercicio o categoría no encontrados
 *       500:
 *         description: Error en el servidor
 */
/**
 * @swagger
 * /exercise/{exercise_id}:
 *   delete:
 *     tags:
 *       - Exercise
 *     summary: Eliminar un ejercicio
 *     description: Solo usuarios con rol admin pueden eliminar ejercicios. También elimina la imagen de Cloudinary si existe.
 *     parameters:
 *       - in: path
 *         name: exercise_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ejercicio a eliminar
 *     responses:
 *       200:
 *         description: Ejercicio eliminado correctamente
 *       400:
 *         description: Falta el ID del ejercicio o es inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Ejercicio no encontrado
 *       500:
 *         description: Error al eliminar la imagen o el ejercicio
 */

import { cloudinary } from "@/lib/cloudinary/cloudinary";
import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import { getCurrentUser } from "@/lib/getCurrentUser";
import validate from "@/lib/validate";
import Category from "@/models/Category";
import Exercise from "@/models/Exercise";
import { NextResponse } from "next/server";

export const PATCH = async (
  request: Request,
  { params }: { params: { exercise_id: string } }
): Promise<NextResponse> => {
  try {
    const user = await getCurrentUser();
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized, admin role required" },
        { status: 403 }
      );
    }

    const { exercise_id } = params;

    validate.isValidObjectId(exercise_id);

    await connect();

    const exercise = await Exercise.findById(exercise_id);
    if (!exercise) {
      return NextResponse.json(
        { message: "Exercise not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category_id,
      img_url,
    }: {
      name?: string;
      description?: string;
      category_id?: string;
      img_url?: string;
    } = body;

    if (name) {
      validate.isValidString(name, "Name");
      exercise.name = name;
    }

    if (description) {
      validate.isValidString(description, "Description");
      exercise.description = description;
    }

    if (category_id && category_id !== exercise.category_id.toString()) {
      try {
        validate.isValidObjectId(category_id);
      } catch (err) {
        return NextResponse.json(
          { message: "Invalid category ID" },
          { status: 400 }
        );
      }

      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      exercise.category_id = category_id;
    }

    if (img_url && img_url !== exercise.img_url) {
      const previousImgId = exercise.img_id;
      const previousImgUrl = exercise.img_url;

      try {
        if (previousImgId) {
          await cloudinary.uploader.destroy(previousImgId);
        }

        const uploadedImage = await cloudinary.uploader.upload(img_url, {
          folder: "exercises",
        });

        exercise.img_url = uploadedImage.secure_url;
        exercise.img_id = uploadedImage.public_id;
      } catch (uploadError) {
        console.error("Cloudinary image update error:", uploadError);

        exercise.img_url = previousImgUrl;
        exercise.img_id = previousImgId;

        return NextResponse.json(
          { message: "Failed to update image in Cloudinary" },
          { status: 500 }
        );
      }
    }

    await exercise.save();
    return NextResponse.json(exercise, { status: 200 });
  } catch (error: unknown) {
    const message = handleError(error);
    return NextResponse.json(
      { message: `An error occurred while updating the exercise: ${message}` },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: { exercise_id: string } }
): Promise<NextResponse> => {
  try {
    const user = await getCurrentUser();
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized, admin role required" },
        { status: 403 }
      );
    }

    const { exercise_id } = params;

    if (!exercise_id) {
      return new NextResponse("Exercise ID is required", { status: 400 });
    }

    validate.isValidObjectId(exercise_id);

    await connect();

    const exercise = await Exercise.findById(exercise_id);
    if (!exercise) {
      return new NextResponse("Exercise not found", { status: 404 });
    }

    if (exercise.img_id) {
      const result = await cloudinary.uploader.destroy(exercise.img_id);
      if (result.result !== "ok" && result.result !== "not found") {
        return new NextResponse(
          "Failed to delete image from Cloudinary. Exercise was not deleted.",
          { status: 500 }
        );
      }
    }

    await exercise.deleteOne();

    return new NextResponse("Exercise deleted successfully", { status: 200 });
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while deleting the exercise: ${errorMessage}`,
      { status: 500 }
    );
  }
};
