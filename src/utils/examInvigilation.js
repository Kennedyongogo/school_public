/** Align with school_api/src/utils/examProctoring.js — live video only for live_monitor. */

export function isLiveInvigilationMode(schedule) {
  return String(schedule?.proctoring_mode || "").trim() === "live_monitor";
}

/** True when now is between exam start_time and end_time (inclusive if times exist). */
export function isExamScheduleWindowOpen(schedule) {
  const now = Date.now();
  const start = schedule?.start_time ? new Date(schedule.start_time).getTime() : null;
  const end = schedule?.end_time ? new Date(schedule.end_time).getTime() : null;
  if (Number.isFinite(start) && now < start) return false;
  if (Number.isFinite(end) && now > end) return false;
  return true;
}

export function isActivityMonitorMode(schedule) {
  const m = String(schedule?.proctoring_mode || "").trim();
  return m === "record_only" || m === "strict_auto";
}

/** Student must use invigilation lobby/room before the exam paper (live invigilation only). */
export function scheduleRequiresInvigilationRoom(schedule) {
  if (!schedule) return false;
  if (isLiveInvigilationMode(schedule)) return true;
  if (schedule.exam_access_policy === "paper_plus_room_required") return true;
  return false;
}

/** LiveKit in-app video for live invigilation exams. */
export function scheduleUsesLiveKit(schedule) {
  if (!schedule || !isLiveInvigilationMode(schedule)) return false;
  const provider = String(schedule.meeting_provider || schedule.platform || "").toLowerCase();
  return schedule.video_mode === "livekit" || provider === "livekit";
}

export function scheduleUsesGoogleMeet(schedule) {
  if (!schedule || !isLiveInvigilationMode(schedule)) return false;
  const provider = String(schedule.meeting_provider || schedule.platform || "").toLowerCase().replace(/-/g, "_");
  return schedule.video_mode === "google_meet" || provider === "google_meet" || provider === "googlemeet";
}

export function examInvigilationSessionKey(scheduleId) {
  return `exam-invigilation-admitted-${scheduleId}`;
}

/** True only after student was admitted and tapped "Continue to exam paper" this session. */
export function hasExamInvigilationPaperAccess(scheduleId) {
  if (!scheduleId || typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(examInvigilationSessionKey(scheduleId)) === "1";
}

export function grantExamInvigilationPaperAccess(scheduleId) {
  if (scheduleId && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(examInvigilationSessionKey(scheduleId), "1");
  }
}

export function clearExamInvigilationPaperAccess(scheduleId) {
  if (scheduleId && typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(examInvigilationSessionKey(scheduleId));
  }
}
