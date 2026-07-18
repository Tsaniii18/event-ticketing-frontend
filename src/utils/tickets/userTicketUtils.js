import {
  formatOptionalShortDateRange,
  formatOptionalTimeRange,
  formatShortDate,
} from "../shared/formatters";

const getUserTicketStatus = (ticket, currentDate = new Date()) => {
  if (ticket.status === "pending" || ticket.status === "cancelled") return null;
  if (ticket.status === "used") return "used";

  const categoryEnd = ticket.ticket_category?.date_time_end;
  if (categoryEnd && new Date(categoryEnd) < currentDate) return "expired";

  return "active";
};

export const transformUserTickets = (tickets) =>
  tickets
    .map((ticket) => {
      const status = getUserTicketStatus(ticket);
      if (!status) return null;

      const startDate =
        ticket.ticket_category?.date_time_start || ticket.event?.date_start;
      const endDate =
        ticket.ticket_category?.date_time_end || ticket.event?.date_end;

      return {
        ...ticket,
        categoryDescription: ticket.ticket_category?.description || "",
        categoryName: ticket.ticket_category?.name || "Tiket",
        categoryPrice: ticket.ticket_category?.price || 0,
        code: ticket.code,
        createdAt: ticket.created_at,
        displayDate: formatShortDate(startDate),
        displayDateRange: formatOptionalShortDateRange(startDate, endDate),
        displayTimeRange: formatOptionalTimeRange(startDate, endDate),
        eventCity: ticket.event?.city || "-",
        eventDateEnd: ticket.event?.date_end,
        eventDateStart: ticket.event?.date_start,
        eventId: ticket.event?.event_id,
        eventImage: ticket.event?.image,
        eventLocation: ticket.event?.location || "-",
        eventName: ticket.event?.name || ticket.event?.event_name || "Event",
        eventVenue:
          ticket.event?.venue ||
          ticket.event?.Venue ||
          ticket.event?.location ||
          "-",
        formattedEventDate: formatShortDate(ticket.event?.date_start),
        formattedEventDateEnd: formatShortDate(ticket.event?.date_end),
        formattedTicketDate: formatShortDate(startDate),
        formattedTicketDateEnd: formatShortDate(endDate),
        status,
        tag: ticket.tag || "",
        ticketDateEnd: endDate,
        ticketDateStart: startDate,
        ticketId: ticket.ticket_id,
        timeRange: formatOptionalTimeRange(startDate, endDate),
        usedAt: ticket.used_at,
      };
    })
    .filter(Boolean);

export const normalizeTicketResponse = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

export const filterUserTickets = (
  tickets,
  { searchTerm = "", status = "all" } = {},
) => {
  let filteredTickets = tickets;

  if (status !== "all") {
    filteredTickets = filteredTickets.filter(
      (ticket) => ticket.status === status,
    );
  }

  if (!searchTerm) return filteredTickets;
  const query = searchTerm.toLowerCase();

  return filteredTickets.filter((ticket) =>
    [ticket.eventName, ticket.categoryName, ticket.tag, ticket.code].some(
      (value) => value?.toLowerCase().includes(query),
    ),
  );
};

export const groupUserTicketsByEvent = (
  tickets,
  { sortBy = "date", sortOrder = "desc" } = {},
) => {
  const groups = {};

  tickets.forEach((ticket) => {
    const eventKey = ticket.eventId || ticket.eventName || "unknown";

    if (!groups[eventKey]) {
      groups[eventKey] = {
        displayDateRange: ticket.displayDateRange,
        eventCity: ticket.eventCity,
        eventDateEnd: ticket.eventDateEnd,
        eventDateStart: ticket.eventDateStart,
        eventId: ticket.eventId,
        eventImage: ticket.eventImage,
        eventLocation: ticket.eventLocation,
        eventName: ticket.eventName,
        eventVenue: ticket.eventVenue,
        formattedEventDate: ticket.formattedEventDate,
        formattedEventDateEnd: ticket.formattedEventDateEnd,
        tickets: [],
      };
    }

    groups[eventKey].tickets.push(ticket);
  });

  return Object.values(groups).sort((firstGroup, secondGroup) => {
    const comparison =
      sortBy === "name"
        ? (firstGroup.eventName || "").localeCompare(
            secondGroup.eventName || "",
          )
        : new Date(firstGroup.eventDateStart || 0) -
          new Date(secondGroup.eventDateStart || 0);

    return sortOrder === "desc" ? -comparison : comparison;
  });
};
