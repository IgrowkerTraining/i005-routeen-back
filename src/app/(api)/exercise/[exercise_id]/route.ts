import { cloudinary } from "@/lib/cloudinary/cloudinary";
import connect from "@/lib/db";
import { handleError } from "@/lib/errorHandler";
import Category from "@/models/Category";
import Exercise from "@/models/Exercise";
import { NextResponse } from "next/server";

const getCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp|gif)$/);
  return match ? match[1] : null;
};

export const PATCH = async (
  request: Request,
  { params }: { params: { exercise_id: string } }
): Promise<NextResponse> => {
  try {
    const { exercise_id } = params;
    const body = await request.json();
    const {
      name,
      description,
      category_id,
      img,
    }: {
      name?: string;
      description?: string;
      category_id?: string;
      img?: string;
    } = body;

    await connect();

    if (!exercise_id) {
      return new NextResponse("Exercise ID is required", { status: 400 });
    }

    const exercise = await Exercise.findById(exercise_id);
    if (!exercise) {
      return new NextResponse("Exercise not found", { status: 404 });
    }

    if (name) exercise.name = name;
    if (description) exercise.description = description;

    if (category_id && category_id !== exercise.category_id.toString()) {
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return new NextResponse("Category not found", { status: 404 });
      }
      exercise.category_id = category_id;
    }

    if (img && img !== exercise.img) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(img, {
          folder: "exercises",
        });

        const publicId = getCloudinaryPublicId(exercise.img);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }

        exercise.img = uploadedImage.secure_url;
      } catch (uploadError) {
        return new NextResponse("Failed to upload image to Cloudinary", {
          status: 500,
        });
      }
    }

    await exercise.save();

    return NextResponse.json(exercise, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while updating the exercise: ${errorMessage}`,
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: { exercise_id: string } }
): Promise<NextResponse> => {
  try {
    const { exercise_id } = params;

    await connect();

    if (!exercise_id) {
      return new NextResponse("Exercise ID is required", { status: 400 });
    }

    const exercise = await Exercise.findById(exercise_id);
    if (!exercise) {
      return new NextResponse("Exercise not found", { status: 404 });
    }

    if (exercise.img) {
      const publicId = getCloudinaryPublicId(exercise.img);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
          return new NextResponse(
            "Failed to delete image from Cloudinary. Exercise was not deleted.",
            { status: 500 }
          );
        }
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
