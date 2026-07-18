import { formatDateInputValue } from "../shared/formatters";
import { getParentCategory } from "./eventCategoryUtils";

export const filterEventSearchResults = (
  events,
  {
    category = "",
    date = "",
    district = "",
    keyword = "",
    sortBy = "popularitas",
    status = "",
  } = {},
) => {
  const query = keyword.toLowerCase();
  const selectedDate = date ? new Date(date) : null;

  let filteredEvents = events.filter((event) => {
    const matchesKeyword = !query || event.name.toLowerCase().includes(query);
    const matchesDate =
      !selectedDate ||
      (selectedDate >= new Date(event.date_start) &&
        selectedDate <= new Date(event.date_end));
    const matchesCategory =
      !category || getParentCategory(event.category) === category;
    const matchesDistrict = !district || event.district === district;
    const matchesStatus = !status || event.status === status;

    return (
      matchesKeyword &&
      matchesDate &&
      matchesCategory &&
      matchesDistrict &&
      matchesStatus
    );
  });

  if (sortBy === "popularitas") {
    return filteredEvents.sort(
      (firstEvent, secondEvent) =>
        (secondEvent.total_likes || 0) - (firstEvent.total_likes || 0),
    );
  }

  if (sortBy === "terlaris") {
    return filteredEvents.sort(
      (firstEvent, secondEvent) =>
        (secondEvent.total_tickets_sold || 0) -
        (firstEvent.total_tickets_sold || 0),
    );
  }

  if (sortBy === "terdekat") {
    const now = new Date();
    filteredEvents = filteredEvents.filter(
      (event) => new Date(event.date_end) >= now,
    );
    return filteredEvents.sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.date_start) - new Date(secondEvent.date_start),
    );
  }

  return filteredEvents;
};

export const filterOwnedEvents = (
  events,
  {
    category = "",
    date = "",
    district = "",
    searchTerm = "",
    status = "all",
  } = {},
) => {
  const query = searchTerm.toLowerCase();

  return events.filter((event) => {
    const matchesSearch =
      !query ||
      [event.name, event.location, event.venue].some((value) =>
        value?.toLowerCase().includes(query),
      );
    const matchesStatus = status === "all" || event.status === status;
    const matchesCategory =
      !category || getParentCategory(event.category) === category;
    const matchesDistrict = !district || event.district === district;
    const matchesDate =
      !date || formatDateInputValue(event.date_start) === date;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesDistrict &&
      matchesDate
    );
  });
};

export const filterVerificationEvents = (
  events,
  { date = "", searchTerm = "", status = "" } = {},
) => {
  const query = searchTerm.toLowerCase();

  return events.filter(
    (event) =>
      (!query || event.name.toLowerCase().includes(query)) &&
      (!date || formatDateInputValue(event.date_start) === date) &&
      (!status || event.status === status),
  );
};

export const filterCalendarEvents = (
  events,
  {
    category = "",
    district = "",
    searchTerm = "",
    status = "",
  } = {},
) => {
  const query = searchTerm.toLowerCase();

  return events.filter((event) => {
    const matchesSearch =
      !query ||
      [event.name, event.location, event.venue].some((value) =>
        value?.toLowerCase().includes(query),
      );
    const matchesCategory =
      !category || getParentCategory(event.category) === category;
    const matchesDistrict = !district || event.district === district;
    const matchesStatus = !status || event.status === status;

    return matchesSearch && matchesCategory && matchesDistrict && matchesStatus;
  });
};
