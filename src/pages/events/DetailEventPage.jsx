import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import {
  MapPin,
  CalendarDays,
  Shapes,
  CheckCircle,
  XCircle,
  Scale,
  Building,
  FileText,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Eye,
  Ticket,
  ChevronDown,
  ChevronUp,
  LogIn,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import api, { eventAPI } from "../../services";
import useNotification from "../../hooks/useNotification";
import useImagePreview from "../../hooks/useImagePreview";
import {
  formatCompactNumber as formatNumber,
  EVENT_DETAIL_STATUS_CONFIG,
  EVENT_DETAIL_STATUS_LABELS,
  formatLongDateTime as formatDateTime,
  formatRupiahTitleCase as formatRupiah,
  formatShortDateRange as formatDate,
  getCartFailureMessages,
  getEventAccessFlags,
  getLikedEventIds,
  getLikeCountAfterToggle,
  getSelectedTicketCartItems,
  getSelectedTicketTotal,
  hasSelectedTickets,
  partitionCartResults,
  readTokenPayload,
  resetTicketQuantities,
  transformSelectableTicketCategories,
  updateTicketQuantity,
} from "../../utils";
import NotificationModal from "../../components/common/NotificationModal";
import TicketCategoryDetailModal from "../../components/events/TicketCategoryDetailModal";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import {
  CartSummary,
  TicketItem,
} from "../../components/events/EventTicketSelection";
import { DescriptionWithNewlines } from "../../components/events/EventFormFields";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

function StatusBadge({ status }) {
  const config = EVENT_DETAIL_STATUS_CONFIG[status] || {
    className: "bg-gray-100 text-gray-700 border border-gray-200",
    icon: EVENT_DETAIL_STATUS_CONFIG.pending.icon,
    iconClassName: "text-gray-600",
  };
  const StatusIcon = config.icon;

  return (
    <div className={`ui-badge py-2 ${config.className}`}>
      <StatusIcon className={`w-5 h-5 ${config.iconClassName}`} />
      <span className="font-semibold">
        {EVENT_DETAIL_STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}

function AdminVerificationSection({ onVerify, verifying }) {
  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-brand-50 border border-brand-200 rounded-xl">
      <h3 className="text-lg sm:text-xl font-semibold text-brand-800 mb-2 sm:mb-3">
        Verifikasi Event
      </h3>
      <p className="text-sm sm:text-base text-brand-700 mb-4">
        Sebagai admin, Anda dapat menyetujui atau menolak event ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={() => onVerify("reject")}
          disabled={verifying}
          variant="danger" className="px-4 sm:px-6 sm:py-3 sm:text-base"
        >
          <XCircle size={18} />
          Tolak Event
        </Button>
        <Button
          onClick={() => onVerify("approve")}
          disabled={verifying}
          variant="success" className="px-4 sm:px-6 sm:py-3 sm:text-base"
        >
          <CheckCircle size={18} />
          Setujui Event
        </Button>
      </div>
    </div>
  );
}

function VerificationModal({
  isOpen,
  onClose,
  action,
  eventName,
  comment,
  onCommentChange,
  onConfirm,
  verifying,
}) {
  if (!isOpen) return null;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="ui-modal-backdrop items-center bg-transparent p-4 backdrop-blur-sm"
    >
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        className="ui-modal-panel relative z-10 max-w-md rounded-xl p-4 shadow-2xl sm:p-6"
      >
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
            Konfirmasi Verifikasi
          </h3>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            Anda akan{" "}
            <strong>{action === "approve" ? "menyetujui" : "menolak"}</strong>{" "}
            event:
          </p>
          <p className="font-semibold text-base sm:text-lg">{eventName}</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Komentar Verifikasi{" "}
            {action === "reject" ? "(Wajib untuk penolakan)" : "(Opsional)"}:
          </label>
          <Motion.textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="ui-input p-2.5 text-sm sm:p-3"
            rows="3"
            placeholder={`Berikan komentar ${
              action === "approve" ? "persetujuan" : "penolakan"
            }...`}
            required={action === "reject"}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2 },
            }}
          />
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3"
        >
          <Button
            onClick={onClose}
            variant="muted" className="px-4 sm:text-base"
            disabled={verifying}
            whileHover={{ scale: verifying ? 1 : 1.02 }}
            whileTap={{ scale: verifying ? 1 : 0.98 }}
          >
            Batal
          </Button>
          <Button unstyled
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-lg text-white transition-colors font-medium text-sm sm:text-base ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={action === "reject" && !comment.trim()}
            loading={verifying}
            loadingLabel="Memproses..."
            whileHover={{
              scale:
                verifying || (action === "reject" && !comment.trim())
                  ? 1
                  : 1.02,
            }}
            whileTap={{
              scale:
                verifying || (action === "reject" && !comment.trim())
                  ? 1
                  : 0.98,
            }}
          >
            {action === "approve" ? (
              "Setujui"
            ) : (
              "Tolak"
            )}
          </Button>
        </Motion.div>
      </Motion.div>
    </Motion.div>
  );
}

function EventImageSection({ event, onImageClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
      <div
        className="rounded-xl overflow-hidden shadow-lg aspect-square border border-gray-200 relative group cursor-pointer"
        onClick={() =>
          onImageClick(
            event.image ||
              "https://axistechindia.com/images/image%20not%20available.jpg",
            event.name,
            "square"
          )
        }
      >
        <img
          src={
            event.image ||
            "https://axistechindia.com/images/image%20not%20available.jpg"
          }
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://axistechindia.com/images/image%20not%20available.jpg";
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 sm:p-3">
            <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 sm:hidden bg-black/50 rounded-full p-1.5">
          <Eye className="w-3 h-3 text-white" />
        </div>
      </div>

      {event.flyer && (
        <div
          className="rounded-xl overflow-hidden shadow-lg aspect-16/6 border border-gray-200 relative group cursor-pointer"
          onClick={() =>
            onImageClick(event.flyer, `Flyer ${event.name}`, "video")
          }
        >
          <img
            src={event.flyer}
            alt={`Flyer ${event.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 sm:p-3">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 sm:hidden bg-black/50 rounded-full p-1.5">
            <Eye className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

function OrganizerInfo({ owner }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="bg-brand-100 p-1.5 sm:p-2 rounded-lg">
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
        </div>
        Penyelenggara
      </h3>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
          {owner?.profile_pict ? (
            <img
              src={owner.profile_pict}
              alt={owner.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center bg-brand-500 text-white font-semibold text-lg sm:text-xl"
            style={{
              display: owner?.profile_pict ? "none" : "flex",
            }}
          >
            {owner?.name?.charAt(0)?.toUpperCase() || "O"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 truncate">
            {owner?.name || "Organizer"}
          </p>
          {owner?.organization && (
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {owner.organization}
            </p>
          )}
          {owner?.email && (
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
              {owner.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandableRules({ rules, maxLines = 5 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);

  useEffect(() => {
    if (!rules) return;
    const lineCount = rules.split("\n").length;
    const charCount = rules.length;
    setNeedsExpand(lineCount > maxLines || charCount > 300);
  }, [rules, maxLines]);

  if (!rules) return null;

  return (
    <div className="relative">
      <div
        className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed transition-all duration-300 ${
          !isExpanded && needsExpand
            ? "max-h-32 sm:max-h-40 overflow-hidden"
            : ""
        }`}
      >
        <DescriptionWithNewlines className="" text={rules} />
      </div>

      {needsExpand && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-t from-white via-white/90 to-transparent pointer-events-none" />
      )}

      {needsExpand && (
        <Button unstyled
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm sm:text-base transition-colors ${
            !isExpanded ? "relative -mt-2 sm:-mt-4" : "mt-3 sm:mt-4"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Sembunyikan
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              Lihat selengkapnya
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function LoginPrompt({ onLogin }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="bg-linear-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-700">
            Anda belum login. Untuk membeli tiket, silahkan login terlebih
            dahulu.
          </p>
          <Button
            onClick={onLogin}
            variant="primary" className="w-full bg-linear-to-r from-brand-600 to-brand-700 shadow-md hover:from-brand-700 hover:to-brand-800 hover:shadow-lg"
          >
            <LogIn size={16} />
            Login Sekarang
          </Button>
        </div>
      </div>
    </Motion.div>
  );
}

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();
  const {
    previewData: previewImage,
    isPreviewOpen,
    openImagePreview: showImagePreview,
    closeImagePreview,
  } = useImagePreview();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEO, setIsEO] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {
    isLoading: verifying,
    startLoading: startVerifying,
    stopLoading: stopVerifying,
  } = useLoading(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const {
    isLoading: likeLoading,
    startLoading: startLikeLoading,
    stopLoading: stopLikeLoading,
  } = useLoading(false);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        startLoading();
        setError(null);
        const response = await api.get(`/api/event/${eventId}`);
        const eventData = response.data;

        setEvent(eventData);
        setTotalLikes(eventData.total_likes || 0);

        setTickets(
          transformSelectableTicketCategories(eventData.ticket_categories),
        );
        checkUserRoleAndOwnership(eventData);
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Gagal memuat detail event");
        showNotification("Gagal memuat detail event", "Error", "error");
      } finally {
        stopLoading();
      }
    };

    const checkUserRoleAndOwnership = (eventData) => {
      const payload = readTokenPayload();

      if (!payload) {
        setIsLoggedIn(false);
        setIsOwner(false);
        setIsAdmin(false);
        setIsEO(false);
        setIsRegularUser(false);
        return;
      }

      const access = getEventAccessFlags(payload, eventData.owner_id);

      setIsLoggedIn(true);
      setIsOwner(access.isOwner);
      setIsAdmin(access.isAdmin);
      setIsEO(access.isOrganizer);
      setIsRegularUser(access.isRegularUser);
    };

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId, showNotification, startLoading, stopLoading]);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      if (!isLoggedIn || !isRegularUser || !eventId) return;

      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = getLikedEventIds(
          response.data?.liked_event,
        );
        setIsLiked(likedEventIds.has(eventId));
      } catch (err) {
        console.error("Error fetching liked status:", err);
      }
    };

    fetchLikedStatus();
  }, [isLoggedIn, isRegularUser, eventId]);

  const handleLikeEvent = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isRegularUser) {
      return;
    }

    if (likeLoading) return;

    startLikeLoading();

    const previousIsLiked = isLiked;
    const previousTotalLikes = totalLikes;

    setIsLiked(!isLiked);
    setTotalLikes((currentLikes) =>
      getLikeCountAfterToggle(currentLikes, isLiked),
    );

    try {
      const response = await eventAPI.likeEvent(eventId);

      if (response.data?.event_total_like !== undefined) {
        setTotalLikes(response.data.event_total_like);
      }

      setEvent((prev) => ({
        ...prev,
        total_likes:
          response.data?.event_total_like ??
          getLikeCountAfterToggle(prev.total_likes, isLiked),
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(previousIsLiked);
      setTotalLikes(previousTotalLikes);
      showNotification("Gagal memproses like", "Error", "error");
    } finally {
      stopLikeLoading();
    }
  };

  const updateQty = (index, delta) => {
    setTickets((currentTickets) =>
      updateTicketQuantity(currentTickets, index, delta),
    );
  };

  const handleAddToCart = async () => {
    try {
      const cartItems = getSelectedTicketCartItems(tickets);

      if (cartItems.length === 0) {
        showNotification(
          "Pilih setidaknya satu tiket",
          "Peringatan",
          "warning"
        );
        return;
      }

      const results = await Promise.allSettled(
        cartItems.map((item) => api.post("/api/cart", item))
      );

      const { failed: failedItems, successful: successfulItems } =
        partitionCartResults(results);

      if (successfulItems.length > 0) {
        showNotification(
          `${successfulItems.length} tiket berhasil dimasukkan ke keranjang!`,
          "Sukses",
          "success"
        );
        setTickets(resetTicketQuantities);

        if (failedItems.length === 0) {
          navigate(ROUTES.CART);
        }
      }

      if (failedItems.length > 0) {
        const errorMessages = getCartFailureMessages(failedItems);

        showNotification(
          `${failedItems.length} tiket gagal ditambahkan: ${errorMessages.join(
            ", "
          )}`,
          "Peringatan",
          "warning"
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.error) {
        showNotification(
          `Gagal menambahkan tiket: ${error.response.data.error}`,
          "Error",
          "error"
        );
      } else {
        showNotification(
          "Gagal menambahkan tiket ke keranjang",
          "Error",
          "error"
        );
      }
    }
  };

  const handleVerifyEvent = async (action) => {
    try {
      startVerifying();

      const statusData = {
        status: action === "approve" ? "approved" : "rejected",
        approval_comment:
          approvalComment ||
          `Event ${action === "approve" ? "disetujui" : "ditolak"} oleh admin`,
      };

      await eventAPI.verifyEvent(eventId, statusData);

      showNotification(
        `Event berhasil ${action === "approve" ? "disetujui" : "ditolak"}!`,
        "Sukses",
        action === "approve" ? "success" : "warning"
      );

      setShowVerificationModal(false);
      setApprovalComment("");

      const refreshedResponse = await api.get(`/api/event/${eventId}`);
      setEvent(refreshedResponse.data);
    } catch (error) {
      console.error("Error verifying event:", error);
      showNotification("Gagal memverifikasi event", "Error", "error");
    } finally {
      stopVerifying();
    }
  };

  const openVerificationModal = (action) => {
    setVerificationAction(action);
    setShowVerificationModal(true);
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicket(null);
  };

  const openImagePreview = (src, alt, aspectRatio) => {
    showImagePreview({ src, alt, aspectRatio });
  };

  const handleLoginRedirect = () => {
    navigate(ROUTES.LOGIN);
  };

  if (loading) {
    return (
      <div className="ui-page">
        <Navbar />
        <LoadingState
          variant="plain"
          className="h-[calc(100vh-80px)]"
          label="Memuat detail event..."
          description="Menyiapkan jadwal, lokasi, dan informasi tiket"
        />
        <NotificationModal
          message={notification.message}
          title={notification.title}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={hideNotification}
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="ui-page">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
              Gagal memuat event
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {error || "Event tidak ditemukan"}
            </p>
            <Button
              onClick={() => navigate(-1)}
              variant="primary" className="px-4 py-2 sm:px-6 sm:py-3 sm:text-base"
            >
              Kembali
            </Button>
          </div>
        </div>
        <NotificationModal
          message={notification.message}
          title={notification.title}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={hideNotification}
        />
      </div>
    );
  }

  const totalHarga = getSelectedTicketTotal(tickets);
  const adaTiketDipilih = hasSelectedTickets(tickets);

  const canVerify = isAdmin && event.status === "pending";
  const canPurchase = isRegularUser;
  const showStatusInfo =
    isOwner || isAdmin || (isEO && event.status !== "approved");

  const isEventEnded = event.status === "ended";

  return (
    <div className="ui-page mt-30">
      <Navbar />

      <NotificationModal
        message={notification.message}
        title={notification.title}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={hideNotification}
      />

      <div className="py-6 sm:py-8">
        <div className="ui-container-wide">
          <div className="mb-6">
            <Button unstyled
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-brand-600 to-brand-700 text-white p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold leading-tight flex-1">
                      {event.name}
                    </h1>

                    <Button unstyled
                      onClick={handleLikeEvent}
                      disabled={!isRegularUser}
                      loading={likeLoading}
                      loadingLabel={
                        <span className="font-semibold text-sm sm:text-base">
                          {formatNumber(totalLikes)}
                        </span>
                      }
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shrink-0 ${
                        isLiked
                          ? "bg-pink-500 text-white hover:bg-pink-600"
                          : "bg-white/20 text-white hover:bg-white/30"
                      } ${
                        likeLoading || !isRegularUser
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      whileHover={{
                        scale: likeLoading || !isRegularUser ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: likeLoading || !isRegularUser ? 1 : 0.95,
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                          isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span className="font-semibold text-sm sm:text-base">
                        {formatNumber(totalLikes)}
                      </span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-brand-100">
                          Lokasi
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base truncate">
                          {event.venue}, {event.district}
                        </p>
                        <p className="text-xs text-brand-100 truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-brand-100">
                          Tanggal
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {formatDate(event.date_start, event.date_end)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-1">
                      <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <Shapes className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-brand-100">
                          Kategori
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {event.category}{" "}
                          {event.child_category && `- ${event.child_category}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {showStatusInfo && (
                <div
                  className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 ${
                    event.status === "pending"
                      ? "bg-yellow-50 border border-yellow-200"
                      : event.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : event.status === "approved"
                      ? "bg-green-50 border border-green-200"
                      : event.status === "active"
                      ? "bg-emerald-50 border border-emerald-200"
                      : event.status === "ended"
                      ? "bg-gray-100 border border-gray-300"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <StatusBadge status={event.status} />
                  <div className="flex-1">
                    {event.approval_comment && event.status === "rejected" && (
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Alasan penolakan:</span> {event.approval_comment}
                      </p>
                    )}
                    {event.approval_comment && event.status === "approved" && (
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Komentar persetujuan:</span> {event.approval_comment}
                      </p>
                    )}
                    {event.status === "active" && (
                      <p className="text-emerald-600 text-sm sm:text-base font-medium">
                        Event ini sedang berlangsung
                      </p>
                    )}
                    {event.status === "ended" && (
                      <p className="text-gray-600 text-sm sm:text-base font-medium">
                        Event ini sudah berakhir
                      </p>
                    )}
                  </div>
                </div>
              )}

              {canVerify && (
                <AdminVerificationSection
                  onVerify={openVerificationModal}
                  verifying={verifying}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-first lg:order-last">
                  <EventImageSection
                    event={event}
                    onImageClick={openImagePreview}
                  />

                  <OrganizerInfo owner={event.owner} />

                  {!isLoggedIn && <LoginPrompt onLogin={handleLoginRedirect} />}
                </div>

                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-brand-50 to-brand-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-brand-100">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <div className="bg-brand-600 p-1.5 sm:p-2 rounded-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        Tentang Event
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed">
                        <DescriptionWithNewlines
                          className=""
                          text={event.description}
                        />
                      </div>
                    </div>
                  </div>

                  {event.rules && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-linear-to-r from-orange-50 to-amber-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-100">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                          <div className="bg-orange-600 p-1.5 sm:p-2 rounded-lg">
                            <Scale className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          Peraturan Event
                        </h2>
                      </div>
                      <div className="p-4 sm:p-6">
                        <ExpandableRules rules={event.rules} maxLines={5} />
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-purple-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-100">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <div className="bg-purple-600 p-1.5 sm:p-2 rounded-lg">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        Kategori Tiket
                      </h2>
                    </div>

                    {tickets.length === 0 ? (
                      <div className="text-center py-10 sm:py-16 text-gray-500 px-4">
                        <div className="max-w-md mx-auto">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-purple-100">
                            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                          </div>
                          <p className="text-base sm:text-lg font-medium mb-2">
                            Belum ada tiket tersedia
                          </p>
                          <p className="text-gray-400 mb-4 text-sm sm:text-base">
                            Tiket untuk event ini belum tersedia
                          </p>
                          {isOwner && (
                            <Button
                              onClick={() => navigate(routeTo.eventEdit(eventId))}
                              variant="primary" className="px-6 shadow-lg hover:shadow-xl sm:px-8 sm:py-3 sm:text-base"
                            >
                              Tambah Tiket
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 space-y-4">
                        {tickets.map((ticket, index) => (
                          <TicketItem
                            key={ticket.ticket_category_id}
                            ticket={ticket}
                            index={index}
                            showControls={canPurchase}
                            onUpdateQty={updateQty}
                            onViewDetail={openTicketModal}
                            isEventEnded={isEventEnded}
                            formatPrice={formatRupiah}
                            formatDateTime={formatDateTime}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {adaTiketDipilih && canPurchase && !isEventEnded && (
                      <CartSummary
                        tickets={tickets}
                        totalPrice={totalHarga}
                        onAddToCart={handleAddToCart}
                        formatPrice={formatRupiah}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setApprovalComment("");
        }}
        action={verificationAction}
        eventName={event.name}
        comment={approvalComment}
        onCommentChange={setApprovalComment}
        onConfirm={() => handleVerifyEvent(verificationAction)}
        verifying={verifying}
      />

      <TicketCategoryDetailModal
        isOpen={showTicketModal}
        onClose={closeTicketModal}
        ticket={selectedTicket}
        formatRupiah={formatRupiah}
        formatDateTime={formatDateTime}
      />

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={closeImagePreview}
        imageSrc={previewImage?.src}
        imageAlt={previewImage?.alt}
        aspectRatio={previewImage?.aspectRatio}
      />
    </div>
  );
}
