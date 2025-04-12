import { cloudinary } from "@/lib/cloudinary/cloudinary";
import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import Category from "@/models/Category";
import Exercise from "@/models/Exercise";
import { NextResponse } from "next/server";

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
export const GET = async (request: Request) => {
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

    return NextResponse.json(exercises);
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while getting the exercises: ${errorMessage}`,
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    await connect();

    const { name, description, category_id, img } = await request.json();

    if (!name || !category_id) {
      return new NextResponse("Name and category_id are required", {
        status: 400,
      });
    }

    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return new NextResponse("Category not found", { status: 404 });
    }

    let imgUrl = "";
    if (img) {
      const uploadedImage = await cloudinary.uploader.upload(img, {
        folder: "exercises",
      });
      imgUrl = uploadedImage.secure_url;
    }

    const newExercise = new Exercise({
      name,
      description,
      category_id,
      img: imgUrl,
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
