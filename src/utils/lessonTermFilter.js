/**
 * Match portal/API term scoping: student sees only lessons for their term.
 */
export function filterLessonsForStudentTerm(lessons, studentTermId) {
  if (!Array.isArray(lessons)) return [];
  const termId = studentTermId != null && String(studentTermId).trim() !== "" ? String(studentTermId) : null;
  return lessons.filter((row) => {
    const lessonTermId = row?.curriculum_class_level?.id || null;
    if (lessonTermId) {
      return termId && String(lessonTermId) === termId;
    }
    return !termId;
  });
}
