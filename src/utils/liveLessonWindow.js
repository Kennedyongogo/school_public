const EARLY_JOIN_MINUTES = 15;

function parseClockOnDate(dateOnly, timeValue) {
  if (!dateOnly) return null;
  const dateStr = String(dateOnly).slice(0, 10);
  const timeStr = timeValue != null && String(timeValue).trim() !== "" ? String(timeValue).slice(0, 8) : "00:00:00";
  const d = new Date(`${dateStr}T${timeStr}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getLessonJoinWindow({
  lesson_date,
  starts_at,
  ends_at,
  session_status,
  early_minutes = EARLY_JOIN_MINUTES,
}) {
  if (session_status === "ended" || session_status === "cancelled") {
    return {
      can_join: false,
      reason: "This class session has ended.",
    };
  }

  const slotStart = parseClockOnDate(lesson_date, starts_at);
  const slotEnd = parseClockOnDate(lesson_date, ends_at || starts_at);

  if (!slotStart || !slotEnd) {
    return { can_join: true, reason: null };
  }

  let end = slotEnd;
  if (end.getTime() <= slotStart.getTime()) {
    end = new Date(slotStart.getTime() + 60 * 60 * 1000);
  }

  const opensAt = new Date(slotStart.getTime() - early_minutes * 60 * 1000);
  const now = new Date();

  if (now < opensAt) {
    return {
      can_join: false,
      reason: "Not open yet — you can join shortly before class starts.",
    };
  }

  if (now > end) {
    return {
      can_join: false,
      reason: "This class time has passed.",
    };
  }

  return { can_join: true, reason: null };
}
