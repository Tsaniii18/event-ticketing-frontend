export const filterVenues = (venues, searchTerm) => {
  if (!searchTerm) return venues;
  const query = searchTerm.toLowerCase();

  return venues.filter((venue) =>
    [venue.name, venue.district, venue.address].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
};

export const isCustomVenueName = (venues, venueName) =>
  !venues.some((venue) => venue.name === venueName);
