const EARLY_JOIN_MINUTES = 15;
const DEFAULT_SCHEDULE_TIMEZONE = "Africa/Nairobi";

const TZ_OFFSETS = {
  "Africa/Nairobi": "+03:00",
  "Africa/Kampala": "+03:00",
  "Africa/Addis_Ababa": "+03:00",
  "Africa/Dar_es_Salaam": "+03:00",
};

function normalizeTimeToHms(timeValue) {
  if (timeValue == null || String(timeValue).trim() === "") return "00:00:00";
  let s = String(timeValue).trim();
  if (s.length === 5) s = `${s}:00`;
  return s.slice(0, 8);
}

function lessonSlotToDate(lessonDate, timeValue, timezone = DEFAULT_SCHEDULE_TIMEZONE) {
  if (!lessonDate) return null;
  const dateStr = String(lessonDate).slice(0, 10);
  const timeStr = normalizeTimeToHms(timeValue);
  const offset = TZ_OFFSETS[timezone] || TZ_OFFSETS[DEFAULT_SCHEDULE_TIMEZONE];
  const d = new Date(`${dateStr}T${timeStr}${offset}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getLessonJoinWindow({
  lesson_date,
  starts_at,
  ends_at,
  session_status,
  timezone = DEFAULT_SCHEDULE_TIMEZONE,
  early_minutes = EARLY_JOIN_MINUTES,
}) {
  if (session_status === "ended" || session_status === "cancelled") {
    return {
      can_join: false,
      reason: "This class session has ended.",
    };
  }

  const scheduleTimezone =
    timezone != null && String(timezone).trim() !== "" ? String(timezone).trim() : DEFAULT_SCHEDULE_TIMEZONE;
  const slotStart = lessonSlotToDate(lesson_date, starts_at, scheduleTimezone);
  const slotEnd = lessonSlotToDate(lesson_date, ends_at || starts_at, scheduleTimezone);

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
