import { lazy } from "react";
import { ROUTES } from "./utils/constants/routeConstants";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const DaftarPage = lazy(() => import("./pages/auth/DaftarPage"));
const DaftarEOPage = lazy(() => import("./pages/auth/DaftarEOPage"));

const LandingPage = lazy(() => import("./pages/events/LandingPage"));
const CariEventPage = lazy(() => import("./pages/events/CariEventPage"));
const DetailEventPage = lazy(() => import("./pages/events/DetailEventPage"));
const EventRegisterPage = lazy(() => import("./pages/events/EventRegisterPage"));
const EventSayaPage = lazy(() => import("./pages/events/EventSayaPage"));
const EditEventPage = lazy(() => import("./pages/events/EditEventPage"));
const CalendarEventPage = lazy(() => import("./pages/events/CalendarEventPage"));
const LikedEventsPage = lazy(() => import("./pages/events/LikedEventsPage"));
const VerifikasiEventPage = lazy(() => import("./pages/events/VerifikasiEventPage"));

const KeranjangPage = lazy(() => import("./pages/tickets/KeranjangPage"));
const TiketSayaPage = lazy(() => import("./pages/tickets/TiketSayaPage"));
const RiwayatPembelianPage = lazy(() => import("./pages/tickets/RiwayatPembelianPage"));
const CheckinTiketPage = lazy(() => import("./pages/tickets/CheckinTiketPage"));

const LaporanEventPage = lazy(() => import("./pages/reports/LaporanEventPage"));
const LaporkanMasalahPage = lazy(() => import("./pages/reports/LaporkanMasalahPage"));
const LaporanMasalahPage = lazy(() => import("./pages/reports/LaporanMasalahPage"));

const LihatProfilPage = lazy(() => import("./pages/users/LihatProfilPage"));
const VerifikasiUserPage = lazy(() => import("./pages/users/VerifikasiUserPage"));
const TinjauUserDetailPage = lazy(() => import("./pages/users/TinjauUserDetailPage"));

export const routes = [
  { path: ROUTES.HOME, Page: LandingPage },
  { path: ROUTES.LOGIN, Page: LoginPage },
  { path: ROUTES.USER_REGISTER, Page: DaftarPage },
  { path: ROUTES.ORGANIZER_REGISTER, Page: DaftarEOPage },
  { path: ROUTES.EVENT_SEARCH_PATTERN, Page: CariEventPage },
  { path: ROUTES.EVENT_DETAIL, Page: DetailEventPage },
  { path: ROUTES.EVENT_CALENDAR, Page: CalendarEventPage },
  { path: ROUTES.PROFILE, Page: LihatProfilPage, requiresAuth: true },
  { path: ROUTES.CART, Page: KeranjangPage, roles: ["user"] },
  { path: ROUTES.MY_TICKETS, Page: TiketSayaPage, roles: ["user"] },
  { path: ROUTES.TRANSACTION_HISTORY, Page: RiwayatPembelianPage, roles: ["user"] },
  { path: ROUTES.LIKED_EVENTS, Page: LikedEventsPage, roles: ["user"] },
  { path: ROUTES.REPORT_ISSUE, Page: LaporkanMasalahPage, roles: ["user", "organizer"] },
  { path: ROUTES.MY_EVENTS, Page: EventSayaPage, roles: ["organizer"] },
  { path: ROUTES.EVENT_REGISTER, Page: EventRegisterPage, roles: ["organizer"] },
  { path: ROUTES.EVENT_EDIT, Page: EditEventPage, roles: ["organizer"] },
  { path: ROUTES.EVENT_REPORT, Page: LaporanEventPage, roles: ["organizer"] },
  { path: ROUTES.TICKET_CHECK_IN, Page: CheckinTiketPage, roles: ["organizer"] },
  { path: ROUTES.EVENT_VERIFICATION, Page: VerifikasiEventPage, roles: ["admin"] },
  { path: ROUTES.USER_VERIFICATION, Page: VerifikasiUserPage, roles: ["admin"] },
  { path: ROUTES.USER_REVIEW, Page: TinjauUserDetailPage, roles: ["admin"] },
  { path: ROUTES.ISSUE_REPORTS, Page: LaporanMasalahPage, roles: ["admin"] },
];
