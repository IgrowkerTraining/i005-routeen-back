import { Error as MongooseError } from "mongoose";

interface ErrorResponse {
  message: string;
  status: number;
}

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof MongooseError.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return {
      message: `Validation error: ${messages.join(", ")}`,
      status: 400,
    };
  }

  if (error instanceof MongooseError.CastError && error.kind === "ObjectId") {
    return {
      message: "Invalid ID format",
      status: 400,
    };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "http_code" in error &&
    "message" in error
  ) {
    return {
      message: `Cloudinary error: ${(error as any).message}`,
      status: (error as any).http_code || 500,
    };
  }

  if (error instanceof Error) {
    console.error("Error:", error.message);
    return {
      message: error.message,
      status: 500,
    };
  }

  console.error("Unknown error:", error);
  return {
    message: "An unknown error occurred",
    status: 500,
  };
};
