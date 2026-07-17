import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { userAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import { Search, Filter, X, Eye, RefreshCw, Users, UserCheck, UserSearch } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  USER_VERIFICATION_STATUS_CONFIG,
  USER_VERIFICATION_STATUS_LABELS,
} from "../../utils";
import Button from "../../components/common/Button";
import { routeTo } from "../../utils/routeConstants";

export default function VerifikasiUserPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllOrganizers();

      const pendingUsers = response.data.filter(
        (u) => u.register_status === "pending"
      );
      setUsers(pendingUsers);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      showNotification("Gagal memuat daftar organizer", "Error", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const applyFilters = useCallback(() => {
    const userList = activeTab === "pending" ? users : allUsers;
    let filtered = [...userList];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === "all" && statusFilter !== "all") {
      filtered = filtered.filter(user => user.register_status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [activeTab, allUsers, searchTerm, statusFilter, users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const handleRefresh = () => {
    fetchUsers();
    showNotification("Data diperbarui", "Sukses", "success");
  };

  const getStatusBadge = (status) => {
    const config =
      USER_VERIFICATION_STATUS_CONFIG[status] ||
      USER_VERIFICATION_STATUS_CONFIG.pending;
    const IconComponent = config.icon;

    return (
      <span className={`ui-badge ${config.className}`}>
        <IconComponent size={14} />
        {config.text}
      </span>
    );
  };

  const getStatusText = (status) => {
    return USER_VERIFICATION_STATUS_LABELS[status] || status;
  };

  const hasActiveFilters = searchTerm || (activeTab === "all" && statusFilter !== "all");

  const pendingUsers = users.filter(user => user.register_status === "pending");
  const approvedUsers = allUsers.filter(user => user.register_status === "approved");

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
                <h1 className="ui-heading-1">Manajemen Pengguna</h1>
                <p className="text-gray-600 mt-2">
                  {activeTab === "pending"
                    ? `Total: ${pendingUsers.length} menunggu verifikasi • Ditampilkan: ${filteredUsers.length} user`
                    : `Total: ${allUsers.length} user • Ditampilkan: ${filteredUsers.length} user`
                  }
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
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-linear-to-r from-brand-500 to-brand-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-100">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{allUsers.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Users size={32} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>

              <div className="bg-linear-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-warning-100">Menunggu Verifikasi</p>
                    <p className="text-3xl font-bold mt-1">{pendingUsers.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <UserSearch size={32} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>

              <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-success-100">Terverifikasi</p>
                    <p className="text-3xl font-bold mt-1">{approvedUsers.length}</p>
                  </div>
                  <Motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <UserCheck size={32} className="text-white opacity-80" />
                  </Motion.div>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex border-b border-gray-200 mb-6"
            >
              <Button unstyled
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "pending"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users size={18} />
                Verifikasi User
                {pendingUsers.length > 0 && (
                  <span className="bg-brand-100 text-brand-600 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingUsers.length}
                  </span>
                )}
              </Button>
              <Button unstyled
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCheck size={18} />
                Lihat All User
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  {allUsers.length}
                </span>
              </Button>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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
                          Cari Nama atau Email
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ui-input py-2.5 pl-10 pr-4"
                          />
                        </div>
                      </div>

                      {activeTab === "all" && (
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
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {hasActiveFilters && (
                      <Motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-brand-50 border border-brand-200 rounded-lg"
                      >
                        <p className="text-sm text-brand-800">
                          Filter aktif:
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {activeTab === "all" && statusFilter !== "all" && ` Status: ${getStatusText(statusFilter)}`}
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
                <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
              </Motion.div>
            ) : filteredUsers.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ui-state"
              >
                <Users className="ui-state-icon mx-auto" size={48} />
                <p className="ui-state-title">
                  {hasActiveFilters
                    ? "Tidak ada user yang sesuai dengan filter"
                    : activeTab === "pending"
                    ? "Tidak ada pengguna organizer yang menunggu verifikasi."
                    : "Tidak ada data pengguna organizer."
                  }
                </p>
                <p className="ui-state-description mb-4">
                  {hasActiveFilters
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua user"
                    : activeTab === "pending"
                    ? "Semua pengguna organizer telah diverifikasi"
                    : "Belum ada pengguna organizer yang terdaftar"
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
                {filteredUsers.map((user, index) => (
                  <Motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="ui-card p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {user.name || user.username}
                          </h3>
                          {getStatusBadge(user.register_status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{user.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Organisasi</p>
                            <p>{user.organization || "-"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Terdaftar</p>
                            <p>{new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(routeTo.userReview(user.user_id))}
                          variant="primary" className="min-w-30 justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Tinjau
                        </Button>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            )}

            {filteredUsers.length > 0 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredUsers.length}</span> dari{" "}
                  <span className="font-medium">
                    {activeTab === "pending" ? users.length : allUsers.length}
                  </span> user
                </div>
                {hasActiveFilters && (
                  <Button unstyled
                    onClick={clearFilters}
                    className="text-brand-600 hover:text-brand-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua User
                  </Button>
                )}
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
