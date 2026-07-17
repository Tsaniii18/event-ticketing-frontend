import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import useSessionUser from "../../hooks/useSessionUser";
import { ticketAPI, eventAPI } from "../../services";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  formatFullDateTime as formatDateTime,
  formatLongDate as formatDate,
  formatTime,
} from "../../utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Home,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  ScanLine,
  ChevronLeft,
  Tag,
  Building2,
  Shield,
  TicketCheck,
  Users,
  Info,
  CalendarX,
  CalendarClock,
  TimerOff
} from "lucide-react";
import Button from "../../components/common/Button";
import { ROUTES } from "../../utils/routeConstants";

export default function CheckinTiketPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [usedAtTime, setUsedAtTime] = useState(null);

  const scannerRef = useRef(null);
  const processCheckInRef = useRef(null);
  const { notification, showNotification, hideNotification } = useNotification();
  const { user } = useSessionUser();

  useEffect(() => {
    if (!user) {
      showNotification("Silakan login terlebih dahulu", "Akses Ditolak", "warning");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!["organizer", "admin"].includes(user.role)) {
      showNotification("Anda tidak memiliki akses ke halaman ini", "Akses Ditolak", "error");
      navigate(ROUTES.HOME);
      return;
    }

    setIsLoaded(true);
  }, [navigate, showNotification, user]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !isLoaded) return;

      try {
        const response = await eventAPI.getEvent(eventId);
        setEventData(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
        showNotification("Gagal memuat data event", "Error", "error");
      }
    };

    fetchEventData();
  }, [eventId, isLoaded, showNotification]);

  const cleanUpScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => undefined);
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(() => {
    if (!isLoaded) return;

    cleanUpScanner();

    const containerElement = document.getElementById('scanner-container');
    if (!containerElement) return;

    let readerElement = document.getElementById('reader');
    if (!readerElement) {
      readerElement = document.createElement('div');
      readerElement.id = 'reader';
      containerElement.appendChild(readerElement);
    }

    const newScanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 300, height: 300 },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2
    });

    async function onScanSuccess(decodedText) {
      if (isProcessing) return;

      setIsProcessing(true);
      setScanResult(decodedText);

      await processCheckInRef.current?.(decodedText);
    }

    const onScanError = () => undefined;

    newScanner.render(onScanSuccess, onScanError);
    scannerRef.current = newScanner;
  }, [cleanUpScanner, isLoaded, isProcessing]);

  const processCheckIn = async (ticketCode) => {
    try {
      setCheckInStatus(null);
      setErrorMessage("");

      if (eventData) {
        const now = new Date();
        const eventDateStart = eventData.date_start ? new Date(eventData.date_start) : null;
        const eventDateEnd = eventData.date_end ? new Date(eventData.date_end) : null;

        if (eventDateStart && now < eventDateStart) {
          setTicketData({
            event_name: eventData.name,
          });
          setCheckInStatus('not_started');
          setErrorMessage("Event belum dimulai. Tiket ini belum bisa digunakan untuk check-in.");
          setShowResult(true);
          showNotification("Tiket belum bisa digunakan, event belum dimulai", "Belum Jadwalnya", "warning");
          setIsProcessing(false);
          return;
        }

        if (eventDateEnd && now > eventDateEnd) {
          setTicketData({
            event_name: eventData.name,
          });
          setCheckInStatus('expired');
          setErrorMessage("Waktu event sudah berakhir. Tiket ini sudah tidak berlaku.");
          setShowResult(true);
          showNotification("Tiket sudah kadaluarsa", "Tiket Kadaluarsa", "error");
          setIsProcessing(false);
          return;
        }
      }

      const response = await ticketAPI.checkInTicket(eventId, ticketCode);

      if (response.data) {
        setTicketData(response.data.ticket);
        setCheckInStatus('success');
        setShowResult(true);

        const updatedEventData = await eventAPI.getEvent(eventId);
        setEventData(updatedEventData.data);

        showNotification("Tiket berhasil di check-in!", "Check-in Berhasil", "success");
      }
    } catch (error) {
      console.error("Check-in error:", error);

      const errorMsg = error.response?.data?.error || "Terjadi kesalahan saat check-in";
      const errorStatus = error.response?.data?.status || null;
      const backendTicketData = error.response?.data?.ticket || null;
      const backendUsedAt = error.response?.data?.used_at || null;

      setErrorMessage(errorMsg);

      if (backendTicketData) {
        setTicketData(backendTicketData);
      } else if (eventData) {
        setTicketData({
          event_name: eventData.name,
        });
      }

      if (backendUsedAt) {
        setUsedAtTime(backendUsedAt);
      }

      if (errorStatus === 'not_started') {
        setCheckInStatus('not_started');
        setShowResult(true);
        showNotification("Tiket belum bisa digunakan, event belum dimulai", "Belum Jadwalnya", "warning");
      } else if (errorStatus === 'expired') {
        setCheckInStatus('expired');
        setShowResult(true);
        showNotification("Tiket sudah kadaluarsa", "Tiket Kadaluarsa", "error");
      } else if (errorStatus === 'already_used') {
        setCheckInStatus('already_used');
        setShowResult(true);
        showNotification("Tiket sudah pernah digunakan", "Check-in Gagal", "warning");
      } else if (errorStatus === 'cancelled') {
        setCheckInStatus('error');
        setErrorMessage("Tiket telah dibatalkan dan tidak dapat digunakan.");
        setShowResult(true);
        showNotification("Tiket dibatalkan", "Check-in Gagal", "error");
      } else if (errorStatus === 'inactive') {
        setCheckInStatus('error');
        setErrorMessage("Tiket tidak aktif dan tidak dapat digunakan.");
        setShowResult(true);
        showNotification("Tiket tidak aktif", "Check-in Gagal", "error");
      }
      else if (errorMsg.includes("not started") || errorMsg.includes("belum dimulai") || errorMsg.includes("belum jadwal")) {
        setCheckInStatus('not_started');
        setShowResult(true);
        showNotification("Tiket belum bisa digunakan, event belum dimulai", "Belum Jadwalnya", "warning");
      } else if (errorMsg.includes("expired") || errorMsg.includes("kadaluarsa") || errorMsg.includes("berakhir") || errorMsg.includes("ended")) {
        setCheckInStatus('expired');
        setShowResult(true);
        showNotification("Tiket sudah kadaluarsa", "Tiket Kadaluarsa", "error");
      } else if (errorMsg.includes("already used") || errorMsg.includes("sudah digunakan")) {
        setCheckInStatus('already_used');
        setShowResult(true);
        showNotification("Tiket sudah pernah digunakan", "Check-in Gagal", "warning");
      } else if (errorMsg.includes("not found") || errorMsg.includes("tidak ditemukan") || errorMsg.includes("invalid")) {
        setCheckInStatus('error');
        setShowResult(true);
        showNotification("Tiket tidak ditemukan atau tidak valid", "Check-in Gagal", "error");
      } else if (errorMsg.includes("not active")) {
        setCheckInStatus('error');
        setShowResult(true);
        showNotification("Tiket tidak aktif", "Check-in Gagal", "error");
      } else {
        setCheckInStatus('error');
        setShowResult(true);
        showNotification(errorMsg, "Check-in Gagal", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  processCheckInRef.current = processCheckIn;

  useEffect(() => {
    if (isLoaded && user) {
      startScanner();
    }

    return () => {
      cleanUpScanner();
    };
  }, [isLoaded, user, startScanner, cleanUpScanner]);

  const handleRescan = () => {
    window.location.reload();
  };

  const handleBack = () => {
    cleanUpScanner();
    navigate(-1);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
          >
            <Loader2 className="w-12 h-12 text-brand-600 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600 font-medium">Mempersiapkan scanner...</p>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

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
                  <TicketCheck className="w-8 h-8 text-brand-600" />
                  Check-in Tiket
                </h1>
                <p className="text-gray-600 mt-2">
                  {eventData?.name || `Event ID: ${eventId}`}
                </p>
              </div>

              <Button
                onClick={handleBack}
                variant="muted"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={18} />
                Kembali
              </Button>
            </Motion.div>

            {eventData && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="ui-subtle-panel mb-8 p-6 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Info size={18} className="text-brand-600" />
                  Informasi Event
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Mulai</p>
                      <p className="font-medium text-gray-900">{formatDate(eventData.date_start)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Waktu</p>
                      <p className="font-medium text-gray-900">{formatTime(eventData.date_start)} - {formatTime(eventData.date_end)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Venue</p>
                      <p className="font-medium text-gray-900">{eventData.venue || eventData.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{eventData.district}</p>
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 grid grid-cols-2 md:grid-cols-2 gap-4"
            >
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Total Presensi"
                value={eventData?.total_attendant || 0}
                color="blue"
              />
              <StatCard
                icon={<Ticket className="w-6 h-6" />}
                label="Tiket Terjual"
                value={eventData?.total_tickets_sold || 0}
                color="green"
              />
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!showResult && (
                  <Motion.div
                    key="scanner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-4">
                        <ScanLine className="w-8 h-8 text-brand-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Scan QR Code Tiket</h2>
                      <p className="text-gray-500 mt-2">
                        Arahkan kamera ke QR code pada tiket pengunjung
                      </p>
                    </div>

                    <div id="scanner-container" className="max-w-md mx-auto">
                      <div id="reader" className="rounded-xl overflow-hidden"></div>
                    </div>

                    <div className="mt-6 bg-brand-50 rounded-xl p-4 border border-brand-200">
                      <h4 className="font-semibold text-brand-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Petunjuk Scanning
                      </h4>
                      <ul className="text-sm text-brand-700 space-y-1">
                        <li>• Pastikan QR code terlihat jelas dan tidak rusak</li>
                        <li>• Posisikan QR code di tengah area scanning</li>
                        <li>• Jaga jarak optimal sekitar 15-30 cm dari kamera</li>
                        <li>• Pastikan pencahayaan cukup</li>
                      </ul>
                    </div>
                  </Motion.div>
                )}

                {isProcessing && (
                  <Motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center"
                  >
                    <Loader2 className="w-16 h-16 text-brand-600 mx-auto animate-spin" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Memproses check-in...</p>
                    <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
                  </Motion.div>
                )}

                {showResult && !isProcessing && scanResult && (
                  <Motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    {checkInStatus === 'success' && ticketData && (
                      <div className="space-y-6">
                        <Motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
                        >
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                          >
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                          </Motion.div>
                          <h2 className="text-2xl font-bold text-green-800">Check-in Berhasil!</h2>
                          <p className="text-green-600 mt-2">Tiket telah divalidasi dan pengunjung dapat masuk</p>
                        </Motion.div>

                        <div className="ui-subtle-panel p-6 space-y-4 border border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-brand-600" />
                            Detail Tiket yang Dipresensi
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                              icon={<Building2 className="w-5 h-5 text-gray-500" />}
                              label="Nama Event"
                              value={ticketData.event_name}
                            />
                            <DetailItem
                              icon={<Tag className="w-5 h-5 text-gray-500" />}
                              label="Kategori Tiket"
                              value={ticketData.ticket_category}
                            />
                            <DetailItem
                              icon={<Shield className="w-5 h-5 text-gray-500" />}
                              label="Status"
                              value={
                                <span className="ui-badge ui-badge-success px-2">
                                  {ticketData.status === 'used' ? 'Sudah Check-in' : ticketData.status}
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                              label="Waktu Check-in"
                              value={
                                <span className="text-green-700 font-semibold">
                                  {formatDateTime(ticketData.checked_in_at)}
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<Calendar className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Tiket Mulai"
                              value={formatDateTime(ticketData.date_start)}
                            />
                            <DetailItem
                              icon={<Clock className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Tiket Berakhir"
                              value={formatDateTime(ticketData.date_end)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {checkInStatus === 'not_started' && (
                      <div className="space-y-6">
                        <Motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-linear-to-r from-brand-50 to-brand-100 rounded-2xl border border-brand-200"
                        >
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-full mb-4"
                          >
                            <CalendarClock className="w-10 h-10 text-brand-600" />
                          </Motion.div>
                          <h2 className="text-2xl font-bold text-brand-800">Belum Jadwalnya</h2>
                          <p className="text-brand-600 mt-2">Event untuk tiket ini belum dimulai</p>
                        </Motion.div>

                        <div className="bg-brand-50 rounded-xl p-4 border border-brand-200">
                          <div className="flex items-start gap-3">
                            <CalendarClock className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-brand-800">Informasi</h4>
                              <p className="text-sm text-brand-700 mt-1">
                                Tiket ini belum dapat digunakan karena event belum dimulai.
                                Check-in hanya dapat dilakukan saat event sudah berjalan.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ui-subtle-panel p-6 space-y-4 border border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-brand-600" />
                            Informasi Event
                            <span className="text-xs font-normal text-gray-500 ml-2">(Tidak dihitung sebagai presensi)</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                              icon={<Building2 className="w-5 h-5 text-gray-500" />}
                              label="Nama Event"
                              value={ticketData?.event_name || eventData?.name || "-"}
                            />
                            <DetailItem
                              icon={<Tag className="w-5 h-5 text-gray-500" />}
                              label="Kategori Tiket"
                              value={ticketData?.ticket_category || "-"}
                            />
                            <DetailItem
                              icon={<Shield className="w-5 h-5 text-gray-500" />}
                              label="Status"
                              value={
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                                  Belum Dapat Digunakan
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<CalendarClock className="w-5 h-5 text-brand-500" />}
                              label="Jadwal Event Mulai"
                              value={
                                <span className="text-brand-700 font-semibold">
                                  {formatDateTime(ticketData?.date_start || eventData?.date_start)}
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<Clock className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Event Berakhir"
                              value={formatDateTime(ticketData?.date_end || eventData?.date_end)}
                            />
                          </div>

                          {(ticketData?.date_start || eventData?.date_start) && (
                            <div className="mt-4 p-3 bg-brand-100 rounded-lg border border-brand-200">
                              <p className="text-sm text-brand-800 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Event akan dimulai pada: <strong>{formatDateTime(ticketData?.date_start || eventData?.date_start)}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {checkInStatus === 'expired' && (
                      <div className="space-y-6">
                        <Motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-linear-to-r from-gray-100 to-gray-100 rounded-2xl border border-gray-300"
                        >
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4"
                          >
                            <TimerOff className="w-10 h-10 text-gray-600" />
                          </Motion.div>
                          <h2 className="text-2xl font-bold text-gray-800">Tiket Kadaluarsa</h2>
                          <p className="text-gray-600 mt-2">Waktu event untuk tiket ini sudah berakhir</p>
                        </Motion.div>

                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                          <div className="flex items-start gap-3">
                            <CalendarX className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-800">Tiket Tidak Berlaku</h4>
                              <p className="text-sm text-gray-700 mt-1">
                                Tiket ini sudah tidak dapat digunakan karena waktu event sudah berakhir.
                                Tiket ini sudah kadaluarsa.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ui-subtle-panel p-6 space-y-4 border border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-gray-500" />
                            Informasi Event
                            <span className="text-xs font-normal text-gray-500 ml-2">(Tidak dihitung sebagai presensi)</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                              icon={<Building2 className="w-5 h-5 text-gray-500" />}
                              label="Nama Event"
                              value={ticketData?.event_name || eventData?.name || "-"}
                            />
                            <DetailItem
                              icon={<Tag className="w-5 h-5 text-gray-500" />}
                              label="Kategori Tiket"
                              value={ticketData?.ticket_category || "-"}
                            />
                            <DetailItem
                              icon={<Shield className="w-5 h-5 text-gray-500" />}
                              label="Status"
                              value={
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                  Kadaluarsa
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<Clock className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Event Mulai"
                              value={formatDateTime(ticketData?.date_start || eventData?.date_start)}
                            />
                            <DetailItem
                              icon={<CalendarX className="w-5 h-5 text-red-500" />}
                              label="Jadwal Event Berakhir"
                              value={
                                <span className="text-red-600 font-semibold">
                                  {formatDateTime(ticketData?.date_end || eventData?.date_end)}
                                </span>
                              }
                            />
                          </div>

                          {(ticketData?.date_end || eventData?.date_end) && (
                            <div className="ui-alert ui-alert-danger mt-4 p-3">
                              <p className="text-sm text-red-800 flex items-center gap-2">
                                <TimerOff className="w-4 h-4" />
                                Event telah berakhir pada: <strong>{formatDateTime(ticketData?.date_end || eventData?.date_end)}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {checkInStatus === 'already_used' && (
                      <div className="space-y-6">
                        <Motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-linear-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200"
                        >
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4"
                          >
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                          </Motion.div>
                          <h2 className="text-2xl font-bold text-amber-800">Tiket Sudah Digunakan</h2>
                          <p className="text-amber-600 mt-2">Tiket ini sudah pernah di check-in sebelumnya</p>
                        </Motion.div>

                        <div className="ui-alert ui-alert-warning rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-amber-800">Perhatian</h4>
                              <p className="text-sm text-amber-700 mt-1">
                                Tiket ini sudah digunakan untuk check-in sebelumnya.
                                Mohon periksa kembali atau hubungi panitia jika ada masalah.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ui-subtle-panel p-6 space-y-4 border border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-amber-600" />
                            Informasi Tiket
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                              icon={<Building2 className="w-5 h-5 text-gray-500" />}
                              label="Nama Event"
                              value={ticketData?.event_name || eventData?.name || "-"}
                            />
                            <DetailItem
                              icon={<Tag className="w-5 h-5 text-gray-500" />}
                              label="Kategori Tiket"
                              value={ticketData?.ticket_category || "-"}
                            />
                            <DetailItem
                              icon={<Shield className="w-5 h-5 text-gray-500" />}
                              label="Status Tiket"
                              value={
                                <span className="ui-badge ui-badge-warning px-2">
                                  Sudah Digunakan
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<CheckCircle2 className="w-5 h-5 text-amber-500" />}
                              label="Waktu Digunakan"
                              value={
                                <span className="text-amber-700 font-semibold">
                                  {formatDateTime(ticketData?.used_at || usedAtTime)}
                                </span>
                              }
                            />
                            <DetailItem
                              icon={<Calendar className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Event Mulai"
                              value={formatDateTime(ticketData?.date_start || eventData?.date_start)}
                            />
                            <DetailItem
                              icon={<Clock className="w-5 h-5 text-gray-500" />}
                              label="Jadwal Event Berakhir"
                              value={formatDateTime(ticketData?.date_end || eventData?.date_end)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {checkInStatus === 'error' && (
                      <div className="space-y-6">
                        <Motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-linear-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200"
                        >
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4"
                          >
                            <XCircle className="w-10 h-10 text-red-600" />
                          </Motion.div>
                          <h2 className="text-2xl font-bold text-red-800">Check-in Gagal</h2>
                          <p className="text-red-600 mt-2">{errorMessage || "Tiket tidak valid atau tidak ditemukan"}</p>
                        </Motion.div>

                        <div className="ui-alert ui-alert-danger rounded-xl">
                          <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-800">Kemungkinan Penyebab</h4>
                              <ul className="text-sm text-red-700 mt-1 space-y-1">
                                <li>• QR code tidak terbaca dengan benar</li>
                                <li>• Tiket bukan untuk event ini</li>
                                <li>• Tiket sudah tidak aktif atau expired</li>
                                <li>• Kode tiket tidak valid</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      <Button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRescan}
                        variant="primary" className="flex-1 rounded-xl px-6 py-4 font-semibold"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Scan Ulang
                      </Button>

                      <Button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBack}
                        variant="muted" className="flex-1 rounded-xl px-6 py-4 font-semibold"
                      >
                        <Home className="w-5 h-5" />
                        Kembali ke Dashboard
                      </Button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              <p>
                Pastikan QR code dalam kondisi baik dan terlihat jelas oleh kamera.
                <br />
                Jika mengalami masalah, coba refresh halaman atau gunakan perangkat lain.
              </p>
            </Motion.div>
          </Motion.div>
        </div>
      </div>

      <style>{`
        #reader {
          border: none !important;
          border-radius: 12px;
          overflow: hidden;
        }
        #reader video {
          border-radius: 12px;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__scan_region video {
          border-radius: 8px;
        }
        #reader__dashboard {
          padding: 12px !important;
        }
        #reader__dashboard_section_swaplink {
          text-decoration: none !important;
          color: var(--color-brand-600) !important;
          font-weight: 600;
        }
        #html5-qrcode-button-camera-permission,
        #html5-qrcode-button-camera-start,
        #html5-qrcode-button-camera-stop {
          background: var(--color-brand-600) !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          color: white !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        #html5-qrcode-button-camera-permission:hover,
        #html5-qrcode-button-camera-start:hover,
        #html5-qrcode-button-camera-stop:hover {
          background: var(--color-brand-700) !important;
        }
        #html5-qrcode-anchor-scan-type-change {
          color: var(--color-brand-600) !important;
          text-decoration: none !important;
          font-weight: 500 !important;
        }
        #reader__filescan_input {
          padding: 8px !important;
        }
        #reader select {
          padding: 8px 12px !important;
          border-radius: 6px !important;
          border: 1px solid var(--color-gray-300) !important;
        }
      `}</style>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-brand-50 text-brand-600 border-brand-200",
    green: "bg-success-50 text-success-600 border-success-200",
  };

  return (
    <Motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${colorClasses[color]} border rounded-xl p-4 transition-all`}
    >
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </Motion.div>
  );
}
