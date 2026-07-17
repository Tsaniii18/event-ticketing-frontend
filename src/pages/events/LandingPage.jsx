import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Ticket,
  Heart,
  ArrowRight,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { eventAPI } from "../../services";
import useSessionUser from "../../hooks/useSessionUser";
import {
  CATEGORY_DATA,
  formatCompactNumber as formatNumber,
  formatOptionalShortDateRange as formatEventDate,
  formatRupiah,
  getCategoryData,
  getLowestTicketPrice as getLowestPrice,
  getParentCategory,
  SCROLLBAR_HIDE_STYLE as scrollbarHideStyle,
} from "../../utils";
import Button from "../../components/common/Button";
import { ROUTES, routeTo } from "../../utils/routeConstants";

export default function LandingPage() {
  const navigate = useNavigate();
  const [bestSellingEvents, setBestSellingEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const { user: sessionUser, isAuthenticated: isLoggedIn } = useSessionUser();
  const userRole = sessionUser?.role || null;

  const [currentBanner, setCurrentBanner] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const bestSellingSliderRef = useRef(null);
  const popularSliderRef = useRef(null);
  const upcomingSliderRef = useRef(null);
  const [canScrollLeftBestSelling, setCanScrollLeftBestSelling] = useState(false);
  const [canScrollRightBestSelling, setCanScrollRightBestSelling] = useState(true);
  const [canScrollLeftPopular, setCanScrollLeftPopular] = useState(false);
  const [canScrollRightPopular, setCanScrollRightPopular] = useState(true);
  const [canScrollLeftUpcoming, setCanScrollLeftUpcoming] = useState(false);
  const [canScrollRightUpcoming, setCanScrollRightUpcoming] = useState(true);

  const checkScrollPosition = useCallback((ref, setCanScrollLeft, setCanScrollRight) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const handleSliderScroll = useCallback((ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    checkScrollPosition(bestSellingSliderRef, setCanScrollLeftBestSelling, setCanScrollRightBestSelling);
    checkScrollPosition(popularSliderRef, setCanScrollLeftPopular, setCanScrollRightPopular);
    checkScrollPosition(upcomingSliderRef, setCanScrollLeftUpcoming, setCanScrollRightUpcoming);
  }, [bestSellingEvents, popularEvents, upcomingEvents, checkScrollPosition]);

  const canLike = useMemo(() => {
    return isLoggedIn && userRole === "user";
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!canLike) return;
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
  }, [canLike]);

  const transformEvent = useCallback((event) => ({
    id: event.event_id || event.id,
    name: event.name,
    date: formatEventDate(event.date_start, event.date_end),
    dateStart: event.date_start,
    dateEnd: event.date_end,
    price: getLowestPrice(event.ticket_categories),
    poster: event.image,
    banner: event.flyer || event.image,
    category: event.category,
    location: event.venue || event.location,
    district: event.district,
    totalLikes: event.total_likes || 0,
    totalTicketsSold: event.total_tickets_sold || 0,
    originalData: event,
  }), []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const approvedResponse = await eventAPI.getApprovedEvents();
        const allEvents = approvedResponse.data || [];

        const filteredByStatus = allEvents.filter(
          (event) => event.status === "approved" || event.status === "active"
        );

        const transformedEvents = filteredByStatus.map(transformEvent);

        const bestSelling = [...transformedEvents]
          .filter((e) => e.totalTicketsSold >= 0)
          .sort((a, b) => b.totalTicketsSold - a.totalTicketsSold)
          .slice(0, 6);
        setBestSellingEvents(bestSelling);

        const popularResponse = await eventAPI.getEventsPopular();
        let popularEventsData = popularResponse.data?.events || [];

        if (popularEventsData.length === 0) {
          popularEventsData = [...transformedEvents]
            .filter((e) => e.totalLikes >= 0)
            .sort((a, b) => b.totalLikes - a.totalLikes)
            .slice(0, 6);
          setPopularEvents(popularEventsData);
        } else {
          const filteredPopular = popularEventsData
            .filter((event) => event.status === "approved" || event.status === "active")
            .map(transformEvent)
            .filter((e) => e.totalLikes >= 0)
            .slice(0, 6);
          setPopularEvents(filteredPopular);
        }

        const now = new Date();
        const upcoming = transformedEvents
          .filter((e) => e.dateStart && new Date(e.dateStart) >= now)
          .sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart))
          .slice(0, 6);
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Gagal memuat data event. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [transformEvent]);

  const handleLikeEvent = async (eventId, e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const userData = sessionStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    if (user.role !== "user") {
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

      const updateLikes = (events) =>
        events.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              totalLikes: isCurrentlyLiked
                ? Math.max(0, (event.totalLikes || 1) - 1)
                : (event.totalLikes || 0) + 1,
            };
          }
          return event;
        });

      setBestSellingEvents(updateLikes);
      setPopularEvents(updateLikes);
      setUpcomingEvents(updateLikes);
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  const bannerEvents = useMemo(
    () => bestSellingEvents.filter((e) => e.banner).slice(0, 5),
    [bestSellingEvents]
  );

  const handleNext = useCallback(() => {
    if (bannerEvents.length === 0) return;
    setIsAnimating(true);
    setCurrentBanner((prev) => (prev + 1) % bannerEvents.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [bannerEvents.length]);

  useEffect(() => {
    if (bannerEvents.length <= 1) return;
    const timer = setInterval(() => {
      if (!isDragging && !isAnimating) {
        handleNext();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner, handleNext, isDragging, isAnimating, bannerEvents.length]);

  const handlePrev = useCallback(() => {
    if (bannerEvents.length === 0) return;
    setIsAnimating(true);
    setCurrentBanner(
      (prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length
    );
    setTimeout(() => setIsAnimating(false), 600);
  }, [bannerEvents.length]);

  const handleDragStart = () => setIsDragging(true);
  const handleDrag = (_event, info) => setDragX(info.offset.x);
  const handleDragEnd = (_event, info) => {
    setIsDragging(false);
    setDragX(0);
    const threshold = 100;
    setTimeout(() => {
      if (info.offset.x < -threshold) handleNext();
      else if (info.offset.x > threshold) handlePrev();
      else {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);
      }
    }, 50);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBannerClick = (eventId) => {
    if (!isDragging && Math.abs(dragX) < 10 && !isAnimating) {
      navigate(routeTo.eventDetail(eventId));
    }
  };

  const handleCategoryClick = (category) => {
    navigate(routeTo.eventSearch({ category: category }));
  };

  const availableCategories = useMemo(() => {
    const cats = new Set();
    bestSellingEvents.forEach((event) => {
      const parent = getParentCategory(event.category);
      if (parent !== "Lainnya") cats.add(parent);
    });
    return Array.from(cats).slice(0, 8);
  }, [bestSellingEvents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Memuat event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 mt-20">
      <style>{scrollbarHideStyle}</style>
      <Navbar />
      <section className="pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {bannerEvents.length > 0 && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/30 bg-gray-900"
              style={{ aspectRatio: "16/6" }}
              onMouseEnter={() => setShowArrows(true)}
              onMouseLeave={() => setShowArrows(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Motion.div
                className="relative w-full h-full active:cursor-grab"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x: dragX }}
              >
                {bannerEvents.map((event, index) => (
                  <Motion.div
                    key={event.id}
                    className={`absolute inset-0 ${
                      index === currentBanner ? "z-10" : "z-0"
                    }`}
                    animate={{ x: `${(index - currentBanner) * 100}%` }}
                    transition={
                      isDragging
                        ? { type: "tween", duration: 0.1 }
                        : {
                            type: "tween",
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }
                    }
                  >
                    <div
                      className="relative w-full h-full"
                      onClick={() => handleBannerClick(event.id)}
                    >
                      <img
                        src={event.banner}
                        alt={event.name}
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                        onError={(e) => {
                          e.target.src = event.poster || "";
                        }}
                      />
                      <div className="absolute inset-0" />
                    </div>
                  </Motion.div>
                ))}
              </Motion.div>

              <AnimatePresence>
                {showArrows && bannerEvents.length > 1 && (
                  <>
                    <Button unstyled
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </Button>
                    <Button unstyled
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </Button>
                  </>
                )}
              </AnimatePresence>

              {bannerEvents.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                  {bannerEvents.map((_, i) => (
                    <Button unstyled
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBanner(i);
                      }}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        i === currentBanner
                          ? "bg-white w-4 sm:w-8"
                          : "bg-white/50 w-1.5 sm:w-2 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Motion.div>
          )}
        </div>
      </section>

      {availableCategories.length > 0 && (
        <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Jelajahi Kategori
                </h2>
                <Button
                  onClick={() => navigate(ROUTES.EVENT_SEARCH)}
                  variant="primary" className="px-3 py-1.5 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-base"
                >
                  Lihat Semua
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
                {availableCategories.map((category, index) => {
                  const catData = CATEGORY_DATA[category];
                  const IconComponent = catData?.icon || Ticket;
                  return (
                    <Button unstyled
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleCategoryClick(category)}
                      className={`group p-2 sm:p-4 ${
                        catData?.bgLight || "bg-gray-50"
                      } rounded-lg sm:rounded-2xl hover:shadow-md sm:hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-1.5 sm:gap-3`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-12 sm:h-12 ${
                          catData?.color || "bg-gray-500"
                        } rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 text-center line-clamp-2 leading-tight">
                        {category}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </Motion.div>
          </div>
        </section>
      )}

      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Event Terlaris
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Event dengan penjualan tiket terbanyak
                  </p>
                </div>
              </div>
              <Button unstyled
                onClick={() => navigate(routeTo.eventSearch({ sort: "terlaris" }))}
                className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Lihat Semua
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {bestSellingEvents.length > 0 ? (
              <div className="relative group/slider">
                <Button unstyled
                  onClick={() => handleSliderScroll(bestSellingSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-emerald-50 hover:scale-110 -ml-3 sm:-ml-4 ${
                    canScrollLeftBestSelling ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </Button>

                <Button unstyled
                  onClick={() => handleSliderScroll(bestSellingSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-emerald-50 hover:scale-110 -mr-3 sm:-mr-4 ${
                    canScrollRightBestSelling ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </Button>

                <div
                  ref={bestSellingSliderRef}
                  onScroll={() => checkScrollPosition(bestSellingSliderRef, setCanScrollLeftBestSelling, setCanScrollRightBestSelling)}
                  className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {bestSellingEvents.slice(0, 6).map((event, index) => (
                    <div key={event.id} className="shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                      <EventCard
                        event={event}
                        index={index}
                        onClick={() => navigate(routeTo.eventDetail(event.id))}
                        formatRupiah={formatRupiah}
                        formatNumber={formatNumber}
                        getCategoryData={getCategoryData}
                        getParentCategory={getParentCategory}
                        isLiked={likedEvents.has(event.id)}
                        onLike={(e) => handleLikeEvent(event.id, e)}
                        isLoggedIn={isLoggedIn}
                        canLike={canLike}
                        showSales
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Ticket}
                title="Belum Ada Event"
                description="Saat ini belum ada event yang tersedia. Silakan cek kembali nanti."
              />
            )}
          </Motion.div>
        </div>
      </section>

      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Event Populer
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Event dengan likes terbanyak
                  </p>
                </div>
              </div>
              <Button unstyled
                onClick={() => navigate(routeTo.eventSearch({ sort: "popularitas" }))}
                className="flex items-center gap-1 sm:gap-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Lihat Semua
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {popularEvents.length > 0 ? (
              <div className="relative group/slider">
                <Button unstyled
                  onClick={() => handleSliderScroll(popularSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pink-50 hover:scale-110 -ml-3 sm:-ml-4 ${
                    canScrollLeftPopular ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </Button>

                <Button unstyled
                  onClick={() => handleSliderScroll(popularSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pink-50 hover:scale-110 -mr-3 sm:-mr-4 ${
                    canScrollRightPopular ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </Button>

                <div
                  ref={popularSliderRef}
                  onScroll={() => checkScrollPosition(popularSliderRef, setCanScrollLeftPopular, setCanScrollRightPopular)}
                  className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {popularEvents.slice(0, 6).map((event, index) => (
                    <div key={event.id} className="shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                      <EventCard
                        event={event}
                        index={index}
                        onClick={() => navigate(routeTo.eventDetail(event.id))}
                        formatRupiah={formatRupiah}
                        formatNumber={formatNumber}
                        getCategoryData={getCategoryData}
                        getParentCategory={getParentCategory}
                        isLiked={likedEvents.has(event.id)}
                        onLike={(e) => handleLikeEvent(event.id, e)}
                        isLoggedIn={isLoggedIn}
                        canLike={canLike}
                        showLikes
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="Belum Ada Event Populer"
                description="Saat ini belum ada event populer. Silakan cek kembali nanti."
              />
            )}
          </Motion.div>
        </div>
      </section>

      {upcomingEvents.length > 0 && (
        <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      Segera Digelar
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Event yang akan datang dalam waktu dekat
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(ROUTES.EVENT_CALENDAR)}
                  variant="primary" className="px-3 py-1.5 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-base"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Lihat Kalender</span>
                  <span className="sm:hidden">Kalender</span>
                </Button>
              </div>

              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {upcomingEvents.slice(0, 6).map((event, index) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(routeTo.eventDetail(event.id))}
                    formatRupiah={formatRupiah}
                    formatNumber={formatNumber}
                    getCategoryData={getCategoryData}
                    getParentCategory={getParentCategory}
                    isLiked={likedEvents.has(event.id)}
                    onLike={(e) => handleLikeEvent(event.id, e)}
                    isLoggedIn={isLoggedIn}
                    canLike={canLike}
                  />
                ))}
              </div>

              <div className="sm:hidden relative group/slider">
                <Button unstyled
                  onClick={() => handleSliderScroll(upcomingSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-brand-50 hover:scale-110 -ml-3 ${
                    canScrollLeftUpcoming ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-brand-600" />
                </Button>

                <Button unstyled
                  onClick={() => handleSliderScroll(upcomingSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-brand-50 hover:scale-110 -mr-3 ${
                    canScrollRightUpcoming ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-brand-600" />
                </Button>

                <div
                  ref={upcomingSliderRef}
                  onScroll={() => checkScrollPosition(upcomingSliderRef, setCanScrollLeftUpcoming, setCanScrollRightUpcoming)}
                  className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {Array.from({ length: Math.ceil(upcomingEvents.slice(0, 6).length / 2) }).map((_, colIndex) => (
                    <div key={colIndex} className="shrink-0 w-[75vw] max-w-70 flex flex-col gap-3">
                      {upcomingEvents.slice(0, 6).slice(colIndex * 2, colIndex * 2 + 2).map((event, index) => (
                        <UpcomingEventCard
                          key={event.id}
                          event={event}
                          index={colIndex * 2 + index}
                          onClick={() => navigate(routeTo.eventDetail(event.id))}
                          formatRupiah={formatRupiah}
                          formatNumber={formatNumber}
                          getCategoryData={getCategoryData}
                          getParentCategory={getParentCategory}
                          isLiked={likedEvents.has(event.id)}
                          onLike={(e) => handleLikeEvent(event.id, e)}
                          isLoggedIn={isLoggedIn}
                          canLike={canLike}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Motion.div>
          </div>
        </section>
      )}

      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-linear-to-br from-brand-600 to-brand-700 rounded-xl sm:rounded-3xl p-6 sm:p-12 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                Siap Menemukan Event Impianmu?
              </h2>
              <p className="text-brand-100 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Jelajahi semua event yang tersedia dan dapatkan tiket untuk
                pengalaman tak terlupakan
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button unstyled
                  onClick={() => navigate(ROUTES.EVENT_SEARCH)}
                  className="bg-white text-brand-600 hover:bg-brand-50 px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  Jelajahi Event
                </Button>
                <Button unstyled
                  onClick={() => navigate(ROUTES.EVENT_CALENDAR)}
                  className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Lihat Kalender
                </Button>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>

      <AnimatePresence>
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg z-50 text-sm sm:text-base max-w-xs sm:max-w-md text-center"
          >
            {error}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({
  event,
  index,
  onClick,
  formatRupiah,
  formatNumber,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  canLike,
  showSales,
  showLikes,
}) {
  const catData = getCategoryData(event.category);
  const parentCategory = getParentCategory(event.category);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-md sm:hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 shrink-0">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add(
                "flex",
                "items-center",
                "justify-center"
              );
              e.target.parentElement.innerHTML =
                '<div class="text-gray-400"><svg class="w-8 h-8 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Ticket className="w-8 h-8 sm:w-16 sm:h-16" />
          </div>
        )}
        {event.category && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span
              className={`${catData.color} text-white text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium`}
            >
              {parentCategory}
            </span>
          </div>
        )}
        <Button unstyled
          onClick={onLike}
          disabled={!canLike}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
            !canLike
              ? "bg-white/90 text-gray-400 cursor-not-allowed"
              : isLiked
              ? "bg-pink-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500"
          }`}
          title={
            !canLike
              ? "Fitur like hanya tersedia untuk user biasa"
              : isLiked
              ? "Unlike"
              : "Like"
          }
        >
          <Heart
            className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`}
          />
        </Button>
      </div>

      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <div className="min-h-14 sm:min-h-16 mb-1.5 sm:mb-2 flex items-start">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight">
            {event.name}
          </h3>
        </div>

        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p
              className={`font-bold text-sm sm:text-base ${
                event.price === 0 ? "text-emerald-600" : "text-brand-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {showSales && event.totalTicketsSold > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 text-xs sm:text-sm">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">{formatNumber(event.totalTicketsSold)}</span>
              </div>
            )}
            {showLikes && event.totalLikes > 0 && (
              <div className="flex items-center gap-1 text-pink-500 text-xs sm:text-sm">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                <span className="font-medium">{formatNumber(event.totalLikes)}</span>
              </div>
            )}
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-50 rounded-full flex items-center justify-center group-hover:bg-brand-600 transition-colors">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-brand-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}

function UpcomingEventCard({
  event,
  index,
  onClick,
  formatRupiah,
  formatNumber,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  canLike,
}) {
  const catData = getCategoryData(event.category);
  const parentCategory = getParentCategory(event.category);

  const daysUntil = event.dateStart
    ? Math.ceil(
        (new Date(event.dateStart) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-md sm:hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 h-full"
    >
      <div className="flex h-full">
        <div className="w-16 sm:w-20 bg-linear-to-b from-brand-600 to-brand-700 flex flex-col items-center justify-center text-white py-3 sm:py-4 shrink-0">
          {event.dateStart && (
            <>
              <span className="text-lg sm:text-2xl font-bold">
                {new Date(event.dateStart).getDate()}
              </span>
              <span className="text-xs uppercase tracking-wide opacity-80">
                {new Date(event.dateStart).toLocaleDateString("id-ID", {
                  month: "short",
                })}
              </span>
            </>
          )}
        </div>

        <div className="flex-1 p-2.5 sm:p-4 flex flex-col">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex-1 min-w-0">
              {event.category && (
                <span
                  className={`${catData.color} text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full font-medium`}
                >
                  {parentCategory}
                </span>
              )}
              <div className="min-h-12 sm:min-h-14 mt-1 sm:mt-1.5 flex items-start">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors text-sm sm:text-base leading-tight">
                  {event.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {daysUntil !== null && daysUntil >= 0 && (
                <span className="ui-badge ui-badge-info whitespace-nowrap px-1.5 py-0.5 sm:px-2 sm:py-1">
                  {daysUntil === 0
                    ? "Hari ini"
                    : daysUntil === 1
                    ? "Besok"
                    : `${daysUntil} hari`}
                </span>
              )}
              <Button unstyled
                onClick={onLike}
                disabled={!canLike}
                className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                  !canLike
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isLiked
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-500"
                }`}
                title={
                  !canLike
                    ? "Fitur like hanya tersedia untuk user biasa"
                    : isLiked
                    ? "Unlike"
                    : "Like"
                }
              >
                <Heart
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                    isLiked ? "fill-current" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <p
              className={`font-bold text-sm sm:text-base ${
                event.price === 0 ? "text-emerald-600" : "text-brand-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {event.totalLikes > 0 && (
                <span className="flex items-center gap-0.5 text-pink-500 text-xs">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  {formatNumber(event.totalLikes)}
                </span>
              )}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}

function EmptyState({ icon, title, description }) {
  const IconComponent = icon;
  return (
    <div className="text-center py-10 sm:py-16">
      <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <IconComponent className="w-6 h-6 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-sm sm:text-base">{description}</p>
    </div>
  );
}
