import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Button from "../common/Button";
import { filterVenues, joinClasses } from "../../utils";

export function DescriptionWithNewlines({
  className = "ui-helper mb-3",
  fallback = null,
  text,
}) {
  if (!text) return fallback;

  const classes = joinClasses("whitespace-pre-line", className);

  return (
    <div className={classes}>{text}</div>
  );
}

export function VenueDropdown({
  value,
  venues,
  onChange,
  onCustomVenueToggle,
  isCustomVenue,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredVenues = useMemo(() => {
    return filterVenues(venues, searchTerm);
  }, [searchTerm, venues]);

  const updateField = (name, fieldValue) => {
    onChange({ target: { name, value: fieldValue } });
  };

  const handleSelectVenue = (venue) => {
    if (venue.name === "Lainnya") {
      onCustomVenueToggle(true);
      updateField("venue", "");
      setSearchTerm("");
    } else {
      onCustomVenueToggle(false);
      updateField("venue", venue.name);
      setSearchTerm(venue.name);
      if (venue.district) updateField("district", venue.district);
      if (venue.address) updateField("location", venue.address);
    }
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);

    if (isCustomVenue || inputValue !== "") {
      updateField("venue", inputValue);
    }
  };

  const handleCustomVenueToggle = () => {
    onCustomVenueToggle(!isCustomVenue);
    updateField("venue", "");
    setSearchTerm("");
  };

  const displayValue = isCustomVenue ? value : searchTerm;

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          className="ui-input px-10"
          placeholder={
            isCustomVenue ? "Masukkan nama venue custom..." : "Cari venue..."
          }
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {(searchTerm || value) && !isCustomVenue && (
          <Button unstyled
            type="button"
            onClick={() => {
              setSearchTerm("");
              updateField("venue", "");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {!isCustomVenue && isOpen && filteredVenues.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredVenues.map((venue) => (
            <Button unstyled
              key={venue.name}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b-0 border-gray-100"
              onClick={() => handleSelectVenue(venue)}
            >
              <div className="font-medium text-gray-900">{venue.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Kecamatan:</span> {venue.district}
              </div>
              <div className="text-sm text-gray-600 truncate">
                <span className="font-medium">Alamat:</span> {venue.address}
              </div>
            </Button>
          ))}
        </div>
      )}

      <Button unstyled
        type="button"
        onClick={handleCustomVenueToggle}
        className="mt-2 block text-sm font-medium text-brand-600 hover:text-brand-800"
      >
        {isCustomVenue
          ? "Pilih dari daftar venue"
          : "Venue tidak ada di daftar? Klik di sini"}
      </Button>
    </div>
  );
}
