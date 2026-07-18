export const countByStatus = (items, statuses, statusKey = "status") => {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  counts.all = items.length;

  items.forEach((item) => {
    const status = item[statusKey];
    if (status in counts) counts[status] += 1;
  });

  return counts;
};

export const sumBy = (items, getValue) =>
  items.reduce((total, item) => total + Number(getValue(item) || 0), 0);

export const hasPositiveValue = (items, valueKey = "value") =>
  Boolean(items?.some((item) => Number(item[valueKey]) > 0));

export const toggleSetValue = (values, value) => {
  const updatedValues = new Set(values);

  if (updatedValues.has(value)) updatedValues.delete(value);
  else updatedValues.add(value);

  return updatedValues;
};

export const replaceItemByKey = (
  items,
  updatedItem,
  key = "id",
) =>
  items.map((item) =>
    item[key] === updatedItem[key] ? updatedItem : item,
  );

export const removeItemByKey = (items, value, key = "id") =>
  items.filter((item) => item[key] !== value);

export const updateItemByKey = (
  items,
  value,
  updates,
  key = "id",
) =>
  items.map((item) =>
    item[key] === value ? { ...item, ...updates } : item,
  );

export const filterVisibleCountItems = (items, alwaysVisibleKey = "all") =>
  items.filter(
    (item) => item.key === alwaysVisibleKey || item.count > 0,
  );

export const sumByStatus = (
  items,
  status,
  getValue,
  statusKey = "status",
) => sumBy(items.filter((item) => item[statusKey] === status), getValue);

export const chunkItems = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

export const hasItemByKey = (items, value, key = "id") =>
  items.some((item) => item[key] === value);
