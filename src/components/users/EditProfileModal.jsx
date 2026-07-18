import { useState, useRef } from "react";
import { userAPI } from "../../services";
import useNotification from "../../hooks/useNotification";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import { X, Camera, User, Mail, Lock, Building, MapPin, FileText, Eye, EyeOff } from "lucide-react";
import useLoading from "../../hooks/useLoading";
import {
  buildProfileFormData,
  createObjectPreviewUrl,
  revokeObjectUrls,
} from "../../utils";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
    profile_pict: null,
    organization: user.organization || '',
    organization_type: user.organization_type || '',
    organization_description: user.organization_description || '',
  });
  const [previewImages, setPreviewImages] = useState({
    profile_pict: user.profile_pict || '',
  });
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(false);
  const [showPassword, setShowPassword] = useState(false);

  const profilePictRef = useRef(null);
  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      const previewUrl = createObjectPreviewUrl(file);
      setPreviewImages(prev => ({
        ...prev,
        [name]: previewUrl
      }));
    }
  };

  const clearFile = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviewImages(prev => ({
      ...prev,
      [fieldName]: user[fieldName] || ''
    }));

    if (fieldName === 'profile_pict' && profilePictRef.current) {
      profilePictRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();

    try {
      const submitData = buildProfileFormData(user, formData);


      const response = await userAPI.updateProfile(submitData);
      onUpdate(response.data.user);

      showNotification('Profil berhasil diperbarui!', 'Update Berhasil', 'success');

      revokeObjectUrls(previewImages);

      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Gagal memperbarui profil', 'Update Gagal', 'error');
    } finally {
      stopLoading();
    }
  };

  const handleClose = () => {
    revokeObjectUrls(previewImages);
    onClose();
  };

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="ui-modal-backdrop items-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="ui-modal-panel max-w-md rounded-2xl"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-gray-900"
              >
                Edit Profil
              </Motion.h3>
              <Button unstyled
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="ui-icon-button size-8 rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {(user.role === 'user' || user.role === 'organizer') && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Camera size={16} />
                      Foto Profil
                    </div>
                  </label>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-500 to-purple-600 overflow-hidden shadow-md">
                        {(previewImages.profile_pict || user.profile_pict) ? (
                          <img
                            src={previewImages.profile_pict || user.profile_pict}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <User className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>
                      {(previewImages.profile_pict || user.profile_pict) && (
                        <Button unstyled
                          type="button"
                          onClick={() => clearFile('profile_pict')}
                          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-danger-500 text-xs text-white shadow-md hover:bg-danger-600"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </Button>
                      )}
                    </div>

                    <Motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 cursor-pointer"
                    >
                      <input
                        ref={profilePictRef}
                        type="file"
                        name="profile_pict"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-brand-500 hover:bg-brand-50 transition-colors">
                        <Camera size={20} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-600">Unggah Foto</p>
                        <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah</p>
                      </div>
                    </Motion.label>
                  </div>
                </Motion.div>
              )}

              {(user.role === 'user' || user.role === 'organizer') && (
                <>
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="ui-label mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Nama Lengkap
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="ui-input"
                      placeholder="Masukkan nama lengkap"
                    />
                  </Motion.div>

                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="ui-label mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="ui-input"
                      placeholder="Masukkan email"
                    />
                  </Motion.div>
                </>
              )}

              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="ui-label mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Password Baru
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="ui-input pr-10"
                    placeholder="Masukkan password baru"
                  />
                  <Button unstyled
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah</p>
              </Motion.div>

              {user.role === 'organizer' && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-t pt-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={18} />
                    Informasi Organizer
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="ui-label mb-2">
                        Nama Organisasi
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        readOnly
                        disabled
                        className="ui-input p-3"
                        placeholder="Masukkan nama organisasi"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama organisasi tidak dapat diubah</p>
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        Jenis Instansi
                      </label>
                      <input
                        type="text"
                        name="organization_type"
                        value={formData.organization_type}
                        readOnly
                        disabled
                        className="ui-input p-3"
                        placeholder="Jenis instansi"
                      />
                      <p className="text-xs text-gray-500 mt-1">Jenis instansi tidak dapat diubah</p>
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Deskripsi Organisasi
                        </div>
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        readOnly
                        disabled
                        rows="3"
                        className="ui-textarea min-h-0 p-3"
                        placeholder="Deskripsi organisasi"
                      />
                      <p className="text-xs text-gray-500 mt-1">Deskripsi organisasi tidak dapat diubah</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Verifikasi KTP
                      </h4>
                      {user.ktp ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2">KTP telah diunggah dan tidak dapat diubah</p>
                          <a
                            href={user.ktp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-800 underline text-sm inline-flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Lihat KTP
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">KTP belum diunggah</p>
                      )}
                    </div>
                  </div>
                </Motion.div>
              )}

              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  loadingLabel="Menyimpan..."
                  size="lg"
                  className="flex-1 bg-linear-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Simpan Perubahan
                </Button>
              </Motion.div>
            </form>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}
