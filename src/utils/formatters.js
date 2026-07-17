export const formatCompactNumber = (number) => {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return number.toString();
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} minggu yang lalu`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} bulan yang lalu`;

  return `${Math.floor(diffInDays / 365)} tahun yang lalu`;
};

export const formatRupiah = (amount, freeLabel = "GRATIS") => {
  if (amount === 0) return freeLabel;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatOptionalRupiah = (amount) => {
  if (!amount && amount !== 0) return "Gratis";
  return formatRupiah(amount);
};

export const formatRupiahTitleCase = (amount) => formatRupiah(amount, "Gratis");

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyOrZero = (amount) => formatCurrency(amount || 0);

export const formatShortDateRange = (dateStart, dateEnd) => {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const formatOptions = { day: "numeric", month: "short", year: "numeric" };
  const startFormatted = start.toLocaleDateString("id-ID", formatOptions);
  const endFormatted = end.toLocaleDateString("id-ID", formatOptions);

  if (startFormatted === endFormatted) return startFormatted;
  return `${startFormatted} - ${endFormatted}`;
};

export const formatRawDateRange = (dateStart, dateEnd) => {
  return dateStart === dateEnd ? dateStart : `${dateStart} - ${dateEnd}`;
};

export const formatTimeRange = (dateStart, dateEnd) => {
  const options = { hour: "2-digit", minute: "2-digit" };
  const startTime = new Date(dateStart).toLocaleTimeString("id-ID", options);
  const endTime = new Date(dateEnd).toLocaleTimeString("id-ID", options);
  return `${startTime} - ${endTime}`;
};

export const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatOptionalShortDateRange = (dateStart, dateEnd) => {
  if (!dateStart) return "-";
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : start;
  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (start.toDateString() === end.toDateString()) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
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

export const formatLongDateOrEmpty = (dateString) => {
  return formatLongDate(dateString, "");
};

export const formatDateForDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatLongDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (dateString, fallback = "-") => {
  if (!dateString) return fallback;
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

export const formatFeedbackStatus = (status, completedLabel = "Selesai") => {
  const labels = {
    waiting: "Menunggu",
    processed: "Diproses",
    completed: completedLabel,
    rejected: "Ditolak",
  };

  return labels[status] || status;
};
