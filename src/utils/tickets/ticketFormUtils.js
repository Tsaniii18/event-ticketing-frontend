import {
  formatDateInputValue,
  formatTimeInputValue,
} from "../shared/dateTimeFormatters";

export const transformEditableTicketCategories = (ticketCategories = []) =>
  ticketCategories.map((ticket, index) => ({
    date_end: formatDateInputValue(ticket.date_time_end),
    date_start: formatDateInputValue(ticket.date_time_start),
    description: ticket.description || "",
    id: ticket.ticket_category_id || `existing-${index}`,
    name: ticket.name,
    price: ticket.price,
    quota: ticket.quota,
    time_end: formatTimeInputValue(ticket.date_time_end, "23:59"),
    time_start: formatTimeInputValue(ticket.date_time_start, "00:00"),
  }));

export const serializeTicketCategories = (tickets) =>
  tickets.map((ticket) => ({
    date_time_end: new Date(
      `${ticket.date_end}T${ticket.time_end}:00Z`,
    ).toISOString(),
    date_time_start: new Date(
      `${ticket.date_start}T${ticket.time_start}:00Z`,
    ).toISOString(),
    description: ticket.description,
    name: ticket.name,
    price: Number.parseFloat(ticket.price),
    quota: Number.parseInt(ticket.quota),
  }));
