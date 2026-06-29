import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Swal from "sweetalert2";
import {
  saveSchoolPortalAssignmentAnswers,
  submitSchoolPortalAssignment,
  uploadSchoolPortalAssignmentAnswerFile,
} from "../api";
import AssignmentQuestionInput from "../components/Portal/AssignmentQuestionInput";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";
import {
  answerFromStoredRow,
  defaultAnswerForQuestionType,
  serializeAnswerForSave,
} from "../utils/assignmentQuestionUtils";

const cardBorder = PORTAL.border;
const edgePad = { xs: 1.5, sm: 2, md: 2.5 };

function buildAnswersMap(assignment, submission) {
  const map = {};
  (assignment?.questions || []).forEach((q) => {
    const stored = (submission?.answers || []).find((a) => String(a.question_id) === String(q.id));
    map[q.id] = stored
      ? answerFromStoredRow(stored, q.question_type)
      : defaultAnswerForQuestionType(q.question_type);
  });
  return map;
}

export default function PortalAssignmentTakePage({ bootPayload }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState("");
  const [assignment, setAssignment] = useState(bootPayload?.assignment ?? null);
  const [submission, setSubmission] = useState(bootPayload?.submission ?? null);
  const [access, setAccess] = useState(bootPayload?.access ?? {});
  const [answersByQuestion, setAnswersByQuestion] = useState(() =>
    buildAnswersMap(bootPayload?.assignment, bootPayload?.submission)
  );
  const saveTimerRef = useRef(null);
  const answersRef = useRef({});
  answersRef.current = answersByQuestion;

  const buildAnswersPayload = useCallback(
    (answerMap) =>
      (assignment?.questions || []).map((q) => ({
        question_id: q.id,
        ...serializeAnswerForSave(q, answerMap[q.id]),
      })),
    [assignment?.questions]
  );

  const persistAnswers = useCallback(
    async (answerMap, submissionId) => {
      const sid = submissionId || submission?.id;
      if (!sid || submission?.status === "submitted") return;
      setSaving(true);
      try {
        const updated = await saveSchoolPortalAssignmentAnswers(sid, buildAnswersPayload(answerMap ?? answersRef.current));
        setSubmission((prev) => ({ ...prev, ...updated, answers: updated?.answers || prev?.answers || [] }));
      } catch {
        // Non-blocking autosave (matches exam take page)
      } finally {
        setSaving(false);
      }
    },
    [submission?.id, submission?.status, buildAnswersPayload]
  );

  const queueSave = useCallback(
    (answerMap) => {
      if (!submission?.id || submission?.status === "submitted" || !access.can_edit) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void persistAnswers(answerMap), 800);
    },
    [persistAnswers, submission?.id, submission?.status, access.can_edit]
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  const upsertAnswer = (questionId, value) => {
    setAnswersByQuestion((prev) => {
      const next = { ...prev, [questionId]: value };
      queueSave(next);
      return next;
    });
  };

  const save = async () => {
    if (!submission?.id) return;
    await persistAnswers(answersByQuestion);
  };

  const handleFileUpload = async (question, file) => {
    if (!submission?.id) {
      await Swal.fire({ icon: "warning", title: "Not ready", text: "Your assignment draft is still loading. Try again in a moment." });
      return;
    }
    if (!access.can_edit) {
      await Swal.fire({ icon: "warning", title: "Cannot upload", text: "This assignment is closed or already submitted." });
      return;
    }
    setUploadingQuestionId(question.id);
    try {
      const answer = await uploadSchoolPortalAssignmentAnswerFile(submission.id, question.id, file);
      let json = answer?.answer_json;
      if (typeof json === "string") {
        try {
          json = JSON.parse(json);
        } catch {
          json = null;
        }
      }
      const files = Array.isArray(json?.files) ? json.files : [];
      upsertAnswer(question.id, { files });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Upload failed", text: e.message });
    } finally {
      setUploadingQuestionId("");
    }
  };

  const submit = async () => {
    if (!submission?.id) return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Submit assignment?",
      text: "You will not be able to edit after submitting.",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    setSubmitting(true);
    try {
      await persistAnswers(answersByQuestion);
      await submitSchoolPortalAssignment(submission.id);
      navigate("/portal/assignments", { state: { assignmentMessage: "Assignment submitted." } });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Submit failed", text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const canAnswer = Boolean(access.can_edit) && submission?.status !== "submitted";

  if (access.is_submitted) {
    return (
      <Box sx={{ width: "100%", minHeight: "calc(100vh - 64px)", bgcolor: "#f8fafc", px: edgePad, py: 2 }}>
        <Alert severity="success">You already submitted this assignment.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/portal/assignments")}>
          Back to list
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#f8fafc",
        pb: 3,
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
                {assignment?.title || "Assignment"}
              </Typography>
              {assignment?.instructions ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                  {assignment.instructions}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {saving ? "Saving…" : canAnswer ? "Answers save automatically" : ""}
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: edgePad, pt: 1.5 }}>
        {!canAnswer ? (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            {access.is_closed ? "This assignment is closed." : "You cannot edit this assignment right now."}
          </Alert>
        ) : null}

        <Stack spacing={1.5} sx={{ width: "100%" }}>
          {(assignment?.questions || []).map((q, idx) => (
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
                  {q.marks ? ` (${q.marks} marks)` : ""}
                  {q.required ? " *" : ""}
                </Typography>
                <AssignmentQuestionInput
                  question={q}
                  value={answersByQuestion[q.id]}
                  onChange={(next) => upsertAnswer(q.id, next)}
                  disabled={!canAnswer}
                  uploading={uploadingQuestionId === q.id}
                  onUploadFile={(file) => handleFileUpload(q, file)}
                />
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 2, width: "100%", pt: 1, borderTop: `1px solid ${cardBorder}` }}
        >
          <Button variant="outlined" onClick={() => navigate("/portal/assignments")}>
            Back
          </Button>
          <Button variant="outlined" disabled={saving || !canAnswer} onClick={() => void save()}>
            {saving ? "Saving…" : "Save now"}
          </Button>
          <Button
            variant="contained"
            disabled={submitting || !canAnswer}
            onClick={() => void submit()}
            sx={portalPrimaryButtonSx()}
          >
            {submitting ? "Submitting…" : "Submit assignment"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
