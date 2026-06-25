import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Swal from "sweetalert2";
import ExamInvigilationVideoDock from "../components/VideoConference/ExamInvigilationVideoDock";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";
import {
  createSchoolPortalExamSubmission,
  fetchSchoolPortalMyExamSubmission,
  fetchSchoolPortalMyExamAttemptsForSchedule,
  fetchSchoolPortalStudentExamSchedules,
  fetchSchoolPortalMyExamLobbyStatus,
  createSchoolPortalExamAttempt,
  updateSchoolPortalExamAttempt,
  createSchoolPortalExamSessionLog,
  saveSchoolPortalExamAnswers,
  submitSchoolPortalExam,
  uploadSchoolPortalExamAnswerFile,
  schoolPortalMediaUrl,
} from "../api";

const accent = PORTAL.gold;
const accentDark = PORTAL.navyDeep;
const cardBorder = PORTAL.border;

const normalizeOptions = (q) => {
  if (Array.isArray(q?.options)) return q.options.map((x) => String(x || "").trim()).filter(Boolean);
  if (typeof q?.options === "string") return q.options.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
};

const fileUploadConfig = (q) => {
  const o = q?.options && typeof q.options === "object" && !Array.isArray(q.options) ? q.options : {};
  const accept = Array.isArray(o.accept) ? o.accept : ["image/*", "application/pdf"];
  return {
    accept,
    maxFiles: Math.min(5, Math.max(1, Number(o.max_files) || 1)),
    maxSizeMb: Math.min(25, Math.max(1, Number(o.max_size_mb) || 10)),
    hint: String(o.upload_hint || "").trim(),
  };
};

const htmlAcceptFromMimeList = (acceptList) => {
  const parts = [];
  (acceptList || []).forEach((pattern) => {
    const p = String(pattern || "").trim();
    if (!p) return;
    if (p === "application/pdf") parts.push(".pdf", "application/pdf");
    else if (p.includes("wordprocessingml")) parts.push(".docx", p);
    else if (p === "application/msword") parts.push(".doc", p);
    else parts.push(p);
  });
  return parts.length ? parts.join(",") : "image/*,application/pdf,.pdf";
};

import {
  scheduleRequiresInvigilationRoom,
  scheduleUsesLiveKit,
  isLiveInvigilationMode,
  isActivityMonitorMode,
  hasExamInvigilationPaperAccess,
  clearExamInvigilationPaperAccess,
  isExamScheduleWindowOpen,
} from "../utils/examInvigilation";

const formatScheduleTime = (value, timezone = "Africa/Nairobi") => {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone || "Africa/Nairobi",
    }).format(dt);
  } catch {
    return dt.toLocaleString();
  }
};

export default function PortalExamTakePage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [webcamReady, setWebcamReady] = useState(false);
  const [examAttemptId, setExamAttemptId] = useState(null);
  const [webcamError, setWebcamError] = useState("");
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [examLocked, setExamLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomConfirmed, setRoomConfirmed] = useState(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState("");
  const mediaStreamRef = useRef(null);
  const autoSubmitRef = useRef(false);
  const creatingAttemptRef = useRef(false);
  const saveTimerRef = useRef(null);
  const answersRef = useRef({});
  answersRef.current = answers;

  const deadline = useMemo(() => {
    if (!submission?.started_at || !exam?.duration_minutes) return null;
    const start = new Date(submission.started_at).getTime();
    return start + Number(exam.duration_minutes) * 60 * 1000;
  }, [submission?.started_at, exam?.duration_minutes]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!deadline) return null;
    return Math.max(0, Math.floor((deadline - now) / 1000));
  }, [deadline, now]);

  const rules = useMemo(() => {
    const cfg = schedule?.proctoring_rules_json && typeof schedule.proctoring_rules_json === "object" ? schedule.proctoring_rules_json : {};
    const strictMode = schedule?.proctoring_mode === "strict_auto";
    const liveInvigilation = isLiveInvigilationMode(schedule);
    const requiresWebcam = liveInvigilation || schedule?.effective_requires_webcam === true;
    const preventTabSwitch = schedule?.effective_prevent_tab_switch === true;
    const tabSwitchLimit =
      Number.isFinite(Number(cfg.tabSwitchLimit)) && Number(cfg.tabSwitchLimit) >= 0
        ? Number(cfg.tabSwitchLimit)
        : preventTabSwitch
        ? 0
        : Number.POSITIVE_INFINITY;
    const warningLimit =
      Number.isFinite(Number(cfg.warningLimit)) && Number(cfg.warningLimit) > 0 ? Number(cfg.warningLimit) : 3;
    const examAccessPolicy =
      schedule?.exam_access_policy === "paper_plus_room_required"
        ? "paper_plus_room_required"
        : "paper_only";
    return { requiresWebcam, preventTabSwitch, tabSwitchLimit, warningLimit, examAccessPolicy, strictMode, liveInvigilation };
  }, [schedule]);

  const isLiveKitInvigilation = useMemo(() => scheduleUsesLiveKit(schedule), [schedule]);

  const requiresRoom = useMemo(() => scheduleRequiresInvigilationRoom(schedule), [schedule]);

  const showPaper = !requiresRoom || roomConfirmed;

  useEffect(() => {
    const load = async () => {
      if (!scheduleId) return;
      setLoading(true);
      setError("");
      try {
        const schedules = await fetchSchoolPortalStudentExamSchedules();
        const sc = schedules.find((x) => String(x.id) === String(scheduleId));
        if (!sc) throw new Error("Exam schedule not found for your class.");
        if (!sc.exam?.id) throw new Error("Exam is not linked on this schedule.");
        if (sc?.attendance?.is_cancelled) {
          throw new Error(sc?.attendance?.cancellation_reason || "Exam is closed due to proctoring violation.");
        }
        if (sc?.end_time && Date.now() > new Date(sc.end_time).getTime()) {
          const tz = sc?.timezone || "Africa/Nairobi";
          const startAt = formatScheduleTime(sc?.start_time, tz);
          const endAt = formatScheduleTime(sc?.end_time, tz);
          const nowAt = formatScheduleTime(new Date().toISOString(), tz);
          throw new Error(`Exam window elapsed for this schedule (${startAt} - ${endAt}, ${tz}). Current time: ${nowAt}.`);
        }
        if (
          sc?.attendance?.submitted_at ||
          sc?.submission_status === "submitted" ||
          sc?.open_block_reason === "already_submitted"
        ) {
          throw new Error("You already submitted this exam. Re-opening is disabled.");
        }

        const needsInvigilation = scheduleRequiresInvigilationRoom(sc);
        if (needsInvigilation) {
          let admitted = false;
          try {
            const lobby = await fetchSchoolPortalMyExamLobbyStatus(scheduleId);
            admitted = lobby?.status === "admitted";
          } catch {
            admitted = false;
          }
          const paperAllowed = admitted && hasExamInvigilationPaperAccess(scheduleId);
          if (!paperAllowed) {
            clearExamInvigilationPaperAccess(scheduleId);
            setSchedule(sc);
            setLoading(false);
            navigate(`/portal/exam-schedule/${scheduleId}/invigilation`, {
              replace: true,
              state: { freshJoin: !admitted },
            });
            return;
          }
          setRoomConfirmed(true);
        }

        setSchedule(sc);
        try {
          await createSchoolPortalExamSubmission(sc.exam.id);
        } catch (submissionErr) {
          const msg = String(submissionErr?.message || "");
          if (/time has ended|duration_elapsed|already submitted|max attempts/i.test(msg)) {
            navigate("/portal/exams", {
              replace: true,
              state: {
                examMessage:
                  /time has ended|duration_elapsed/i.test(msg)
                    ? "Your exam time has ended. Your saved answers were submitted automatically."
                    : "You already submitted this exam.",
              },
            });
            return;
          }
          throw submissionErr;
        }
        const { submission: sub, access: subAccess } = await fetchSchoolPortalMyExamSubmission(sc.exam.id);
        if (!sub) throw new Error("Could not load your submission.");
        if (sub.status === "submitted") {
          navigate("/portal/exams", {
            replace: true,
            state: { examMessage: "You already submitted this exam." },
          });
          return;
        }
        if (subAccess?.duration_elapsed && sub.status === "submitted") {
          navigate("/portal/exams", {
            replace: true,
            state: {
              examMessage:
                "Your exam time has ended. Your saved answers were submitted automatically.",
            },
          });
          return;
        }
        setSubmission(sub);
        setExam(sub.exam || null);
        try {
          const attempts = await fetchSchoolPortalMyExamAttemptsForSchedule(sc.exam?.id || sc.id);
          const latest = Array.isArray(attempts)
            ? attempts.find((a) => String(a.exam_id) === String(sc.exam?.id)) || attempts[0]
            : null;
          if (latest?.id) {
            setExamAttemptId(latest.id);
            if (Number.isFinite(Number(latest.tab_switch_count))) setTabSwitchCount(Number(latest.tab_switch_count));
            if (Number.isFinite(Number(latest.warning_count))) setWarningCount(Number(latest.warning_count));
          }
        } catch {
          // Non-blocking: exam attempts are for proctor monitoring UI.
        }
        const map = {};
        (sub.answers || []).forEach((a) => {
          if (!a?.question_id) return;
          map[a.question_id] =
            a.answer_json !== null && a.answer_json !== undefined ? a.answer_json : a.answer_text || "";
        });
        setAnswers(map);
      } catch (e) {
        setError(e.message || "Could not open exam.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [scheduleId]);

  useEffect(() => {
    if (!rules.requiresWebcam) {
      setWebcamReady(true);
      setWebcamError("");
      return undefined;
    }
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        setWebcamReady(true);
        setWebcamError("");
        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            setWebcamReady(false);
            setWebcamError("Webcam stopped during exam.");
          };
        });
      } catch {
        setWebcamReady(false);
        setWebcamError("Webcam is required for this exam. Please allow camera access.");
      }
    };
    void start();
    return () => {
      cancelled = true;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [rules.requiresWebcam]);

  const questions = useMemo(() => {
    const rows = Array.isArray(exam?.questions) ? [...exam.questions] : [];
    rows.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
    return rows;
  }, [exam?.questions]);

  const isSubmitted = submission?.status === "submitted";
  const canAnswer =
    !isSubmitted &&
    !examLocked &&
    (!rules.requiresWebcam || webcamReady) &&
    (!requiresRoom || roomConfirmed);

  const buildAnswerPayload = useCallback(
    (answerMap) =>
      questions.map((q) => {
        const v = answerMap[q.id];
        const isJson = Array.isArray(v) || (v && typeof v === "object");
        return {
          question_id: q.id,
          answer_text: isJson ? null : v != null ? String(v) : "",
          answer_json: isJson ? v : null,
        };
      }),
    [questions]
  );

  const persistAnswers = useCallback(
    async (answerMap, submissionId) => {
      const sid = submissionId || submission?.id;
      if (!sid || !questions.length || submission?.status === "submitted") return;
      setSaving(true);
      try {
        const updated = await saveSchoolPortalExamAnswers(sid, buildAnswerPayload(answerMap ?? answersRef.current));
        setSubmission((s) => ({ ...s, answers: updated?.answers || s?.answers || [] }));
      } catch {
        // Non-blocking autosave
      } finally {
        setSaving(false);
      }
    },
    [submission?.id, submission?.status, questions.length, buildAnswerPayload]
  );

  const queueSave = useCallback(
    (answerMap) => {
      if (!submission?.id || submission?.status === "submitted") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void persistAnswers(answerMap), 800);
    },
    [persistAnswers, submission?.id, submission?.status]
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const maybeCreateAttempt = async () => {
      if (!canAnswer) return;
      if (!schedule || !submission || !schedule?.exam?.id || !submission?.student_id) return;
      if (examAttemptId) return;
      if (creatingAttemptRef.current) return;
      creatingAttemptRef.current = true;
      const nowIso = new Date().toISOString();
      const payload = {
        exam_id: schedule.exam.id,
        exam_schedule_id: schedule.id,
        student_id: submission.student_id,
        status: "in_progress",
        start_time: nowIso,
        webcam_enabled: !!webcamReady,
        tab_switch_count: tabSwitchCount,
        warning_count: warningCount,
        last_activity_at: nowIso,
        client_presence_active: true,
      };
      try {
        const created = await createSchoolPortalExamAttempt(payload);
        if (created?.id) {
          setExamAttemptId(created.id);
          try {
            await createSchoolPortalExamSessionLog({
              exam_attempt_id: created.id,
              event_type: "session_start",
              event_data: { source: "portal_exam_take_page" },
              cumulative_time_seconds: 0,
              remaining_time_seconds: remainingSeconds != null ? remainingSeconds : 0,
            });
          } catch {
            // Non-blocking telemetry.
          }
        }
      } finally {
        creatingAttemptRef.current = false;
      }
    };
    if (!loading && schedule && submission) void maybeCreateAttempt().catch(() => {});
  }, [canAnswer, examAttemptId, schedule, submission, webcamReady, tabSwitchCount, warningCount, loading]);

  useEffect(() => {
    if (!examAttemptId) return;
    const timeout = setTimeout(() => {
      const nowIso = new Date().toISOString();
      void updateSchoolPortalExamAttempt(examAttemptId, {
        webcam_enabled: !!webcamReady,
        tab_switch_count: tabSwitchCount,
        warning_count: warningCount,
        last_activity_at: nowIso,
        client_presence_active: true,
      }).catch(() => {});
    }, 900);
    return () => clearTimeout(timeout);
  }, [examAttemptId, webcamReady, tabSwitchCount, warningCount]);

  useEffect(() => {
    if (!examAttemptId || !submission || submission.status === "submitted" || !schedule) return undefined;
    if (!isActivityMonitorMode(schedule)) return undefined;
    const tick = window.setInterval(() => {
      void logSessionEvent("session_presence", { active: true });
    }, 45000);
    return () => window.clearInterval(tick);
  }, [examAttemptId, submission?.status, schedule?.proctoring_mode]);

  const upsertAnswer = (questionId, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      queueSave(next);
      return next;
    });
  };

  const handleFileUpload = async (question, file) => {
    if (!submission?.id || !question?.id || !file) return;
    const cfg = fileUploadConfig(question);
    const current = answers[question.id];
    const files = current && typeof current === "object" && Array.isArray(current.files) ? current.files : [];
    if (files.length >= cfg.maxFiles) {
      setError(`Maximum ${cfg.maxFiles} file(s) allowed for this question.`);
      return;
    }
    if (file.size > cfg.maxSizeMb * 1024 * 1024) {
      setError(`File exceeds maximum size of ${cfg.maxSizeMb} MB.`);
      return;
    }
    setUploadingQuestionId(question.id);
    setError("");
    try {
      const answerRow = await uploadSchoolPortalExamAnswerFile(submission.id, question.id, file);
      const nextJson =
        answerRow?.answer_json && typeof answerRow.answer_json === "object" ? answerRow.answer_json : { files: [] };
      upsertAnswer(question.id, nextJson);
      setSubmission((s) => {
        const prev = Array.isArray(s?.answers) ? s.answers : [];
        const rest = prev.filter((a) => a.question_id !== question.id);
        return { ...s, answers: [...rest, { question_id: question.id, ...answerRow }] };
      });
    } catch (e) {
      setError(e.message || "Could not upload file.");
    } finally {
      setUploadingQuestionId("");
    }
  };

  const logSessionEvent = async (event_type, event_data = {}) => {
    if (!examAttemptId) return;
    try {
      await createSchoolPortalExamSessionLog({
        exam_attempt_id: examAttemptId,
        event_type,
        event_data,
        cumulative_time_seconds:
          remainingSeconds != null && exam?.duration_minutes
            ? Math.max(0, Number(exam.duration_minutes) * 60 - remainingSeconds)
            : 0,
        remaining_time_seconds: remainingSeconds != null ? remainingSeconds : 0,
      });
    } catch {
      // Non-blocking telemetry.
    }
  };

  const saveDraft = async ({ throwOnError = false } = {}) => {
    if (!submission?.id || !questions.length) return false;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await saveSchoolPortalExamAnswers(submission.id, buildAnswerPayload(answersRef.current));
      setSubmission((s) => ({ ...s, answers: updated?.answers || s?.answers || [] }));
      return true;
    } catch (e) {
      setError(e.message || "Could not save.");
      if (throwOnError) throw e;
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitNow = async (reason = "manual_submit") => {
    if (!submission?.id || submission.status === "submitted") return;
    if (reason !== "manual_submit") setAutoSubmitting(true);
    else setSubmitting(true);
    setError("");
    try {
      const saved = await saveDraft({ throwOnError: reason === "manual_submit" });
      if (!saved && reason !== "manual_submit") {
        await saveDraft({ throwOnError: false });
      }
      await submitSchoolPortalExam(submission.id, { submit_reason: reason });
      const nowIso = new Date().toISOString();
      setSubmission((s) =>
        s ? { ...s, status: "submitted", submitted_at: s.submitted_at || nowIso } : s
      );
      let attemptId = examAttemptId;
      if (!attemptId && schedule?.exam?.id && schedule?.id && submission?.student_id) {
        try {
          const nowIso = new Date().toISOString();
          const created = await createSchoolPortalExamAttempt({
            exam_id: schedule.exam.id,
            exam_schedule_id: schedule.id,
            student_id: submission.student_id,
            status: "in_progress",
            start_time: canAnswer ? nowIso : null,
            webcam_enabled: !!webcamReady,
            tab_switch_count: tabSwitchCount,
            warning_count: warningCount,
            last_activity_at: nowIso,
            client_presence_active: true,
          });
          attemptId = created?.id || attemptId;
          if (created?.id) setExamAttemptId(created.id);
        } catch {
          // Non-blocking: the exam is already submitted; proctor monitor can be approximate.
        }
      }
      if (attemptId) {
        const nowIso = new Date().toISOString();
        await updateSchoolPortalExamAttempt(attemptId, {
          status: "completed",
          submitted_at: nowIso,
          end_time: nowIso,
          webcam_enabled: !!webcamReady,
          tab_switch_count: tabSwitchCount,
          warning_count: warningCount,
          last_activity_at: nowIso,
          client_presence_active: false,
        }).catch(() => {});
      }
      const timeAuto = reason === "auto_submit_time_elapsed";
      await Swal.fire({
        icon: "success",
        title: timeAuto ? "Time ended" : "Exam submitted",
        text: timeAuto
          ? "Your saved answers were submitted automatically."
          : reason === "manual_submit"
          ? "Your answers were submitted successfully."
          : "Your exam has been submitted.",
        timer: 1600,
        showConfirmButton: false,
      });
      navigate("/portal/exams", {
        replace: true,
        state: timeAuto
          ? { examMessage: "Your exam time has ended. Your saved answers were submitted automatically." }
          : undefined,
      });
    } catch (e) {
      setError(e.message || "Could not submit exam.");
    } finally {
      if (reason !== "manual_submit") setAutoSubmitting(false);
      else setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!schedule || !submission || submission.status === "submitted") return undefined;
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      if (requiresRoom && !roomConfirmed) return;
      const trackTabSwitch = isActivityMonitorMode(schedule) || rules.preventTabSwitch;
      if (!trackTabSwitch) return;

      const enforcePolicy = rules.preventTabSwitch;

      setTabSwitchCount((prev) => {
        const next = prev + 1;
        if (examAttemptId) {
          void updateSchoolPortalExamAttempt(examAttemptId, {
            tab_switch_count: next,
            last_activity_at: new Date().toISOString(),
            client_presence_active: true,
          }).catch(() => {});
        }
        void logSessionEvent("violation_detected", {
          type: "tab_switch",
          proctoring_mode: schedule?.proctoring_mode || "record_only",
          enforced: enforcePolicy,
        });
        return next;
      });

      if (enforcePolicy) {
        setWarningCount((prev) => prev + 1);
        void logSessionEvent("warning_issued", { reason: "tab_switch" });
        if (rules.strictMode && Number(rules.tabSwitchLimit) <= 0) {
          setExamLocked(true);
          setLockReason("Exam closed due to tab switch policy breach.");
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [
    schedule,
    submission,
    rules.preventTabSwitch,
    rules.strictMode,
    rules.tabSwitchLimit,
    requiresRoom,
    roomConfirmed,
    examAttemptId,
  ]);

  useEffect(() => {
    if (!examLocked || !examAttemptId) return;
    const nowIso = new Date().toISOString();
    void updateSchoolPortalExamAttempt(examAttemptId, {
      status: "cancelled",
      is_cancelled: true,
      cancellation_reason: lockReason || "Proctoring violation",
      end_time: nowIso,
      submitted_at: nowIso,
      client_presence_active: false,
      last_activity_at: nowIso,
    }).catch(() => {});
  }, [examLocked, examAttemptId, lockReason]);

  useEffect(() => {
    if (!rules.strictMode) return;
    if (!rules.preventTabSwitch || !Number.isFinite(rules.tabSwitchLimit)) return;
    if (requiresRoom && !roomConfirmed) return;
    if (tabSwitchCount > rules.tabSwitchLimit && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      setError("Tab switching limit exceeded. Auto-submitting exam.");
      void logSessionEvent("auto_submit", {
        reason: "tab_switch_limit_exceeded",
        tabSwitchCount,
        tabSwitchLimit: rules.tabSwitchLimit,
      });
      void submitNow("auto_submit_tab_switch");
    }
  }, [rules.strictMode, rules.preventTabSwitch, rules.tabSwitchLimit, tabSwitchCount, requiresRoom, roomConfirmed]);

  useEffect(() => {
    if (!rules.strictMode) return;
    if (warningCount < rules.warningLimit || autoSubmitRef.current) return;
    if (!rules.preventTabSwitch) return;
    if (requiresRoom && !roomConfirmed) return;
    autoSubmitRef.current = true;
    setError("Warning limit reached. Auto-submitting exam.");
    void logSessionEvent("auto_submit", {
      reason: "warning_limit_reached",
      warningCount,
      warningLimit: rules.warningLimit,
    });
    void submitNow("auto_submit_warning_limit");
  }, [warningCount, rules.warningLimit, rules.preventTabSwitch, rules.strictMode, requiresRoom, roomConfirmed]);

  useEffect(() => {
    if (remainingSeconds == null) return;
    if (remainingSeconds <= 0 && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      setError("Time elapsed. Auto-submitting exam.");
      void logSessionEvent("auto_submit", { reason: "time_elapsed" });
      void submitNow("auto_submit_time_elapsed");
    }
  }, [remainingSeconds]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)", width: "100%" }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2 }, py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const edgePad = { xs: 1.5, sm: 2, md: 2.5 };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#f8fafc",
        pb: showPaper && isLiveKitInvigilation && roomConfirmed ? 26 : 3,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: { xs: 56, sm: 64 },
          zIndex: 20,
          width: "100%",
          borderBottom: `1px solid ${cardBorder}`,
          bgcolor: "#fff",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box sx={{ height: 4, background: PORTAL.navyGradient, width: "100%" }} />
        <Box sx={{ px: edgePad, py: { xs: 1.25, sm: 1.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.25}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, fontFamily: PORTAL.fontDisplay, color: PORTAL.navyDeep, lineHeight: 1.25 }}
              >
                {exam?.title || "Exam"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class: {schedule?.curriculum_class?.name || "—"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <Chip label={`Duration: ${exam?.duration_minutes || 0} min`} size="small" />
              {isActivityMonitorMode(schedule) || rules.preventTabSwitch ? (
                <Chip
                  label={`Tab switches: ${tabSwitchCount}`}
                  size="small"
                  color={tabSwitchCount > 0 ? "warning" : "default"}
                  title={
                    rules.preventTabSwitch
                      ? "Tab switches are enforced"
                      : "Recorded for your teacher (allowed in monitored mode)"
                  }
                />
              ) : null}
              {rules.requiresWebcam ? (
                <Chip label={webcamReady ? "Webcam: On" : "Webcam: Required"} size="small" color={webcamReady ? "success" : "error"} />
              ) : null}
              {remainingSeconds != null ? (
                <Chip
                  color={remainingSeconds < 300 ? "error" : "default"}
                  label={`Time left: ${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(
                    remainingSeconds % 60
                  ).padStart(2, "0")}`}
                  size="small"
                />
              ) : null}
              {saving ? (
                <Typography variant="caption" color="text.secondary">
                  Saving…
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: edgePad, pt: 1.5 }}>
        {webcamError ? <Alert severity="warning" sx={{ mb: 1.5 }}>{webcamError}</Alert> : null}
        {requiresRoom ? (
          <Alert severity={roomConfirmed ? "success" : "info"} sx={{ mb: 1.5 }}>
            {roomConfirmed
              ? isLiveKitInvigilation
                ? "You were admitted. Keep the invigilation camera open (bottom-right) while you answer."
                : "Invigilation room confirmed for this session."
              : isLiveKitInvigilation
              ? "Join the invigilation room and wait for your teacher to admit you before answering questions."
              : "This exam requires invigilation room first. Open it below to continue."}
          </Alert>
        ) : null}
        {isActivityMonitorMode(schedule) && !rules.preventTabSwitch ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Monitored exam: leaving this tab is recorded for your teacher but does not close your exam.
          </Alert>
        ) : null}
        {rules.preventTabSwitch && Number.isFinite(rules.tabSwitchLimit) ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Strict exam: tab switch limit is {rules.tabSwitchLimit}. Current switches: {tabSwitchCount}.
          </Alert>
        ) : null}
        {rules.strictMode && rules.preventTabSwitch && Number(rules.tabSwitchLimit) <= 0 ? (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Strict policy: switching tab once closes this exam and you cannot continue.
          </Alert>
        ) : null}
        {examLocked ? (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {lockReason || "Exam closed due to proctoring rule breach."}
          </Alert>
        ) : null}

        {!showPaper ? (
          <Card elevation={0} sx={{ border: `1px solid ${cardBorder}`, mb: 2, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ height: 4, background: PORTAL.navyGradient }} />
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Invigilation required first
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You cannot view exam questions until your teacher admits you in the invigilation room. The exam timer
                starts only after you are admitted.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  clearExamInvigilationPaperAccess(scheduleId);
                  navigate(`/portal/exam-schedule/${scheduleId}/invigilation`, { state: { freshJoin: true } });
                }}
                sx={portalPrimaryButtonSx()}
              >
                Go to invigilation room
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {showPaper ? (
        <Stack spacing={1.5} sx={{ width: "100%" }}>
          {questions.map((q, idx) => {
            const qType = q.question_type || "short_text";
            const opts = normalizeOptions(q);
            const diagramData = q?.options?.diagram_data || "";
            const diagramHotspots = Array.isArray(q?.options?.hotspots) ? q.options.hotspots : [];
            const v =
              answers[q.id] ??
              (qType === "multi_select" ? [] : qType === "diagram_label" ? {} : qType === "file_upload" ? { files: [] } : "");
            const uploadCfg = qType === "file_upload" ? fileUploadConfig(q) : null;
            const uploadedFiles =
              qType === "file_upload" && v && typeof v === "object" && Array.isArray(v.files) ? v.files : [];
            return (
              <Card
                key={q.id}
                elevation={0}
                sx={{
                  width: "100%",
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 2,
                  bgcolor: "#fff",
                }}
              >
                <CardContent sx={{ px: { xs: 1.75, sm: 2.5 }, py: { xs: 1.75, sm: 2 } }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.25, fontSize: { xs: "1rem", md: "1.05rem" }, lineHeight: 1.45 }}>
                    {idx + 1}. {q.question_text}
                  </Typography>
                  {qType === "true_false" ? (
                    <RadioGroup
                      value={String(v || "")}
                      onChange={(e) => upsertAnswer(q.id, e.target.value)}
                      sx={{ flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap", gap: { xs: 0, sm: 1 } }}
                    >
                      <FormControlLabel value="True" disabled={!canAnswer} control={<Radio size="small" />} label="True" />
                      <FormControlLabel value="False" disabled={!canAnswer} control={<Radio size="small" />} label="False" />
                    </RadioGroup>
                  ) : qType === "multiple_choice" ? (
                    <RadioGroup
                      value={String(v || "")}
                      onChange={(e) => upsertAnswer(q.id, e.target.value)}
                      sx={{ flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap", gap: { xs: 0, sm: 1 } }}
                    >
                      {opts.map((o) => (
                        <FormControlLabel
                          key={`${q.id}-radio-${o}`}
                          value={o}
                          disabled={!canAnswer}
                          control={<Radio size="small" />}
                          label={o}
                        />
                      ))}
                    </RadioGroup>
                  ) : qType === "multi_select" ? (
                    <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" useFlexGap spacing={{ xs: 0.25, sm: 1 }}>
                      {opts.map((o) => {
                        const selectedValues = Array.isArray(v) ? v : [];
                        const checked = selectedValues.includes(o);
                        return (
                          <FormControlLabel
                            key={`${q.id}-check-${o}`}
                            control={
                              <Checkbox
                                size="small"
                                disabled={!canAnswer}
                                checked={checked}
                                onChange={(e) => {
                                  const curr = Array.isArray(v) ? v : [];
                                  upsertAnswer(
                                    q.id,
                                    e.target.checked ? [...curr, o] : curr.filter((x) => x !== o)
                                  );
                                }}
                              />
                            }
                            label={o}
                          />
                        );
                      })}
                    </Stack>
                  ) : qType === "diagram_label" ? (
                    <Stack spacing={1.25}>
                      {diagramData ? (
                        <Box
                          component="img"
                          src={diagramData}
                          alt="Diagram question"
                          sx={{
                            width: "100%",
                            maxWidth: 520,
                            borderRadius: 1,
                            border: "1px solid #e5e7eb",
                            bgcolor: "#fff",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Alert severity="warning">Diagram image missing for this question.</Alert>
                      )}
                      {diagramHotspots.length ? (
                        diagramHotspots.map((hs, hsIdx) => {
                          const hsKey = String(hs?.id || hsIdx + 1);
                          const answerMap = v && typeof v === "object" ? v : {};
                          return (
                            <TextField
                              key={hsKey}
                              fullWidth
                              size="small"
                              label={hs?.prompt ? `Label ${hsIdx + 1}: ${hs.prompt}` : `Label ${hsIdx + 1}`}
                              value={String(answerMap[hsKey] || "")}
                              onChange={(e) =>
                                upsertAnswer(q.id, {
                                  ...answerMap,
                                  [hsKey]: e.target.value,
                                })
                              }
                              disabled={!canAnswer}
                            />
                          );
                        })
                      ) : (
                        <Alert severity="info">No label points configured for this diagram.</Alert>
                      )}
                    </Stack>
                  ) : qType === "file_upload" ? (
                    <Stack spacing={1}>
                      {uploadCfg?.hint ? (
                        <Typography variant="body2" color="text.secondary">
                          {uploadCfg.hint}
                        </Typography>
                      ) : null}
                      <Typography variant="caption" color="text.secondary">
                        Upload up to {uploadCfg?.maxFiles || 1} file(s), max {uploadCfg?.maxSizeMb || 10} MB each.
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={!canAnswer || uploadingQuestionId === q.id || uploadedFiles.length >= (uploadCfg?.maxFiles || 1)}
                        size="small"
                        sx={{ alignSelf: "flex-start" }}
                      >
                        {uploadingQuestionId === q.id ? "Uploading…" : "Choose file"}
                        <input
                          type="file"
                          hidden
                          accept={htmlAcceptFromMimeList(uploadCfg?.accept)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) void handleFileUpload(q, file);
                          }}
                        />
                      </Button>
                      {uploadedFiles.length ? (
                        <Stack spacing={0.5}>
                          {uploadedFiles.map((f, fi) => (
                            <Typography key={`${q.id}-file-${fi}`} variant="body2">
                              <Box
                                component="a"
                                href={schoolPortalMediaUrl(f.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: accent, fontWeight: 600 }}
                              >
                                {f.name || `File ${fi + 1}`}
                              </Box>
                              {f.size ? (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({Math.round(Number(f.size) / 1024)} KB)
                                </Typography>
                              ) : null}
                            </Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No file uploaded yet.
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <TextField
                      fullWidth
                      multiline
                      minRows={qType === "essay" || qType === "long_text" ? 4 : 2}
                      value={typeof v === "string" ? v : ""}
                      onChange={(e) => upsertAnswer(q.id, e.target.value)}
                      disabled={!canAnswer}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
        ) : null}

        {showPaper ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 2, width: "100%", pt: 1, borderTop: `1px solid ${cardBorder}` }}
        >
          <Button variant="outlined" onClick={() => navigate("/portal/exams")}>
            Back
          </Button>
          {requiresRoom && (isLiveKitInvigilation || schedule?.meeting_join_url) ? (
            <Button
              variant={roomConfirmed ? "contained" : "outlined"}
              color={roomConfirmed ? "success" : "primary"}
              onClick={() => {
                if (isLiveKitInvigilation) {
                  navigate(`/portal/exam-schedule/${scheduleId}/invigilation`);
                  return;
                }
                setRoomOpen(true);
                setRoomConfirmed(true);
              }}
            >
              {roomConfirmed
                ? isLiveKitInvigilation
                  ? "Re-open invigilation room"
                  : "Invigilation room opened"
                : "Open invigilation room"}
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={() => void submitNow("manual_submit")}
            disabled={
              isSubmitted ||
              submitting ||
              autoSubmitting ||
              (remainingSeconds != null && remainingSeconds <= 0) ||
              !canAnswer
            }
            sx={portalPrimaryButtonSx()}
          >
            {isSubmitted
              ? "Already submitted"
              : submitting || autoSubmitting
                ? "Submitting..."
                : "Submit exam"}
          </Button>
        </Stack>
        ) : null}
      </Box>
      <Dialog open={roomOpen && !isLiveKitInvigilation} onClose={() => setRoomOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pr: 5 }}>
          Invigilation room
          <IconButton aria-label="Close" onClick={() => setRoomOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: "75vh" }}>
          {schedule?.meeting_join_url ? (
            <Box
              component="iframe"
              title="Invigilation room"
              src={schedule.meeting_join_url}
              sx={{ width: "100%", height: "100%", border: 0 }}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write"
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Alert severity="warning">No meeting link configured for this exam schedule.</Alert>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {showPaper && isLiveKitInvigilation && roomConfirmed && scheduleId ? (
        <ExamInvigilationVideoDock
          examScheduleId={scheduleId}
          meetJoinUrl={schedule?.meet_join_url || schedule?.meeting_join_url}
        />
      ) : null}
    </Box>
  );
}

