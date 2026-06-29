export const SCHOOL_SCHEDULE_TIMEZONE = "Africa/Nairobi";

/** Show stored UTC instant as wall-clock in the school timezone (matches exam schedules). */
export function formatWallClockDateTime(iso, timeZone = SCHOOL_SCHEDULE_TIMEZONE) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(undefined, { timeZone, dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d.toLocaleString();
  }
}
