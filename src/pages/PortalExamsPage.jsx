import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import {
  clearExamInvigilationPaperAccess,
  scheduleRequiresInvigilationRoom,
  isLiveInvigilationMode,
} from "../utils/examInvigilation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import {
  fetchSchoolPortalStudentExamSchedules,
  fetchSchoolPortalUser,
  fetchSchoolPortalStudentExamResult,
} from "../api";

const accent = "#DC2626";
const accentLight = "#FEE2E2";

function examSortTimestamp(row) {
  const candidates = [
    row?.start_time,
    row?.created_at,
    row?.end_time,
    row?.updated_at,
    row?.exam?.created_at,
  ];
  for (const raw of candidates) {
    const t = raw ? new Date(raw).getTime() : NaN;
    if (Number.isFinite(t)) return t;
  }
  return 0;
}

function sortExamsLatestFirst(list) {
  return [...list].sort((a, b) => examSortTimestamp(b) - examSortTimestamp(a));
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

function openButtonLabel(row, { alreadySubmitted, durationEnded, scheduleElapsed, disqualified, canOpen }) {
  if (alreadySubmitted) return "Already submitted";
  if (durationEnded) return "Time ended — submitted";
  if (disqualified) return "Exam closed";
  if (scheduleElapsed) return "Window elapsed";
  if (!canOpen) return "Cannot open";
  if (String(row.exam_type || row.exam?.exam_type || "") === "pdf_form") return "Open PDF exam";
  if (isLiveInvigilationMode(row)) return "Join invigilation room";
  if (row.proctoring_mode === "strict_auto") return "Open strict exam";
  return "Open exam";
}

export default function PortalExamsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flashMessage = location.state?.examMessage || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
      if (!token) {
        navigate("/marketplace", { replace: true });
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [me, exams] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchSchoolPortalStudentExamSchedules(),
        ]);
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setRows(exams);
      } catch (e) {
        setError(e.message || "Could not load exams.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate, location.key]);

  useEffect(() => {
    if (dialogOpen && selectedExam) {
      setResultLoading(true);
      fetchSchoolPortalStudentExamResult(selectedExam.id)
        .then((res) => setResult(res))
        .catch(() => setResult(null))
        .finally(() => setResultLoading(false));
    } else {
      setResult(null);
    }
  }, [dialogOpen, selectedExam]);

  const sortedRows = useMemo(() => sortExamsLatestFirst(rows), [rows]);

  const isPdfResultView = useMemo(() => {
    if (!result) return false;
    const examType =
      result.examType || selectedExam?.exam_type || selectedExam?.exam?.exam_type || "";
    return result.showQuestionBreakdown === false || String(examType) === "pdf_form";
  }, [result, selectedExam]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 3,
        background: "linear-gradient(180deg, #FEF2F2 0%, #fff 45%)",
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: accent }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : sortedRows.length === 0 ? (
          <Alert severity="info">No exams assigned to you yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {flashMessage ? (
              <Alert severity="success" onClose={() => navigate(location.pathname, { replace: true, state: {} })}>
                {flashMessage}
              </Alert>
            ) : null}
            {sortedRows.map((row, idx) => (
              <Card key={row.id || idx} elevation={0} sx={{ border: "1px solid #f1d5d5" }}>
                <CardContent>
                  {(() => {
                    const alreadySubmitted =
                      row?.submission_status === "submitted" ||
                      Boolean(row?.attendance?.submitted_at);
                    const disqualified = Boolean(row?.attendance?.is_cancelled);
                    const scheduleElapsed =
                      row?.schedule_window_elapsed === true ||
                      (row?.end_time ? Date.now() > new Date(row.end_time).getTime() : false);
                    const durationEnded =
                      row?.open_block_reason === "duration_elapsed" ||
                      (row?.duration_elapsed === true && !alreadySubmitted);
                    const sessionOpen = ["scheduled", "live"].includes(
                      String(row?.session_status || row?.status || "").toLowerCase()
                    );
                    const canOpenSession =
                      !alreadySubmitted &&
                      !disqualified &&
                      !scheduleElapsed &&
                      !durationEnded &&
                      sessionOpen;
                    const canOpen =
                      typeof row?.can_open === "boolean" ? row.can_open : canOpenSession;
                    return (
                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {idx + 1}. {row.exam?.title || "Exam"}
                        </Typography>
                        {disqualified ? (
                          <Alert severity="error" sx={{ py: 0 }}>
                            Exam closed: {row?.attendance?.cancellation_reason || "Proctoring violation detected."}
                          </Alert>
                        ) : null}
                        {scheduleElapsed ? (
                          <Alert severity="warning" sx={{ py: 0 }}>
                            The scheduled exam window has ended. You can no longer open this paper.
                          </Alert>
                        ) : null}
                        {durationEnded || row?.open_block_reason === "duration_elapsed" ? (
                          <Alert severity="info" sx={{ py: 0 }}>
                            Your exam time has ended. Any answers you saved were submitted automatically.
                          </Alert>
                        ) : null}
                        {!alreadySubmitted && row?.duration_minutes && row?.remaining_seconds != null ? (
                          <Typography variant="body2" color="text.secondary">
                            Time allowed: {row.duration_minutes} min
                            {row.remaining_seconds > 0
                              ? ` · About ${Math.ceil(row.remaining_seconds / 60)} min left on your attempt`
                              : ""}
                          </Typography>
                        ) : null}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                          <Typography variant="body2">
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                            {formatDateTime(row.start_time)} - {formatDateTime(row.end_time)}
                          </Typography>
                          <Typography variant="body2">
                            <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                            {row.teacher?.user?.full_name || row.teacher?.user?.username || "Unassigned invigilator"}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          <QuizIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                          Monitoring:{" "}
                          {row.proctoring_mode === "live_monitor"
                            ? "Live invigilation"
                            : row.proctoring_mode === "strict_auto"
                              ? "Strict online"
                              : row.proctoring_mode === "record_only"
                                ? "Monitored online"
                                : "Monitored online"}
                        </Typography>
                        {row.meeting_join_url ? (
                          <Typography variant="body2" color="text.secondary">
                            <VideocamOutlinedIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                            Online link available
                          </Typography>
                        ) : null}
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrowRoundedIcon />}
                            onClick={() => {
                              if (scheduleRequiresInvigilationRoom(row)) {
                                clearExamInvigilationPaperAccess(row.id);
                                navigate(`/portal/exam-schedule/${encodeURIComponent(row.id)}/invigilation`, {
                                  state: { freshJoin: true },
                                });
                                return;
                              }
                              navigate(`/portal/exams/${encodeURIComponent(row.id)}`, {
                                state: {
                                  examType: row.exam_type || row.exam?.exam_type || "questions",
                                  scheduleSnapshot: row,
                                },
                              });
                            }}
                            disabled={!canOpen}
                            sx={{ bgcolor: accent, "&:hover": { bgcolor: "#b91c1c" } }}
                          >
                            {openButtonLabel(row, {
                              alreadySubmitted,
                              durationEnded,
                              scheduleElapsed,
                              disqualified,
                              canOpen,
                            })}
                          </Button>
                          <Tooltip title="View Result">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedExam(row);
                                setDialogOpen(true);
                              }}
                              sx={{
                                color: accent,
                                "&:hover": { bgcolor: accentLight },
                                "&:focus": { outline: "none" },
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Exam Result: {selectedExam?.exam?.title}
            <IconButton
              onClick={() => setDialogOpen(false)}
              sx={{ color: "grey.500", "&:focus": { outline: "none" } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {resultLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: accent }} />
              </Box>
            ) : result ? (
              <Stack spacing={3}>
                <Card elevation={2} sx={{ border: `1px solid ${accentLight}`, bgcolor: "#fefefe" }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <EmojiEventsIcon sx={{ color: accent, fontSize: 32 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: accent }}>
                        Your Score
                      </Typography>
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#333", mb: 1 }}>
                      {result.totalScore} / {result.totalMax}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                      {(result.percentage != null
                        ? result.percentage
                        : result.totalMax > 0
                          ? ((result.totalScore / result.totalMax) * 100).toFixed(1)
                          : 0)}
                      % achieved
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={
                        result.totalMax > 0
                          ? Math.min(100, (result.totalScore / result.totalMax) * 100)
                          : 0
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { bgcolor: accent },
                      }}
                    />
                  </CardContent>
                </Card>

                {result.grade ? (
                  <Card elevation={1} sx={{ border: `1px solid ${accentLight}`, bgcolor: "#f9f9f9" }}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
                        Grade
                      </Typography>
                      <Chip
                        label={result.grade}
                        size="large"
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          bgcolor: result.grade.includes("A")
                            ? "#4caf50"
                            : result.grade.includes("B")
                              ? "#2196f3"
                              : result.grade.includes("C")
                                ? "#ff9800"
                                : "#f44336",
                          color: "white",
                          px: 2,
                          py: 1,
                        }}
                      />
                      {result.gradeRemarks ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                          {result.gradeRemarks}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}

                {isPdfResultView ? (
                  <Alert severity="info">
                    This was a PDF exam. Your teacher awarded an overall score — individual question marks are not
                    shown here.
                  </Alert>
                ) : (
                  <>
                    <Divider />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#333" }}>
                      Question Breakdown
                    </Typography>
                    {result.questions && result.questions.length > 0 ? (
                      <Stack spacing={1.5}>
                        {result.questions.map((q, i) => (
                          <Card key={i} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                Question {i + 1}: {q.question}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  Score: {q.score} / {q.maxScore}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={q.maxScore > 0 ? (q.score / q.maxScore) * 100 : 0}
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: "#f0f0f0",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor:
                                        q.score === q.maxScore ? "#4caf50" : q.score > 0 ? "#ff9800" : "#f44336",
                                    },
                                  }}
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ textAlign: "center", color: "text.secondary", py: 2 }}>
                        No question details available.
                      </Typography>
                    )}
                  </>
                )}
              </Stack>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <VisibilityIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Result not available yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please check back after grading is completed.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}
