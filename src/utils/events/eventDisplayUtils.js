import { formatOptionalShortDateRange } from "../shared/formatters";

export const getDaysUntilEvent = (dateStart) => {
  if (!dateStart) return null;
  const timeDiff = new Date(dateStart) - new Date();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const getEventTimeLabel = (dateStart, status) => {
  if (status === "active") {
    return { text: "Sedang Berlangsung", color: "bg-green-600" };
  }

  const daysUntil = getDaysUntilEvent(dateStart);
  if (daysUntil === null || daysUntil < 0) return null;
  if (daysUntil === 0) return { text: "Hari ini", color: "bg-emerald-500" };
  if (daysUntil === 1) return { text: "Besok", color: "bg-emerald-500" };
  if (daysUntil <= 7) {
    return { text: `${daysUntil} hari`, color: "bg-emerald-500" };
  }
  return { text: `${daysUntil} hari`, color: "bg-brand-500" };
};

export const getLowestTicketPrice = (ticketCategories) => {
  if (!ticketCategories || ticketCategories.length === 0) return 0;
  return Math.min(...ticketCategories.map((category) => category.price));
};

const transformEventCardData = (event) => ({
  banner: event.flyer || event.image,
  category: event.category,
  date: formatOptionalShortDateRange(event.date_start, event.date_end),
  dateEnd: event.date_end,
  dateStart: event.date_start,
  district: event.district,
  id: event.event_id || event.id,
  location: event.venue || event.location,
  name: event.name,
  originalData: event,
  poster: event.image,
  price: getLowestTicketPrice(event.ticket_categories),
  totalLikes: event.total_likes || 0,
  totalTicketsSold: event.total_tickets_sold || 0,
});

const isPublicEvent = (event) =>
  event.status === "approved" || event.status === "active";

export const getLandingEventCollections = (
  events,
  popularEvents = [],
  { limit = 6, now = new Date() } = {},
) => {
  const transformedEvents = events
    .filter(isPublicEvent)
    .map(transformEventCardData);

  const bestSelling = [...transformedEvents]
    .filter((event) => event.totalTicketsSold >= 0)
    .sort(
      (firstEvent, secondEvent) =>
        secondEvent.totalTicketsSold - firstEvent.totalTicketsSold,
    )
    .slice(0, limit);

  const popular =
    popularEvents.length === 0
      ? [...transformedEvents]
          .filter((event) => event.totalLikes >= 0)
          .sort(
            (firstEvent, secondEvent) =>
              secondEvent.totalLikes - firstEvent.totalLikes,
          )
          .slice(0, limit)
      : popularEvents
          .filter(isPublicEvent)
          .map(transformEventCardData)
          .filter((event) => event.totalLikes >= 0)
          .slice(0, limit);

  const upcoming = transformedEvents
    .filter((event) => event.dateStart && new Date(event.dateStart) >= now)
    .sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.dateStart) - new Date(secondEvent.dateStart),
    )
    .slice(0, limit);

  return { bestSelling, popular, upcoming };
};

export const getBannerEvents = (events, limit = 5) =>
  events.filter((event) => event.banner).slice(0, limit);

export const getEventMinimumPrice = (event) => {
  if (!event.ticket_categories || event.ticket_categories.length === 0) return 0;
  const prices = event.ticket_categories
    .map((category) => category.price)
    .filter((price) => price !== undefined && price !== null);
  return prices.length === 0 ? 0 : Math.min(...prices);
};

export const getEventStatusLabel = (status) => {
  const labels = {
    ended: { text: "Berakhir", bgColor: "bg-gray-600" },
    active: { text: "Sedang Berlangsung", bgColor: "bg-green-600" },
    approved: { text: "Segera Hadir", bgColor: "bg-brand-600" },
  };

  return labels[status] || null;
};
