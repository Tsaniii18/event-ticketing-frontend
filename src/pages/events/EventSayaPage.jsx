import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Calendar,
  Eye,
  Filter,
  Folder,
  Pencil,
  QrCode,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import { eventAPI } from "../../services";
import {
  CATEGORIES,
  EVENT_OWNER_STATUS_LABELS,
  getCategoryColor,
  getParentCategory,
  PAGE_CONTAINER_VARIANTS as containerVariants,
  PAGE_ITEM_VARIANTS as itemVariants,
  YOGYAKARTA_DISTRICTS as DISTRICTS,
} from "../../utils";

export default function EventSayaPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getMyEvents();
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching my events:", err);
      setError("Gagal memuat event saya");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (event) => getParentCategory(event.category) === categoryFilter,
      );
    }

    if (districtFilter) {
      filtered = filtered.filter(
        (event) => event.district === districtFilter,
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date_start)
          .toISOString()
          .split("T")[0];
        return eventDate === dateFilter;
      });
    }

    setFilteredEvents(filtered);
  }, [categoryFilter, dateFilter, districtFilter, events, searchTerm, statusFilter]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("");
    setDistrictFilter("");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    categoryFilter ||
    districtFilter ||
    dateFilter;

  const getStatusText = (status) => {
    return EVENT_OWNER_STATUS_LABELS[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "ui-badge-warning";
      case "rejected":
        return "ui-badge-danger";
      case "approved":
      case "active":
        return "ui-badge-success";
      case "ended":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen py-8 flex items-center justify-center pt-36">
          <Motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="ui-spinner mb-4" />
            <div className="text-lg text-gray-600">Memuat event saya...</div>
          </Motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen py-8 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-36">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-red-600 text-lg font-semibold mb-2">
              {error}
            </div>
            <Motion.button
              onClick={fetchMyEvents}
              className="ui-button ui-button-primary px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Coba Lagi
            </Motion.button>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
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
                <h1 className="ui-heading-1">Event Saya</h1>
                <p className="text-gray-600 mt-2">
                  Total: {events.length} event • Ditampilkan:{" "}
                  {filteredEvents.length} event
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
                  disabled={refreshing}
                  className="ui-button ui-button-primary disabled:opacity-50"
                  whileHover={{ scale: refreshing ? 1 : 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw
                    size={18}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Memperbarui..." : "Refresh"}
                </Motion.button>
              </div>
            </Motion.div>

            <Motion.div
              className="pb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Motion.div
                variants={itemVariants}
                className="ui-subtle-panel mb-8 p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <h3 className="ui-heading-2">Filter & Pencarian</h3>
                  <div className="flex items-center gap-3">
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
                      onClick={() => setShowFilters(!showFilters)}
                      className="ui-button ui-button-secondary font-medium"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter size={18} />
                      {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                    </Motion.button>
                  </div>
                </div>

                <Motion.div
                  className="relative mb-4"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari nama event atau lokasi..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="ui-input pl-10 pr-4"
                  />
                </Motion.div>

                <AnimatePresence>
                  {showFilters && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <Motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="ui-label mb-2">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(event) =>
                              setStatusFilter(event.target.value)
                            }
                            className="ui-input"
                          >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu Review</option>
                            <option value="approved">Diterima</option>
                            <option value="rejected">Ditolak</option>
                            <option value="ended">Selesai</option>
                          </select>
                        </Motion.div>

                        <Motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label className="ui-label mb-2">Kategori</label>
                          <select
                            value={categoryFilter}
                            onChange={(event) =>
                              setCategoryFilter(event.target.value)
                            }
                            className="ui-input"
                          >
                            <option value="">Semua Kategori</option>
                            {Object.keys(CATEGORIES).map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </Motion.div>

                        <Motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="ui-label mb-2">Lokasi</label>
                          <div className="relative">
                            <Building2
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <select
                              value={districtFilter}
                              onChange={(event) =>
                                setDistrictFilter(event.target.value)
                              }
                              className="ui-input pl-10 pr-4"
                            >
                              <option value="">Semua Kecamatan</option>
                              {DISTRICTS.map((district) => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              ))}
                            </select>
                          </div>
                        </Motion.div>

                        <Motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="ui-label mb-2">Tanggal</label>
                          <div className="relative">
                            <Calendar
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="date"
                              value={dateFilter}
                              onChange={(event) =>
                                setDateFilter(event.target.value)
                              }
                              className="ui-input pl-10 pr-4 cursor-pointer"
                            />
                          </div>
                        </Motion.div>
                      </div>

                      {hasActiveFilters && (
                        <Motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg"
                        >
                          <p className="text-sm text-brand-800">
                            Filter aktif:
                            {searchTerm && ` Pencarian: "${searchTerm}"`}
                            {statusFilter !== "all" &&
                              ` Status: ${getStatusText(statusFilter)}`}
                            {categoryFilter && ` Kategori: ${categoryFilter}`}
                            {districtFilter && ` Kecamatan: ${districtFilter}`}
                            {dateFilter &&
                              ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                          </p>
                        </Motion.div>
                      )}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>

              {filteredEvents.length === 0 ? (
                <Motion.div variants={itemVariants} className="ui-state">
                  <Folder className="ui-state-icon mx-auto" size={48} />
                  <p className="ui-state-title">
                    {hasActiveFilters
                      ? "Tidak ada event yang sesuai dengan filter"
                      : "Belum ada event yang dibuat"}
                  </p>
                  <p className="ui-state-description mb-4">
                    {hasActiveFilters
                      ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua event"
                      : "Mulai buat event pertama Anda untuk melihatnya di sini"}
                  </p>
                  {hasActiveFilters && (
                    <Motion.button
                      onClick={clearFilters}
                      className="ui-button ui-button-primary px-5 shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hapus Semua Filter
                    </Motion.button>
                  )}
                </Motion.div>
              ) : (
                <Motion.div
                  variants={itemVariants}
                  className="ui-table-shell shadow-sm"
                >
                  <table className="w-full min-w-190">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-sm font-semibold text-gray-700">
                        <th className="p-4 border-b">Event</th>
                        <th className="p-4 border-b">Lokasi & Tanggal</th>
                        <th className="p-4 border-b">Status</th>
                        <th className="p-4 border-b text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEvents.map((event, index) => (
                        <Motion.tr
                          key={event.event_id}
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {event.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Motion.span
                                  className={`${getCategoryColor(event.category)} text-white text-xs px-2 py-1 rounded-full`}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 17,
                                  }}
                                >
                                  {getParentCategory(event.category)}
                                </Motion.span>
                                {event.category !==
                                  getParentCategory(event.category) &&
                                  event.category && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {event.category}
                                    </span>
                                  )}
                                {event.child_category && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-400">
                                      {event.child_category}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {event.location}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(event.date_start).toLocaleDateString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <span
                                className={`ui-badge w-fit py-1.5 ${getStatusColor(event.status)}`}
                              >
                                {getStatusText(event.status)}
                              </span>
                              {event.approval_comment &&
                                event.status === "rejected" && (
                                  <div className="text-xs text-red-600 max-w-xs">
                                    <span className="font-medium">Alasan:</span>{" "}
                                    {event.approval_comment}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2 justify-center min-h-11 items-center">
                              <ActionButton
                                icon={Eye}
                                label="Rincian"
                                title="Lihat rincian event"
                                className="bg-brand-50 hover:bg-brand-100 text-brand-700"
                                onClick={() =>
                                  navigate(`/detailEvent/${event.event_id}`)
                                }
                              />
                              {(event.status === "pending" ||
                                event.status === "rejected") && (
                                <ActionButton
                                  icon={Pencil}
                                  label="Edit"
                                  title="Edit event"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                  onClick={() =>
                                    navigate(`/edit-event/${event.event_id}`)
                                  }
                                />
                              )}
                              {(event.status === "approved" ||
                                event.status === "ended" ||
                                event.status === "active") && (
                                <ActionButton
                                  icon={BarChart3}
                                  label="Laporan"
                                  title="Lihat laporan"
                                  className="bg-purple-50 hover:bg-purple-100 text-purple-700"
                                  onClick={() =>
                                    navigate(`/laporan/${event.event_id}`)
                                  }
                                />
                              )}
                              {(event.status === "approved" ||
                                event.status === "active") && (
                                <ActionButton
                                  icon={QrCode}
                                  label="Scan"
                                  title="Scan tiket"
                                  className="bg-gray-800 hover:bg-black text-white"
                                  onClick={() =>
                                    navigate(`/scan/${event.event_id}`)
                                  }
                                />
                              )}
                            </div>
                          </td>
                        </Motion.tr>
                      ))}
                    </tbody>
                  </table>
                </Motion.div>
              )}

              {filteredEvents.length > 0 && (
                <Motion.div
                  variants={itemVariants}
                  className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
                >
                  <div>
                    Menampilkan{" "}
                    <span className="font-medium">{filteredEvents.length}</span>{" "}
                    dari <span className="font-medium">{events.length}</span> event
                  </div>
                  {hasActiveFilters && (
                    <Motion.button
                      onClick={clearFilters}
                      className="text-brand-600 hover:text-brand-800 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Tampilkan Semua Event
                    </Motion.button>
                  )}
                </Motion.div>
              )}
            </Motion.div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, title, className, onClick }) {
  const Icon = icon;
  return (
    <Motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-25 justify-center ${className}`}
      title={title}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon size={16} />
      {label}
    </Motion.button>
  );
}
