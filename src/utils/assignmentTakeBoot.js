import {
  createSchoolPortalAssignmentSubmission,
  fetchSchoolPortalMyAssignmentSubmission,
} from "../api";

/** Load assignment + draft submission (creates draft when needed). */
export async function bootAssignmentTake(assignmentId) {
  let payload = await fetchSchoolPortalMyAssignmentSubmission(assignmentId);

  if (!payload.submission && !payload.access?.is_submitted && !payload.access?.is_closed) {
    await createSchoolPortalAssignmentSubmission(assignmentId);
    payload = await fetchSchoolPortalMyAssignmentSubmission(assignmentId);
  }

  return payload;
}
