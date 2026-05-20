/** Align with school_api/src/utils/examProctoring.js — live video only for live_monitor. */

export function isLiveInvigilationMode(schedule) {
  return String(schedule?.proctoring_mode || "").trim() === "live_monitor";
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

/** LiveKit video room — only when exam is live invigilation and platform is LiveKit. */
export function scheduleUsesLiveKit(schedule) {
  if (!schedule || !isLiveInvigilationMode(schedule)) return false;
  const provider = String(schedule.meeting_provider || "").toLowerCase();
  return schedule.video_mode === "livekit" || provider === "livekit";
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
