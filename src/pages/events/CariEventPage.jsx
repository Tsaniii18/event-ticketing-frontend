import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { eventAPI } from "../../services";
import useSessionUser from "../../hooks/useSessionUser";
import {
  EVENT_PARENT_CATEGORIES,
  EVENTS_PER_PAGE as ITEMS_PER_PAGE,
  filterEventSearchResults,
  formatCompactNumber as formatNumber,
  formatRupiah,
  formatShortDateRange as formatDate,
  getCategoryColor,
  getPaginationItems,
  getParentCategory,
  paginateItems,
  getEventStatusLabel as getStatusLabel,
  getEventTimeLabel as getTimeLabel,
  getLowestTicketPrice as getLowestPrice,
  getLikedEventIds,
  toggleSetValue,
  updateEventLikeCount,
  YOGYAKARTA_DISTRICTS as DISTRICTS,
} from "../../utils";
import { Search, Filter, Calendar, MapPin, X, RefreshCw, Heart, ChevronLeft, ChevronRight, ShoppingBag, Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/constants/routeConstants";
import useLoading from "../../hooks/useLoading";
import LoadingState from "../../components/common/LoadingState";

export default function CariEvent() {
  const navigate = useNavigate();
  const { searchQuery } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const {
    isLoading: loading,
    startLoading,
    stopLoading,
  } = useLoading(true);
  const [showFilters, setShowFilters] = useState(false);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const { user: sessionUser, isAuthenticated: isLoggedIn } = useSessionUser();
  const userRole = sessionUser?.role || null;
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    keyword: searchQuery || searchParams.get('keyword') || "",
    date: searchParams.get('date') || "",
    category: searchParams.get('category') || "",
    district: searchParams.get('district') || ""
  });

  const initialSort = searchParams.get('sort') || "popularitas";
  const [sortBy, setSortBy] = useState(initialSort);
  const [statusFilter, setStatusFilter] = useState("");


  const canLike = useMemo(() => {
    return isLoggedIn && userRole === "user";
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await eventAPI.getMyLikedEvents();
        setLikedEvents(getLikedEventIds(response.data?.liked_event));
      } catch (err) {
        console.error("Error fetching liked events:", err);
      }
    };
    fetchLikedEvents();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        startLoading();
        const response = await eventAPI.getApprovedEvents();
        const eventsData = response.data || [];

        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (searchQuery && searchQuery !== filters.keyword) {
      setFilters(prev => ({ ...prev, keyword: searchQuery }));
    }
  }, [searchQuery, filters.keyword]);

  useEffect(() => {
    setFilteredEvents(
      filterEventSearchResults(events, {
        ...filters,
        sortBy,
        status: statusFilter,
      }),
    );
    setCurrentPage(1);
  }, [filters, events, sortBy, statusFilter]);

  const handleLikeEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate(ROUTES.LOGIN); return; }

    if (userRole !== "user") return;

    const isCurrentlyLiked = likedEvents.has(eventId);

    try {
      await eventAPI.likeEvent(eventId);
      setLikedEvents((currentEvents) =>
        toggleSetValue(currentEvents, eventId),
      );
      setEvents((currentEvents) =>
        updateEventLikeCount(currentEvents, eventId, isCurrentlyLiked),
      );
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (value) => {
    if (value === "terdekat" && statusFilter === "ended") {
      setStatusFilter("");
    }
    setSortBy(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
  };

  const handleStatusFilterChange = (status) => {
    if (status === "ended" && sortBy === "terdekat") {
      setSortBy("popularitas");
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sort', 'popularitas');
      setSearchParams(newParams);
    }
    setStatusFilter(status);
  };

  const handleCardClick = (id) => navigate(routeTo.eventDetail(id));

  const clearFilters = () => {
    setFilters({ keyword: "", date: "", category: "", district: "" });
    setSortBy("popularitas");
    setStatusFilter("");
    navigate(ROUTES.EVENT_SEARCH);
  };

  const handleRefresh = () => window.location.reload();

  const hasActiveFilters = filters.keyword || filters.date || filters.category || filters.district || statusFilter;

  const {
    endItem,
    items: paginatedEvents,
    startItem,
    totalPages,
  } = paginateItems(filteredEvents, currentPage, ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEndedFilterDisabled = sortBy === "terdekat";

  return (
    <div className="ui-page">
      <Navbar />

      <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-20 sm:mt-32">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="ui-panel p-4 sm:p-6 md:p-8"
          >

            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cari Event</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Total: {events.length} • Ditampilkan: {filteredEvents.length}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {hasActiveFilters && (
                    <Button unstyled
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1.5"
                    >
                      <X size={14} />
                      <span className="hidden xs:inline">Hapus Filter</span>
                      <span className="xs:hidden">Reset</span>
                    </Button>
                  )}

                  <Button
                    onClick={handleRefresh}
                    variant="primary" className="px-3 py-2 sm:rounded-xl sm:px-4 sm:py-2.5"
                  >
                    <RefreshCw size={16} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-2">Filter berdasarkan status event:</p>

            <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
              <Button unstyled
                onClick={() => handleStatusFilterChange("")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  statusFilter === ''
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </Button>
              <Button unstyled
                onClick={() => handleStatusFilterChange("approved")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  statusFilter === 'approved'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={16} />
                Segera Hadir
              </Button>
              <Button unstyled
                onClick={() => handleStatusFilterChange("active")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle size={16} />
                Sedang Berlangsung
              </Button>
              <Button unstyled
                onClick={() => handleStatusFilterChange("ended")}
                disabled={isEndedFilterDisabled}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  statusFilter === 'ended'
                    ? 'bg-gray-500 text-white shadow-md'
                    : isEndedFilterDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <XCircle size={16} />
                Berakhir
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-2">Urutkan berdasar:</p>

            <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
              <Button unstyled
                onClick={() => handleSortChange('popularitas')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  sortBy === 'popularitas'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={16} className={sortBy === 'popularitas' ? 'fill-current' : ''} />
                Popularitas
              </Button>
              <Button unstyled
                onClick={() => handleSortChange('terlaris')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  sortBy === 'terlaris'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingBag size={16} />
                Terlaris
              </Button>
              <Button unstyled
                onClick={() => handleSortChange('terdekat')}
                disabled={statusFilter === "ended"}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                  statusFilter === "ended"
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                    : sortBy === 'terdekat'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={16} />
                Waktu Terdekat
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex justify-between items-center gap-3 mb-4">
                <h3 className="text-base sm:text-xl font-semibold text-gray-800">Filter & Pencarian</h3>

                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary" className="px-3 py-2 sm:px-4 sm:py-2.5"
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">{showFilters ? "Sembunyikan" : "Tampilkan"}</span>
                  <span className="sm:hidden">{showFilters ? "Tutup" : "Filter"}</span>
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-3 sm:space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Cari Nama Event
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Cari event..."
                            value={filters.keyword}
                            onChange={(e) => handleFilterChange('keyword', e.target.value)}
                            className="ui-input py-2 pl-9 pr-3 text-sm sm:py-2.5 sm:pl-10 sm:pr-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Filter Tanggal
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="ui-input py-2 pl-9 pr-3 text-sm sm:py-2.5 sm:pl-10 sm:pr-4"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Kategori
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="ui-select px-3 py-2 text-sm sm:px-4 sm:py-2.5"
                        >
                          <option value="">Semua Kategori</option>
                          {EVENT_PARENT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Kecamatan
                        </label>
                        <select
                          value={filters.district}
                          onChange={(e) => handleFilterChange('district', e.target.value)}
                          className="ui-select px-3 py-2 text-sm sm:px-4 sm:py-2.5"
                        >
                          <option value="">Semua Kecamatan</option>
                          {DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            {loading ? (
              <LoadingState
                variant="compact"
                className="py-16 sm:py-20"
                label="Memuat event..."
                description="Mencari event yang sesuai dengan filter Anda"
              />
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="max-w-md mx-auto px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Tidak ada event ditemukan</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
                  <Button
                    onClick={clearFilters}
                    variant="primary" className="px-4 py-2 sm:px-6 sm:text-base"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {paginatedEvents.map((event, index) => (
                    <Motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
                    >
                      <EventCard
                        event={event}
                        onClick={() => handleCardClick(event.event_id)}
                        formatRupiah={formatRupiah}
                        formatDate={formatDate}
                        formatNumber={formatNumber}
                        getLowestPrice={getLowestPrice}
                        getCategoryColor={getCategoryColor}
                        getParentCategory={getParentCategory}
                        getStatusLabel={getStatusLabel}
                        getTimeLabel={getTimeLabel}
                        isLiked={likedEvents.has(event.event_id)}
                        onLike={(e) => handleLikeEvent(event.event_id, e)}
                        isLoggedIn={isLoggedIn}
                        sortBy={sortBy}
                        canLike={canLike}
                        statusFilter={statusFilter}
                      />
                    </Motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                      {startItem}-{endItem} dari {filteredEvents.length}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                      <Button unstyled
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Prev</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {getPaginationItems(currentPage, totalPages).map((page, idx) => (
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-gray-400 text-sm">...</span>
                          ) : (
                            <Button unstyled
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-sm ${
                                currentPage === page
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </Button>
                          )
                        ))}
                      </div>

                      <Button unstyled
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event, onClick, formatRupiah, formatDate, formatNumber, getLowestPrice,
  getCategoryColor, getParentCategory, getStatusLabel, getTimeLabel, isLiked, onLike,
  sortBy, canLike, statusFilter
}) {
  const minPrice = getLowestPrice(event.ticket_categories);
  const parentCategory = getParentCategory(event.category);
  const isEnded = event.status === "ended";
  const statusLabel = getStatusLabel(event.status);
  const timeLabel = getTimeLabel(event.date_start, event.status);

  const showTimeLabel = sortBy === "terdekat" && timeLabel;
  const showStatusLabel = !showTimeLabel && statusLabel &&
    (statusFilter === "" || statusFilter === event.status);

  return (
    <Motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 shrink-0">
        <img
          src={event.image || "https://axistechindia.com/images/image%20not%20available.jpg"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://axistechindia.com/images/image%20not%20available.jpg";
          }}
        />

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className={`${getCategoryColor(event.category, event.status)} text-white text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium`}>
            {isEnded ? "Berakhir" : parentCategory}
          </span>
        </div>

        <Button unstyled
          onClick={onLike}
          disabled={!canLike}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
            !canLike
              ? 'bg-white/90 text-gray-400 cursor-not-allowed'
              : isLiked
              ? 'bg-pink-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {showTimeLabel && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <span className={`${timeLabel.color} text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium`}>
              {timeLabel.text}
            </span>
          </div>
        )}

        {showStatusLabel && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <span className={`${statusLabel.bgColor} text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium`}>
              {statusLabel.text}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <div className="min-h-12 sm:min-h-14 mb-1.5 sm:mb-2 flex items-start">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight">
            {event.name}
          </h3>
        </div>

        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-1.5 text-gray-700 text-[10px] sm:text-xs">
            <Calendar size={10} className="shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{formatDate(event.date_start, event.date_end)}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-gray-700 text-[10px] sm:text-xs">
            <MapPin size={10} className="shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{event.venue || event.district || event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-xs text-gray-400">Mulai dari</p>
            <p className={`font-bold text-xs sm:text-md ${minPrice === 0 ? 'text-emerald-600' : 'text-brand-600'} truncate`}>
              {formatRupiah(minPrice)}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1">
            {sortBy === 'terlaris' && event.total_tickets_sold > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-emerald-600 text-[10px] sm:text-xs">
                <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="font-medium">{formatNumber(event.total_tickets_sold)}</span>
              </div>
            )}
            {sortBy === 'popularitas' && event.total_likes > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-pink-500 text-[10px] sm:text-xs">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span className="font-medium">{formatNumber(event.total_likes)}</span>
              </div>
            )}
            <div className="w-5 h-5 sm:w-7 sm:h-7 bg-brand-50 rounded-full flex items-center justify-center group-hover:bg-brand-600 transition-colors">
              <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
