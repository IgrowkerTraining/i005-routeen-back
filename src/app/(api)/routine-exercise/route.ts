import { handleError } from "@/lib/errorHandler";
import { NextResponse } from "next/server";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return new NextResponse(
      `An error occurred while creating the exercise: ${errorMessage}`,
      { status: 500 }
    );
  }
};
