import { useState, useMemo, useEffect, useCallback } from "react";
import Navbar from "../../components/layout/Navbar";
import { feedbackAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import FeedbackStatusBadge from "../../components/common/FeedbackStatusBadge";
import useNotification from "../../hooks/useNotification";
import {
  Eye,
  Search,
  Filter,
  X,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  formatTimeAgo as getTimeAgo,
  getFeedbackStatusLabel,
} from "../../utils";

export default function LaporanMasalahPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { notification, showNotification, hideNotification } = useNotification();

  const [showFilters, setShowFilters] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    responseInput: "",
  });

  const fetchAllFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAllFeedback();
      const sortedFeedback = (response.data.feedback || []).sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
      setReports(sortedFeedback);
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal memuat laporan",
        "Error",
        "error"
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  const handleRefresh = () => {
    fetchAllFeedback();
    showNotification("Data diperbarui", "Sukses", "success");
  };

  const openDetail = (report) => {
    setDetailModal({
      open: true,
      data: report,
      responseInput: report.reply || "",
    });
  };

  const updateFeedbackStatus = async (status) => {
    if (!detailModal.data) return;

    try {
      setUpdating(true);

      const formData = {
        status: status,
        reply: detailModal.responseInput.trim() || ""
      };

      await feedbackAPI.updateFeedbackStatus(detailModal.data.feedback_id, formData);

      showNotification("Status laporan berhasil diupdate!", "Sukses", "success");

      await fetchAllFeedback();

      setDetailModal({ open: false, data: null, responseInput: "" });

    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal mengupdate status",
        "Error",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(reports.map((r) => r.feedback_category))];
    return categories;
  }, [reports]);

  const waitingReports = reports.filter(r => r.status === "waiting");
  const processedReports = reports.filter(r => r.status === "processed");
  const completedReports = reports.filter(r => r.status === "completed");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchUser =
        searchUser === "" ||
        r.user?.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(searchUser.toLowerCase());

      const matchStatus =
        statusFilter === "all" || r.status === statusFilter;

      const matchCategory =
        categoryFilter === "all" || r.feedback_category === categoryFilter;

      return matchUser && matchStatus && matchCategory;
    });
  }, [reports, searchUser, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchUser("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchUser || statusFilter !== "all" || categoryFilter !== "all";

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

      <AnimatePresence>
        {detailModal.open && detailModal.data && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-backdrop items-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="ui-modal-panel max-w-lg overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Detail Laporan
                </h2>
                <button
                  onClick={() => setDetailModal({ open: false, data: null, responseInput: "" })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Kategori:</span>
                  <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
                    {detailModal.data.feedback_category}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pengirim</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{detailModal.data.user?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{detailModal.data.user?.email || "No email"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status Saat Ini</p>
                  <FeedbackStatusBadge
                    status={detailModal.data.status}
                    completedLabel="Diterima"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Deskripsi Masalah</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {detailModal.data.comment}
                    </p>
                  </div>
                </div>

                {detailModal.data.image && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Bukti Lampiran</p>
                    <a
                      href={detailModal.data.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
                    >
                      <Eye size={16} />
                      Lihat Gambar
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tanggapan Admin</p>
                  <textarea
                    className="ui-input resize-none"
                    rows={4}
                    value={detailModal.responseInput}
                    onChange={(e) =>
                      setDetailModal((prev) => ({
                        ...prev,
                        responseInput: e.target.value,
                      }))
                    }
                    placeholder="Tulis tanggapan admin..."
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 p-6 border-t border-gray-100 bg-gray-50">
                <Motion.button
                  className="ui-button ui-button-secondary px-5"
                  onClick={() => setDetailModal({ open: false, data: null, responseInput: "" })}
                  disabled={updating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </Motion.button>
                <div className="flex gap-2">
                  <Motion.button
                    className="ui-button ui-button-danger px-5"
                    onClick={() => updateFeedbackStatus("rejected")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Tolak
                      </>
                    )}
                  </Motion.button>
                  <Motion.button
                    className="ui-button ui-button-warning px-5"
                    onClick={() => updateFeedbackStatus("processed")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        Proses
                      </>
                    )}
                  </Motion.button>
                  <Motion.button
                    className="ui-button ui-button-success px-5"
                    onClick={() => updateFeedbackStatus("completed")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Terima
                      </>
                    )}
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

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
                <h1 className="ui-heading-1">Laporan Masalah</h1>
                <p className="text-gray-600 mt-2">
                  Total: {reports.length} laporan • Ditampilkan: {filteredReports.length} laporan
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {hasActiveFilters && (
                  <Motion.button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Hapus Filter
                  </Motion.button>
                )}

                <Motion.button
                  onClick={handleRefresh}
                  className="ui-button ui-button-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} />
                  Refresh
                </Motion.button>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-linear-to-r from-brand-500 to-brand-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-100 text-sm font-medium">Total Laporan</p>
                    <p className="text-3xl font-bold mt-1">{reports.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FileText size={28} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>

              <div className="bg-linear-to-r from-amber-500 to-amber-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Menunggu</p>
                    <p className="text-3xl font-bold mt-1">{waitingReports.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Clock size={28} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>

              <div className="bg-linear-to-r from-cyan-500 to-cyan-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Diproses</p>
                    <p className="text-3xl font-bold mt-1">{processedReports.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <AlertCircle size={28} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>

              <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Selesai</p>
                    <p className="text-3xl font-bold mt-1">{completedReports.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <CheckCircle size={28} className="text-white opacity-80" />
                  </Motion.div>
                </div>
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

                <Motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="ui-button ui-button-secondary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </Motion.button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="ui-label">
                          Cari Nama atau Email
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            className="ui-input py-2.5 pl-10 pr-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="ui-label">
                          Filter Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="ui-input py-2.5"
                        >
                          <option value="all">Semua Status</option>
                          <option value="waiting">Menunggu</option>
                          <option value="processed">Diproses</option>
                          <option value="completed">Diterima</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="ui-label">
                          Filter Kategori
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="ui-input py-2.5"
                        >
                          <option value="all">Semua Kategori</option>
                          {categoryOptions.map((category, i) => (
                            <option key={i} value={category}>{category}</option>
                          ))}
                        </select>
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
                          {searchUser && ` Pencarian: "${searchUser}"`}
                          {statusFilter !== "all" && ` Status: ${getFeedbackStatusLabel(statusFilter, "Diterima")}`}
                          {categoryFilter !== "all" && ` Kategori: ${categoryFilter}`}
                        </p>
                      </Motion.div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>

            {loading ? (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="ui-spinner"
                />
                <p className="mt-4 text-gray-600">Memuat data laporan...</p>
              </Motion.div>
            ) : filteredReports.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ui-state"
              >
                <MessageSquare className="ui-state-icon mx-auto" size={48} />
                <p className="ui-state-title">
                  {hasActiveFilters
                    ? "Tidak ada laporan yang sesuai dengan filter"
                    : "Belum ada laporan masalah"
                  }
                </p>
                <p className="ui-state-description mb-4">
                  {hasActiveFilters
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua laporan"
                    : "Laporan masalah dari pengguna akan muncul di sini"
                  }
                </p>
                {hasActiveFilters && (
                  <Motion.button
                    onClick={clearFilters}
                    className="ui-button ui-button-primary px-5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hapus Semua Filter
                  </Motion.button>
                )}
              </Motion.div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report, index) => (
                  <Motion.div
                    key={report.feedback_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="ui-card p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.user?.name || "Unknown"}
                          </h3>
                          <FeedbackStatusBadge
                            status={report.status}
                            completedLabel="Diterima"
                          />
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            {report.feedback_category}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{report.user?.email || "No email"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Waktu Dibuat</p>
                            <p>{getTimeAgo(report.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Motion.button
                          onClick={() => openDetail(report)}
                          className="ui-button ui-button-primary min-w-30 justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Tinjau
                        </Motion.button>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            )}

            {filteredReports.length > 0 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredReports.length}</span> dari{" "}
                  <span className="font-medium">{reports.length}</span> laporan
                </div>
                {hasActiveFilters && (
                  <Motion.button
                    onClick={clearFilters}
                    className="text-brand-600 hover:text-brand-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua Laporan
                  </Motion.button>
                )}
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
