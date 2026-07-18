export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  USER_REGISTER: "/daftar",
  ORGANIZER_REGISTER: "/daftar-organizer",
  EVENT_SEARCH: "/cari-event",
  EVENT_SEARCH_PATTERN: "/cari-event/:searchQuery?",
  EVENT_DETAIL: "/detail-event/:eventId",
  EVENT_CALENDAR: "/kalender-event",
  PROFILE: "/profil",
  CART: "/keranjang",
  MY_TICKETS: "/tiket-saya",
  TRANSACTION_HISTORY: "/riwayat-transaksi",
  LIKED_EVENTS: "/event-disukai",
  REPORT_ISSUE: "/laporkan-masalah",
  MY_EVENTS: "/event-saya",
  EVENT_REGISTER: "/daftar-event",
  EVENT_EDIT: "/edit-event/:eventId",
  EVENT_REPORT: "/laporan-event/:eventId",
  TICKET_CHECK_IN: "/check-in-tiket/:eventId",
  EVENT_VERIFICATION: "/verifikasi-event",
  USER_VERIFICATION: "/verifikasi-user",
  USER_REVIEW: "/tinjau-user/:userId",
  ISSUE_REPORTS: "/laporan-masalah",
});

const encodePathSegment = (value) => encodeURIComponent(String(value));

const addSearchParams = (path, params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? path + "?" + query : path;
};

const createPath = (pattern, parameter, value) =>
  pattern.replace(":" + parameter, encodePathSegment(value));

export const routeTo = Object.freeze({
  eventSearch: ({ searchQuery, ...params } = {}) => {
    const path = searchQuery
      ? ROUTES.EVENT_SEARCH + "/" + encodePathSegment(searchQuery)
      : ROUTES.EVENT_SEARCH;

    return addSearchParams(path, params);
  },
  eventDetail: (eventId) =>
    createPath(ROUTES.EVENT_DETAIL, "eventId", eventId),
  eventEdit: (eventId) =>
    createPath(ROUTES.EVENT_EDIT, "eventId", eventId),
  eventReport: (eventId) =>
    createPath(ROUTES.EVENT_REPORT, "eventId", eventId),
  ticketCheckIn: (eventId) =>
    createPath(ROUTES.TICKET_CHECK_IN, "eventId", eventId),
  userReview: (userId) =>
    createPath(ROUTES.USER_REVIEW, "userId", userId),
});
