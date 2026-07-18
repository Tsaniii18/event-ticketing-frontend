export const transformSelectableTicketCategories = (ticketCategories = []) =>
  ticketCategories.map((ticket) => ({
    date_time_end: ticket.date_time_end,
    date_time_start: ticket.date_time_start,
    desc: ticket.description || "Tiket masuk event",
    price: ticket.price,
    qty: 0,
    quota: ticket.quota,
    sold: ticket.sold || 0,
    stock: ticket.quota - (ticket.sold || 0),
    ticket_category_id: ticket.ticket_category_id,
    type: ticket.name,
  }));

export const getSelectedTickets = (tickets) =>
  tickets.filter((ticket) => ticket.qty > 0);

export const getSelectedTicketCartItems = (tickets) =>
  getSelectedTickets(tickets).map((ticket) => ({
    quantity: ticket.qty,
    ticket_category_id: ticket.ticket_category_id,
  }));

export const getSelectedTicketTotal = (tickets) =>
  tickets.reduce(
    (total, ticket) => total + Number(ticket.price) * ticket.qty,
    0,
  );

export const hasSelectedTickets = (tickets) =>
  tickets.some((ticket) => ticket.qty > 0);

export const updateTicketQuantity = (tickets, index, delta) =>
  tickets.map((ticket, ticketIndex) =>
    ticketIndex === index
      ? {
          ...ticket,
          qty: Math.min(Math.max(ticket.qty + delta, 0), ticket.stock),
        }
      : ticket,
  );

export const resetTicketQuantities = (tickets) =>
  tickets.map((ticket) => ({ ...ticket, qty: 0 }));
