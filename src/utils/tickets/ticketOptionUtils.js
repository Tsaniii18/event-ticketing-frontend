const generateTimeOptions = () => {
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

export const filterTicketCategoryOptions = (categories, searchTerm) => {
  const query = searchTerm.toLowerCase();
  return categories.filter((category) =>
    category.toLowerCase().includes(query),
  );
};
