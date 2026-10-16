/** Calendar day on the learner's device, including around midnight and DST. */
export function localDate(date = new Date(), offsetDays = 0): string {
  const value = new Date(date);
  value.setDate(value.getDate() + offsetDays);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
