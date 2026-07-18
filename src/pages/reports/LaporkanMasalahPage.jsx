import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { feedbackAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import FeedbackStatusBadge from "../../components/common/FeedbackStatusBadge";
import useNotification from "../../hooks/useNotification";
import useSessionUser from "../../hooks/useSessionUser";
import {
  Eye,
  Send,
  Upload,
  X,
  History,
  PenLine,
  MessageSquare
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  buildFeedbackFormData,
  FADE_UP_VARIANTS as itemVariants,
  FEEDBACK_CATEGORIES as feedbackCategories,
  formatTimeAgo as getTimeAgo,
  getFeedbackFormCategory,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  readFileAsDataUrl,
  sortFeedbackByNewest,
  validateImageFile,
} from "../../utils";
import Button from "../../components/common/Button";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function LaporkanMasalahPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buat");
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(false);
  const [reports, setReports] = useState([]);
  const { user } = useSessionUser();

  const { notification, showNotification, hideNotification } = useNotification();

  const fetchMyFeedback = useCallback(async () => {
    try {
      startLoading();
      const response = await feedbackAPI.getMyFeedback();
      const sortedFeedback = sortFeedbackByNewest(
        response.data.feedback || [],
      );
      setReports(sortedFeedback);
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal memuat riwayat laporan",
        "Error",
        "error"
      );
      setReports([]);
    } finally {
      stopLoading();
    }
  }, [showNotification, startLoading, stopLoading]);

  useEffect(() => {
    if (activeTab === "riwayat" && user) fetchMyFeedback();
  }, [activeTab, fetchMyFeedback, user]);

  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  const [form, setForm] = useState({
    feedback_category: "",
    comment: "",
    custom_category: ""
  });
  const [proofFile, setProofFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);

    if (validation.reason === "type") {
      showNotification("Format file harus JPG, JPEG, atau PNG", "Peringatan", "warning");
      return (e.target.value = "");
    }

    if (validation.reason === "size") {
      showNotification("Ukuran file maksimal 5MB", "Peringatan", "warning");
      return (e.target.value = "");
    }

    setProofFile(file);

    readFileAsDataUrl(file).then(setPreviewImage);
  };

  const removeImage = () => {
    setProofFile(null);
    setPreviewImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    if (value.length <= 38) {
      setForm({ ...form, custom_category: value });
    }
  };

  const submitReport = async () => {
    const finalCategory = getFeedbackFormCategory(form);

    if (!finalCategory.trim() || !form.comment.trim()) {
      showNotification("Harap isi semua field yang wajib", "Peringatan", "warning");
      return;
    }

    try {
      startLoading();

      const formData = buildFeedbackFormData(form, proofFile);

      await feedbackAPI.createFeedback(formData);

      showNotification("Laporan berhasil dikirim!", "Sukses", "success");

      setForm({ feedback_category: "", comment: "", custom_category: "" });
      setProofFile(null);
      setPreviewImage(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      setActiveTab("riwayat");
      fetchMyFeedback();

    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal mengirim laporan",
        "Error",
        "error"
      );
    } finally {
      stopLoading();
    }
  };

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
                <Button unstyled
                  onClick={() => setDetailModal({ open: false, data: null })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Kategori:</span>
                  <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
                    {detailModal.data.feedback_category}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                  <FeedbackStatusBadge status={detailModal.data.status} />
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
                  {detailModal.data.reply ? (
                    <div className="ui-alert ui-alert-success">
                      <p className="text-green-700 whitespace-pre-wrap">
                        {detailModal.data.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="ui-alert ui-alert-warning">
                      <p className="text-amber-700 italic">
                        Admin belum memberikan tanggapan
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
                <Button
                  onClick={() => setDetailModal({ open: false, data: null })}
                  variant="primary" className="px-5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tutup
                </Button>
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
                <h1 className="ui-heading-1">Laporkan Masalah</h1>
                <p className="text-gray-600 mt-2">
                  Sampaikan keluhan atau saran Anda kepada tim kami
                </p>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex border-b border-gray-200 mb-8"
            >
              <Button unstyled
                onClick={() => setActiveTab("buat")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "buat"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PenLine size={18} />
                Buat Laporan
              </Button>
              <Button unstyled
                onClick={() => setActiveTab("riwayat")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "riwayat"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <History size={18} />
                Riwayat Laporan
                {reports.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {reports.length}
                  </span>
                )}
              </Button>
            </Motion.div>

            {activeTab === "buat" && (
              <Motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <Motion.div
                  variants={itemVariants}
                  className="ui-subtle-panel p-6"
                >
                  <h2 className="ui-heading-2 mb-6">
                    Informasi Laporan
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="ui-label">
                        Kategori Masalah *
                      </label>
                      <select
                        className="ui-input"
                        value={form.feedback_category}
                        onChange={(e) => setForm({ ...form, feedback_category: e.target.value, custom_category: "" })}
                        required
                      >
                        <option value="">Pilih kategori masalah</option>
                        {feedbackCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.feedback_category === "other" && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="ui-label">
                          Kategori Lainnya *
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan kategori masalah..."
                          className="ui-input"
                          value={form.custom_category}
                          onChange={handleCustomCategoryChange}
                          maxLength={38}
                          required
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {form.custom_category.length}/38 karakter
                          </p>
                          {form.custom_category.length >= 38 && (
                            <p className="text-xs text-red-500">
                              Maksimal karakter tercapai
                            </p>
                          )}
                        </div>
                      </Motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="ui-label">
                        Deskripsi Masalah *
                      </label>
                      <textarea
                        placeholder="Jelaskan masalah yang Anda alami secara detail..."
                        className="ui-textarea"
                        rows={5}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="ui-label">
                        Lampirkan Gambar (Opsional)
                      </label>

                      {!previewImage ? (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-brand-400 transition-colors">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <span className="text-gray-600 font-medium">Klik untuk upload gambar</span>
                          <span className="text-gray-400 text-sm mt-1">JPG, JPEG, PNG (Maks. 5MB)</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={fileHandler}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative inline-block">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-xs max-h-48 rounded-lg object-cover border border-gray-200"
                          />
                          <Button unstyled
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="flex gap-4 pt-6 border-t border-gray-200"
                >
                  <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    variant="secondary" className="flex-1 px-6 py-3"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={submitReport}
                    loading={loading}
                    loadingLabel="Mengirim..."
                    variant="primary"
                    className="flex-1 px-6 py-3"
                    whileHover={{
                      scale: loading ? 1 : 1.02,
                      y: loading ? 0 : -1,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={18} />
                    Kirim Laporan
                  </Button>
                </Motion.div>
              </Motion.div>
            )}

            {activeTab === "riwayat" && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {loading ? (
                  <LoadingState
                    variant="compact"
                    className="py-20"
                    label="Memuat riwayat laporan..."
                    description="Menyiapkan laporan dan tanggapan terbaru"
                  />
                ) : reports.length === 0 ? (
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ui-state"
                  >
                    <MessageSquare className="ui-state-icon mx-auto" size={48} />
                    <p className="ui-state-title">
                      Belum ada riwayat laporan
                    </p>
                    <p className="ui-state-description mb-4">
                      Laporan yang Anda kirimkan akan muncul di sini
                    </p>
                    <Button
                      onClick={() => setActiveTab("buat")}
                      variant="primary" className="px-5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buat Laporan Pertama
                    </Button>
                  </Motion.div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
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
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {report.feedback_category}
                              </span>
                              <FeedbackStatusBadge status={report.status} />
                            </div>

                            <p className="text-gray-700 line-clamp-2 mb-3">
                              {report.comment}
                            </p>

                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Dibuat:</span> {getTimeAgo(report.created_at)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDetailModal({ open: true, data: report })}
                              variant="primary" className="min-w-30 justify-center"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye size={16} />
                              Detail
                            </Button>
                          </div>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                )}

                {reports.length > 0 && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
                  >
                    <div>
                      Total <span className="font-medium">{reports.length}</span> laporan
                    </div>
                    <Button unstyled
                      onClick={() => setActiveTab("buat")}
                      className="text-brand-600 hover:text-brand-800 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      + Buat Laporan Baru
                    </Button>
                  </Motion.div>
                )}
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
