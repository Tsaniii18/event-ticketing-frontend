import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "../constants/uiConstants";

export const validateImageFile = (
  file,
  { allowedTypes = ALLOWED_IMAGE_TYPES, maxSize = MAX_IMAGE_SIZE } = {},
) => {
  if (!file) return { isValid: false, reason: "missing" };

  const hasValidType = allowedTypes
    ? allowedTypes.includes(file.type)
    : file.type.startsWith("image/");

  if (!hasValidType) return { isValid: false, reason: "type" };
  if (file.size > maxSize) return { isValid: false, reason: "size" };

  return { isValid: true, reason: null };
};

export const getFileDisplayName = (
  file,
  {
    currentFile,
    currentLabel = "File saat ini",
    fallback = "Pilih file",
  } = {},
) => file?.name || (currentFile ? currentLabel : fallback);
