export const createObjectPreviewUrl = (file) => URL.createObjectURL(file);

export const revokeObjectUrls = (urls) => {
  Object.values(urls).forEach((url) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  });
};

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const downloadUrl = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export const downloadBlob = (
  data,
  filename,
  type = "application/octet-stream",
) => {
  const objectUrl = URL.createObjectURL(new Blob([data], { type }));
  downloadUrl(objectUrl, filename);
  URL.revokeObjectURL(objectUrl);
};

export const copyTextToClipboard = (text) =>
  navigator.clipboard.writeText(text);

export const openExternalUrl = (url) => window.open(url, "_blank");
