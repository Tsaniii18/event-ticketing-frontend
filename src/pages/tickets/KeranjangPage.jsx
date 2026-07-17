import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/layout/Navbar";
import { cartAPI, paymentAPI } from "../../services";
import useNotification from "../../hooks/useNotification";
import NotificationModal from "../../components/common/NotificationModal";
import {
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  Calendar,
  MapPin,
  Plus,
  Minus,
  AlertCircle,
  ShoppingCart,
  Loader2,
  RefreshCw,
  Sparkles,
  Ticket,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  formatCurrency as formatRupiah,
  formatLongDateOrEmpty as formatDate,
  transformCartData,
} from "../../utils";
import Button from "../../components/common/Button";

export default function KeranjangPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const { notification, showNotification, hideNotification } = useNotification();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [itemToDecrement, setItemToDecrement] = useState(null);

  const [showFreeTicketModal, setShowFreeTicketModal] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await cartAPI.getCart();

      if (response.data && response.data.carts) {
        const transformedCart = transformCartData(response.data.carts);
        setCart(transformedCart);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      const errorMessage = err.response?.data?.error || "Gagal memuat data keranjang";
      setError(errorMessage);
      showNotification(errorMessage, "Error", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openPaymentPage = () => {
    if (paymentData?.payment_url) {
      window.open(paymentData.payment_url, '_blank');
      setShowCheckoutModal(false);
    }
  };

  const isAllFreeTickets = () => {
    return cart.length > 0 && !cart.some((event) =>
      event.tickets.some((ticket) => ticket.price > 0)
    );
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await cartAPI.deleteCart({ cart_id: itemToDelete.cartId });
      showNotification(`Tiket "${itemToDelete.ticketName}" berhasil dihapus`, "Sukses", "success");
      await fetchCart();
    } catch (err) {
      console.error("Error deleting cart item:", err);
      showNotification("Gagal menghapus tiket dari keranjang", "Error", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const confirmDecrement = async () => {
    if (!itemToDecrement) return;

    try {
      await cartAPI.deleteCart({ cart_id: itemToDecrement.cartId });
      showNotification("Tiket berhasil dihapus dari keranjang", "Sukses", "success");
      await fetchCart();
    } catch (err) {
      console.error("Error deleting cart item:", err);
      showNotification("Gagal menghapus tiket dari keranjang", "Error", "error");
    } finally {
      setShowDecrementModal(false);
      setItemToDecrement(null);
    }
  };

  const confirmFreeTicketCheckout = async () => {
    setShowFreeTicketModal(false);
    setCheckoutLoading(true);

    try {
      const response = await paymentAPI.createPayment();

      if (response.data) {
        showNotification("Tiket gratis berhasil diklaim!", "Sukses", "success");
        await fetchCart();
        navigate('/tiket-saya');
      } else {
        throw new Error("Gagal memproses tiket gratis");
      }

    } catch (err) {
      console.error("Error during free ticket checkout:", err);
      const errorMessage = err.response?.data?.error || "Gagal memproses tiket gratis";
      showNotification(errorMessage, "Error", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const incrementQty = async (cartId, currentQty, stock) => {
    if (currentQty >= stock) {
      showNotification("Stok tidak mencukupi", "Peringatan", "warning");
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty + 1
      };

      await cartAPI.updateCart(updateData);
      await fetchCart();
      showNotification("Jumlah tiket berhasil ditambah", "Sukses", "success");
    } catch (err) {
      console.error("Error incrementing quantity:", err);
      const errorMessage = err.response?.data?.error || "Gagal menambah jumlah tiket";
      showNotification(errorMessage, "Error", "error");
    }
  };

  const decrementQty = async (cartId, currentQty, ticketName) => {
    if (currentQty <= 1) {
      setItemToDecrement({
        cartId,
        ticketName
      });
      setShowDecrementModal(true);
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty - 1
      };

      await cartAPI.updateCart(updateData);
      await fetchCart();
      showNotification("Jumlah tiket berhasil dikurangi", "Sukses", "success");
    } catch (err) {
      console.error("Error decrementing quantity:", err);
      const errorMessage = err.response?.data?.error || "Gagal mengurangi jumlah tiket";
      showNotification(errorMessage, "Error", "error");
    }
  };

  const deleteCartItem = async (cartId, ticketName) => {
    setItemToDelete({
      cartId,
      ticketName
    });
    setShowDeleteModal(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification("Keranjang kosong, tidak dapat checkout", "Peringatan", "warning");
      return;
    }

    if (isAllFreeTickets()) {
      setShowFreeTicketModal(true);
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await paymentAPI.createPayment();

      if (response.data) {
        setPaymentData(response.data);

        sessionStorage.setItem('last_transaction_id', response.data.transaction_id);
        sessionStorage.setItem('last_transaction_total', response.data.total);

        setShowCheckoutModal(true);
        await fetchCart();

      } else {
        throw new Error("Data pembayaran tidak tersedia");
      }

    } catch (err) {
      console.error("Error during checkout:", err);
      const errorMessage = err.response?.data?.error || "Gagal memproses checkout";
      showNotification(errorMessage, "Checkout Gagal", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalHarga = cart.reduce(
    (sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.price * ticket.qty, 0),
    0
  );

  if (loading) {
    return (
      <div className="ui-page">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="ui-spinner mx-auto size-16"
            />
            <p className="mt-6 text-gray-600 font-medium">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && cart.length === 0) {
    return (
      <div className="ui-page">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24 p-4">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ui-feedback-panel ui-error-state p-8"
          >
            <div className="ui-feedback-icon mb-6 size-20 bg-danger-100">
              <AlertCircle className="w-10 h-10 text-danger-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button
              onClick={fetchCart}
              variant="primary" className="w-full rounded-xl px-6 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className="inline mr-2" />
              Coba Lagi
            </Button>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page">
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <AnimatePresence>
        {showDeleteModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="ui-modal-panel max-w-sm rounded-2xl border border-gray-100 p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Tiket
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Hapus tiket "{itemToDelete?.ticketName}" dari keranjang?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    variant="secondary" className="flex-1 py-2"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    variant="danger" className="flex-1 py-2"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDecrementModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="ui-modal-panel max-w-sm rounded-2xl border border-gray-100 p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <X className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Tiket
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Jumlah tiket akan menjadi 0. Hapus tiket "{itemToDecrement?.ticketName}" dari keranjang?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDecrementModal(false);
                      setItemToDecrement(null);
                    }}
                    variant="secondary" className="flex-1 py-2"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={confirmDecrement}
                    variant="danger" className="flex-1 py-2"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFreeTicketModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="ui-modal-panel max-w-sm rounded-2xl border border-gray-100 p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Konfirmasi Tiket Gratis
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Anda akan mengklaim tiket gratis. Setelah dikonfirmasi, tiket akan langsung muncul di halaman "Tiket Saya" dan Anda akan langsung diarahkan ke sana.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowFreeTicketModal(false)}
                    variant="secondary" className="flex-1 py-2"
                    disabled={checkoutLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={confirmFreeTicketCheckout}
                    disabled={checkoutLoading}
                    variant="success" className="flex-1 py-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Konfirmasi"
                    )}
                  </Button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckoutModal && paymentData && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="ui-modal-panel max-w-md rounded-2xl border border-gray-100 p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Checkout Berhasil!
                </h2>
                <Button unstyled
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="ui-alert ui-alert-success">
                  <p className="font-semibold text-center">
                    Anda akan diarahkan ke halaman pembayaran...
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 text-gray-900">Detail Transaksi</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transaksi:</span>
                      <span className="font-medium text-gray-900">{paymentData.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pembayaran:</span>
                      <span className="font-bold text-brand-600">{formatRupiah(paymentData.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-yellow-600">Menunggu Pembayaran</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-900">Link Pembayaran</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Jika tidak diarahkan otomatis, salin link berikut atau klik tombol di bawah:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentData.payment_url}
                      readOnly
                      className="ui-input flex-1 px-3 py-2 text-xs"
                    />
                    <Button unstyled
                      onClick={() => copyToClipboard(paymentData.payment_url)}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setShowCheckoutModal(false)}
                    variant="secondary" className="flex-1 py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={openPaymentPage}
                    variant="primary" className="flex-1 py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka Pembayaran
                  </Button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-12">
        <div className="ui-container">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel mt-15 p-6 md:p-8"
          >

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 mt-2">
                  Kelola tiket event yang akan Anda beli
                </p>
              </div>

              <Button
                onClick={fetchCart}
                variant="primary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
            </Motion.div>

            {cart.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Keranjang Kosong</h3>
                <p className="text-gray-600 mb-8">Belum ada tiket di keranjang belanja Anda</p>
                <Button
                  onClick={() => navigate('/cariEvent')}
                  variant="primary" className="rounded-xl px-6 py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={18} className="inline mr-2" />
                  Jelajahi Event
                </Button>
              </Motion.div>
            ) : (
              <>
                <div className="space-y-6">
                  {cart.map((event, index) => (
                    <Motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >

                      <div className="p-6 md:p-8 bg-linear-to-r from-brand-50 to-brand-100">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="shrink-0">
                            <img
                              src={event.eventPoster}
                              alt={event.eventName}
                              className="w-20 h-20 rounded-xl object-cover shadow-md border border-gray-200"
                              onError={(e) => {
                                e.target.src = "https://picsum.photos/600/600?random=21";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h2>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} className="text-brand-600 shrink-0" />
                                <span className="text-sm">{formatDate(event.eventDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} className="text-brand-600 shrink-0" />
                                <span className="text-sm">{event.eventLocation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200">
                        <div className="p-6 md:p-8 space-y-4">
                          {event.tickets.map((ticket, ticketIndex) => (
                            <Motion.div
                              key={ticket.cartId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (index + ticketIndex) * 0.05 }}
                              className="bg-gray-50 rounded-xl border border-gray-300 p-4 hover:border-brand-300 transition-colors"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{ticket.name}</h3>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {ticket.description}
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900">{formatRupiah(ticket.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Stok tersedia:</span>
                                      <span className="font-semibold text-gray-900">{ticket.stock}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-300 p-2 shadow-sm">
                                    <Button unstyled
                                      onClick={() => decrementQty(ticket.cartId, ticket.qty, ticket.name)}
                                      className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Minus size={16} className="text-gray-700" />
                                    </Button>
                                    <span className="w-8 text-center font-bold text-lg text-gray-900">{ticket.qty}</span>
                                    <Button unstyled
                                      onClick={() => incrementQty(ticket.cartId, ticket.qty, ticket.stock)}
                                      className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Plus size={16} className="text-gray-700" />
                                    </Button>
                                  </div>

                                  <Button unstyled
                                    onClick={() => deleteCartItem(ticket.cartId, ticket.name)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                                    title="Hapus dari keranjang"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                <span className="text-gray-600 text-sm">Subtotal:</span>
                                <span className="font-bold text-gray-900 text-lg">
                                  {formatRupiah(ticket.price * ticket.qty)}
                                </span>
                              </div>
                            </Motion.div>
                          ))}
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </div>

                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 pt-8 border-t border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="bg-linear-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total Pembayaran:</span>
                          <span className="font-bold text-2xl">
                            {formatRupiah(totalHarga)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600 space-y-1">
                        {isAllFreeTickets() ? (
                          <>
                            <p className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Untuk tiket gratis, tiket akan langsung muncul di "Tiket Saya"
                            </p>
                            <p className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Anda akan langsung diarahkan ke halaman tiket Anda
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Klik tombol checkout untuk mengklaim tiket gratis Anda
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Pembayaran akan dilakukan secara aman melalui Midtrans
                            </p>
                            <p className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Anda akan dibawa ke tab baru untuk pembayaran
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Setelah pembayaran selesai, Anda bisa menutup tab pembayaran dan kembali ke halaman ini
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="lg:w-64">
                      <Button
                        variant="primary" className="w-full rounded-xl bg-linear-to-r from-brand-600 to-brand-700 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:from-brand-700 hover:to-brand-800 hover:shadow-xl"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={20} />
                            Checkout & Bayar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Motion.div>
              </>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
