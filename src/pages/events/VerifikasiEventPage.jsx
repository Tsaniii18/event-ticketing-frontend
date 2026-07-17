import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { eventAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import { Search, Filter, Calendar, X, Eye, CheckCircle, XCircle, RefreshCw, FileText, User, MapPin, Calendar as CalendarIcon, Tag } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../../components/common/Button";
import { routeTo } from "../../utils/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function VerifikasiEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const fetchPendingEvents = useCallback(async () => {
    try {
      startLoading();
      const response = await eventAPI.getPendingEvents();
      const pendingEvents = response.data.filter(event => event.status === "pending");
      setEvents(pendingEvents);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      showNotification("Gagal memuat daftar event pending", "Error", "error");
    } finally {
      stopLoading();
    }
  }, [showNotification, startLoading, stopLoading]);

  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date_start).toISOString().split('T')[0];
        return eventDate === dateFilter;
      });
    }

    setFilteredEvents(filtered);
  }, [dateFilter, events, searchTerm]);

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  const handleVerifyEvent = async (eventId, status) => {
    try {
      const statusData = {
        status: status,
        approval_comment: approvalComment || `${status === "approved" ? "Event disetujui" : "Event ditolak"} oleh admin`
      };

      await eventAPI.verifyEvent(eventId, statusData);

      showNotification(
        `Event berhasil ${status === "approved" ? "disetujui" : "ditolak"}`,
        "Sukses",
        "success"
      );

      setSelectedEvent(null);
      setApprovalComment("");
      fetchPendingEvents();
    } catch (error) {
      console.error("Error verifying event:", error);
      showNotification(
        `Gagal ${status === "approved" ? "menyetujui" : "menolak"} event`,
        "Error",
        "error"
      );
    }
  };

  const handleViewDetails = (event) => {
    navigate(routeTo.eventDetail(event.event_id));
  };

  const handleRefresh = () => {
    fetchPendingEvents();
    showNotification("Data event diperbarui", "Sukses", "success");
  };

  const renderTextWithNewlines = (text) => {
    if (!text) return "-";

    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const hasActiveFilters = searchTerm || dateFilter;

  return (
    <div>
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="ui-page">
        <div className="ui-container">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel mt-32 p-6 md:p-8"
          >

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="ui-heading-1">Verifikasi Event</h1>
                <p className="text-gray-600 mt-2">
                  Total: {events.length} event • Ditampilkan: {filteredEvents.length} event
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {hasActiveFilters && (
                  <Button unstyled
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Hapus Filter
                  </Button>
                )}

                <Button
                  onClick={handleRefresh}
                  variant="primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} />
                  Refresh
                </Button>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="ui-subtle-panel mb-8 p-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="ui-heading-2">Filter & Pencarian</h3>

                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="ui-label">
                          Cari Nama Event
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari event..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ui-input py-2.5 pl-10 pr-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="ui-label">
                          Filter Tanggal Mulai
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="ui-input py-2.5 pl-10 pr-4"
                          />
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <Motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-brand-50 border border-brand-200 rounded-lg"
                      >
                        <p className="text-sm text-brand-800">
                          Filter aktif:
                          {searchTerm && ` Nama: "${searchTerm}"`}
                          {dateFilter && ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                        </p>
                      </Motion.div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>

            {loading ? (
              <LoadingState
                variant="compact"
                className="py-20"
                label="Memuat daftar event..."
                description="Menyiapkan event yang menunggu verifikasi"
              />
            ) : filteredEvents.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ui-state"
              >
                <FileText className="ui-state-icon mx-auto" size={48} />
                <p className="ui-state-title">
                  {hasActiveFilters ? "Tidak ada event yang sesuai dengan filter" : "Tidak ada event pending untuk diverifikasi"}
                </p>
                <p className="ui-state-description mb-4">
                  {hasActiveFilters
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua event"
                    : "Semua event telah diverifikasi"
                  }
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="primary" className="px-5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hapus Semua Filter
                  </Button>
                )}
              </Motion.div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <Motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="ui-card p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between max-w-140 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                          <span className="ui-badge ui-badge-warning">
                            Ditinjau
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Organizer</p>
                            <p>{event.owner?.name || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Kategori</p>
                            <p>{event.category} • {event.child_category}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Lokasi</p>
                            <p>{event.location}, {event.city}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Tanggal</p>
                            <p>
                              {new Date(event.date_start).toLocaleDateString('id-ID')} - {" "}
                              {new Date(event.date_end).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Button unstyled
                          onClick={() => handleViewDetails(event)}
                          className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2.5 rounded-lg transition-colors font-medium min-w-30 justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Detail
                        </Button>
                        <Button
                          onClick={() => setSelectedEvent(event)}
                          variant="soft" tone="success" className="min-w-30 bg-success-50 text-success-700 hover:bg-success-100"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle size={16} />
                          Verifikasi
                        </Button>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            )}

            {filteredEvents.length > 0 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredEvents.length}</span> dari{" "}
                  <span className="font-medium">{events.length}</span> event
                </div>
                {hasActiveFilters && (
                  <Button unstyled
                    onClick={clearFilters}
                    className="text-brand-600 hover:text-brand-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua Event
                  </Button>
                )}
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="ui-modal-panel max-w-2xl rounded-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold text-gray-900"
                  >
                    Verifikasi Event
                  </Motion.h3>
                  <Button unstyled
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedEvent(null);
                      setApprovalComment("");
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={18} />
                      Detail Event
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <User size={14} />
                          Nama Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.name}
                        </div>
                      </Motion.div>

                      <Motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <User size={14} />
                          Organizer
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.owner?.name || "Unknown"}
                        </div>
                      </Motion.div>

                      <Motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <Tag size={14} />
                          Kategori
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.category} • {selectedEvent.child_category}
                        </div>
                      </Motion.div>

                      <Motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <CalendarIcon size={14} />
                          Tanggal Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {new Date(selectedEvent.date_start).toLocaleDateString('id-ID')} - {" "}
                          {new Date(selectedEvent.date_end).toLocaleDateString('id-ID')}
                        </div>
                      </Motion.div>

                      <Motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-2"
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <MapPin size={14} />
                          Lokasi
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.location}, {selectedEvent.city}
                        </div>
                      </Motion.div>

                      <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-2"
                      >
                        <label className="ui-label mb-2 flex items-center gap-2">
                          <FileText size={14} />
                          Deskripsi Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {renderTextWithNewlines(selectedEvent.description)}
                        </div>
                      </Motion.div>
                    </div>
                  </Motion.div>

                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="ui-label mb-2">
                      Komentar Verifikasi (Opsional)
                    </label>
                    <textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="ui-input resize-y whitespace-pre-wrap"
                      rows="3"
                      placeholder="Berikan komentar atau alasan verifikasi..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Komentar akan ditampilkan kepada organizer sebagai feedback
                    </p>
                  </Motion.div>
                </div>

                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 pt-6 mt-6 border-t border-gray-200"
                >
                  <Button
                    onClick={() => {
                      setSelectedEvent(null);
                      setApprovalComment("");
                    }}
                    variant="secondary" className="flex-1 px-4 py-3"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "rejected")}
                    variant="danger" className="flex-1 px-4 py-3"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XCircle size={18} />
                    Tolak Event
                  </Button>
                  <Button
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "approved")}
                    variant="success" className="flex-1 px-4 py-3"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={18} />
                    Setujui Event
                  </Button>
                </Motion.div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
