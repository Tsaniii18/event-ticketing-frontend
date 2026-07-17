import { X, ZoomIn, ZoomOut } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Button from "./Button";

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  aspectRatio = "square",
}) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleClose = () => {
    setScale(1);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !imageSrc) return null;

  const getAspectRatioStyle = () => {
    if (aspectRatio === "square") {
      return { aspectRatio: "1 / 1" };
    }
    return { aspectRatio: "16 / 6" };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="ui-modal-backdrop items-center bg-black/90 p-2 backdrop-blur-sm sm:p-4"
          onClick={handleBackdropClick}
        >
          <Button unstyled
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </Button>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 z-10"
          >
            <Button unstyled
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut size={20} />
            </Button>
            <span className="text-white text-sm font-medium min-w-15 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button unstyled
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn size={20} />
            </Button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Motion.div
              animate={{ scale }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full flex items-center justify-center"
            >
              <div
                className="relative w-full max-h-[85vh] sm:max-h-[80vh] bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl"
                style={getAspectRatioStyle()}
              >
                <img
                  src={imageSrc}
                  alt={imageAlt || "Preview"}
                  className="w-full h-full object-contain"
                  draggable="false"
                  onError={(e) => {
                    e.target.src =
                      "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                  }}
                />
              </div>
            </Motion.div>
          </Motion.div>

          {imageAlt && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 max-w-[50%] sm:max-w-[60%]"
            >
              <p className="text-white/90 text-sm sm:text-lg font-medium truncate bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                {imageAlt}
              </p>
            </Motion.div>
          )}

          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs"
          >
            Ketuk di luar gambar untuk menutup
          </Motion.p>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
