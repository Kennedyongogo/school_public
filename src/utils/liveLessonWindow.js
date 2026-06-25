const EARLY_JOIN_MINUTES = 15;
const LIVE_SESSION_GRACE_MINUTES = 60;
const DEFAULT_SCHEDULE_TIMEZONE = "Africa/Nairobi";

const TZ_OFFSETS = {
  "Africa/Nairobi": "+03:00",
  "Africa/Kampala": "+03:00",
  "Africa/Addis_Ababa": "+03:00",
  "Africa/Dar_es_Salaam": "+03:00",
};

function normalizeTimeToHms(timeValue) {
  if (timeValue == null || String(timeValue).trim() === "") return "00:00:00";
  if (timeValue instanceof Date && !Number.isNaN(timeValue.getTime())) {
    const h = String(timeValue.getUTCHours()).padStart(2, "0");
    const m = String(timeValue.getUTCMinutes()).padStart(2, "0");
    const sec = String(timeValue.getUTCSeconds()).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }
  let s = String(timeValue).trim();
  const isoTime = s.match(/T(\d{2}:\d{2}:\d{2})/);
  if (isoTime) return isoTime[1];
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
    if (s.length === 5) s = `${s}:00`;
    return s.slice(0, 8);
  }
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

function parseOptionalDate(value) {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getLessonJoinWindow({
  lesson_date,
  starts_at,
  ends_at,
  session_status,
  timezone = DEFAULT_SCHEDULE_TIMEZONE,
  early_minutes = EARLY_JOIN_MINUTES,
  live_end_time = null,
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

  if (session_status === "live") {
    return { can_join: true, reason: null };
  }

  let closesAt = end;
  const liveEnd = parseOptionalDate(live_end_time);
  if (liveEnd && liveEnd.getTime() > closesAt.getTime()) {
    closesAt = liveEnd;
  }
  if (session_status === "scheduled" && liveEnd) {
    closesAt = new Date(closesAt.getTime() + LIVE_SESSION_GRACE_MINUTES * 60 * 1000);
  }

  if (now > closesAt) {
    return {
      can_join: false,
      reason: "This class time has passed. The join button is no longer available.",
    };
  }

  return { can_join: true, reason: null };
}
