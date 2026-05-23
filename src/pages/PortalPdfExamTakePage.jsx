import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  createSchoolPortalExamSubmission,
  fetchSchoolPortalExamPdfTemplateBlob,
  fetchSchoolPortalMyExamLobbyStatus,
  fetchSchoolPortalMyExamSubmission,
  fetchSchoolPortalStudentExamSchedules,
  saveSchoolPortalExamPdfAnswers,
  submitSchoolPortalExam,
} from "../api";
import { showExamFeeErrorFromApi } from "../utils/examFeeAlerts";
import {
  scheduleRequiresInvigilationRoom,
  hasExamInvigilationPaperAccess,
  clearExamInvigilationPaperAccess,
} from "../utils/examInvigilation";

const accent = "#DC2626";

function FieldInput({ field, value, onChange }) {
  const name = field.name;
  const type = String(field.type || "Text");
  const helper = field.prompt ? String(field.prompt).trim() : "";
  if (type === "long_text") {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {field.label || name}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            {helper}
          </Typography>
        ) : null}
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={4}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="Type your answer and working here"
        />
      </Box>
    );
  }
  if (type === "CheckBox") {
    return (
      <FormControlLabel
        control={<Checkbox checked={Boolean(value)} onChange={(e) => onChange(name, e.target.checked)} />}
        label={name}
      />
    );
  }
  if (type === "RadioGroup" && Array.isArray(field.options) && field.options.length) {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {field.label || name}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            {helper}
          </Typography>
        ) : null}
        <RadioGroup value={value ?? ""} onChange={(e) => onChange(name, e.target.value)}>
          {field.options.map((opt) => (
            <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
          ))}
        </RadioGroup>
      </Box>
    );
  }
  if (type === "Dropdown" && Array.isArray(field.options) && field.options.length) {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <MenuItem value="">
          <em>Select</em>
        </MenuItem>
        {field.options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {field.label || name}
      </Typography>
      {helper ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
          {helper}
        </Typography>
      ) : null}
      <TextField
        fullWidth
        size="small"
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        multiline
        minRows={2}
      />
    </Box>
  );
}

export default function PortalPdfExamTakePage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [pdfUrl, setPdfUrl] = useState("");
  const saveTimerRef = useRef(null);

  const deadline = useMemo(() => {
    if (!submission?.started_at || !exam?.duration_minutes) return null;
    return new Date(submission.started_at).getTime() + Number(exam.duration_minutes) * 60 * 1000;
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

  const persistAnswers = useCallback(
    async (nextAnswers, submissionId) => {
      const sid = submissionId || submission?.id;
      if (!sid) return;
      setSaving(true);
      try {
        await saveSchoolPortalExamPdfAnswers(sid, nextAnswers);
      } catch {
        // Non-blocking autosave
      } finally {
        setSaving(false);
      }
    },
    [submission?.id]
  );

  const onFieldChange = (name, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [name]: value };
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void persistAnswers(next), 800);
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      if (!scheduleId) return;
      setLoading(true);
      setError("");
      try {
        const schedules = await fetchSchoolPortalStudentExamSchedules();
        const sc = schedules.find((x) => String(x.id) === String(scheduleId));
        if (!sc) throw new Error("Exam not found for your class.");
        const examType = sc.exam_type || sc.exam?.exam_type || "questions";
        if (examType !== "pdf_form") {
          navigate(`/portal/exams/${scheduleId}`, { replace: true });
          return;
        }
        if (sc?.attendance?.submitted_at) {
          navigate("/portal/exams", { replace: true, state: { examMessage: "You already submitted this exam." } });
          return;
        }
        if (scheduleRequiresInvigilationRoom(sc)) {
          let admitted = false;
          try {
            const lobby = await fetchSchoolPortalMyExamLobbyStatus(scheduleId);
            admitted = lobby?.status === "admitted";
          } catch {
            admitted = false;
          }
          if (!(admitted && hasExamInvigilationPaperAccess(scheduleId))) {
            clearExamInvigilationPaperAccess(scheduleId);
            navigate(`/portal/exam-schedule/${scheduleId}/invigilation`, { replace: true });
            return;
          }
        }
        setSchedule(sc);
        try {
          await createSchoolPortalExamSubmission(sc.exam?.id || sc.id);
        } catch (submissionErr) {
          if (await showExamFeeErrorFromApi(submissionErr)) {
            navigate("/portal/exams", { replace: true });
            return;
          }
          throw submissionErr;
        }
        const { submission: sub } = await fetchSchoolPortalMyExamSubmission(sc.exam?.id || sc.id);
        if (!sub) throw new Error("Could not load submission.");
        if (sub.status === "submitted") {
          navigate("/portal/exams", { replace: true, state: { examMessage: "You already submitted this exam." } });
          return;
        }
        const ex = sub.exam || null;
        setSubmission(sub);
        setExam(ex);
        setFields(Array.isArray(ex?.pdf_field_schema_json) ? ex.pdf_field_schema_json : []);
        const initial =
          sub.pdf_answers_json && typeof sub.pdf_answers_json === "object" ? { ...sub.pdf_answers_json } : {};
        setAnswers(initial);
        const examId = ex?.id || sc.exam?.id || sc.id;
        const blob = await fetchSchoolPortalExamPdfTemplateBlob(examId);
        setPdfUrl(URL.createObjectURL(blob));
      } catch (e) {
        setError(e.message || "Could not open PDF exam.");
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [scheduleId, navigate]);

  useEffect(() => {
    if (remainingSeconds === 0 && deadline && submission?.status === "draft" && !submitting) {
      void handleSubmit("auto_submit_time_elapsed");
    }
  }, [remainingSeconds, deadline, submission?.status]);

  const handleSubmit = async (reason = "manual_submit") => {
    if (!submission?.id) return;
    const confirm =
      reason === "auto_submit_time_elapsed"
        ? { isConfirmed: true }
        : await Swal.fire({
            icon: "warning",
            title: "Submit exam?",
            text: "You cannot change answers after submitting.",
            showCancelButton: true,
            confirmButtonColor: accent,
          });
    if (!confirm.isConfirmed) return;
    setSubmitting(true);
    try {
      await saveSchoolPortalExamPdfAnswers(submission.id, answers);
      await submitSchoolPortalExam(submission.id, { submit_reason: reason });
      navigate("/portal/exams", {
        replace: true,
        state: { examMessage: "Exam submitted successfully." },
      });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Submit failed", text: e.message || "Could not submit." });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/portal/exams")}>
          Back to exams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {exam?.title || schedule?.exam?.title || "PDF Exam"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {remainingSeconds != null ? (
            <Typography sx={{ fontWeight: 700, color: remainingSeconds < 300 ? accent : "text.primary" }}>
              {formatTime(remainingSeconds)}
            </Typography>
          ) : null}
          {saving ? <Typography variant="caption">Saving…</Typography> : null}
          <Button
            variant="contained"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            sx={{ bgcolor: accent, "&:hover": { bgcolor: "#B91C1C" } }}
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Card sx={{ flex: 1.2, minHeight: 480 }} elevation={0}>
          <CardContent sx={{ p: 0, height: "100%" }}>
            {pdfUrl ? (
              <Box
                component="iframe"
                src={pdfUrl}
                title="Exam PDF"
                sx={{ width: "100%", height: { xs: 420, lg: 640 }, border: "none" }}
              />
            ) : (
              <Alert severity="warning">PDF preview unavailable.</Alert>
            )}
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }} elevation={0}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Your answers
            </Typography>
            <Stack spacing={1.5}>
              {fields.length ? (
                fields.map((f) => (
                  <FieldInput key={f.name} field={f} value={answers[f.name]} onChange={onFieldChange} />
                ))
              ) : (
                <Alert severity="info">No form fields were detected on this PDF.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
