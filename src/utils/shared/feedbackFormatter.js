export const formatFeedbackStatus = (status, completedLabel = "Selesai") => {
  const labels = {
    waiting: "Menunggu",
    processed: "Diproses",
    completed: completedLabel,
    rejected: "Ditolak",
  };

  return labels[status] || status;
};
