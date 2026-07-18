import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { userAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import {
  getOrganizerStatusConfig,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
} from "../../utils";
import { motion as Motion } from "framer-motion";
import {
  User, Mail, Building, MapPin, FileText,
  Shield, ArrowLeft, CheckCircle, XCircle
} from "lucide-react";
import Button from "../../components/common/Button";
import { ROUTES } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function TinjauUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [user, setUser] = useState(null);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const {
    isLoading: submitting,
    startLoading: startSubmitting,
    stopLoading: stopSubmitting,
  } = useLoading(false);
  const [comment, setComment] = useState("");

  const fetchUserDetail = useCallback(async () => {
    try {
      startLoading();
      const response = await userAPI.getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showNotification("Gagal memuat detail pengguna", "Error", "error");
    } finally {
      stopLoading();
    }
  }, [userId, showNotification, startLoading, stopLoading]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleVerify = async (status) => {
    if (submitting) return;

    try {
      startSubmitting();

      await userAPI.verifyOrganizer(userId, {
        status: status,
        comment: comment || `User ${status === "approved" ? "disetujui" : "ditolak"}`,
      });

      showNotification(
        `Pengguna berhasil ${status === "approved" ? "disetujui" : "ditolak"}!`,
        "Sukses",
        "success"
      );

      setTimeout(() => {
        navigate(ROUTES.USER_VERIFICATION);
      }, 1500);
    } catch (error) {
      console.error("Error verifying user:", error);
      showNotification("Gagal memverifikasi pengguna", "Error", "error");
    } finally {
      stopSubmitting();
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingState
          variant="plain"
          className="ui-page min-h-[70vh]"
          label="Memuat detail pengguna..."
          description="Menyiapkan informasi dan status verifikasi pengguna"
        />
      </div>
    );
  }

  const statusInfo = user
    ? getOrganizerStatusConfig(user.register_status)
    : null;
  const StatusIcon = statusInfo?.icon;

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
        <div className="ui-container-narrow pt-32">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel overflow-hidden shadow-xl"
          >
            <div className="bg-linear-to-r from-brand-500 to-brand-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Tinjau Pengguna Organizer</h1>
                  <p className="text-brand-100 mt-1">Verifikasi dan tinjau data pengguna organizer</p>
                </div>
                <Button unstyled
                  onClick={() => navigate(ROUTES.USER_VERIFICATION)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={18} />
                  Kembali
                </Button>
              </div>
            </div>

            {user ? (
              <Motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-6 md:p-8"
              >
                <Motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-6 border-b border-gray-200"
                >
                  <div className="relative">
                    <Motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-24 h-24 rounded-full bg-linear-to-br from-brand-500 to-purple-600 overflow-hidden shadow-lg"
                    >
                      {user.profile_pict ? (
                        <img
                          src={user.profile_pict}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <User className="text-white" size={32} />
                        </div>
                      )}
                    </Motion.div>
                    {statusInfo && (
                      <Motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-2 -right-2"
                      >
                        <div className={`ui-badge ${statusInfo.color} shadow-md`}>
                          <StatusIcon size={12} />
                          {statusInfo.text}
                        </div>
                      </Motion.div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.name || user.username}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span className="font-medium capitalize">{user.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  <div className="ui-subtle-panel p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-100 rounded-lg">
                        <User className="text-brand-600" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Username
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ui-subtle-panel p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="text-green-600" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Informasi Akun</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Role
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Status Verifikasi
                        </label>
                        <div className={`ui-alert ${statusInfo.color} p-3 font-medium`}>
                          {statusInfo.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="bg-linear-to-r from-brand-50 to-brand-100 rounded-xl p-6 mb-6 border border-brand-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <Building className="text-brand-600" size={20} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Informasi Organizer</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="ui-label mb-2 flex items-center gap-2">
                        <Building size={16} />
                        Nama Organisasi
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-brand-200 shadow-sm">
                        {user.organization || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="ui-label mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Tipe Organisasi
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-brand-200 shadow-sm">
                        {user.organization_type || "-"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="ui-label mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Deskripsi Organisasi
                      </label>
                      <p className="text-gray-900 p-3 bg-white rounded-lg border border-brand-200 shadow-sm min-h-20">
                        {user.organization_description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-brand-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={18} />
                      Verifikasi KTP
                    </h4>
                    {user.ktp ? (
                      <div className="bg-white rounded-lg p-4 border border-brand-200">
                        <p className="text-sm text-gray-600 mb-3">KTP telah diunggah untuk verifikasi</p>
                        <a
                          href={user.ktp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium"
                        >
                          <FileText size={16} />
                          Lihat Dokumen KTP
                        </a>
                      </div>
                    ) : (
                      <div className="ui-alert ui-alert-warning">
                        <p className="text-yellow-800">KTP belum diunggah untuk verifikasi</p>
                      </div>
                    )}
                  </div>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="ui-subtle-panel p-6 mb-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Komentar Verifikasi
                  </h3>
                  <textarea
                    className="ui-input resize-none p-4"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Berikan komentar untuk approval/rejection..."
                  ></textarea>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200"
                >
                  <Button
                    onClick={() => navigate(ROUTES.USER_VERIFICATION)}
                    variant="muted" className="px-6 py-3"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={18} />
                    Kembali
                  </Button>
                  <Button
                    onClick={() => handleVerify("rejected")}
                    variant="danger"
                    className="px-6 py-3"
                    loading={submitting}
                    loadingLabel="Memproses..."
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XCircle size={18} />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleVerify("approved")}
                    variant="success"
                    className="px-6 py-3"
                    loading={submitting}
                    loadingLabel="Memproses..."
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={18} />
                    Setujui
                  </Button>
                </Motion.div>
              </Motion.div>
            ) : (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <div className="text-gray-400 mb-4">
                  <User size={48} className="mx-auto" />
                </div>
                <p className="text-gray-600 text-lg mb-4">Pengguna tidak ditemukan.</p>
                <Button
                  onClick={() => navigate(ROUTES.USER_VERIFICATION)}
                  variant="primary" className="mx-auto px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={18} />
                  Kembali ke Daftar Verifikasi
                </Button>
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
