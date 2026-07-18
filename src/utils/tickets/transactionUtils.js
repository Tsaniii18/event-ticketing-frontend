import { TRANSACTION_STATUS_CONFIG } from "../constants/ticketConstants";
import { formatShortDate } from "../shared/formatters";

const getTransactionStatusLabel = (status) =>
  TRANSACTION_STATUS_CONFIG[status]?.label || status;

const groupTicketsByCategory = (ticketDetails) => {
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

export const transformTransactionHistory = (transactions) =>
  transactions.map((transaction) => ({
    events:
      transaction.events?.map((event) => ({
        address: event.location,
        city: event.city,
        details: groupTicketsByCategory(event.ticket_details),
        endDate: formatShortDate(event.date_end),
        eventName: event.event_name,
        eventSubtotal: event.event_subtotal,
        id: event.event_id,
        image: event.image,
        startDate: formatShortDate(event.date_start),
        venue: event.venue,
      })) || [],
    linkPayment: transaction.link_payment,
    status: transaction.transaction_status,
    statusLabel: getTransactionStatusLabel(transaction.transaction_status),
    totalAmount: transaction.price_total,
    transactionDate: formatShortDate(transaction.transaction_time),
    transactionDateTime: new Date(transaction.transaction_time),
    transactionId: transaction.transaction_id,
    transactionTime: transaction.transaction_time,
  }));

export const filterAndSortTransactions = (
  transactions,
  {
    searchTerm = "",
    sortBy = "date",
    sortOrder = "desc",
    status = "all",
  } = {},
) => {
  let filteredTransactions =
    status === "all"
      ? [...transactions]
      : transactions.filter((transaction) => transaction.status === status);

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (transaction) =>
        transaction.transactionId.toLowerCase().includes(query) ||
        transaction.events.some((event) =>
          event.eventName.toLowerCase().includes(query),
        ),
    );
  }

  return filteredTransactions.sort((firstTransaction, secondTransaction) => {
    let comparison;

    if (sortBy === "amount") {
      comparison =
        firstTransaction.totalAmount - secondTransaction.totalAmount;
    } else if (sortBy === "status") {
      comparison = firstTransaction.status.localeCompare(
        secondTransaction.status,
      );
    } else {
      comparison =
        firstTransaction.transactionDateTime -
        secondTransaction.transactionDateTime;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
};
