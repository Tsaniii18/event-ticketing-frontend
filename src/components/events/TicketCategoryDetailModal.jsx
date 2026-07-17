import { X } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";

export default function TicketCategoryDetailModal({
  isOpen,
  onClose,
  ticket,
  formatRupiah,
  formatDateTime,
  formatDescriptionWithNewlines,
}) {
  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="ui-modal-backdrop bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <Motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="ui-modal-panel sm:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate pr-2">
                Detail Tiket - {ticket.type}
              </h3>
              <Button unstyled
                onClick={onClose}
                className="ui-icon-button size-8 shrink-0 sm:size-10"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="bg-linear-to-r from-brand-50 to-brand-100 rounded-xl p-4 sm:p-6 border border-brand-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {ticket.type}
                    </h4>
                    <p className="text-2xl sm:text-3xl font-bold text-brand-700">
                      {formatRupiah(ticket.price)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.stock === 0 && (
                      <span className="ui-badge ui-badge-danger px-2 py-0.5 font-semibold sm:px-3 sm:py-1">
                        HABIS
                      </span>
                    )}
                    {ticket.stock > 0 && ticket.stock <= 10 && (
                      <span className="ui-badge ui-badge-warning px-2 py-0.5 font-semibold sm:px-3 sm:py-1">
                        HAMPIR HABIS
                      </span>
                    )}
                    {ticket.stock > 10 && (
                      <span className="ui-badge ui-badge-success px-2 py-0.5 font-semibold sm:px-3 sm:py-1">
                        TERSEDIA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  Deskripsi Tiket
                </h5>
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed">
                  {formatDescriptionWithNewlines(ticket.desc)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Informasi Stok
                  </h5>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Kuota Total</span>
                      <span className="font-semibold text-gray-900">
                        {ticket.quota}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Tiket Terjual</span>
                      <span className="font-semibold text-green-600">
                        {ticket.sold}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Stok Tersedia</span>
                      <span className="font-semibold text-brand-600">
                        {ticket.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h5 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Periode Tiket
                  </h5>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Tanggal Mulai</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {ticket.date_time_start
                          ? formatDateTime(ticket.date_time_start)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                        Tanggal Berakhir
                      </p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {ticket.date_time_end
                          ? formatDateTime(ticket.date_time_end)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
