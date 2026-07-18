export const partitionCartResults = (results) => {
  const isSuccessful = (result) =>
    result.status === "fulfilled" &&
    (result.value.status === 200 || result.value.status === 201);

  return {
    failed: results.filter((result) => !isSuccessful(result)),
    successful: results.filter(isSuccessful),
  };
};

export const getCartFailureMessages = (failedResults) =>
  failedResults.map((result) => {
    if (result.status === "rejected") {
      return (
        result.reason?.response?.data?.error ||
        result.reason?.message ||
        "Error tidak diketahui"
      );
    }

    return result.value?.data?.error || `Status: ${result.value.status}`;
  });

export const getCartTotal = (cart) =>
  cart.reduce(
    (total, event) =>
      total +
      event.tickets.reduce(
        (ticketTotal, ticket) => ticketTotal + ticket.price * ticket.qty,
        0,
      ),
    0,
  );

export const hasOnlyFreeTickets = (cart) =>
  cart.length > 0 &&
  !cart.some((event) =>
    event.tickets.some((ticket) => Number(ticket.price) > 0),
  );

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
