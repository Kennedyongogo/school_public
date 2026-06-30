/**
 * Public API helpers for contact, quote, and consultation submissions.
 * Uses VITE_API_URL in production if set; otherwise same-origin (dev proxy).
 */
import {
  clearSchoolPortalSession,
  getPortalAuthToken,
  getPortalAuthUser,
  hasPortalSession,
  savePortalSession,
  updatePortalSessionUser,
} from "./utils/portalAuthStorage";

export {
  clearSchoolPortalSession,
  getPortalAuthToken,
  getPortalAuthUser,
  hasPortalSession,
  savePortalSession,
  updatePortalSessionUser,
};

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

/**
 * Submit Contact Us form (public).
 * @param {{ fullName: string, email: string, phone?: string, serviceType?: string, message: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postContact(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to send message");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit Get Quotation form (public).
 * @param {{ projectType: string, location: string, scaleOfOperation: string, expectedOutcomes: string, service?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postQuote(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to submit quote request");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit Book Consultation form (public).
 * @param {{ fullName: string, email: string, phone: string, consultationType: string, preferredDate?: string, preferredTime?: string, message?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postConsultation(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to book consultation");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit a service request from a service card (public).
 * @param {{ serviceId: string, fullName: string, email: string, phone: string, message?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postServiceRequest(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/service-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to submit service request");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Subscribe to newsletter (public).
 * @param {{ email: string, source?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postNewsletter(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to subscribe");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

function getMarketplaceAuthHeaders() {
  const token = getPortalAuthToken();
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Register marketplace user (minimal: email, phone, password, fullName, termsAccepted, privacyAccepted).
 */
export async function registerMarketplaceUser(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Registration failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Parent/student login for the public school site (same `users` table as admin).
 * POST /api/users/login with portal restriction on the server.
 */
export async function loginMarketplaceUser(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/users/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      portal: "public",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Login failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/** Absolute URL for profile images when API is on another origin (`VITE_API_URL`). */
export function schoolPortalMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export async function fetchSchoolPortalUser() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/users/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Session expired. Please sign in again.");
  return data.data;
}

export async function fetchSchoolPortalParentProfile() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/parents/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load parent profile.");
  return data.data;
}

export async function fetchMyParentFeeInvoices() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-invoices/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load fee invoices.");
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchMyParentFeeInvoicePdf(invoiceId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-invoices/me/${encodeURIComponent(invoiceId)}/pdf`, {
    headers: { ...getMarketplaceAuthHeaders(), Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not load invoice PDF.");
  }
  return res.blob();
}

export async function fetchMyParentFeeReceipts() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-receipts/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load payment receipts.");
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchMyParentFeeReceiptPdf(receiptId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-receipts/me/${encodeURIComponent(receiptId)}/pdf`, {
    headers: { ...getMarketplaceAuthHeaders(), Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not load receipt PDF.");
  }
  return res.blob();
}

export async function postMyParentFeePayment(invoiceId, { amount, reference, notes } = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-invoices/me/${encodeURIComponent(invoiceId)}/payments`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ amount, reference, notes }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not record payment.");
  return data.data;
}

export async function postMyParentMpesaStkPush(invoiceId, { phone_number, amount } = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/mpesa/fee-invoice/${encodeURIComponent(invoiceId)}/stk-push`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ phone_number, amount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not start M-Pesa payment.");
  return data.data;
}

export async function fetchMpesaStkPushStatus(checkoutRequestId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/mpesa/stk-push/${encodeURIComponent(checkoutRequestId)}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not check payment status.");
  return data.data;
}

export async function fetchMpesaConfigStatus() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/mpesa/status`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load M-Pesa status.");
  return data.data;
}

export async function fetchSchoolPortalStudentProfile() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/students/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load student profile.");
  return data.data;
}

export async function fetchStudentTermStatus() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/students/me/term-status`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load term status.");
  return data.data;
}

export async function startStudentTerm() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/students/me/start-term`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not start term.");
  return data.data;
}

export async function fetchMyPlacementRegister() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/students/me/placement-register`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load your school journey.");
  return data.data;
}

export async function fetchSchoolPortalStudentTimetableLessons({ date } = {}) {
  const base = getBaseUrl();
  const qs = date ? `?date=${encodeURIComponent(String(date).slice(0, 10))}` : "";
  const res = await fetch(`${base}/api/school-portal/student/timetable-lessons${qs}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load class lessons.");
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchSchoolPortalStudentExamSchedules() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/student/exam-schedules`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load exam schedules.");
  return (Array.isArray(data.data) ? data.data : []).map(stripLegacyExamFeeGateFields);
}

/** Exams no longer gate on school fees; drop legacy fee fields from API payloads. */
function stripLegacyExamFeeGateFields(row) {
  if (!row || typeof row !== "object") return row;
  const next = { ...row };
  delete next.fee_payment_required;
  delete next.fee_block_message;
  delete next.fee_required_amount;
  delete next.fee_amount_paid;
  delete next.fee_amount_shortfall;
  delete next.fee_access;
  delete next.exam_fee_access_mode;
  delete next.exam_fee_minimum_amount;
  delete next.exam_fee_minimum_basis;
  if (next.open_block_reason === "fee_not_met") {
    next.open_block_reason = null;
    if (next.can_open === false) next.can_open = true;
  }
  return next;
}

function stripLegacyExamSubmissionAccess(access) {
  if (!access || typeof access !== "object") return access;
  const next = { ...access };
  delete next.fee_payment_required;
  delete next.fee_block_message;
  delete next.fee_required_amount;
  delete next.fee_amount_paid;
  delete next.fee_amount_shortfall;
  delete next.fee_access;
  delete next.exam_fee_access_mode;
  if (next.open_block_reason === "fee_not_met") {
    next.open_block_reason = null;
    if (next.can_open === false) next.can_open = true;
  }
  return next;
}

export async function fetchSchoolPortalStudentExamResult(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/student/exam-results/${encodeURIComponent(examScheduleId)}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Could not load exam result.");
    err.code = data.code || null;
    err.status = res.status;
    throw err;
  }
  return data.data;
}

export async function fetchSchoolPortalStudentExamResultPdf(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/student/exam-results/${encodeURIComponent(examScheduleId)}/pdf`, {
    headers: { ...getMarketplaceAuthHeaders(), Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not download exam result PDF.");
  }
  return res.blob();
}

export async function fetchSchoolPortalStudentExamAnsweredPdf(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/school-portal/student/exam-results/${encodeURIComponent(examScheduleId)}/answered-pdf`,
    { headers: { ...getMarketplaceAuthHeaders(), Accept: "application/pdf" } }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not download answered exam PDF.");
  }
  return res.blob();
}

export async function fetchSchoolPortalStudentReportCards({ page = 1, limit = 20 } = {}) {
  const base = getBaseUrl();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${base}/api/school-portal/student/report-cards?${params}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load report cards.");
  return {
    rows: Array.isArray(data.data) ? data.data : [],
    pagination: data.pagination || { total: 0, page: 1, limit, totalPages: 1 },
  };
}

export async function fetchSchoolPortalStudentReportCardPdf(cardId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/student/report-cards/${encodeURIComponent(cardId)}/pdf`, {
    headers: { ...getMarketplaceAuthHeaders(), Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not load report card PDF.");
  }
  return res.blob();
}

export async function createSchoolPortalExamSubmission(examId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exams/${encodeURIComponent(examId)}/submissions`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Could not start exam.");
    err.code = data.code;
    throw err;
  }
  return data.data;
}

export async function fetchSchoolPortalExamScheduleRoom(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/exam-schedule/${encodeURIComponent(examScheduleId)}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load exam invigilation room.");
  return data.data;
}

export async function fetchSchoolPortalExamScheduleLiveKitToken(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/exam-schedule/${encodeURIComponent(examScheduleId)}/livekit-token`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not get LiveKit token.");
  return data.data;
}

export async function fetchSchoolPortalMyExamLobbyStatus(examScheduleId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/school-portal/exam-schedule/${encodeURIComponent(examScheduleId)}/lobby/me`,
    { headers: getMarketplaceAuthHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load lobby status.");
  return data.data;
}

export async function fetchSchoolPortalMyExamSubmission(examId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exams/${encodeURIComponent(examId)}/submissions/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load exam paper.");
  return {
    submission: data.data,
    access: stripLegacyExamSubmissionAccess(data.access || null),
  };
}

/** Upload one file for a file_upload exam question (student JWT). */
export async function uploadSchoolPortalExamAnswerFile(submissionId, questionId, file) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const formData = new FormData();
  formData.append("exam_answer_file", file);
  const res = await fetch(
    `${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/answers/${encodeURIComponent(questionId)}/upload`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
      body: formData,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not upload file.");
  return data.data;
}

export async function saveSchoolPortalExamAnswers(submissionId, answers) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/answers`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not save answers.");
  return data.data;
}

export async function submitSchoolPortalExam(submissionId, payload = null) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/submit`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not submit exam.");
  return data.data;
}

export async function fetchSchoolPortalStudentAssignments() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/student/my`, { headers: getMarketplaceAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load assignments.");
  return Array.isArray(data.data) ? data.data : [];
}

export async function createSchoolPortalAssignmentSubmission(assignmentId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/${encodeURIComponent(assignmentId)}/submissions`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not start assignment.");
  return data.data;
}

export async function fetchSchoolPortalMyAssignmentSubmission(assignmentId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/${encodeURIComponent(assignmentId)}/submissions/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load assignment.");
  return { submission: data.data, assignment: data.assignment, access: data.access || {} };
}

export async function saveSchoolPortalAssignmentAnswers(submissionId, answers) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/answers`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not save answers.");
  return data.data;
}

export async function submitSchoolPortalAssignment(submissionId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/submit`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not submit assignment.");
  return data.data;
}

export async function uploadSchoolPortalAssignmentAnswerFile(submissionId, questionId, file) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const formData = new FormData();
  formData.append("assignment_answer_file", file);
  const res = await fetch(
    `${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/answers/${encodeURIComponent(questionId)}/upload`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not upload file.");
  return data.data;
}

export async function saveSchoolPortalAssignmentPdfAnswers(submissionId, fieldValues) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/pdf-answers`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ field_values: fieldValues }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not save answers.");
  return data.data;
}

export async function uploadSchoolPortalAssignmentPdfWorkingPaper(submissionId, file) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const formData = new FormData();
  formData.append("assignment_pdf_working_paper", file);
  const res = await fetch(`${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/pdf-working-papers`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not upload file.");
  return data.data;
}

export async function deleteSchoolPortalAssignmentPdfWorkingPaper(submissionId, fileId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/assignments/submissions/${encodeURIComponent(submissionId)}/pdf-working-papers/${encodeURIComponent(fileId)}`,
    { method: "DELETE", headers: getMarketplaceAuthHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not remove file.");
  return data.data;
}

export async function fetchSchoolPortalStudentAssignmentFeedback(assignmentId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assignments/student/${encodeURIComponent(assignmentId)}/feedback`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Could not load feedback.");
    err.code = data.code || null;
    throw err;
  }
  return data.data;
}

export async function fetchSchoolPortalAssignmentPdfTemplateBlob(assignmentId) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const res = await fetch(`${base}/api/assignments/${encodeURIComponent(assignmentId)}/pdf-template`, {
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/pdf" } : { Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not load assignment PDF.");
  }
  return res.blob();
}

export async function fetchSchoolPortalExamPdfTemplateBlob(examId) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const res = await fetch(`${base}/api/exams/${encodeURIComponent(examId)}/pdf-template`, {
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/pdf" } : { Accept: "application/pdf" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Could not load exam PDF.");
  }
  return res.blob();
}

export async function saveSchoolPortalExamPdfAnswers(submissionId, fieldValues) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/pdf-answers`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ field_values: fieldValues }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not save PDF answers.");
  return data.data;
}

export async function uploadSchoolPortalExamPdfWorkingPaper(submissionId, file) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const formData = new FormData();
  formData.append("exam_pdf_working_paper", file);
  const res = await fetch(
    `${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/pdf-working-papers`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
      body: formData,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not upload working paper.");
  return { submission: data.data, uploaded_file: data.uploaded_file || null };
}

export async function deleteSchoolPortalExamPdfWorkingPaper(submissionId, fileId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/exams/submissions/${encodeURIComponent(submissionId)}/pdf-working-papers/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: getMarketplaceAuthHeaders(),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not remove working paper.");
  return data.data;
}

export async function fetchSchoolPortalMyExamAttemptsForSchedule(examScheduleId) {
  const base = getBaseUrl();
  const examId = examScheduleId;
  const res = await fetch(
    `${base}/api/exam-attempts?exam_id=${encodeURIComponent(examId)}`,
    {
      headers: getMarketplaceAuthHeaders(),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load exam attempts.");
  return Array.isArray(data.data) ? data.data : [];
}

export async function createSchoolPortalExamAttempt(payload) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exam-attempts`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not start exam attempt.");
  return data.data;
}

export async function updateSchoolPortalExamAttempt(attemptId, patch) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exam-attempts/${encodeURIComponent(attemptId)}`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not update exam attempt.");
  return data.data;
}

export async function createSchoolPortalExamSessionLog(payload) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/exam-session-logs`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not create session log.");
  return data.data;
}

/** Portal bell: unread count + recent rows (same JWT as `/api/users/me`). */
export async function fetchSchoolPortalNotifications() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/notifications`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load notifications.");
  return data.data;
}

export async function markSchoolPortalNotificationRead(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not update notification.");
  return data.data;
}

export async function markAllSchoolPortalNotificationsRead() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/notifications/mark-all-read`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not clear notifications.");
  return data.data;
}

/** Records timetable live attendance when a student enters the live class room (student JWT). */
export async function postSchoolPortalLiveSessionJoin(body) {
  const base = getBaseUrl();
  const payload =
    typeof body === "string"
      ? { join_url: body }
      : body && typeof body === "object"
      ? body
      : {};
  const res = await fetch(`${base}/api/school-portal/live-session/join`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not record session join.");
  return data;
}

/** Marks leave/duration when the student ends the live class (student JWT). */
export async function postSchoolPortalLiveSessionLeave(body) {
  const base = getBaseUrl();
  const payload =
    typeof body === "string"
      ? { join_url: body }
      : body && typeof body === "object"
      ? body
      : {};
  const res = await fetch(`${base}/api/school-portal/live-session/leave`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not record session leave.");
  return data;
}

/**
 * Same as leave POST, for `pagehide` / tab close (`keepalive` so the request can finish after unload).
 */
export function beaconSchoolPortalLiveSessionLeave(body) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const payload =
    typeof body === "string"
      ? { join_url: body }
      : body && typeof body === "object"
      ? body
      : {};
  void fetch(`${base}/api/school-portal/live-session/leave`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

/** Room metadata + ICE servers for in-app WebRTC live class. */
export async function fetchSchoolPortalLiveClassRoom(liveClassId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/school-portal/live-class/${encodeURIComponent(liveClassId)}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load live class room.");
  return data.data;
}

/** Current lobby status for this student (waiting / admitted / none). */
export async function fetchSchoolPortalMyLobbyStatus(liveClassId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/school-portal/live-class/${encodeURIComponent(liveClassId)}/lobby/me`,
    { headers: getMarketplaceAuthHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load lobby status.");
  return data.data;
}

/** Live session metadata for a school event (parent / student). */
export async function fetchEventLiveSession(eventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/live`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load event session.");
  return data.data;
}

/** Lobby status for the current user on an event. */
export async function fetchMyEventLobbyStatus(eventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/lobby/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load lobby status.");
  return data.data;
}

/** Chat + reactions for an event live session. */
export async function fetchEventInteractions(eventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/interactions`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not load interactions.");
  return data.data;
}

export async function postEventChat(eventId, body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/chat`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not send message.");
  return data.data;
}

export async function postEventReaction(eventId, emoji) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/reaction`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ emoji }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not send reaction.");
  return data.data;
}

export async function markEventQuestionAnswered(eventId, messageId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/events/${encodeURIComponent(eventId)}/chat/${encodeURIComponent(messageId)}/answered`,
    { method: "PATCH", headers: getMarketplaceAuthHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not update question.");
  return data.data;
}

/** LiveKit token for an admitted event attendee. */
export async function fetchEventLiveKitToken(eventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/livekit-token`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not get LiveKit token.");
  return data.data;
}

/** LiveKit access token (after lobby admit for students). */
export async function fetchSchoolPortalLiveKitToken(liveClassId) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/school-portal/live-class/${encodeURIComponent(liveClassId)}/livekit-token`,
    {
      method: "POST",
      headers: getMarketplaceAuthHeaders(),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Could not get LiveKit token.");
  return data.data;
}

/**
 * Get current marketplace user + profile (requires token).
 */
export async function getMarketplaceMe() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/me`, {
    method: "GET",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch profile");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Upload marketplace profile photo. Returns { profilePhotoUrl }. Requires token.
 * @param {File} file - Image file (e.g. from input type="file")
 */
export async function uploadMarketplaceProfilePhoto(file) {
  const base = getBaseUrl();
  const token = getPortalAuthToken();
  const formData = new FormData();
  formData.append("profile_photo", file);
  const res = await fetch(`${base}/api/marketplace/upload-photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to upload profile photo");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

export async function uploadAdmissionDocuments(files) {
  const base = getBaseUrl();
  const formData = new FormData();
  if (files.studentPicture instanceof File) formData.append("student_picture", files.studentPicture);
  if (files.studentReportcard instanceof File) formData.append("student_reportcard", files.studentReportcard);
  if (files.studentBirthcertificate instanceof File) formData.append("student_birthcertificate", files.studentBirthcertificate);
  const res = await fetch(`${base}/api/admission-applications/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to upload documents");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit a public admission application (JSON). Document fields must be server paths from uploadAdmissionDocuments.
 */
export async function submitAdmissionApplication(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/admission-applications/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Application failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Complete marketplace profile (role + common + role-specific). Requires token.
 */
export async function completeMarketplaceProfile(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/complete`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to complete profile");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Apply for a grant (requires marketplace auth).
 * Sends POST /api/grant-applications with body: { grantId, applicationData }.
 * @param {string} grantId - ID of the grant
 * @param {object} [applicationData] - Optional application form data (default {})
 * @returns {Promise<{ success: boolean, message?: string, data?: object }>}
 */
export async function applyForGrant(grantId, applicationData = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/grant-applications`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ grantId, applicationData }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Application failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Register for a training event (requires marketplace auth).
 * Sends POST /api/training-registrations with body: { trainingEventId }.
 * @param {string} trainingEventId - ID of the training event
 * @returns {Promise<{ success: boolean, message?: string, data?: object }>}
 */
export async function registerForTrainingEvent(trainingEventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/training-registrations`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ trainingEventId }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Registration failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

// ——— Marketplace Listings ———

/**
 * Get current user's listings (requires marketplace auth).
 */
export async function getMyListings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/my`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch your listings");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Get public (approved) listings. No auth required.
 */
export async function getPublicListings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/public`);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch listings");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Get a single listing by id (optional auth for owner visibility).
 */
export async function getListingById(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Create a new listing (requires marketplace auth). Use formData when uploading an image file.
 * @param {FormData|{ title: string, description?: string, category?: string, price?: number, priceUnit?: string, quantity?: number, quantityUnit?: string, location?: string }} bodyOrFormData - FormData (with listing_image file) or JSON body
 */
export async function createListing(bodyOrFormData) {
  const base = getBaseUrl();
  const isFormData = bodyOrFormData instanceof FormData;
  const headers = { Accept: "application/json" };
  const token = getPortalAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}/api/marketplace/listings`, {
    method: "POST",
    headers,
    body: isFormData ? bodyOrFormData : JSON.stringify(bodyOrFormData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to create listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Update a listing (requires marketplace auth, owner only). Use formData when uploading an image file.
 * @param {string} id - Listing ID
 * @param {FormData|{ title?: string, description?: string, category?: string, price?: number, priceUnit?: string, quantity?: number, quantityUnit?: string, location?: string, delete_image?: string }} bodyOrFormData - FormData (with listing_image file) or JSON body
 */
export async function updateListing(id, bodyOrFormData) {
  const base = getBaseUrl();
  const isFormData = bodyOrFormData instanceof FormData;
  const headers = { Accept: "application/json" };
  const token = getPortalAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    method: "PATCH",
    headers,
    body: isFormData ? bodyOrFormData : JSON.stringify(bodyOrFormData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to update listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Delete a listing (requires marketplace auth, owner only).
 */
export async function deleteListing(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    method: "DELETE",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to delete listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

export async function fetchPublicTeachers(page = 1, limit = 10) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/public/teachers?page=${page}&limit=${limit}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch teachers");
    err.response = res;
    err.data = data;
    throw err;
  }
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.pagination || { total: 0, page, limit, totalPages: 1 },
  };
}

export async function fetchPublicCurricula() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/curricula/public/all`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch curricula");
    err.response = res;
    err.data = data;
    throw err;
  }
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchPublicFeeStructures(curriculumId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/fee-structures/public/curriculum/${curriculumId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch fee structures");
    err.response = res;
    err.data = data;
    throw err;
  }
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchPublicCurriculumClasses(curriculumId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/curricula/public/${curriculumId}/classes`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch classes");
    err.response = res;
    err.data = data;
    throw err;
  }
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchPublicCurriculumClassLevels(curriculumId, classId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/curricula/public/${curriculumId}/classes/${classId}/levels`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch class levels");
    err.response = res;
    err.data = data;
    throw err;
  }
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchPublicCurriculumById(curriculumId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/public/curricula/${curriculumId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch curriculum");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data.data;
}

export async function fetchPublicSchoolAdmins(page = 1, limit = 10) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/public/school-admins?page=${page}&limit=${limit}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch school admins");
    err.response = res;
    err.data = data;
    throw err;
  }
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.pagination || { total: 0, page, limit, totalPages: 1 },
  };
}

/** Approved parent/student reviews for the public home page (paginated). */
export async function fetchApprovedPortalReviews(page = 1, limit = 5) {
  const base = getBaseUrl();
  const res = await fetch(
    `${base}/api/portal-reviews/public/approved?page=${page}&limit=${limit}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load reviews");
  return {
    data: Array.isArray(data.data) ? data.data : [],
    pagination: data.pagination || {
      total: 0,
      page,
      limit,
      totalPages: 1,
    },
  };
}

/** Whether the logged-in portal user has submitted their one review. */
export async function fetchMyPortalReviewStatus() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/portal-reviews/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load review status");
  return data.data;
}

/** Submit a single review (parent or student). */
export async function submitPortalReview({ rating, comment }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/portal-reviews/me`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ rating, comment }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Could not submit review");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data.data;
}
