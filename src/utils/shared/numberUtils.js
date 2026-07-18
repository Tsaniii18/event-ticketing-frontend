export const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export const calculatePercentage = (
  value,
  total,
  { maximum, precision } = {},
) => {
  if (total <= 0) return precision === undefined ? 0 : (0).toFixed(precision);

  const percentage = (value / total) * 100;
  const boundedPercentage =
    maximum === undefined
      ? percentage
      : Math.min(percentage, maximum);

  return precision === undefined
    ? boundedPercentage
    : boundedPercentage.toFixed(precision);
};
