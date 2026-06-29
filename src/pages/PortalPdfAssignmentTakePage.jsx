import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Swal from "sweetalert2";
import {
  deleteSchoolPortalAssignmentPdfWorkingPaper,
  fetchSchoolPortalAssignmentPdfTemplateBlob,
  saveSchoolPortalAssignmentPdfAnswers,
  schoolPortalMediaUrl,
  submitSchoolPortalAssignment,
  uploadSchoolPortalAssignmentPdfWorkingPaper,
} from "../api";
import StablePdfIframe from "../components/Exam/StablePdfIframe";
import {
  createManualAnswerEntry,
  isImageWorkingPaper,
  normalizeWorkingPapers,
  parseManualPdfAnswers,
  PDF_MAX_WORKING_PAPERS,
  serializeManualPdfAnswers,
} from "../utils/pdfManualAnswers";
import { getCachedExamPdfBlobUrl, peekCachedExamPdfBlobUrl } from "../utils/pdfExamBlobCache";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";

const accent = PORTAL.gold;
const cardBorder = PORTAL.border;
const edgePad = { xs: 1.5, sm: 2, md: 2.5 };

export default function PortalPdfAssignmentTakePage({ bootPayload }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const [removingPaperId, setRemovingPaperId] = useState("");
  const [assignment] = useState(bootPayload?.assignment ?? null);
  const [submission, setSubmission] = useState(bootPayload?.submission ?? null);
  const [access] = useState(bootPayload?.access ?? {});
  const [entries, setEntries] = useState(() => {
    const parsed = parseManualPdfAnswers(bootPayload?.submission?.pdf_answers_json);
    return parsed.entries.length ? parsed.entries : [createManualAnswerEntry()];
  });
  const [workingPapers, setWorkingPapers] = useState(() => {
    const parsed = parseManualPdfAnswers(bootPayload?.submission?.pdf_answers_json);
    return normalizeWorkingPapers(parsed.working_papers);
  });
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const entriesRef = useRef(entries);
  const workingPapersRef = useRef(workingPapers);
  const cameraInputRef = useRef(null);
  const scanInputRef = useRef(null);
  entriesRef.current = entries;
  workingPapersRef.current = workingPapers;

  const canAnswer = Boolean(access.can_edit) && submission?.status !== "submitted";

  useEffect(() => {
    const assignmentId = assignment?.id;
    if (!assignmentId) return;
    let cancelled = false;

    const cached = peekCachedExamPdfBlobUrl(assignmentId);
    if (cached) {
      setPdfUrl(cached);
      setPdfLoading(false);
    } else {
      setPdfLoading(true);
    }

    getCachedExamPdfBlobUrl(assignmentId, () => fetchSchoolPortalAssignmentPdfTemplateBlob(assignmentId))
      .then((url) => {
        if (!cancelled) {
          setPdfUrl(url);
          setPdfLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignment?.id]);

  const applyWorkingPapers = useCallback((papers) => {
    const next = Array.isArray(papers) ? papers : [];
    workingPapersRef.current = next;
    setWorkingPapers(next);
  }, []);

  const syncWorkingPapersFromSubmission = useCallback(
    (sub, uploadedFile = null) => {
      if (!sub) return;
      setSubmission(sub);
      const parsed = parseManualPdfAnswers(sub.pdf_answers_json);
      let papers = parsed.working_papers;
      if (!papers.length && uploadedFile) {
        papers = normalizeWorkingPapers([uploadedFile]);
      }
      applyWorkingPapers(papers);
    },
    [applyWorkingPapers]
  );

  const persistAnswers = useCallback(
    async (nextEntries, submissionId) => {
      const sid = submissionId || submission?.id;
      if (!sid || !canAnswer) return;
      setSaving(true);
      try {
        const updated = await saveSchoolPortalAssignmentPdfAnswers(
          sid,
          serializeManualPdfAnswers(nextEntries, workingPapersRef.current)
        );
        if (updated) setSubmission(updated);
      } catch {
        // Non-blocking autosave
      } finally {
        setSaving(false);
      }
    },
    [submission?.id, canAnswer]
  );

  const queueSave = useCallback(
    (nextEntries) => {
      if (!canAnswer) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void persistAnswers(nextEntries), 800);
    },
    [persistAnswers, canAnswer]
  );

  const updateEntry = (id, patch) => {
    setEntries((prev) => {
      const next = prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
      queueSave(next);
      return next;
    });
  };

  const addEntry = () => {
    setEntries((prev) => {
      const next = [...prev, createManualAnswerEntry()];
      queueSave(next);
      return next;
    });
  };

  const removeEntry = (id) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((entry) => entry.id !== id);
      queueSave(next);
      return next;
    });
  };

  const handleWorkingPaperUpload = async (file) => {
    if (!file || !submission?.id || !canAnswer) return;
    if (workingPapers.length >= PDF_MAX_WORKING_PAPERS) {
      await Swal.fire({
        icon: "warning",
        title: "Upload limit reached",
        text: `You can upload up to ${PDF_MAX_WORKING_PAPERS} working paper files.`,
      });
      return;
    }
    setUploadingPaper(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      const data = await uploadSchoolPortalAssignmentPdfWorkingPaper(submission.id, file);
      const parsed = parseManualPdfAnswers(data?.pdf_answers_json || submission.pdf_answers_json);
      applyWorkingPapers(parsed.working_papers);
      setSubmission((prev) => ({ ...prev, pdf_answers_json: data?.pdf_answers_json }));
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Upload failed", text: e.message || "Could not upload file." });
    } finally {
      setUploadingPaper(false);
    }
  };

  const handleRemoveWorkingPaper = async (fileId) => {
    if (!submission?.id || !fileId || !canAnswer) return;
    setRemovingPaperId(fileId);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      const data = await deleteSchoolPortalAssignmentPdfWorkingPaper(submission.id, fileId);
      syncWorkingPapersFromSubmission({ ...submission, pdf_answers_json: data?.pdf_answers_json });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Remove failed", text: e.message || "Could not remove file." });
    } finally {
      setRemovingPaperId("");
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
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      await saveSchoolPortalAssignmentPdfAnswers(
        submission.id,
        serializeManualPdfAnswers(entriesRef.current, workingPapersRef.current)
      );
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
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Read the assignment PDF on the left, then type answers and upload your working on the right.
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
              {saving ? <Typography variant="caption">Saving…</Typography> : null}
              {uploadingPaper ? <Typography variant="caption">Uploading…</Typography> : null}
              <Button
                variant="contained"
                disabled={submitting || !canAnswer}
                onClick={() => void submit()}
                sx={portalPrimaryButtonSx()}
              >
                {submitting ? "Submitting…" : "Submit assignment"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: edgePad, pt: 1.5 }}>
        {!canAnswer ? (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            {access.is_closed ? "This assignment is closed." : "You cannot edit this assignment right now."}
          </Alert>
        ) : null}

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <Card sx={{ flex: 1.2, minHeight: 480, border: `1px solid ${cardBorder}` }} elevation={0}>
            <CardContent sx={{ p: 0, height: "100%" }}>
              {pdfLoading && !pdfUrl ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: { xs: 420, lg: 640 },
                    bgcolor: "#f9fafb",
                  }}
                >
                  <CircularProgress sx={{ color: accent }} />
                </Box>
              ) : pdfUrl ? (
                <StablePdfIframe src={pdfUrl} title="Assignment PDF" />
              ) : (
                <Alert severity="warning" sx={{ m: 2 }}>
                  Your teacher has not uploaded the assignment PDF yet.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, border: `1px solid ${cardBorder}` }} elevation={0}>
            <CardContent sx={{ px: { xs: 1.75, sm: 2.5 }, py: { xs: 1.75, sm: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Typed answers
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addEntry}
                  disabled={!canAnswer}
                  sx={{ borderColor: accent, color: accent }}
                >
                  Add answer
                </Button>
              </Stack>
              <Alert severity="info" sx={{ mb: 1.5 }}>
                Type answers for questions you can answer here. For the rest, work on paper and upload photos or a scan
                below.
              </Alert>
              <Stack spacing={1.5}>
                {entries.map((entry, index) => (
                  <Box
                    key={entry.id}
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 1,
                      p: 1.25,
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Answer {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={entries.length <= 1 || !canAnswer}
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Remove answer"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Question number"
                        placeholder="e.g. 1, 2a, 3b"
                        value={entry.question}
                        onChange={(e) => updateEntry(entry.id, { question: e.target.value })}
                        disabled={!canAnswer}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Your answer"
                        placeholder="Type your answer here"
                        multiline
                        minRows={2}
                        value={entry.answer}
                        onChange={(e) => updateEntry(entry.id, { answer: e.target.value })}
                        disabled={!canAnswer}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Working on paper
              </Typography>
              <Alert severity="info" sx={{ mb: 1.5 }}>
                Work on your own paper for the remaining questions. Take <strong>many photos</strong> with your camera,
                or upload <strong>one scanned PDF</strong>. You can mix both.
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={uploadingPaper ? <CircularProgress size={16} /> : <CameraAltOutlinedIcon />}
                  disabled={uploadingPaper || !canAnswer || workingPapers.length >= PDF_MAX_WORKING_PAPERS}
                  onClick={() => cameraInputRef.current?.click()}
                  sx={{ borderColor: accent, color: accent }}
                >
                  Take photo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={uploadingPaper ? <CircularProgress size={16} /> : <UploadFileOutlinedIcon />}
                  disabled={uploadingPaper || !canAnswer || workingPapers.length >= PDF_MAX_WORKING_PAPERS}
                  onClick={() => scanInputRef.current?.click()}
                  sx={{ borderColor: accent, color: accent }}
                >
                  Upload scan / file
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Up to {PDF_MAX_WORKING_PAPERS} files · images or PDF · 25 MB each
              </Typography>
              <input
                ref={cameraInputRef}
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleWorkingPaperUpload(file);
                }}
              />
              <input
                ref={scanInputRef}
                type="file"
                hidden
                accept="image/*,application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleWorkingPaperUpload(file);
                }}
              />
              {workingPapers.length ? (
                <Stack spacing={1}>
                  {workingPapers.map((file, index) => {
                    const fileUrl = schoolPortalMediaUrl(file.url);
                    const isImage = isImageWorkingPaper(file);
                    return (
                      <Box
                        key={file.id}
                        sx={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 1,
                          p: 1,
                          bgcolor: "#fff",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Paper {index + 1}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                              {file.name || "Uploaded file"}
                            </Typography>
                            {fileUrl ? (
                              <Button
                                size="small"
                                component="a"
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ mt: 0.5, px: 0, minWidth: 0 }}
                              >
                                Open file
                              </Button>
                            ) : null}
                            {isImage && fileUrl ? (
                              <Box
                                component="img"
                                src={fileUrl}
                                alt={file.name || "Working paper"}
                                sx={{
                                  mt: 1,
                                  maxWidth: "100%",
                                  maxHeight: 160,
                                  borderRadius: 1,
                                  border: "1px solid #e5e7eb",
                                  display: "block",
                                }}
                              />
                            ) : null}
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!canAnswer || removingPaperId === file.id}
                            onClick={() => void handleRemoveWorkingPaper(file.id)}
                            aria-label="Remove uploaded paper"
                          >
                            {removingPaperId === file.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteOutlineIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No working papers uploaded yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>

        <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/portal/assignments")}>
            Back to assignments
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
