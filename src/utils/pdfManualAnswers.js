export const PDF_MANUAL_ANSWER_MODE = "manual";
export const PDF_MAX_WORKING_PAPERS = 20;

export function createManualAnswerEntry() {
  return {
    id: `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    question: "",
    answer: "",
  };
}

export function formatLegacyPdfAnswerValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "").trim();
}

export function normalizeWorkingPapers(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((file, index) => ({
    id: String(file?.id || `paper-${index + 1}`),
    url: String(file?.url || "").trim(),
    name: String(file?.name || "").trim(),
    mime: String(file?.mime || "").trim(),
    size: Number.isFinite(Number(file?.size)) ? Number(file.size) : null,
    uploaded_at: file?.uploaded_at || null,
  }));
}

export function coercePdfAnswersJson(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return typeof raw === "object" ? raw : null;
}

export function parseManualPdfAnswers(raw) {
  const answers = coercePdfAnswersJson(raw);
  if (!answers) {
    return { mode: PDF_MANUAL_ANSWER_MODE, entries: [createManualAnswerEntry()], working_papers: [] };
  }
  const working_papers = normalizeWorkingPapers(answers.working_papers);
  if (Array.isArray(answers.entries)) {
    const entries = answers.entries.map((entry, index) => ({
      id: String(entry?.id || `entry-${index + 1}`),
      question: String(entry?.question ?? ""),
      answer: String(entry?.answer ?? ""),
    }));
    return {
      mode: PDF_MANUAL_ANSWER_MODE,
      entries: entries.length ? entries : [createManualAnswerEntry()],
      working_papers,
    };
  }
  const legacyEntries = Object.entries(answers)
    .filter(([key]) => !["mode", "entries", "working_papers"].includes(key))
    .map(([key, value], index) => ({
      id: `legacy-${index + 1}`,
      question: key.replace(/^q/i, "Q"),
      answer: formatLegacyPdfAnswerValue(value),
    }));
  return {
    mode: PDF_MANUAL_ANSWER_MODE,
    entries: legacyEntries.length ? legacyEntries : [createManualAnswerEntry()],
    working_papers,
  };
}

export function serializeManualPdfAnswers(entries, workingPapers) {
  const payload = {
    mode: PDF_MANUAL_ANSWER_MODE,
    entries: (Array.isArray(entries) ? entries : []).map((entry, index) => ({
      id: String(entry?.id || `entry-${index + 1}`),
      question: String(entry?.question ?? ""),
      answer: String(entry?.answer ?? ""),
    })),
  };
  if (workingPapers !== undefined) {
    payload.working_papers = normalizeWorkingPapers(workingPapers);
  }
  return payload;
}

export function isImageWorkingPaper(file) {
  return String(file?.mime || "").startsWith("image/");
}
