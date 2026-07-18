import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_DATA,
  DEFAULT_CATEGORY_DATA,
} from "../constants/eventConstants";

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

export const getCategoryData = (category) =>
  CATEGORY_DATA[getParentCategory(category)] || DEFAULT_CATEGORY_DATA;

export const getChildEventCategories = (parentCategory) =>
  CATEGORIES[parentCategory] || [];

export const getAvailableEventCategories = (events, limit = 8) => {
  const categories = new Set();

  events.forEach((event) => {
    const parentCategory = getParentCategory(event.category);
    if (parentCategory !== "Lainnya") categories.add(parentCategory);
  });

  return Array.from(categories).slice(0, limit);
};
