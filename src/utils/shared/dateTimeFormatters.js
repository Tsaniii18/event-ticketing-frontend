export const formatShortDateRange = (dateStart, dateEnd) => {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const formatOptions = { day: "numeric", month: "short", year: "numeric" };
  const startFormatted = start.toLocaleDateString("id-ID", formatOptions);
  const endFormatted = end.toLocaleDateString("id-ID", formatOptions);

  if (startFormatted === endFormatted) return startFormatted;
  return `${startFormatted} - ${endFormatted}`;
};

export const formatRawDateRange = (dateStart, dateEnd) =>
  dateStart === dateEnd ? dateStart : `${dateStart} - ${dateEnd}`;

export const formatTimeRange = (dateStart, dateEnd) => {
  const options = { hour: "2-digit", minute: "2-digit" };
  const startTime = new Date(dateStart).toLocaleTimeString("id-ID", options);
  const endTime = new Date(dateEnd).toLocaleTimeString("id-ID", options);
  return `${startTime} - ${endTime}`;
};

export const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatNumericDate = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("id-ID");
};

export const formatDayMonth = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

export const formatMonthDate = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatMonthShort = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("id-ID", { month: "short" });
};

export const formatDateInputValue = (dateValue, fallback = "") => {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().split("T")[0];
};

export const formatTimeInputValue = (dateValue, fallback = "") => {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toTimeString().slice(0, 5);
};

export const formatOptionalShortDateRange = (dateStart, dateEnd) => {
  if (!dateStart) return "-";
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : start;
  const startFormatted = formatShortDate(dateStart);
  const endFormatted = formatShortDate(dateEnd || dateStart);

  if (startFormatted === "-") return "-";
  if (endFormatted === "-") return startFormatted;

  if (start.toDateString() === end.toDateString()) return startFormatted;
  return `${startFormatted} - ${endFormatted}`;
};

export const formatLongDate = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatLongDateOrEmpty = (dateString) =>
  formatLongDate(dateString, "");

export const formatDateForDisplay = (dateString) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatLongDateTime = (dateTime) =>
  new Date(dateTime).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatTime = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatShortDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = formatShortDate(dateString);
  const time = formatTime(dateString, "");
  return time ? `${date} ${time}` : date;
};

export const formatOptionalTimeRange = (dateStart, dateEnd) => {
  const startTime = formatTime(dateStart, "");
  const endTime = formatTime(dateEnd, "");
  return startTime && endTime ? `${startTime} - ${endTime}` : "-";
};

export const formatFullDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
