export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    return error.message;
  } else {
    console.error("An unknown error occurred");
    return "An unknown error occurred";
  }
};
