import { formatOptionalShortDateRange } from "../shared/formatters";
import { getCategoryColor, getParentCategory } from "./eventCategoryUtils";

export const getLikedEventIds = (likedEvents = []) =>
  new Set(likedEvents.map((event) => event.event_id));

export const getLikeCountAfterToggle = (currentCount, wasLiked) =>
  wasLiked
    ? Math.max(0, (currentCount || 1) - 1)
    : (currentCount || 0) + 1;

export const updateEventLikeCount = (
  events,
  eventId,
  wasLiked,
  { countKey = "total_likes", idKey = "event_id" } = {},
) =>
  events.map((event) => {
    if (event[idKey] !== eventId) return event;

    return {
      ...event,
      [countKey]: getLikeCountAfterToggle(event[countKey], wasLiked),
    };
  });

export const transformLikedEvents = (events) =>
  events.map((event) => ({
    ...event,
    categoryColor: getCategoryColor(event.category),
    formattedDate: formatOptionalShortDateRange(
      event.date_start,
      event.date_end,
    ),
    parentCategory: getParentCategory(event.category),
  }));

export const filterAndSortLikedEvents = (
  events,
  {
    category = "",
    searchTerm = "",
    sortBy = "date",
    sortOrder = "desc",
  } = {},
) => {
  let filteredEvents = category
    ? events.filter((event) => event.parentCategory === category)
    : [...events];

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredEvents = filteredEvents.filter((event) =>
      [event.name, event.venue, event.location, event.category].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }

  return filteredEvents.sort((firstEvent, secondEvent) => {
    let comparison;

    if (sortBy === "likes") {
      comparison =
        (firstEvent.total_likes || 0) - (secondEvent.total_likes || 0);
    } else if (sortBy === "name") {
      comparison = (firstEvent.name || "").localeCompare(
        secondEvent.name || "",
      );
    } else {
      comparison =
        new Date(firstEvent.date_start || 0) -
        new Date(secondEvent.date_start || 0);
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
};
