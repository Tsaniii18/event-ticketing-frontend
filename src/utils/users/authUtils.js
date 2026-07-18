export const buildOrganizerRegistrationFormData = (form, ktpFile) => {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("ktp", ktpFile);

  return formData;
};
