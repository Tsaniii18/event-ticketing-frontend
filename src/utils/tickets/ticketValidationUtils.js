import {
  formatDateForDisplay,
  formatNumericDate,
} from "../shared/formatters";

export const validateTicketDateRange = ({
  eventEnd,
  eventStart,
  formatDate = formatDateForDisplay,
  ticketEnd,
  ticketStart,
}) => {
  if (!eventStart || !eventEnd) {
    return {
      isValid: false,
      message: "Harap tentukan tanggal event terlebih dahulu",
    };
  }

  const eventStartDate = new Date(eventStart);
  const eventEndDate = new Date(eventEnd);
  const ticketStartDate = new Date(ticketStart);
  const ticketEndDate = new Date(ticketEnd);

  eventStartDate.setHours(0, 0, 0, 0);
  eventEndDate.setHours(23, 59, 59, 999);
  ticketStartDate.setHours(0, 0, 0, 0);
  ticketEndDate.setHours(23, 59, 59, 999);

  if (ticketStartDate < eventStartDate) {
    return {
      isValid: false,
      message: `Tanggal mulai tiket tidak boleh sebelum tanggal event (${formatDate(eventStart)})`,
    };
  }

  if (ticketEndDate > eventEndDate) {
    return {
      isValid: false,
      message: `Tanggal selesai tiket tidak boleh setelah tanggal event (${formatDate(eventEnd)})`,
    };
  }

  return { isValid: true };
};

export const validateTicketTiming = ({
  date_end: dateEnd,
  date_start: dateStart,
  time_end: timeEnd,
  time_start: timeStart,
}) => {
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) {
    return {
      isValid: false,
      message: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai!",
    };
  }

  if (startDate.getTime() !== endDate.getTime() || !timeStart || !timeEnd) {
    return { isValid: true };
  }

  const [startHour, startMinute] = timeStart.split(":").map(Number);
  const [endHour, endMinute] = timeEnd.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes > endMinutes) {
    return {
      isValid: false,
      message:
        "Jam mulai tidak boleh lebih besar dari jam selesai pada tanggal yang sama!",
    };
  }

  if (startMinutes === endMinutes) {
    return {
      isValid: false,
      message: "Jam mulai dan jam selesai tidak boleh sama!",
    };
  }

  return { isValid: true };
};

export const validateTicketSchedule = (ticket, eventDates) => {
  if (
    !ticket.name ||
    !ticket.quota ||
    !ticket.price ||
    !ticket.date_start ||
    !ticket.date_end
  ) {
    return {
      isValid: false,
      message: "Harap isi semua field yang wajib diisi!",
    };
  }

  const timingValidation = validateTicketTiming(ticket);
  if (!timingValidation.isValid) return timingValidation;

  const startDateTime = new Date(
    `${ticket.date_start}T${ticket.time_start}`,
  );
  const endDateTime = new Date(`${ticket.date_end}T${ticket.time_end}`);

  if (endDateTime <= startDateTime) {
    return {
      isValid: false,
      message: "Tanggal/waktu selesai harus setelah tanggal/waktu mulai!",
    };
  }

  if (eventDates?.start && eventDates?.end) {
    return validateTicketDateRange({
      eventEnd: eventDates.end,
      eventStart: eventDates.start,
      formatDate: formatNumericDate,
      ticketEnd: ticket.date_end,
      ticketStart: ticket.date_start,
    });
  }

  return { isValid: true };
};

export const getTicketsOutsideEventRange = (
  tickets,
  eventStart,
  eventEnd,
) =>
  tickets.filter(
    (ticket) =>
      !validateTicketDateRange({
        eventEnd,
        eventStart,
        ticketEnd: ticket.date_end,
        ticketStart: ticket.date_start,
      }).isValid,
  );

const adjustDateToChangedRange = ({
  currentDate,
  isStartDate,
  newEnd,
  newStart,
  previousEnd,
  previousStart,
}) => {
  if (!previousStart || !previousEnd) {
    return isStartDate ? newStart : newEnd;
  }

  const oldRangeStart = new Date(previousStart);
  const oldRangeEnd = new Date(previousEnd);
  const newRangeStart = new Date(newStart);
  const newRangeEnd = new Date(newEnd);
  const date = new Date(currentDate);

  oldRangeStart.setHours(0, 0, 0, 0);
  oldRangeEnd.setHours(0, 0, 0, 0);
  newRangeStart.setHours(0, 0, 0, 0);
  newRangeEnd.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const previousDuration = oldRangeEnd.getTime() - oldRangeStart.getTime();
  const newDuration = newRangeEnd.getTime() - newRangeStart.getTime();
  const relativePosition =
    previousDuration > 0
      ? (date.getTime() - oldRangeStart.getTime()) / previousDuration
      : 0;
  const boundedPosition = Math.max(0, Math.min(1, relativePosition));
  const adjustedDate = new Date(
    newRangeStart.getTime() + boundedPosition * newDuration,
  );

  if (adjustedDate < newRangeStart) return newStart;
  if (adjustedDate > newRangeEnd) return newEnd;

  return adjustedDate.toISOString().split("T")[0];
};

export const adjustTicketToEventRange = (
  ticket,
  previousEventDates,
  eventDates,
) => {
  const eventDatesChanged =
    eventDates.date_start !== previousEventDates.date_start ||
    eventDates.date_end !== previousEventDates.date_end;

  if (!eventDatesChanged) return ticket;

  const adjustedTicket = {
    ...ticket,
    date_end: adjustDateToChangedRange({
      currentDate: ticket.date_end,
      isStartDate: false,
      newEnd: eventDates.date_end,
      newStart: eventDates.date_start,
      previousEnd: previousEventDates.date_end,
      previousStart: previousEventDates.date_start,
    }),
    date_start: adjustDateToChangedRange({
      currentDate: ticket.date_start,
      isStartDate: true,
      newEnd: eventDates.date_end,
      newStart: eventDates.date_start,
      previousEnd: previousEventDates.date_end,
      previousStart: previousEventDates.date_start,
    }),
  };

  if (adjustedTicket.date_start > adjustedTicket.date_end) {
    adjustedTicket.date_end = adjustedTicket.date_start;
  }

  return adjustedTicket;
};
