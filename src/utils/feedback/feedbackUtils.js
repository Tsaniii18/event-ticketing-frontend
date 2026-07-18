export const sortFeedbackByNewest = (feedback) =>
  [...feedback].sort(
    (firstFeedback, secondFeedback) =>
      new Date(secondFeedback.created_at) -
      new Date(firstFeedback.created_at),
  );

export const getFeedbackCategories = (feedback) =>
  [...new Set(feedback.map((item) => item.feedback_category))];

export const filterFeedbackReports = (
  reports,
  { category = "all", searchTerm = "", status = "all" } = {},
) => {
  const query = searchTerm.toLowerCase();

  return reports.filter((report) => {
    const matchesUser =
      !query ||
      [report.user?.name, report.user?.email].some((value) =>
        value?.toLowerCase().includes(query),
      );
    const matchesStatus = status === "all" || report.status === status;
    const matchesCategory =
      category === "all" || report.feedback_category === category;

    return matchesUser && matchesStatus && matchesCategory;
  });
};

export const getFeedbackFormCategory = (form) =>
  form.feedback_category === "other"
    ? form.custom_category
    : form.feedback_category;

export const buildFeedbackFormData = (form, image) => {
  const formData = new FormData();
  formData.append("feedback_category", getFeedbackFormCategory(form));
  formData.append("comment", form.comment);
  if (image) formData.append("image", image);
  return formData;
};
