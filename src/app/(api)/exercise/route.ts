/**
 * @swagger
 * /exercise:
 *   post:
 *     tags:
 *       - Exercise
 *     summary: Crear un nuevo ejercicio
 *     description: Solo usuarios con rol admin pueden crear ejercicios. Se puede incluir una imagen y un video como archivos.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del ejercicio
 *               category_id:
 *                 type: string
 *                 description: ID de la categoría asociada
 *               img_url:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del ejercicio (opcional)
 *               video_url:
 *                 type: string
 *                 format: binary
 *                 description: Video del ejercicio (opcional)
 *             required:
 *               - name
 *               - category_id
 *           encoding:
 *             img_url:
 *               contentType: image/png, image/jpeg
 *             video_url:
 *               contentType: video/mp4
 *     responses:
 *       201:
 *         description: Ejercicio creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Categoría no encontrada
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
  category_id: string;
  img_url?: string;
  video_url?: string;
}

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const user = await getCurrentUser();
    await connect();

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized, admin role required" },
        { status: 403 }
      );
    }

    const data = await request.formData();

    const name = data.get("name")?.toString() || "";
    const category_id = data.get("category_id")?.toString() || "";
    const img_url = data.get("image");
    const video_url = data.get("video");

    const forbidden = rejectForbiddenFields(data, ["img_id", "_id", "__v"]);
    if (forbidden) {
      return NextResponse.json({ message: forbidden }, { status: 400 });
    }

    validate.isValidString(name, "Name");
    validate.isValidObjectId(category_id);

    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    let imgUrl = "", imgId = "";
    const imgFile = data.get("img_url");
    if (imgFile && imgFile instanceof File) {
      const base64Image = await fileToBase64(imgFile);
      const uploadedImage = await cloudinary.uploader.upload(base64Image, {
        folder: "exercises",
      });
      imgUrl = uploadedImage.secure_url;
      imgId = uploadedImage.public_id;
    }

    let videoUrl = "", videoId = "";
    const videoFile = data.get("video_url");
    if (videoFile && videoFile instanceof File) {
      const base64Video = await fileToBase64(videoFile);
      const uploadedVideo = await cloudinary.uploader.upload(base64Video, {
        folder: "exercise_videos",
        resource_type: "video",
      });
      videoUrl = uploadedVideo.secure_url;
      videoId = uploadedVideo.public_id;
    }

    const newExercise = new Exercise({
      name,
      category_id,
      img_url: imgUrl,
      img_id: imgId,
      video_url: videoUrl,
      video_id: videoId,
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

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
};