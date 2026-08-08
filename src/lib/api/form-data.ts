/**
 * Laravel (via PHP) only populates $_FILES for native POST requests, so
 * multipart updates must be sent as POST with a `_method` override field
 * rather than a real HTTP PUT/PATCH.
 */
export function buildFormData<T extends object>(
  input: T,
  method?: "PUT" | "PATCH"
): FormData {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0 && (value[0] instanceof File || value[0] instanceof Blob)) {
        (value as File[]).forEach((file) => formData.append(`${key}[]`, file));
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
