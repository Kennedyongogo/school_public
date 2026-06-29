export function parseAssignmentChoices(q) {
  const opts = q?.options;
  if (opts && typeof opts === "object" && !Array.isArray(opts) && Array.isArray(opts.choices)) {
    const raw = opts.choices.map((c) => String(c || "").trim()).filter(Boolean);
    if (raw.length === 1 && raw[0].includes(",")) {
      return raw[0].split(",").map((s) => s.trim()).filter(Boolean);
    }
    return raw;
  }
  if (Array.isArray(opts)) return opts.map((o) => String(o || "").trim()).filter(Boolean);
  if (typeof opts === "string") return opts.split(",").map((o) => o.trim()).filter(Boolean);
  return [];
}

export function fileUploadConfig(q) {
  const o = q?.options && typeof q.options === "object" && !Array.isArray(q.options) ? q.options : {};
  const accept = Array.isArray(o.accept) ? o.accept : ["image/*", "application/pdf"];
  return {
    accept,
    maxFiles: Math.min(5, Math.max(1, Number(o.max_files) || 1)),
    maxSizeMb: Math.min(25, Math.max(1, Number(o.max_size_mb) || 10)),
    hint: String(o.upload_hint || "").trim(),
  };
}

export function defaultAnswerForQuestionType(questionType) {
  if (questionType === "multi_select") return [];
  if (questionType === "file_upload") return { files: [] };
  return "";
}

export function answerFromStoredRow(a, questionType) {
  if (!a) return defaultAnswerForQuestionType(questionType);
  if (a.answer_json != null) return a.answer_json;
  if (questionType === "multi_select") return [];
  if (questionType === "file_upload") return { files: [] };
  return a.answer_text || "";
}

export function serializeAnswerForSave(q, value) {
  if (q.question_type === "multi_select" || q.question_type === "file_upload") {
    return { answer_text: null, answer_json: value };
  }
  return { answer_text: String(value || ""), answer_json: null };
}

export function htmlAcceptFromMimeList(accept = []) {
  return accept.join(",");
}
