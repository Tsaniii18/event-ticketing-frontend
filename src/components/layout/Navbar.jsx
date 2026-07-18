import {
  Menu,
  Search,
  ShoppingCart,
  X,
  History,
  LogOut,
  User,
  Home,
  Ticket,
  Calendar,
  CalendarDays,
  ShieldCheck,
  Users,
  Heart,
  Flag,
  FileText,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import useNotification from "../../hooks/useNotification";
import useSessionUser from "../../hooks/useSessionUser";
import useClickOutside from "../../hooks/useClickOutside";
import NotificationModal from "../common/NotificationModal";
import Button from "../common/Button";
import { ROUTES, routeTo } from "../../utils/constants/routeConstants";
import {
  getUserRoleConfig,
  getUserRoleLabel,
  joinClasses,
} from "../../utils";

export default function Navbar() {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [verificationDropdownOpen, setVerificationDropdownOpen] =
    useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const verificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { notification, showNotification, hideNotification } =
    useNotification();
  const { user, clearSession } = useSessionUser();
  const roleConfig = getUserRoleConfig(user?.role);
  const RoleIcon = roleConfig.icon;
  const isAuthenticated = user !== null;
  const userRole = user?.role || null;
  const shouldShowCart = isAuthenticated && userRole === "user";
  const verificationActive =
    location.pathname === ROUTES.USER_VERIFICATION ||
    location.pathname === ROUTES.EVENT_VERIFICATION;
  const reportActive = location.pathname === ROUTES.ISSUE_REPORTS;
  useClickOutside(dropdownRef, () => setProfileDropdownOpen(false));
  useClickOutside(verificationRef, () => setVerificationDropdownOpen(false));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setProfileDropdownOpen(false);
    showNotification(
      "Anda telah berhasil logout",
      "Logout Berhasil",
      "success"
    );
    navigate(ROUTES.HOME);
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleVerificationClick = () => {
    setVerificationDropdownOpen(!verificationDropdownOpen);
  };

  const handleShoppingCartClick = () => {
    if (!isAuthenticated) {
      showNotification(
        "Harap login terlebih dahulu",
        "Akses Ditolak",
        "warning"
      );
      return;
    }

    if (userRole === "user") {
      navigate(ROUTES.CART);
    } else {
      showNotification(
        "Fitur ini hanya tersedia untuk User",
        "Akses Ditolak",
        "warning"
      );
    }
  };

  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    navigate(ROUTES.PROFILE);
  };

  const handleViewLikedEvents = () => {
    setProfileDropdownOpen(false);
    navigate(ROUTES.LIKED_EVENTS);
  };

  const handleViewTransactionHistory = () => {
    setProfileDropdownOpen(false);
    navigate(ROUTES.TRANSACTION_HISTORY);
  };

  const handleViewReportIssue = () => {
    setProfileDropdownOpen(false);
    navigate(ROUTES.REPORT_ISSUE);
  };

  const handleVerificationUser = () => {
    setVerificationDropdownOpen(false);
    navigate(ROUTES.USER_VERIFICATION);
  };

  const handleVerificationEvent = () => {
    setVerificationDropdownOpen(false);
    navigate(ROUTES.EVENT_VERIFICATION);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search");

    if (searchQuery && searchQuery.trim() !== "") {
      navigate(routeTo.eventSearch({ searchQuery: searchQuery.trim() }));
      e.target.reset();
      showNotification(`Mencari event: ${searchQuery}`, "Pencarian", "info");
    }
  };

  const renderUserAvatar = () => {
    if (user?.profile_pict) {
      return (
        <img
          src={user.profile_pict}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        <User className="w-5 h-5 text-white" />
      </div>
    );
  };

  const renderMobileUserAvatar = () => {
    if (user?.profile_pict) {
      return (
        <img
          src={user.profile_pict}
          alt={user.username}
          className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-md"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-md">
        <User className="w-7 h-7 text-white" />
      </div>
    );
  };

  const getNavLinkClass = (isActive, additionalClasses = "") => {
    const baseClasses =
      "flex items-center space-x-2 px-6 py-3 rounded-t-lg font-medium transition-all relative group";
    const activeClasses = "bg-white text-brand-600 shadow-lg";
    const inactiveClasses = "text-white hover:bg-white/20 hover:shadow-lg";

    return joinClasses(
      baseClasses,
      isActive ? activeClasses : inactiveClasses,
      additionalClasses,
    );
  };

  return (
    <div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-navigation shadow-lg" : "bg-navigation"
        }`}
      >
        <div className="ui-container-wide">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            <div className="flex items-center space-x-4">
              <Button unstyled
                className="md:hidden text-white hover:text-amber-400 transition-colors"
                onClick={() => setMobileMenuIsOpen(true)}
              >
                <Menu className="w-7 h-7" />
              </Button>

              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <div className="bg-white rounded-lg p-1 shadow-md">
                  <Ticket className="w-6 h-6 text-brand-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  TIKERIA
                </span>
              </Link>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Cari event, konser, workshop..."
                    className="ui-input bg-white/95 py-3 pr-4 pl-10 shadow-sm focus:border-transparent focus:ring-brand-300"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {shouldShowCart && (
                <Button unstyled
                  className="relative text-white hover:text-amber-400 transition-colors p-2"
                  onClick={handleShoppingCartClick}
                >
                  <ShoppingCart className="w-6 h-6" />
                </Button>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <Button unstyled
                    className="hidden md:flex items-center space-x-3 text-white hover:text-amber-400 transition-colors p-2"
                    onClick={handleProfileClick}
                  >
                    {renderUserAvatar()}
                    <div className="lg:flex flex-col items-start">
                      <span className="text-sm font-bold">
                        {user?.username}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center space-x-1 mt-1 ${roleConfig.color}`}
                      >
                        <RoleIcon className="w-4 h-4" />
                        <span className="font-semibold">
                          {getUserRoleLabel(user?.role, true)}
                        </span>
                      </span>
                    </div>
                  </Button>

                  <Button unstyled
                    className="md:hidden flex items-center space-x-2 text-white hover:text-amber-400 transition-colors p-1"
                    onClick={handleProfileClick}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white truncate max-w-20">
                        {user?.username}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full border flex items-center space-x-0.5 ${roleConfig.color}`}
                      >
                        <RoleIcon className="w-4 h-4" />
                        <span className="font-semibold">
                          {getUserRoleLabel(user?.role, true)}
                        </span>
                      </span>
                    </div>
                    {renderUserAvatar()}
                  </Button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-xl">
                      <div className="p-4 border-b border-gray-200 bg-linear-to-r from-brand-50 to-brand-100 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center shadow-sm">
                            {user?.profile_pict ? (
                              <img
                                src={user.profile_pict}
                                alt={user.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center bg-brand-500 text-white font-bold text-lg shadow-inner"
                              style={{
                                display: user?.profile_pict ? "none" : "flex",
                              }}
                            >
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">
                              {user.username}
                            </p>
                            <p
                              className={`text-sm px-3 py-1 rounded-full border flex items-center space-x-1 mt-1 w-fit ${roleConfig.color}`}
                            >
                              <RoleIcon className="w-4 h-4" />
                              <span className="font-bold">
                                {getUserRoleLabel(user.role, true)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Button unstyled
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-brand-50 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                            <User className="w-4 h-4 text-brand-600" />
                          </div>
                          <span className="font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                            Lihat Profil
                          </span>
                        </Button>

                        {isAuthenticated && userRole === "user" && (
                          <Button unstyled
                            onClick={handleViewLikedEvents}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-pink-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                              <Heart className="w-4 h-4 text-pink-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                              Event yang Disukai
                            </span>
                          </Button>
                        )}

                        {userRole === "user" && (
                          <Button unstyled
                            onClick={handleViewTransactionHistory}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <History className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                              Riwayat Transaksi
                            </span>
                          </Button>
                        )}

                        {(userRole === "user" || userRole === "organizer") && (
                          <Button unstyled
                            onClick={handleViewReportIssue}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-yellow-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <Flag className="w-4 h-4 text-yellow-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-yellow-600 transition-colors">
                              Laporkan Masalah
                            </span>
                          </Button>
                        )}

                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <Button unstyled
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="font-medium text-red-600 group-hover:text-red-700 transition-colors">
                              Keluar
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={ROUTES.LOGIN}>
                  <Button unstyled className="rounded-lg bg-navigation-dark px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-white hover:text-navigation-dark hover:shadow-lg">
                    Masuk
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="fixed top-20 z-40 hidden w-full border-t border-white/20 bg-navigation-dark shadow-md md:block">
        <div className="ui-container-wide">
          <div className="flex items-center">
            <div className="flex items-center">
              <NavLink
                to={ROUTES.HOME}
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <Home size={16} />
                <span>Beranda</span>
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === ROUTES.HOME
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </NavLink>

              <NavLink
                to={ROUTES.EVENT_SEARCH}
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <Search size={16} />
                <span>Cari Event</span>
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname.startsWith(ROUTES.EVENT_SEARCH)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </NavLink>

              <NavLink
                to={ROUTES.EVENT_CALENDAR}
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <CalendarDays size={16} />
                <span>Kalender Event</span>
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === ROUTES.EVENT_CALENDAR
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </NavLink>

              {isAuthenticated && userRole === "user" && (
                <NavLink
                  to={ROUTES.MY_TICKETS}
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Ticket size={16} />
                  <span>Tiket Saya</span>
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                      location.pathname === ROUTES.MY_TICKETS
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </NavLink>
              )}

              {isAuthenticated && userRole === "organizer" && (
                <>
                  <NavLink
                    to={ROUTES.EVENT_REGISTER}
                    className={({ isActive }) => getNavLinkClass(isActive)}
                  >
                    <Calendar size={16} />
                    <span>Buat Event</span>
                    <div
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                        location.pathname === ROUTES.EVENT_REGISTER
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </NavLink>
                  <NavLink
                    to={ROUTES.MY_EVENTS}
                    className={({ isActive }) => getNavLinkClass(isActive)}
                  >
                    <Calendar size={16} />
                    <span>Event Saya</span>
                    <div
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                        location.pathname === ROUTES.MY_EVENTS
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </NavLink>
                </>
              )}

              {isAuthenticated && userRole === "admin" && (
                <>
                  <NavLink
                    to={ROUTES.ISSUE_REPORTS}
                    className={({ isActive }) => getNavLinkClass(isActive)}
                  >
                    <FileText size={16} />
                    <span>Laporan Masalah</span>
                    <div
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                        reportActive
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </NavLink>

                  <div className="relative" ref={verificationRef}>
                    <Button unstyled
                      className={getNavLinkClass(verificationActive)}
                      onClick={handleVerificationClick}
                    >
                      <ShieldCheck size={16} />
                      <span>Verifikasi</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          verificationDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                      <div
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                          verificationActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Button>

                    {verificationDropdownOpen && (
                      <div className="absolute right-0 top-full w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <Button unstyled
                          onClick={handleVerificationUser}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors group ${
                            location.pathname === ROUTES.USER_VERIFICATION
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              location.pathname === ROUTES.USER_VERIFICATION
                                ? "bg-brand-100"
                                : "bg-gray-100 group-hover:bg-brand-100"
                            } transition-colors`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">Verifikasi User</span>
                            <p className="text-xs text-gray-500">
                              Verifikasi akun organizer
                            </p>
                          </div>
                          {location.pathname === ROUTES.USER_VERIFICATION && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </Button>

                        <Button unstyled
                          onClick={handleVerificationEvent}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors group ${
                            location.pathname === ROUTES.EVENT_VERIFICATION
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              location.pathname === ROUTES.EVENT_VERIFICATION
                                ? "bg-brand-100"
                                : "bg-gray-100 group-hover:bg-brand-100"
                            } transition-colors`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">
                              Verifikasi Event
                            </span>
                            <p className="text-xs text-gray-500">
                              Verifikasi event baru
                            </p>
                          </div>
                          {location.pathname === ROUTES.EVENT_VERIFICATION && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="fixed top-16 z-40 w-full border-b border-white/20 bg-navigation shadow-sm md:hidden">
        <div className="px-4 py-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Cari event..."
                className="ui-input bg-white/95 py-2.5 pr-4 pl-10 shadow-sm focus:ring-brand-300"
              />
            </div>
          </form>
        </div>
      </nav>

      <div
        className={`${
          mobileMenuIsOpen ? "fixed inset-0" : "hidden"
        } z-50 bg-black/50 transition-all duration-300`}
        onClick={() => setMobileMenuIsOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-xl transform ${
            mobileMenuIsOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-linear-to-r from-brand-600 to-brand-700 p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Ticket className="w-8 h-8" />
                <span className="text-xl font-bold">TIKERIA</span>
              </div>
              <Button unstyled
                onClick={() => setMobileMenuIsOpen(false)}
                className="text-white hover:text-amber-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {renderMobileUserAvatar()}
                <div>
                  <p className="font-bold text-lg">{user?.username}</p>
                  <p
                    className={`text-xs px-3 py-1 rounded-full border flex items-center space-x-1 mt-1 w-fit ${roleConfig.color}`}
                  >
                    <RoleIcon className="w-4 h-4" />
                    <span className="font-bold">
                      {getUserRoleLabel(user.role, true)}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-brand-100 mb-3">Belum login?</p>
                <Link to={ROUTES.LOGIN}>
                  <Button unstyled
                    className="bg-white text-brand-600 px-6 py-2 rounded-lg font-bold hover:bg-brand-50 transition-all"
                    onClick={() => setMobileMenuIsOpen(false)}
                  >
                    Masuk Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="p-4 space-y-1">
            <NavLink
              to={ROUTES.HOME}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive
                    ? "bg-brand-50 text-brand-600 font-bold"
                    : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-semibold">Beranda</span>
            </NavLink>

            <NavLink
              to={ROUTES.EVENT_SEARCH}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive
                    ? "bg-brand-50 text-brand-600 font-bold"
                    : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Search size={20} />
              <span className="font-semibold">Cari Event</span>
            </NavLink>

            <NavLink
              to={ROUTES.EVENT_CALENDAR}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive
                    ? "bg-brand-50 text-brand-600 font-bold"
                    : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <CalendarDays size={20} />
              <span className="font-semibold">Kalender Event</span>
            </NavLink>

            {isAuthenticated && userRole === "user" && (
              <NavLink
                to={ROUTES.LIKED_EVENTS}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    isActive
                      ? "bg-pink-50 text-pink-600 font-bold"
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  }`
                }
                onClick={() => setMobileMenuIsOpen(false)}
              >
                <Heart size={20} />
                <span className="font-semibold">Event Disukai</span>
              </NavLink>
            )}

            {isAuthenticated && userRole === "user" && (
              <NavLink
                to={ROUTES.MY_TICKETS}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    isActive
                      ? "bg-brand-50 text-brand-600 font-bold"
                      : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                  }`
                }
                onClick={() => setMobileMenuIsOpen(false)}
              >
                <Ticket size={20} />
                <span className="font-semibold">Tiket Saya</span>
              </NavLink>
            )}

            {isAuthenticated && userRole === "organizer" && (
              <>
                <NavLink
                  to={ROUTES.EVENT_REGISTER}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive
                        ? "bg-brand-50 text-brand-600 font-bold"
                        : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-semibold">Buat Event</span>
                </NavLink>
                <NavLink
                  to={ROUTES.MY_EVENTS}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive
                        ? "bg-brand-50 text-brand-600 font-bold"
                        : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-semibold">Event Saya</span>
                </NavLink>
              </>
            )}

            {isAuthenticated && userRole === "admin" && (
              <>
                <NavLink
                  to={ROUTES.ISSUE_REPORTS}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive
                        ? "bg-brand-50 text-brand-600 font-bold"
                        : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <FileText size={20} />
                  <span className="font-semibold">Laporan Masalah</span>
                </NavLink>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                    VERIFIKASI
                  </div>
                  <NavLink
                    to={ROUTES.USER_VERIFICATION}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                        isActive
                          ? "bg-brand-50 text-brand-600 font-bold"
                          : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                      }`
                    }
                    onClick={() => setMobileMenuIsOpen(false)}
                  >
                    <Users size={20} />
                    <span className="font-semibold">Verifikasi User</span>
                  </NavLink>
                  <NavLink
                    to={ROUTES.EVENT_VERIFICATION}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                        isActive
                          ? "bg-brand-50 text-brand-600 font-bold"
                          : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                      }`
                    }
                    onClick={() => setMobileMenuIsOpen(false)}
                  >
                    <CheckCircle size={20} />
                    <span className="font-semibold">Verifikasi Event</span>
                  </NavLink>
                </div>
              </>
            )}

            {isAuthenticated && (
              <Button unstyled
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 rounded-lg text-red-600 hover:bg-red-50 transition-all mt-4 hover:scale-[1.02]"
              >
                <LogOut size={20} />
                <span className="font-semibold">Keluar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
