import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { userAPI } from "../../services";
import EditProfileModal from "../../components/users/EditProfileModal";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import useImagePreview from "../../hooks/useImagePreview";
import {
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
} from "../../utils";
import { motion as Motion } from "framer-motion";
import {
  User, Mail, Building, MapPin, FileText,
  Shield, Edit, CheckCircle,
  Clock, XCircle, Download, Eye
} from "lucide-react";
import Button from "../../components/common/Button";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function LihatProfilPage() {
  const [user, setUser] = useState(null);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const {
    previewData: previewImageData,
    isPreviewOpen,
    openImagePreview,
    closeImagePreview,
  } = useImagePreview();

  const fetchUserProfile = useCallback(async () => {
    try {
      startLoading();
      const response = await userAPI.getProfile();
      setUser(response.data);
      sessionStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
      const userData = sessionStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setShowEditModal(false);
  };

  const handleViewProfilePicture = () => {
    if (user?.profile_pict) {
      openImagePreview({
        src: user.profile_pict,
        alt: `Foto Profil - ${user.name || user.username}`,
        type: "profile"
      });
    }
  };

  const handleViewKTP = () => {
    if (user?.ktp) {
      openImagePreview({
        src: user.ktp,
        alt: `KTP - ${user.name || user.username}`,
        type: "ktp"
      });
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "user":
        return "User";
      case "organizer":
        return "Event Organizer";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Menunggu Verifikasi", color: "ui-badge-warning", icon: Clock };
      case "approved":
        return { text: "Terverifikasi", color: "ui-badge-success", icon: CheckCircle };
      case "rejected":
        return { text: "Ditolak", color: "ui-badge-danger", icon: XCircle };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800", icon: Shield };
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingState
          variant="plain"
          className="ui-page min-h-[70vh]"
          label="Memuat data profil..."
          description="Menyiapkan informasi akun dan profil Anda"
        />
      </div>
    );
  }

  const statusInfo = user.role === "organizer" ? getStatusDisplay(user.register_status) : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div>
      <Navbar />

      <div className="ui-page">
        <div className="ui-container-narrow pt-32">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  >
                    Profil Saya
                  </Motion.h1>
                  <p className="text-gray-500 mt-1">Kelola informasi profil Anda</p>
                </div>
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="primary" className="bg-linear-to-r from-brand-600 to-brand-700 py-2 hover:from-brand-700 hover:to-brand-800"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit size={18} />
                  Edit Profil
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
                      className="relative w-24 h-24 rounded-full bg-linear-to-br from-brand-500 to-purple-600 overflow-hidden shadow-lg group cursor-pointer"
                      onClick={handleViewProfilePicture}
                    >
                      {user.profile_pict ? (
                        <>
                          <img
                            src={user.profile_pict}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center bg-gray-300 cursor-pointer"
                          onClick={handleViewProfilePicture}
                        >
                          <User className="text-white" size={32} />
                        </div>
                      )}
                    </Motion.div>

                    {user.profile_pict && (
                      <Button unstyled
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleViewProfilePicture}
                        className="mt-2 text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 justify-center w-full"
                      >
                        <Eye size={12} />
                        Lihat Foto
                      </Button>
                    )}

                    {user.role === "organizer" && statusInfo && (
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
                        <span className="font-medium">{getRoleDisplayName(user.role)}</span>
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
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          {user.username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          {user.name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
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
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200 capitalize">
                          {getRoleDisplayName(user.role)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Status Akun
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          Aktif
                        </p>
                      </div>
                      {user.role === "organizer" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Status Verifikasi
                          </label>
                          <div className={`ui-alert ${statusInfo.color} p-2 font-medium`}>
                            {statusInfo.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Motion.div>

                {user.role === "organizer" && (
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
                          {user.organization_description || "-"}
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
                          <p className="text-sm text-gray-600 mb-3">KTP telah diunggah dan diverifikasi</p>
                          <div className="flex flex-wrap gap-3">
                            <Button unstyled
                              onClick={handleViewKTP}
                              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium px-3 py-1.5 hover:bg-brand-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              Lihat KTP
                            </Button>
                            <a
                              href={user.ktp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium px-3 py-1.5 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Download size={16} />
                              Download KTP
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="ui-alert ui-alert-warning">
                          <p className="text-yellow-800">KTP belum diunggah untuk verifikasi</p>
                        </div>
                      )}
                    </div>

                    {user.register_comment && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-brand-200"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText size={18} />
                          Komentar Verifikasi
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">{user.register_comment}</p>
                        </div>
                      </Motion.div>
                    )}
                  </Motion.div>
                )}
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
                <p className="text-gray-600 text-lg">Gagal memuat data profil.</p>
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {isPreviewOpen && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={closeImagePreview}
          imageSrc={previewImageData.src}
          imageAlt={previewImageData.alt}
          aspectRatio="square"
          showDownloadButton={true}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = previewImageData.src;
            link.download = previewImageData.type === 'profile'
              ? `profile-${user.username}.jpg`
              : `ktp-${user.username}.jpg`;
            link.click();
          }}
        />
      )}
    </div>
  );
}
