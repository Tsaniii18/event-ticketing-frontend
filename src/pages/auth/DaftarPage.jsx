import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import { authAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import {
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
  passwordsMatch,
} from "../../utils";
import { ROUTES } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";

export default function DaftarPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { notification, showNotification, hideNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch(formData.password, confirmPassword)) {
      showNotification(
        "Password dan konfirmasi password tidak sama",
        "Error",
        "error"
      );
      return;
    }

    startLoading();

    try {
      const response = await authAPI.register(formData);

      if (response.data.message) {
        showNotification(
          "Registrasi berhasil! Silakan login.",
          "Sukses",
          "success"
        );
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      }
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Registrasi gagal",
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
                  <h1 className="text-2xl md:text-3xl font-bold">Daftar Akun Baru</h1>
                  <p className="text-brand-100 mt-1">Bergabunglah dengan komunitas kami</p>
                </div>
                <div className="flex items-center gap-2 text-brand-100">
                  <User size={20} />
                  <span className="font-medium">Akun User</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Motion.div variants={itemVariants} className="md:col-span-2">
                    <label className="ui-label mb-2 flex items-center gap-2">
                      <User size={16} className="text-brand-600" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="ui-input"
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </Motion.div>

                  <Motion.div variants={itemVariants}>
                    <label className="ui-label mb-2 flex items-center gap-2">
                      <User size={16} className="text-brand-600" />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="ui-input"
                      placeholder="Pilih username unik"
                      required
                    />
                  </Motion.div>

                  <Motion.div variants={itemVariants}>
                    <label className="ui-label mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-brand-600" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="ui-input"
                      placeholder="email@contoh.com"
                      required
                    />
                  </Motion.div>

                  <Motion.div variants={itemVariants}>
                    <label className="ui-label mb-2 flex items-center gap-2">
                      <Lock size={16} className="text-brand-600" />
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
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </Motion.div>

                  <Motion.div variants={itemVariants}>
                    <label className="ui-label mb-2 flex items-center gap-2">
                      <Lock size={16} className="text-brand-600" />
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="ui-input pr-10"
                        placeholder="Ulangi password Anda"
                        required
                      />
                      <Button unstyled
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </Motion.div>
                </div>

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
                    Daftar Sekarang
                    <ArrowRight size={18} />
                  </Button>
                </Motion.div>
              </form>

              <Motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-center text-gray-600">
                  Ingin mengadakan Event?{" "}
                  <Link
                    to={ROUTES.ORGANIZER_REGISTER}
                    className="text-brand-600 font-semibold hover:underline hover:text-brand-700 transition-colors"
                  >
                    Daftar Sebagai Penyelenggara Event
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
    </div>
  );
}
