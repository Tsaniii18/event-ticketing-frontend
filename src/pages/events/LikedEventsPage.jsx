import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Building2,
  Calendar,
  Clock,
  Filter,
  Heart,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import useSessionUser from "../../hooks/useSessionUser";
import { eventAPI } from "../../services";
import {
  EVENT_PARENT_CATEGORIES,
  filterAndSortLikedEvents,
  formatTime,
  removeItemByKey,
  transformLikedEvents,
} from "../../utils";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function LikedEventsPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();
  const [likedEvents, setLikedEvents] = useState([]);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const { isAuthenticated: isLoggedIn } = useSessionUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
    }
  }, [isLoggedIn, navigate]);

  const fetchLikedEvents = useCallback(async () => {
    try {
      startLoading();
      const response = await eventAPI.getMyLikedEvents();
      setLikedEvents(response.data?.liked_event || []);
    } catch (error) {
      console.error("Error fetching liked events:", error);
      showNotification("Gagal memuat event yang disukai", "Error", "error");
    } finally {
      stopLoading();
    }
  }, [showNotification, startLoading, stopLoading]);

  useEffect(() => {
    if (isLoggedIn) fetchLikedEvents();
  }, [fetchLikedEvents, isLoggedIn]);

  const handleUnlikeEvent = async (eventId, clickEvent) => {
    clickEvent.stopPropagation();

    try {
      await eventAPI.likeEvent(eventId);
      setLikedEvents((currentEvents) =>
        removeItemByKey(currentEvents, eventId, "event_id"),
      );
      showNotification("Event dihapus dari favorit", "Info", "info");
    } catch (error) {
      console.error("Error unliking event:", error);
      showNotification("Gagal menghapus event dari favorit", "Error", "error");
    }
  };

  const transformedEvents = useMemo(
    () => transformLikedEvents(likedEvents),
    [likedEvents],
  );

  const sortedEvents = useMemo(() => {
    return filterAndSortLikedEvents(transformedEvents, {
      category: selectedCategory,
      searchTerm,
      sortBy,
      sortOrder,
    });
  }, [searchTerm, selectedCategory, sortBy, sortOrder, transformedEvents]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("date");
    setSortOrder("desc");
    showNotification("Filter berhasil direset", "Info", "info");
  };

  const hasActiveFilters = searchTerm || selectedCategory;

  if (loading) {
    return (
      <div className="ui-page">
        <Navbar />
        <LoadingState
          variant="plain"
          className="min-h-[60vh]"
          label="Memuat event favorit Anda..."
          description="Mengumpulkan event yang telah Anda simpan"
        />
      </div>
    );
  }

  return (
    <div className="ui-page">
      <Navbar />
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="pt-24 pb-12">
        <div className="ui-container">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel mt-15 p-6 md:p-8"
          >
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Event yang Disukai
                </h1>
                <p className="text-gray-600 mt-2">
                  Kelola semua event favorit Anda di satu tempat
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(ROUTES.EVENT_SEARCH)}
                  variant="primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles size={18} className="inline mr-2" />
                  Jelajahi Event
                </Button>
                <Button
                  onClick={fetchLikedEvents}
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
              transition={{ duration: 0.6, delay: 0.3 }}
              className="ui-subtle-panel mb-8 p-6"
            >
              <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h3 className="ui-heading-2">Filter & Pencarian</h3>
                <Button unstyled
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium"
                >
                  <Filter size={18} />
                  <span>{showFilters ? "Sembunyikan" : "Tampilkan"} Filter</span>
                </Button>
              </div>

              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama event, venue, atau kategori..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="ui-input pl-10 pr-4"
                />
                {searchTerm && (
                  <Button unstyled
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showFilters && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="ui-label mb-2">Kategori</label>
                        <select
                          value={selectedCategory}
                          onChange={(event) =>
                            setSelectedCategory(event.target.value)
                          }
                          className="ui-input"
                        >
                          <option value="">Semua Kategori</option>
                          {EVENT_PARENT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="ui-label">Urutkan Berdasarkan</label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            className="ui-select flex-1"
                          >
                            <option value="date">Tanggal Event</option>
                            <option value="name">Nama Event</option>
                            <option value="likes">Jumlah Like</option>
                          </select>
                          <Button
                            onClick={() =>
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }
                            variant="muted" className="py-3"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ArrowUpDown
                              size={20}
                              className={`text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                        <p className="text-sm text-brand-800">
                          Filter aktif:
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {selectedCategory &&
                            ` Kategori: ${selectedCategory}`}
                        </p>
                      </div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>

              {hasActiveFilters && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mt-4"
                >
                  <Button unstyled
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    <X size={16} />
                    Hapus Semua Filter
                  </Button>
                </Motion.div>
              )}
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold text-gray-800">
                  {sortedEvents.length}
                </span>{" "}
                event favorit
                {selectedCategory && ` dalam kategori ${selectedCategory}`}
              </p>
            </Motion.div>

            <div className="space-y-4">
              {sortedEvents.length === 0 ? (
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Tidak Ada Event Ditemukan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters
                      ? "Tidak ada event yang sesuai dengan filter yang dipilih"
                      : "Belum ada event yang disukai"}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="primary" className="px-6 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset Filter
                    </Button>
                  )}
                </Motion.div>
              ) : (
                sortedEvents.map((event, index) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    index={index}
                    onClick={() => navigate(routeTo.eventDetail(event.event_id))}
                    onUnlike={(clickEvent) =>
                      handleUnlikeEvent(event.event_id, clickEvent)
                    }
                  />
                ))
              )}
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, index, onClick, onUnlike }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.01,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
    >
      <div className="flex flex-col md:flex-row">
        {event.image && (
          <Motion.div
            className="md:w-48 h-32 md:h-auto shrink-0 bg-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(error) => {
                error.target.style.display = "none";
              }}
            />
          </Motion.div>
        )}

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Motion.span
                  className={`${event.categoryColor} text-white text-xs px-2.5 py-1 rounded-full font-medium`}
                  whileHover={{ scale: 1.05 }}
                >
                  {event.parentCategory}
                </Motion.span>
                {event.category !== event.parentCategory && event.category && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                    {event.category}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">
                {event.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={16}
                    className="text-brand-600 shrink-0"
                  />
                  <span>{event.formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2
                    size={16}
                    className="text-red-500 shrink-0"
                  />
                  <span className="truncate">
                    {event.venue || event.location || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    size={16}
                    className="text-green-600 shrink-0"
                  />
                  <span>{formatTime(event.date_start)}</span>
                </div>
                {event.district && (
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-purple-600 shrink-0"
                    />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {event.total_likes > 0 && (
                    <span className="flex items-center gap-1.5 text-pink-500 text-sm font-medium">
                      <Heart className="w-4 h-4 fill-current" />
                      {event.total_likes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button unstyled
                    onClick={onUnlike}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 bg-pink-500 text-white hover:bg-pink-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
