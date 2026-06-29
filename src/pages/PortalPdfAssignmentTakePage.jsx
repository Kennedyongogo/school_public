import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Swal from "sweetalert2";
import {
  deleteSchoolPortalAssignmentPdfWorkingPaper,
  saveSchoolPortalAssignmentPdfAnswers,
  submitSchoolPortalAssignment,
  uploadSchoolPortalAssignmentPdfWorkingPaper,
} from "../api";
import {
  createManualAnswerEntry,
  normalizeWorkingPapers,
  parseManualPdfAnswers,
  serializeManualPdfAnswers,
} from "../utils/pdfManualAnswers";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";

export default function PortalPdfAssignmentTakePage({ bootPayload }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assignment, setAssignment] = useState(bootPayload?.assignment ?? null);
  const [submission, setSubmission] = useState(bootPayload?.submission ?? null);
  const [access, setAccess] = useState(bootPayload?.access ?? {});
  const [entries, setEntries] = useState(() => {
    const parsed = parseManualPdfAnswers(bootPayload?.submission?.pdf_answers_json);
    return parsed.entries.length ? parsed.entries : [createManualAnswerEntry()];
  });
  const [workingPapers, setWorkingPapers] = useState(() => {
    const parsed = parseManualPdfAnswers(bootPayload?.submission?.pdf_answers_json);
    return normalizeWorkingPapers(parsed.working_papers);
  });
  const fileRef = useRef(null);
  const saveTimer = useRef(null);

  const persist = useCallback(
    async (nextEntries, nextPapers) => {
      if (!submission?.id || !access.can_edit) return;
      setSaving(true);
      try {
        const payload = serializeManualPdfAnswers(nextEntries, nextPapers);
        const updated = await saveSchoolPortalAssignmentPdfAnswers(submission.id, payload);
        setSubmission(updated);
      } finally {
        setSaving(false);
      }
    },
    [submission?.id, access.can_edit]
  );

  const scheduleSave = useCallback(
    (nextEntries, nextPapers) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void persist(nextEntries, nextPapers), 800);
    },
    [persist]
  );

  const updateEntries = (next) => {
    setEntries(next);
    scheduleSave(next, workingPapers);
  };

  const onUpload = async (file) => {
    if (!file || !submission?.id) return;
    setUploading(true);
    try {
      const data = await uploadSchoolPortalAssignmentPdfWorkingPaper(submission.id, file);
      const parsed = parseManualPdfAnswers(data?.pdf_answers_json || submission.pdf_answers_json);
      const papers = normalizeWorkingPapers(parsed.working_papers);
      setWorkingPapers(papers);
      setSubmission((prev) => ({ ...prev, pdf_answers_json: data?.pdf_answers_json }));
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Upload failed", text: e.message });
    } finally {
      setUploading(false);
    }
  };

  const removePaper = async (fileId) => {
    if (!submission?.id) return;
    try {
      const data = await deleteSchoolPortalAssignmentPdfWorkingPaper(submission.id, fileId);
      const parsed = parseManualPdfAnswers(data?.pdf_answers_json);
      setWorkingPapers(normalizeWorkingPapers(parsed.working_papers));
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Remove failed", text: e.message });
    }
  };

  const submit = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Submit assignment?",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    setSubmitting(true);
    try {
      await persist(entries, workingPapers);
      await submitSchoolPortalAssignment(submission.id);
      navigate("/portal/assignments", { state: { assignmentMessage: "Assignment submitted." } });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Submit failed", text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (access.is_submitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="success">You already submitted this assignment.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/portal/assignments")}>Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Typography sx={{ fontFamily: PORTAL.fontDisplay, fontWeight: 800, fontSize: "1.5rem", mb: 1 }}>
        {assignment?.title || "Assignment"}
      </Typography>
      {assignment?.instructions ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          {assignment.instructions}
        </Typography>
      ) : null}

      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 700 }}>Typed answers</Typography>
        {entries.map((entry, idx) => (
          <Box key={entry.id || idx} sx={{ border: `1px solid ${PORTAL.border}`, borderRadius: 2, p: 2, bgcolor: "#fff" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <TextField
                size="small"
                label="Question #"
                value={entry.question || ""}
                onChange={(e) => {
                  const next = [...entries];
                  next[idx] = { ...entry, question: e.target.value };
                  updateEntries(next);
                }}
                sx={{ width: 120 }}
              />
              <Box sx={{ flex: 1 }} />
              <IconButton
                size="small"
                onClick={() => updateEntries(entries.filter((_, i) => i !== idx))}
                disabled={entries.length <= 1}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Your answer"
              value={entry.answer || ""}
              onChange={(e) => {
                const next = [...entries];
                next[idx] = { ...entry, answer: e.target.value };
                updateEntries(next);
              }}
            />
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={() => updateEntries([...entries, createManualAnswerEntry()])}>
          Add another answer
        </Button>

        <Typography sx={{ fontWeight: 700, pt: 1 }}>Upload working papers (PDF or images)</Typography>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void onUpload(f);
          }}
        />
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
        {workingPapers.map((paper) => (
          <Stack key={paper.id} direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{paper.name || "Uploaded file"}</Typography>
            <IconButton size="small" onClick={() => void removePaper(paper.id)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate("/portal/assignments")}>Back</Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
          {saving ? "Saving…" : "Draft saves automatically"}
        </Typography>
        <Button variant="contained" disabled={submitting} onClick={() => void submit()} sx={portalPrimaryButtonSx()}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </Stack>
    </Box>
  );
}
