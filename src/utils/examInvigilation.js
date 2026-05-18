/** Student must use invigilation room (wait for admit + camera) before the exam paper. */
export function scheduleRequiresInvigilationRoom(schedule) {
  if (!schedule) return false;
  if (schedule.exam_access_policy === "paper_plus_room_required") return true;
  if (schedule.proctoring_mode === "live_monitor" || schedule.proctoring_mode === "strict_auto") return true;
  const provider = String(schedule.meeting_provider || "").toLowerCase();
  if (schedule.video_mode === "livekit" || provider === "livekit") return true;
  if (schedule.meeting_id || schedule.meeting_join_url) return true;
  return false;
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
