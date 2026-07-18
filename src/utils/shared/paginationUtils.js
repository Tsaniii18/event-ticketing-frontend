export const getPaginationItems = (
  currentPage,
  totalPages,
  maxVisiblePages = 5,
) => {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      ...Array.from({ length: 4 }, (_, index) => totalPages - 3 + index),
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const paginateItems = (items, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    endItem: Math.min(endIndex, items.length),
    items: items.slice(startIndex, endIndex),
    startItem: items.length === 0 ? 0 : startIndex + 1,
    totalPages: Math.ceil(items.length / itemsPerPage),
  };
};
