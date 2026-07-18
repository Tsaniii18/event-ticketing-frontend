import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  User,
  Shield,
  Building,
  FileText,
  Upload,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import LoadingProgress from "../../components/common/LoadingProgress";
import { authAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import {
  buildOrganizerRegistrationFormData,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
  passwordsMatch,
  readFileAsDataUrl,
  validateImageFile,
} from "../../utils";
import { ROUTES } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import useLoadingProgress from "../../hooks/useLoadingProgress";

export default function DaftarEOPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "organizer",
    organization: "",
    organization_type: "",
    organization_description: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const {
    progress: uploadProgress,
    resetProgress: resetUploadProgress,
    startProgress: startUploadProgress,
  } = useLoadingProgress();
  const [errorMsg, setErrorMsg] = useState("");
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCustomOrgType, setShowCustomOrgType] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrgTypeChange = (e) => {
    const value = e.target.value;

    if (value === "Lainnya") {
      setShowCustomOrgType(true);
      setFormData((prev) => ({
        ...prev,
        organization_type: "",
      }));
    } else {
      setShowCustomOrgType(false);
      setFormData((prev) => ({
        ...prev,
        organization_type: value,
      }));
    }
  };

  const handleCustomOrgTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      organization_type: e.target.value,
    }));
  };

  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file);

      if (validation.reason === "type") {
        setErrorMsg("Hanya file JPG, JPEG, atau PNG yang diizinkan!");
        setKtpFile(null);
        setKtpPreview(null);
        resetUploadProgress();
        return;
      }

      if (validation.reason === "size") {
        setErrorMsg("Ukuran file maksimal 5MB!");
        setKtpFile(null);
        setKtpPreview(null);
        resetUploadProgress();
        return;
      }

      setErrorMsg("");
      setKtpFile(file);

      readFileAsDataUrl(file).then(setKtpPreview);
      startUploadProgress();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch(formData.password, confirmPassword)) {
      showNotification("Password dan konfirmasi tidak sama!", "Error", "error");
      return;
    }

    if (formData.password.length < 6) {
      showNotification("Password minimal 6 karakter!", "Error", "error");
      return;
    }

    if (!ktpFile) {
      showNotification("Harap upload foto KTP!", "Error", "error");
      return;
    }

    if (
      !formData.organization ||
      !formData.organization_type ||
      !formData.organization_description
    ) {
      showNotification("Semua field organisasi harus diisi!", "Error", "error");
      return;
    }

    startLoading();

    try {
      const submitData = buildOrganizerRegistrationFormData(
        formData,
        ktpFile,
      );

      const response = await authAPI.register(submitData);

      if (response.data.message) {
        showNotification(
          "Registrasi berhasil! Menunggu persetujuan admin.",
          "Sukses",
          "success"
        );
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Registrasi gagal. Coba lagi.";
      showNotification(errorMessage, "Error", "error");
    } finally {
      stopLoading();
    }
  };

  return (
    <div>
      <Navbar />

      <div className="ui-page flex items-center justify-center">
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />

        <div className="ui-container-narrow pt-32">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel overflow-hidden border-brand-200 shadow-xl"
          >
            <div className="bg-brand-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Daftar Sebagai Penyelenggara Event
                  </h1>
                  <p className="text-brand-100 mt-1">
                    Mulai adakan event Anda bersama kami
                  </p>
                </div>
                <div className="flex items-center gap-2 text-brand-100">
                  <Building size={20} />
                  <span className="font-medium">Event Organizer</span>
                </div>
              </div>
            </div>

            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={20} className="text-brand-600" />
                    Informasi Organisasi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="ui-label mb-2">
                        Nama Instansi
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="ui-input"
                        placeholder="Masukkan Nama Instansi"
                        required
                      />
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        Jenis Instansi
                      </label>
                      <select
                        name="organization_type"
                        value={
                          showCustomOrgType
                            ? "Lainnya"
                            : formData.organization_type
                        }
                        onChange={handleOrgTypeChange}
                        className="ui-select rounded-xl cursor-pointer"
                        required
                      >
                        <option value="">-- Pilih Jenis Instansi --</option>
                        <option value="Perguruan Tinggi">
                          Perguruan Tinggi
                        </option>
                        <option value="Sekolah">Sekolah</option>
                        <option value="Lembaga Kursus & Pelatihan">
                          Lembaga Kursus & Pelatihan
                        </option>
                        <option value="Pusat Riset / Laboratorium">
                          Pusat Riset / Laboratorium
                        </option>
                        <option value="Instansi Pemerintah">
                          Instansi Pemerintah
                        </option>
                        <option value="BUMN">BUMN</option>
                        <option value="BUMD">BUMD</option>
                        <option value="Lembaga Pemerintah Non Departemen">
                          LPND
                        </option>
                        <option value="Lembaga Legislatif">
                          Lembaga Legislatif
                        </option>
                        <option value="Lembaga Yudikatif">
                          Lembaga Yudikatif
                        </option>
                        <option value="Pemerintah Daerah">
                          Pemerintah Daerah
                        </option>
                        <option value="Perusahaan Teknologi">
                          Perusahaan Teknologi
                        </option>
                        <option value="Perusahaan Startup">
                          Perusahaan Startup
                        </option>
                        <option value="Perusahaan Manufaktur">
                          Perusahaan Manufaktur
                        </option>
                        <option value="Perusahaan Jasa">Perusahaan Jasa</option>
                        <option value="Perusahaan Retail">
                          Perusahaan Retail
                        </option>
                        <option value="Perusahaan Finansial">
                          Perusahaan Finansial
                        </option>
                        <option value="Perusahaan Konsultan">
                          Perusahaan Konsultan
                        </option>
                        <option value="Perusahaan Logistik">
                          Perusahaan Logistik
                        </option>
                        <option value="Perusahaan Konstruksi">
                          Perusahaan Konstruksi
                        </option>
                        <option value="Perusahaan Telekomunikasi">
                          Perusahaan Telekomunikasi
                        </option>
                        <option value="Perusahaan Energi">
                          Perusahaan Energi
                        </option>
                        <option value="Perusahaan Pertambangan">
                          Perusahaan Pertambangan
                        </option>
                        <option value="Perusahaan Perkebunan">
                          Perusahaan Perkebunan
                        </option>
                        <option value="Perusahaan Agrikultur">
                          Perusahaan Agrikultur
                        </option>
                        <option value="Perusahaan Media">
                          Perusahaan Media
                        </option>
                        <option value="Fasilitas Kesehatan">
                          Fasilitas Kesehatan
                        </option>
                        <option value="Rumah Sakit">Rumah Sakit</option>
                        <option value="Puskesmas / Klinik">
                          Puskesmas / Klinik
                        </option>
                        <option value="Organisasi Nirlaba">
                          Organisasi Nirlaba
                        </option>
                        <option value="Organisasi Sosial">
                          Organisasi Sosial
                        </option>
                        <option value="Yayasan">Yayasan</option>
                        <option value="Lembaga Kemanusiaan">
                          Lembaga Kemanusiaan
                        </option>
                        <option value="Komunitas">Komunitas</option>
                        <option value="Event Organizer">Event Organizer</option>
                        <option value="Lembaga Keagamaan">
                          Lembaga Keagamaan
                        </option>
                        <option value="Lembaga Internasional">
                          Lembaga Internasional
                        </option>
                        <option value="Media Massa">Media Massa</option>
                        <option value="Freelancer / Individu Profesional">
                          Freelancer / Individu Profesional
                        </option>
                        <option value="Lainnya">Lainnya</option>
                      </select>

                      {showCustomOrgType && (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="custom_organization_type"
                            value={formData.organization_type}
                            onChange={handleCustomOrgTypeChange}
                            className="ui-input"
                            placeholder="Masukkan jenis instansi"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="ui-label mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-brand-600" />
                        Deskripsi Organisasi
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleChange}
                        className="ui-input"
                        placeholder="Jelaskan tentang organisasi Anda..."
                        rows="4"
                        required
                      />
                    </div>
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-brand-600" />
                    Informasi Pribadi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="ui-label mb-2">
                        Nama Pengurus
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="ui-input"
                        placeholder="Masukkan Nama Pengurus"
                        required
                      />
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="ui-input"
                        placeholder="Masukkan Username"
                        required
                      />
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="ui-input"
                        placeholder="Masukkan Email"
                        required
                      />
                    </div>
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-brand-600" />
                    Keamanan Akun
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="ui-label mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="ui-input pr-10"
                          placeholder="Minimal 6 karakter"
                          required
                        />
                        <Button unstyled
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="ui-label mb-2">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="ui-input pr-10"
                          placeholder="Konfirmasi Password"
                          required
                        />
                        <Button unstyled
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-brand-600" />
                    Verifikasi Identitas
                  </h3>
                  <div className="bg-brand-50 rounded-xl p-6 border-2 border-dashed border-brand-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload KTP (JPG/JPEG/PNG - Maks. 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpChange}
                      className="ui-input cursor-pointer rounded-xl hover:bg-gray-50"
                      required
                    />

                    {errorMsg && (
                      <p className="text-red-600 text-sm mt-2">{errorMsg}</p>
                    )}

                    {uploadProgress > 0 && (
                      <LoadingProgress
                        className="mt-3"
                        progress={uploadProgress}
                      />
                    )}

                    {ktpPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Preview KTP:
                        </p>
                        <img
                          src={ktpPreview}
                          alt="Preview KTP"
                          className="w-48 rounded-lg shadow-md border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setIsModalOpen(true)}
                        />
                      </div>
                    )}
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants} className="pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    loadingLabel="Mendaftarkan..."
                    size="lg"
                    fullWidth
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Daftar Sebagai EO
                    <ArrowRight size={18} />
                  </Button>
                </Motion.div>
              </form>

              <Motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-center text-gray-600">
                  Ingin mendaftar sebagai peserta biasa?{" "}
                  <Link
                    to={ROUTES.USER_REGISTER}
                    className="text-brand-600 font-semibold hover:underline hover:text-brand-700 transition-colors"
                  >
                    Daftar Sebagai Peserta
                  </Link>
                </p>
                <p className="text-sm text-center text-gray-600 mt-2">
                  Sudah punya akun?{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-brand-600 font-semibold hover:underline hover:text-brand-700 transition-colors"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </Motion.div>
            </Motion.div>
          </Motion.div>
        </div>
      </div>

      {isModalOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ui-modal-backdrop items-center bg-black/60 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ui-modal-panel max-w-2xl rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Preview KTP</h3>
              <Button unstyled
                onClick={() => setIsModalOpen(false)}
                className="ui-icon-button"
              >
                ✕
              </Button>
            </div>
            <img
              src={ktpPreview}
              alt="KTP"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </Motion.div>
        </Motion.div>
      )}
    </div>
  );
}
