import { TRANSACTION_STATUS_CONFIG } from "./ticketConstants";

export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`,
      );
    }
  }
  return times;
};

export const TIME_OPTIONS = generateTimeOptions();

export const getTransactionStatusLabel = (status) => {
  return TRANSACTION_STATUS_CONFIG[status]?.label || status;
};

export const groupTicketsByCategory = (ticketDetails) => {
  if (!ticketDetails || ticketDetails.length === 0) return [];

  const grouped = {};

  ticketDetails.forEach((ticket) => {
    const key = ticket.ticket_category_id;

    if (!grouped[key]) {
      grouped[key] = {
        type: ticket.category_name,
        description: ticket.description,
        price: ticket.price,
        startDate: new Date(ticket.date_time_start).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        endDate: new Date(ticket.date_time_end).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        dateTimeStart: ticket.date_time_start,
        dateTimeEnd: ticket.date_time_end,
        ticketCategoryId: ticket.ticket_category_id,
        quantity: 0,
        tickets: [],
      };
    }

    grouped[key].quantity += 1;
    grouped[key].tickets.push({
      ticketId: ticket.ticket_id,
      code: ticket.code,
      status: ticket.status,
    });
  });

  return Object.values(grouped);
};

export const transformCartData = (backendCarts) => {
  const eventMap = {};

  backendCarts.forEach((cartItem) => {
    const eventId = cartItem.event?.event_id || cartItem.event_id;
    const eventName = cartItem.event?.name || "Unknown Event";
    const eventImage =
      cartItem.event?.image || "https://picsum.photos/600/600?random=21";
    const eventDate =
      cartItem.event?.date_start || cartItem.ticket_category?.date_time_start;
    const eventLocation = cartItem.event?.location || "Lokasi tidak tersedia";

    if (!eventMap[eventId]) {
      eventMap[eventId] = {
        eventId,
        eventName,
        eventPoster: eventImage,
        eventDate,
        eventLocation,
        tickets: [],
      };
    }

    if (cartItem.ticket_category) {
      eventMap[eventId].tickets.push({
        cartId: cartItem.cart_id,
        ticketId: cartItem.ticket_category.ticket_category_id,
        name: cartItem.ticket_category.name,
        description: cartItem.ticket_category.description,
        price: cartItem.ticket_category.price,
        qty: cartItem.quantity,
        stock: cartItem.ticket_category.quota - cartItem.ticket_category.sold,
        dateTimeStart: cartItem.ticket_category.date_time_start,
        dateTimeEnd: cartItem.ticket_category.date_time_end,
      });
    }
  });

  return Object.values(eventMap);
};
