export const formatRupiah = (amount, freeLabel = "GRATIS") => {
  if (amount === 0) return freeLabel;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatOptionalRupiah = (amount) => {
  if (!amount && amount !== 0) return "Gratis";
  return formatRupiah(amount);
};

export const formatRupiahTitleCase = (amount) =>
  formatRupiah(amount, "Gratis");

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyOrZero = (amount) => formatCurrency(amount || 0);
