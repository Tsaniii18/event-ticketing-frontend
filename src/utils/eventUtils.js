import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_DATA,
  DEFAULT_CATEGORY_DATA,
} from "./eventConstants";

export const getParentCategory = (category) => {
  if (!category) return "Lainnya";
  if (CATEGORIES[category]) return category;

  for (const [parent, children] of Object.entries(CATEGORIES)) {
    if (children.includes(category)) return parent;
  }

  return "Lainnya";
};

export const getCategoryColor = (category, status) => {
  if (status === "ended") return "bg-gray-400";
  return CATEGORY_COLORS[getParentCategory(category)] || CATEGORY_COLORS.Lainnya;
};

export const getCategoryData = (category) => {
  return CATEGORY_DATA[getParentCategory(category)] || DEFAULT_CATEGORY_DATA;
};

export const getDaysUntilEvent = (dateStart) => {
  if (!dateStart) return null;
  const timeDiff = new Date(dateStart) - new Date();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const getEventTimeLabel = (dateStart, status) => {
  if (status === "active") {
    return { text: "Sedang Berlangsung", color: "bg-green-600" };
  }

  const daysUntil = getDaysUntilEvent(dateStart);
  if (daysUntil === null || daysUntil < 0) return null;
  if (daysUntil === 0) return { text: "Hari ini", color: "bg-emerald-500" };
  if (daysUntil === 1) return { text: "Besok", color: "bg-emerald-500" };
  if (daysUntil <= 7) {
    return { text: `${daysUntil} hari`, color: "bg-emerald-500" };
  }
  return { text: `${daysUntil} hari`, color: "bg-brand-500" };
};

export const getLowestTicketPrice = (ticketCategories) => {
  if (!ticketCategories || ticketCategories.length === 0) return 0;
  return Math.min(...ticketCategories.map((category) => category.price));
};

export const getEventMinimumPrice = (event) => {
  if (!event.ticket_categories || event.ticket_categories.length === 0) return 0;
  const prices = event.ticket_categories
    .map((category) => category.price)
    .filter((price) => price !== undefined && price !== null);
  return prices.length === 0 ? 0 : Math.min(...prices);
};

export const getEventStatusLabel = (status) => {
  const labels = {
    ended: { text: "Berakhir", bgColor: "bg-gray-600" },
    active: { text: "Sedang Berlangsung", bgColor: "bg-green-600" },
    approved: { text: "Segera Hadir", bgColor: "bg-brand-600" },
  };

  return labels[status] || null;
};

export const getMinimumEventDate = () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  return minDate.toISOString().split("T")[0];
};
