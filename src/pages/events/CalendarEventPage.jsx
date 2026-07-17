import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { eventAPI } from "../../services";
import NotificationModal from "../../components/common/NotificationModal";
import useNotification from "../../hooks/useNotification";
import {
  CATEGORY_COLORS,
  DAY_NAMES as dayNames,
  DAY_NAMES_FULL as dayNamesFull,
  formatCompactNumber as formatNumber,
  formatOptionalRupiah as formatRupiah,
  formatOptionalShortDateRange as formatDateRange,
  formatShortDate as formatDate,
  getApiCategoryColor,
  getApiParentCategory,
  getEventMinimumPrice as getMinPrice,
  MONTH_NAMES as monthNames,
  YOGYAKARTA_DISTRICTS as DISTRICTS,
} from "../../utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  Building2,
  Clock,
  MapPin,
  Filter,
  X,
  Search,
  List,
  RefreshCw,
  Heart,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/routeConstants";

export default function CalendarEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();

  const [events, setEvents] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const [showMobileEventModal, setShowMobileEventModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error("Error parsing token:", error);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!isLoggedIn || userRole !== "user") return;
      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = new Set(
          (response.data?.liked_event || []).map((e) => e.event_id)
        );
        setLikedEvents(likedEventIds);
      } catch (err) {
        console.error("Error fetching liked events:", err);
      }
    };
    fetchLikedEvents();
  }, [isLoggedIn, userRole]);

  const fetchEventCategories = async () => {
    try {
      const response = await eventAPI.getEventCategories();
      const categoriesData = response.data.event_category || [];
      setEventCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching event categories:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsResponse, categoriesResponse] = await Promise.all([
          eventAPI.getApprovedEvents(),
          eventAPI.getEventCategories()
        ]);

        let eventsData = eventsResponse.data || [];
        const categoriesData = categoriesResponse.data.event_category || [];

        setEvents(eventsData);
        setEventCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("Gagal memuat data event", "Error", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const handleLikeEvent = async (eventId, e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (userRole !== "user") {
      return;
    }

    const isCurrentlyLiked = likedEvents.has(eventId);

    try {
      await eventAPI.likeEvent(eventId);

      setLikedEvents((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

      setEvents((prev) =>
        prev.map((event) => {
          if (event.event_id === eventId) {
            return {
              ...event,
              total_likes: isCurrentlyLiked
                ? Math.max(0, (event.total_likes || 1) - 1)
                : (event.total_likes || 0) + 1,
            };
          }
          return event;
        })
      );
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  const getParentCategory = useCallback(
    (category) => getApiParentCategory(category, eventCategories),
    [eventCategories],
  );

  const getCategoryColor = useCallback(
    (category, status) =>
      getApiCategoryColor(category, eventCategories, status),
    [eventCategories],
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase());

      const eventParentCategory = getParentCategory(event.category);
      const matchesCategory =
        !categoryFilter || eventParentCategory === categoryFilter;

      const matchesDistrict =
        !districtFilter || event.district === districtFilter;

      const matchesStatus =
        !statusFilter || event.status === statusFilter;

      return matchesSearch && matchesCategory && matchesDistrict && matchesStatus;
    });
  }, [events, searchTerm, categoryFilter, districtFilter, getParentCategory, statusFilter]);

  const getEventsForDate = (date) => {
    if (!date) return [];

    return filteredEvents.filter((event) => {
      if (!event.date_start) return false;

      const eventStart = new Date(event.date_start);
      const eventEnd = event.date_end ? new Date(event.date_end) : eventStart;
      const checkDate = new Date(date);

      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  const getEventsForMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return filteredEvents
      .filter((event) => {
        if (!event.date_start) return false;

        const eventStart = new Date(event.date_start);
        const eventEnd = event.date_end ? new Date(event.date_end) : eventStart;

        return (
          (eventStart >= monthStart && eventStart <= monthEnd) ||
          (eventEnd >= monthStart && eventEnd <= monthEnd) ||
          (eventStart < monthStart && eventEnd > monthEnd)
        );
      })
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  }, [filteredEvents, currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (dayInfo) => {
    setSelectedDate(dayInfo.date);
    if (window.innerWidth < 768 && getEventsForDate(dayInfo.date).length > 0) {
      setShowMobileEventModal(true);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(routeTo.eventDetail(eventId));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDistrictFilter("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchTerm || categoryFilter || districtFilter || statusFilter;

  const parentCategoriesForLegend = useMemo(() => {
    return eventCategories.map(category => category.event_category_name);
  }, [eventCategories]);

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

      <MobileEventModal
        isOpen={showMobileEventModal}
        onClose={() => setShowMobileEventModal(false)}
        selectedDate={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        formatDate={formatDate}
        formatDateRange={formatDateRange}
        formatRupiah={formatRupiah}
        getMinPrice={getMinPrice}
        getCategoryColor={getCategoryColor}
        getParentCategory={getParentCategory}
        onEventClick={handleEventClick}
        likedEvents={likedEvents}
        onLike={handleLikeEvent}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        dayNamesFull={dayNamesFull}
        formatNumber={formatNumber}
      />

      <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-28 sm:mt-32">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="ui-panel p-4 sm:p-6 md:p-8"
          >
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-4 mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600" />
                    Kalender Event
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                    Temukan event menarik berdasarkan tanggal
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button unstyled
                      onClick={() => setViewMode("calendar")}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all font-medium text-sm sm:text-base ${
                        viewMode === "calendar"
                          ? "bg-brand-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Calendar size={16} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Kalender</span>
                    </Button>
                    <Button unstyled
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all font-medium text-sm sm:text-base ${
                        viewMode === "list"
                          ? "bg-brand-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <List size={16} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Daftar</span>
                    </Button>
                  </div>

                  {hasActiveFilters && (
                    <Button unstyled
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      <X size={14} />
                      <span className="hidden sm:inline">Hapus Filter</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      eventAPI.getApprovedEvents().then((response) => setEvents(response.data || []));
                      fetchEventCategories();
                    }}
                    variant="primary" className="px-3 py-1.5 sm:px-4 sm:py-2.5 sm:text-base"
                  >
                    <RefreshCw
                      size={16}
                      className={`sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex flex-row justify-between items-center gap-3 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-xl font-semibold text-gray-800">
                  Filter & Pencarian
                </h3>

                <Button unstyled
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 sm:gap-2 text-brand-600 hover:text-brand-800 font-medium text-sm sm:text-base"
                >
                  <Filter size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {showFilters ? "Sembunyikan" : "Tampilkan"} Filter
                  </span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </div>

              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Cari nama event atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ui-input py-2.5 pl-9 pr-4 text-sm sm:py-3 sm:pl-10 sm:text-base"
                />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Kategori
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="ui-select px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base"
                        >
                          <option value="">Semua Kategori</option>
                          {eventCategories.map((category) => (
                            <option key={category.event_category_id} value={category.event_category_name}>
                              {category.event_category_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Lokasi
                        </label>
                        <div className="relative">
                          <Building2
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="ui-input py-2.5 pl-9 pr-4 text-sm sm:py-3 sm:pl-10 sm:text-base"
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

                      <div className="flex items-end sm:col-span-2 lg:col-span-1">
                        <Button
                          onClick={goToToday}
                          variant="muted" className="w-full sm:py-3 sm:text-base"
                        >
                          <Calendar size={16} className="sm:w-4 sm:h-4" />
                          Ke Hari Ini
                        </Button>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-brand-50 border border-brand-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-brand-800">
                          Filter aktif:
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {categoryFilter && ` Kategori: ${categoryFilter}`}
                          {districtFilter && ` Kecamatan: ${districtFilter}`}
                        </p>
                      </div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  Memuat data event...
                </p>
              </div>
            ) : viewMode === "calendar" ? (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <Button unstyled
                    onClick={goToPreviousMonth}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-sm">Sebelumnya</span>
                  </Button>

                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h2>

                  <Button unstyled
                    onClick={goToNextMonth}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline text-sm">Selanjutnya</span>
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-7 bg-brand-600 text-white">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, index) => {
                      const dayEvents = getEventsForDate(dayInfo.date);
                      const hasEvents = dayEvents.length > 0;

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(dayInfo)}
                          className={`min-h-15 sm:min-h-20 md:min-h-25 lg:min-h-30 p-1 sm:p-2 border-b border-r border-gray-200 cursor-pointer transition-all ${
                            !dayInfo.isCurrentMonth
                              ? "bg-gray-50 opacity-60"
                              : "bg-white hover:bg-brand-50"
                          } ${
                            isSelected(dayInfo.date)
                              ? "ring-2 ring-brand-500 ring-inset bg-brand-50"
                              : ""
                          } ${hasEvents ? "hover:shadow-inner" : ""}`}
                        >
                          <div className="flex justify-start mb-0.5 sm:mb-1">
                            <span
                              className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center ${
                                !dayInfo.isCurrentMonth
                                  ? "text-gray-400"
                                  : isToday(dayInfo.date)
                                  ? "bg-brand-600 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full"
                                  : "text-gray-900"
                              }`}
                            >
                              {dayInfo.day}
                            </span>
                          </div>

                          <div className="hidden sm:block space-y-0.5 sm:space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.event_id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event.event_id);
                                }}
                                className={`${getCategoryColor(
                                  event.category,
                                  event.status
                                )} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                              >
                                {event.status === "ended" ? `${event.name} (Berakhir)` : event.name}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] sm:text-xs text-brand-600 font-medium">
                                +{dayEvents.length - 2} lainnya
                              </div>
                            )}
                          </div>

                          <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.event_id}
                                className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(
                                  event.category,
                                  event.status
                                )}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] text-gray-500">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <Motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="hidden md:block mt-6 sm:mt-8"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                        Event pada {formatDate(selectedDate.toISOString())}
                      </h3>

                      {getEventsForDate(selectedDate).length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm sm:text-base">
                            Tidak ada event pada tanggal ini
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getEventsForDate(selectedDate).map((event, index) => (
                            <Motion.div
                              key={event.event_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                            >
                              <EventCard
                                event={event}
                                onClick={() => handleEventClick(event.event_id)}
                                formatDateRange={formatDateRange}
                                formatRupiah={formatRupiah}
                                getMinPrice={getMinPrice}
                                getCategoryColor={getCategoryColor}
                                getParentCategory={getParentCategory}
                                isLiked={likedEvents.has(event.event_id)}
                                onLike={(e) => handleLikeEvent(event.event_id, e)}
                                isLoggedIn={isLoggedIn}
                                userRole={userRole}
                                formatNumber={formatNumber}
                              />
                            </Motion.div>
                          ))}
                        </div>
                      )}
                    </Motion.div>
                  )}
                </AnimatePresence>

                <p className="md:hidden text-center text-xs text-gray-500 mt-4">
                  Ketuk tanggal untuk melihat detail event
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <Button unstyled
                    onClick={goToPreviousMonth}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-sm">Sebelumnya</span>
                  </Button>

                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h2>

                  <Button unstyled
                    onClick={goToNextMonth}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline text-sm">Selanjutnya</span>
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </Button>
                </div>

                {getEventsForMonth.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg mb-2">
                      Tidak ada event di bulan ini
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Coba pilih bulan lain atau ubah filter pencarian
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {getEventsForMonth.map((event, index) => (
                      <Motion.div
                        key={event.event_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <EventCard
                          event={event}
                          onClick={() => handleEventClick(event.event_id)}
                          formatDateRange={formatDateRange}
                          formatRupiah={formatRupiah}
                          getMinPrice={getMinPrice}
                          getCategoryColor={getCategoryColor}
                          getParentCategory={getParentCategory}
                          isLiked={likedEvents.has(event.event_id)}
                          onLike={(e) => handleLikeEvent(event.event_id, e)}
                          isLoggedIn={isLoggedIn}
                          userRole={userRole}
                          showFullDate
                          formatNumber={formatNumber}
                        />
                      </Motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Legenda Kategori:
              </h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {parentCategoriesForLegend.slice(0, 8).map((category) => (
                  <Button unstyled
                    key={category}
                    onClick={() =>
                      setCategoryFilter(
                        categoryFilter === category ? "" : category
                      )
                    }
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                      categoryFilter === category
                        ? "bg-brand-100 text-brand-700 ring-1 ring-brand-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${CATEGORY_COLORS[category] || CATEGORY_COLORS["Lainnya"]}`}
                    />
                    <span className="truncate max-w-20 sm:max-w-none">
                      {category}
                    </span>
                  </Button>
                ))}
                <Button unstyled
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "ended" ? "" : "ended"
                    )
                  }
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                    statusFilter === "ended"
                      ? "bg-gray-300 text-gray-800 ring-1 ring-gray-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400" />
                  <span>Berakhir</span>
                </Button>
                {parentCategoriesForLegend.length > 8 && (
                  <Button unstyled
                    onClick={() => setShowFilters(true)}
                    className="text-xs sm:text-sm text-brand-600 hover:text-brand-800 font-medium"
                  >
                    +{parentCategoriesForLegend.length - 8} lainnya
                  </Button>
                )}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}

function MobileEventModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  formatDate,
  formatRupiah,
  getMinPrice,
  getCategoryColor,
  getParentCategory,
  onEventClick,
  likedEvents,
  onLike,
  userRole,
  dayNamesFull,
  formatNumber,
}) {
  if (!isOpen || !selectedDate) return null;

  const dayName = dayNamesFull[selectedDate.getDay()];

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:hidden"
          onClick={onClose}
        >
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-h-[85vh] rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {dayName}, {formatDate(selectedDate.toISOString())}
                </h3>
                <p className="text-sm text-gray-500">
                  {events.length} event ditemukan
                </p>
              </div>
              <Button unstyled
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-4">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Tidak ada event pada tanggal ini
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <MobileEventCard
                      key={event.event_id}
                      event={event}
                      onClick={() => {
                        onClose();
                        onEventClick(event.event_id);
                      }}
                      formatRupiah={formatRupiah}
                      getMinPrice={getMinPrice}
                      getCategoryColor={getCategoryColor}
                      getParentCategory={getParentCategory}
                      isLiked={likedEvents.has(event.event_id)}
                      onLike={(e) => onLike(event.event_id, e)}
                      userRole={userRole}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              )}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileEventCard({
  event,
  onClick,
  formatRupiah,
  getMinPrice,
  getCategoryColor,
  getParentCategory,
  isLiked,
  onLike,
  userRole,
  formatNumber,
}) {
  const parentCategory = getParentCategory(event.category);
  const canLike = userRole === "user";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-3transition-colors"
    >
      <div className="flex gap-3">
        {event.image && (
          <div className="w-20 h-20 aspect-square rounded-lg overflow-hidden shrink-0 bg-gray-100">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`${getCategoryColor(
                  event.category,
                  event.status
                )} text-white text-[10px] px-2 py-0.5 rounded-full`}
              >
                {event.status === "ended" ? "Berakhir" : parentCategory}
              </span>
            </div>
            <Button unstyled
              onClick={onLike}
              disabled={!canLike}
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isLiked
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600"
              } ${!canLike ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>

          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {event.name}
          </h4>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{event.venue || event.location || "-"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`font-bold text-sm ${
                getMinPrice(event) === 0 ? "text-green-600" : "text-brand-600"
              }`}
            >
              {getMinPrice(event) === 0 ? "GRATIS" : formatRupiah(getMinPrice(event))}
            </span>
            <div className="flex items-center gap-2">
              {event.total_likes > 0 && (
                <span className="flex items-center gap-0.5 text-pink-500 text-[10px]">
                  <Heart className="w-2.5 h-2.5 fill-current" />
                  <span className="font-medium">{formatNumber(event.total_likes)}</span>
                </span>
              )}
              <ArrowRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  onClick,
  formatDateRange,
  formatRupiah,
  getMinPrice,
  getCategoryColor,
  getParentCategory,
  isLiked,
  onLike,
  userRole,
  formatNumber,
}) {
  const parentCategory = getParentCategory(event.category);
  const canLike = userRole === "user";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden active:scale-[0.99]"
    >
      <div className="sm:hidden">
        <div className="flex gap-3 p-3">
          {event.image ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/96?text=Event";
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg shrink-0 bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-brand-400" />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span
                  className={`${getCategoryColor(event.category, event.status)} text-white text-[10px] px-2 py-0.5 rounded-full inline-block`}
                >
                  {event.status === "ended" ? "Berakhir" : parentCategory}
                </span>
                <Button unstyled
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(e);
                  }}
                  disabled={!canLike}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isLiked
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  } ${!canLike ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                </Button>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1.5">
                {event.name}
              </h3>

              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-brand-500" />
                  {event.date_start
                    ? new Date(event.date_start).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} className="text-red-500 shrink-0" />
                  <span className="truncate">{event.venue || event.district || "-"}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <span
                  className={`text-sm font-bold ${
                    getMinPrice(event) === 0 ? "text-green-600" : "text-brand-600"
                  }`}
                >
                  {getMinPrice(event) === 0 ? "GRATIS" : formatRupiah(getMinPrice(event))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {event.total_likes > 0 && (
                  <span className="flex items-center gap-0.5 text-pink-500 text-[10px]">
                    <Heart className="w-3 h-3 fill-current" />
                    <span className="font-medium">{formatNumber(event.total_likes)}</span>
                  </span>
                )}
                {event.total_tickets_sold > 0 && (
                  <span className="flex items-center gap-0.5 text-emerald-600 text-[10px]">
                    <ShoppingBag className="w-2.5 h-2.5" />
                    <span className="font-medium">{formatNumber(event.total_tickets_sold)}</span>
                  </span>
                )}
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex">
        {event.image && (
          <div className="w-40 md:w-48 lg:w-56 shrink-0 bg-gray-100">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`${getCategoryColor(event.category, event.status)} text-white text-xs px-2.5 py-1 rounded-full`}
                >
                  {event.status === "ended" ? "Berakhir" : parentCategory}
                </span>
                {event.status !== "ended" && event.category !== parentCategory && event.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                )}
                {event.status !== "ended" && event.child_category && (
                  <span className="text-xs text-gray-400">
                    • {event.child_category}
                  </span>
                )}
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 line-clamp-2">
                {event.name}
              </h3>
            </div>
            <Button unstyled
              onClick={(e) => {
                e.stopPropagation();
                onLike(e);
              }}
              disabled={!canLike}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isLiked
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-500"
              } ${!canLike ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-600 shrink-0" />
              <span className="truncate">{formatDateRange(event.date_start, event.date_end)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-red-500 shrink-0" />
              <span className="truncate">
                {event.venue || event.location || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-600 shrink-0" />
              <span>
                {event.date_start
                  ? new Date(event.date_start).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
            </div>
            {event.district && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-600 shrink-0" />
                <span className="truncate">{event.district}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-500">Mulai dari</span>
              <p className="text-lg font-bold text-brand-600">
                {getMinPrice(event) === 0
                  ? "GRATIS"
                  : formatRupiah(getMinPrice(event))}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {event.total_likes > 0 && (
                <span className="flex items-center gap-1 text-pink-500 text-sm">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="font-medium">{formatNumber(event.total_likes)}</span>
                </span>
              )}
              {event.total_tickets_sold > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(event.total_tickets_sold)}</span>
                </span>
              )}
              <Button
                variant="primary" className="py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
