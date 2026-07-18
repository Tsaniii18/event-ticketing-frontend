const normalizeDateStart = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeDateEnd = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const isSameCalendarDate = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) return false;
  return new Date(firstDate).toDateString() === new Date(secondDate).toDateString();
};

export const isTodayDate = (date, today = new Date()) =>
  isSameCalendarDate(date, today);

export const getEventsForCalendarDate = (events, date) => {
  if (!date) return [];
  const checkedDate = normalizeDateStart(date);

  return events.filter((event) => {
    if (!event.date_start) return false;
    const eventStart = normalizeDateStart(event.date_start);
    const eventEnd = normalizeDateEnd(event.date_end || event.date_start);
    return checkedDate >= eventStart && checkedDate <= eventEnd;
  });
};

export const getEventsForCalendarMonth = (events, currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return events
    .filter((event) => {
      if (!event.date_start) return false;
      const eventStart = new Date(event.date_start);
      const eventEnd = new Date(event.date_end || event.date_start);

      return (
        (eventStart >= monthStart && eventStart <= monthEnd) ||
        (eventEnd >= monthStart && eventEnd <= monthEnd) ||
        (eventStart < monthStart && eventEnd > monthEnd)
      );
    })
    .sort((firstEvent, secondEvent) =>
      new Date(firstEvent.date_start) - new Date(secondEvent.date_start),
    );
};

export const buildCalendarDays = (currentDate, totalCells = 42) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const previousMonthLastDay = new Date(year, month, 0).getDate();
  const days = [];

  for (let index = firstDay.getDay() - 1; index >= 0; index -= 1) {
    const day = previousMonthLastDay - index;
    days.push({
      date: new Date(year, month - 1, day),
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({
      date: new Date(year, month, day),
      day,
      isCurrentMonth: true,
    });
  }

  const remainingDays = totalCells - days.length;
  for (let day = 1; day <= remainingDays; day += 1) {
    days.push({
      date: new Date(year, month + 1, day),
      day,
      isCurrentMonth: false,
    });
  }

  return days;
};
