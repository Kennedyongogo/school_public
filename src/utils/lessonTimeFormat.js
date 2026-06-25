function parseTimeParts(value) {
  if (value == null || String(value).trim() === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { hours: value.getUTCHours(), minutes: value.getUTCMinutes() };
  }
  const s = String(value).trim();
  const isoMatch = s.match(/T(\d{1,2}):(\d{2})/);
  if (isoMatch) {
    return { hours: Number(isoMatch[1]), minutes: Number(isoMatch[2]) };
  }
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { hours: Number(m[1]), minutes: Number(m[2]) };
}

export function formatTimeAmPm(value) {
  const parts = parseTimeParts(value);
  if (!parts) return "—";
  const { hours, minutes } = parts;
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function formatLessonTimeRange(start, end) {
  const a = formatTimeAmPm(start);
  const b = formatTimeAmPm(end);
  if (a === "—" && b === "—") return "—";
  if (a === "—") return b;
  if (b === "—") return a;
  return `${a} – ${b}`;
}
