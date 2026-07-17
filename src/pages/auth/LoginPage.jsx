import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion as Motion } from "framer-motion";
import { Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { authAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import {
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
} from "../../utils";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        showNotification("Login berhasil!", "Sukses", "success");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Login gagal",
        "Error",
        "error"
      );
    } finally {
      setLoading(false);
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

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel overflow-hidden border-brand-200 shadow-xl"
          >
            <div className="bg-brand-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Masuk ke Akun</h1>
                  <p className="text-brand-100 mt-1">Selamat datang kembali</p>
                </div>
                <div className="flex items-center gap-2 text-brand-100">
                  <Shield size={20} />
                  <span className="font-medium">Login</span>
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
                  <label className="ui-label mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-brand-600" />
                    Email/Username
                  </label>
                  <input
                    type="text"
                    name="username_or_email"
                    value={formData.username_or_email}
                    onChange={handleChange}
                    className="ui-input"
                    placeholder="Masukkan Email atau Username"
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
                      placeholder="Masukkan Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants} className="pt-4">
                  <Motion.button
                    type="submit"
                    disabled={loading}
                    className="ui-button ui-button-primary w-full rounded-xl py-3 font-semibold shadow-lg"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Motion.button>
                </Motion.div>
              </form>

              <Motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200 space-y-3"
              >
                <p className="text-sm text-center text-gray-600">
                  Belum punya Akun?{" "}
                  <Link
                    to="/daftar"
                    className="text-brand-600 font-semibold hover:underline hover:text-brand-700 transition-colors"
                  >
                    Daftar
                  </Link>
                </p>
                <p className="text-sm text-center text-gray-600">
                  Ingin mengadakan Event?{" "}
                  <Link
                    to="/daftarEO"
                    className="text-brand-600 font-semibold hover:underline hover:text-brand-700 transition-colors"
                  >
                    Daftar Sebagai Penyelenggara Event
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
