import { useCallback, useState } from "react";

export default function useImagePreview() {
  const [previewData, setPreviewData] = useState(null);

  const openImagePreview = useCallback((data) => {
    if (data) setPreviewData(data);
  }, []);

  const closeImagePreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  return {
    previewData,
    isPreviewOpen: previewData !== null,
    openImagePreview,
    closeImagePreview,
  };
}
