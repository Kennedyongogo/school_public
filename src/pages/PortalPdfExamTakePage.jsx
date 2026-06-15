import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  createSchoolPortalExamSubmission,
  deleteSchoolPortalExamPdfWorkingPaper,
  fetchSchoolPortalExamPdfTemplateBlob,
  fetchSchoolPortalMyExamLobbyStatus,
  fetchSchoolPortalMyExamSubmission,
  fetchSchoolPortalStudentExamSchedules,
  saveSchoolPortalExamPdfAnswers,
  schoolPortalMediaUrl,
  submitSchoolPortalExam,
  uploadSchoolPortalExamPdfWorkingPaper,
} from "../api";
import {
  scheduleRequiresInvigilationRoom,
  hasExamInvigilationPaperAccess,
  clearExamInvigilationPaperAccess,
} from "../utils/examInvigilation";
import {
  createManualAnswerEntry,
  isImageWorkingPaper,
  normalizeWorkingPapers,
  parseManualPdfAnswers,
  PDF_MAX_WORKING_PAPERS,
  serializeManualPdfAnswers,
} from "../utils/pdfManualAnswers";
import { getCachedExamPdfBlobUrl, clearCachedExamPdfBlobUrl, peekCachedExamPdfBlobUrl } from "../utils/pdfExamBlobCache";
import StablePdfIframe from "../components/Exam/StablePdfIframe";
import { PORTAL, portalPageShellSx, portalPrimaryButtonSx } from "../components/Portal/portalShared";

const accent = PORTAL.gold;

export default function PortalPdfExamTakePage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scheduleSnapshotRef = useRef(location.state?.scheduleSnapshot || null);
  if (location.state?.scheduleSnapshot) {
    scheduleSnapshotRef.current = location.state.scheduleSnapshot;
  }
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPaper, setUploadingPaper] = useState(false);
  const [removingPaperId, setRemovingPaperId] = useState("");
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [entries, setEntries] = useState([createManualAnswerEntry()]);
  const [workingPapers, setWorkingPapers] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const entriesRef = useRef(entries);
  const workingPapersRef = useRef(workingPapers);
  const loadedExamIdRef = useRef("");
  entriesRef.current = entries;
  workingPapersRef.current = workingPapers;
  const cameraInputRef = useRef(null);
  const scanInputRef = useRef(null);

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
      if (!sid) return;
      setSaving(true);
      try {
        const updated = await saveSchoolPortalExamPdfAnswers(sid, serializeManualPdfAnswers(nextEntries));
        if (updated) setSubmission(updated);
      } catch {
        // Non-blocking autosave
      } finally {
        setSaving(false);
      }
    },
    [submission?.id]
  );

  const queueSave = useCallback(
    (nextEntries) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void persistAnswers(nextEntries), 800);
    },
    [persistAnswers]
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
    if (!file || !submission?.id) return;
    if (workingPapers.length >= PDF_MAX_WORKING_PAPERS) {
      await Swal.fire({
        icon: "warning",
        title: "Upload limit reached",
        text: `You can upload up to ${PDF_MAX_WORKING_PAPERS} working paper files.`,
      });
      return;
    }
    setUploadingPaper(true);
    setError("");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      const { submission: updated, uploaded_file: uploadedFile } =
        await uploadSchoolPortalExamPdfWorkingPaper(submission.id, file);
      syncWorkingPapersFromSubmission(updated, uploadedFile);
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Upload failed", text: e.message || "Could not upload file." });
    } finally {
      setUploadingPaper(false);
    }
  };

  const handleRemoveWorkingPaper = async (fileId) => {
    if (!submission?.id || !fileId) return;
    setRemovingPaperId(fileId);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      const updated = await deleteSchoolPortalExamPdfWorkingPaper(submission.id, fileId);
      syncWorkingPapersFromSubmission(updated);
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Remove failed", text: e.message || "Could not remove file." });
    } finally {
      setRemovingPaperId("");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!scheduleId) return;
      setBootLoading(true);
      setError("");

      try {
        let sc = scheduleSnapshotRef.current;
        if (!sc || String(sc.id) !== String(scheduleId)) {
          const schedules = await fetchSchoolPortalStudentExamSchedules();
          sc = schedules.find((x) => String(x.id) === String(scheduleId));
        }
        if (!sc) throw new Error("Exam not found for your class.");
        const examType = sc.exam_type || sc.exam?.exam_type || "questions";
        if (examType !== "pdf_form") {
          navigate(`/portal/exams/${scheduleId}`, { replace: true });
          return;
        }
        if (
          sc?.attendance?.submitted_at ||
          sc?.submission_status === "submitted" ||
          sc?.open_block_reason === "already_submitted"
        ) {
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

        const examId = String(sc.exam?.id || sc.id);
        if (loadedExamIdRef.current && loadedExamIdRef.current !== examId) {
          clearCachedExamPdfBlobUrl(loadedExamIdRef.current);
        }
        loadedExamIdRef.current = examId;

        setSchedule(sc);
        setExam(sc.exam || null);

        const cachedPdfUrl = peekCachedExamPdfBlobUrl(examId);
        if (cachedPdfUrl) {
          setPdfUrl(cachedPdfUrl);
          setPdfLoading(false);
        } else {
          setPdfLoading(true);
        }

        const pdfPromise = getCachedExamPdfBlobUrl(examId, () => fetchSchoolPortalExamPdfTemplateBlob(examId));
        pdfPromise
          .then((url) => {
            if (!cancelled) {
              setPdfUrl(url);
              setPdfLoading(false);
            }
          })
          .catch(() => {
            if (!cancelled) setPdfLoading(false);
          });

        await createSchoolPortalExamSubmission(examId);
        const { submission: sub } = await fetchSchoolPortalMyExamSubmission(examId);
        if (!sub) throw new Error("Could not load submission.");
        if (sub.status === "submitted") {
          navigate("/portal/exams", { replace: true, state: { examMessage: "You already submitted this exam." } });
          return;
        }

        const parsed = parseManualPdfAnswers(sub.pdf_answers_json);
        if (!cancelled) {
          setExam(sub.exam || sc.exam || null);
          setSubmission(sub);
          setEntries(parsed.entries);
          setWorkingPapers(parsed.working_papers);
        }

        await pdfPromise;
      } catch (e) {
        if (!cancelled) {
          setPdfLoading(false);
          setError(e.message || "Could not open PDF exam.");
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
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
            text: "You cannot change answers or uploads after submitting.",
            showCancelButton: true,
            confirmButtonColor: accent,
          });
    if (!confirm.isConfirmed) return;
    setSubmitting(true);
    try {
      await saveSchoolPortalExamPdfAnswers(
        submission.id,
        serializeManualPdfAnswers(entriesRef.current, workingPapersRef.current)
      );
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

  if (error && !schedule) {
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
          {exam?.title || schedule?.exam?.title || (bootLoading ? "Loading exam…" : "PDF Exam")}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {remainingSeconds != null ? (
            <Typography sx={{ fontWeight: 700, color: remainingSeconds < 300 ? accent : "text.primary" }}>
              {formatTime(remainingSeconds)}
            </Typography>
          ) : null}
          {saving ? <Typography variant="caption">Saving…</Typography> : null}
          {uploadingPaper ? <Typography variant="caption">Uploading…</Typography> : null}
          <Button
            variant="contained"
            disabled={submitting || bootLoading || submission?.status === "submitted"}
            onClick={() => void handleSubmit()}
            sx={portalPrimaryButtonSx()}
          >
            {submission?.status === "submitted"
              ? "Already submitted"
              : submitting
                ? "Submitting…"
                : "Submit exam"}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Card sx={{ flex: 1.2, minHeight: 480 }} elevation={0}>
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
              <StablePdfIframe src={pdfUrl} title="Exam PDF" />
            ) : (
              <Alert severity="warning">PDF preview unavailable.</Alert>
            )}
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }} elevation={0}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Typed answers
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addEntry}
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
                      disabled={entries.length <= 1}
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
                disabled={uploadingPaper || workingPapers.length >= PDF_MAX_WORKING_PAPERS}
                onClick={() => cameraInputRef.current?.click()}
                sx={{ borderColor: accent, color: accent }}
              >
                Take photo
              </Button>
              <Button
                variant="outlined"
                startIcon={uploadingPaper ? <CircularProgress size={16} /> : <UploadFileOutlinedIcon />}
                disabled={uploadingPaper || workingPapers.length >= PDF_MAX_WORKING_PAPERS}
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
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={removingPaperId === file.id}
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
                      {isImage && fileUrl ? (
                        <Box
                          component="img"
                          src={fileUrl}
                          alt={file.name || `Working paper ${index + 1}`}
                          sx={{
                            mt: 1,
                            width: "100%",
                            maxHeight: 180,
                            objectFit: "contain",
                            borderRadius: 1,
                            border: "1px solid #f3f4f6",
                            bgcolor: "#f9fafb",
                          }}
                        />
                      ) : null}
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No working paper uploaded yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
