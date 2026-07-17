import { Eye, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion as Motion } from "framer-motion";

export function TicketItem({
  ticket,
  index,
  showControls,
  onUpdateQty,
  onViewDetail,
  isEventEnded,
  formatPrice,
  formatDateTime,
}) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="ui-card bg-linear-to-br from-white to-gray-50 p-4 transition-all duration-300 hover:shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
            <p className="bg-linear-to-r from-brand-600 to-brand-800 bg-clip-text text-base font-bold text-transparent sm:text-lg lg:text-xl">
              {ticket.type}
            </p>
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

          {ticket.date_time_start && (
            <div className="space-y-0.5 text-xs text-gray-700 sm:text-sm">
              <p>
                <span className="font-medium">Mulai:</span>{" "}
                {formatDateTime(ticket.date_time_start)}
              </p>
              <p>
                <span className="font-medium">Selesai:</span>{" "}
                {formatDateTime(ticket.date_time_end)}
              </p>
              {isEventEnded && (
                <p className="text-xs font-medium text-danger-600">
                  Event ini sudah berakhir
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 sm:gap-3">
          <p
            className={`text-xl sm:text-2xl font-bold ${
              ticket.price === 0 ? "text-green-600" : "text-gray-900"
            }`}
          >
            {formatPrice(ticket.price)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetail(ticket);
          }}
          className="ui-button w-full bg-gray-100 text-gray-700 hover:bg-gray-200 sm:w-auto sm:text-base"
        >
          <Eye size={16} />
          Lihat Detail
        </button>

        {showControls && (
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
            {!isEventEnded && (
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Tersisa: {ticket.stock} pcs
              </p>
            )}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onUpdateQty(index, -1)}
                  disabled={ticket.qty === 0 || isEventEnded}
                  className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    ticket.qty === 0 || isEventEnded
                      ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-purple-50 hover:text-purple-600 bg-white text-gray-700"
                  } border border-transparent`}
                >
                  <Minus size={18} className="sm:w-4 sm:h-4" />
                </button>
                <span className="w-10 sm:w-8 text-center font-bold text-lg text-gray-900">
                  {ticket.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(index, 1)}
                  className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    ticket.qty >= ticket.stock ||
                    ticket.stock === 0 ||
                    isEventEnded
                      ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "hover:bg-purple-50 hover:text-purple-600 bg-white text-gray-700"
                  } border border-transparent`}
                  disabled={
                    ticket.qty >= ticket.stock ||
                    ticket.stock === 0 ||
                    isEventEnded
                  }
                >
                  <Plus size={18} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Motion.div>
  );
}

export function CartSummary({
  tickets,
  totalPrice,
  onAddToCart,
  formatPrice,
}) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="sticky top-4 rounded-xl border border-brand-200 bg-linear-to-br from-brand-50 to-brand-100 p-4 shadow-lg sm:p-6"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
        Ringkasan Pembelian
      </h3>

      <div className="space-y-2 sm:space-y-3 mb-4">
        {tickets
          .filter((ticket) => ticket.qty > 0)
          .map((ticket) => (
            <div
              key={ticket.ticket_category_id}
              className="flex justify-between text-xs sm:text-sm bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200"
            >
              <span className="text-gray-700 truncate mr-2">
                {ticket.type} × {ticket.qty}
              </span>
              <span className="font-medium text-gray-900 shrink-0">
                {formatPrice(ticket.price * ticket.qty)}
              </span>
            </div>
          ))}
      </div>

      <div className="border-t border-brand-200 pt-3 sm:pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            Total
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold ${
              totalPrice === 0 ? "text-green-600" : "text-brand-600"
            }`}
          >
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <Motion.button
        onClick={onAddToCart}
        className="ui-button ui-button-primary w-full rounded-xl bg-linear-to-r from-brand-600 to-brand-700 py-3 font-semibold shadow-lg transition-all duration-300 hover:from-brand-700 hover:to-brand-800 hover:shadow-xl active:scale-[0.98] sm:py-4 sm:text-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
        Masukkan ke Keranjang
      </Motion.button>
    </Motion.div>
  );
}
