import { lazy } from "react";

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
  { path: "/", Page: LandingPage },
  { path: "/login", Page: LoginPage },
  { path: "/daftar", Page: DaftarPage },
  { path: "/daftarEO", Page: DaftarEOPage },
  { path: "/cariEvent/:namaEvent?", Page: CariEventPage },
  { path: "/detailEvent/:id", Page: DetailEventPage },
  { path: "/kalender-event", Page: CalendarEventPage },
  { path: "/lihat-profil", Page: LihatProfilPage, protected: true },
  { path: "/keranjang", Page: KeranjangPage, roles: ["user"] },
  { path: "/tiket-saya", Page: TiketSayaPage, roles: ["user"] },
  { path: "/riwayat-transaksi", Page: RiwayatPembelianPage, roles: ["user"] },
  { path: "/event-disukai", Page: LikedEventsPage, roles: ["user"] },
  { path: "/laporkan-masalah", Page: LaporkanMasalahPage, roles: ["user", "organizer"] },
  { path: "/event-saya", Page: EventSayaPage, roles: ["organizer"] },
  { path: "/daftar-event", Page: EventRegisterPage, roles: ["organizer"] },
  { path: "/edit-event/:id", Page: EditEventPage, roles: ["organizer"] },
  { path: "/laporan/:eventId", Page: LaporanEventPage, roles: ["organizer"] },
  { path: "/scan/:eventId", Page: CheckinTiketPage, roles: ["organizer"] },
  { path: "/verifikasi-event", Page: VerifikasiEventPage, roles: ["admin"] },
  { path: "/verifikasiUser", Page: VerifikasiUserPage, roles: ["admin"] },
  { path: "/tinjauUser/:id", Page: TinjauUserDetailPage, roles: ["admin"] },
  { path: "/laporanMasalah", Page: LaporanMasalahPage, roles: ["admin"] },
];
