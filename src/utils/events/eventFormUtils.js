import { serializeTicketCategories } from "../tickets/ticketFormUtils";

export const buildEventFormData = ({
  bannerFile,
  formData,
  posterFile,
  tickets,
}) => {
  const submitData = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (!value) return;
    submitData.append(
      key,
      key === "date_start" || key === "date_end"
        ? new Date(value).toISOString()
        : value,
    );
  });

  if (posterFile) submitData.append("image", posterFile);
  if (bannerFile) submitData.append("flyer", bannerFile);
  if (tickets.length > 0) {
    submitData.append(
      "ticket_categories",
      JSON.stringify(serializeTicketCategories(tickets)),
    );
  }

  return submitData;
};

export const getMinimumEventDate = (referenceDate = new Date()) => {
  const minDate = new Date(referenceDate || Date.now());
  minDate.setDate(minDate.getDate() + 7);
  return minDate.toISOString().split("T")[0];
};

export const canEditEvent = (status) =>
  status === "pending" || status === "rejected";
