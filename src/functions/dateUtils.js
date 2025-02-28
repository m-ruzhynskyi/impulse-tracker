export const parseRangeId = (rangeId) => {
  const [startStr, endStr] = rangeId.split("_");
  const parseDate = (str) => {
    const [day, month] = str.split("-");
    return new Date(new Date().getFullYear(), month - 1, day);
  };
  return { start: parseDate(startStr), end: parseDate(endStr) };
};

export const formatDate = (startDate, daysToAdd) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysToAdd);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getRangeId = (quantOfDays, dayToStart) => {
  return quantOfDays > 0 && dayToStart
    ? `${formatDate(dayToStart, 0)}_${formatDate(dayToStart, quantOfDays - 1)}`
    : null;
};

export const dateDDMMYYYY = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getFullYear()}`;
};
