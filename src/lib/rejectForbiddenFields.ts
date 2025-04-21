export function rejectForbiddenFields<T extends object>(
  body: T,
  forbiddenFields: string[]
): string | null {
  for (const field of forbiddenFields) {
    if (field in body) {
      return `The field ${field} is not allowed.`;
    }
  }
  return null;
}