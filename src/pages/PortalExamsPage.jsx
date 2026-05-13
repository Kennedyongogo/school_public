import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import QuizIcon from "@mui/icons-material/Quiz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import {
  fetchSchoolPortalStudentExamSchedules,
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalUser,
  fetchSchoolPortalStudentExamResult,
} from "../api";

const accent = "#DC2626";
const accentLight = "#FEE2E2";

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

export default function PortalExamsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
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
        const [me, profile, exams] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchSchoolPortalStudentProfile(),
          fetchSchoolPortalStudentExamSchedules(),
        ]);
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setStudent(profile);
        setRows(exams);
      } catch (e) {
        setError(e.message || "Could not load exams.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate]);

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

  const classLabel = student?.curriculum_class
    ? `${student.curriculum_class.name || ""}${student.curriculum_class.code ? ` (${student.curriculum_class.code})` : ""}`.trim()
    : "—";
  const curriculumLabel = student?.curriculum
    ? `${student.curriculum.name || ""}${student.curriculum.type ? ` (${student.curriculum.type})` : ""}`.trim()
    : "—";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 3,
        background: "linear-gradient(180deg, #FEF2F2 0%, #fff 45%)",
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        <Card elevation={0} sx={{ border: `1px solid ${accentLight}`, mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Chip icon={<SchoolIcon />} label={`Curriculum: ${curriculumLabel}`} sx={{ fontWeight: 700 }} />
              <Chip icon={<ClassIcon />} label={`Class: ${classLabel}`} sx={{ fontWeight: 700 }} />
            </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: accent }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : rows.length === 0 ? (
          <Alert severity="info">No exam schedules found for your class yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((row, idx) => (
              <Card key={row.id || idx} elevation={0} sx={{ border: "1px solid #f1d5d5" }}>
                <CardContent>
                  {(() => {
                    const alreadySubmitted = Boolean(row?.attendance?.submitted_at);
                    const disqualified = Boolean(row?.attendance?.is_cancelled);
                    const endAtMs = row?.end_time ? new Date(row.end_time).getTime() : null;
                    const elapsed = Number.isFinite(endAtMs) ? Date.now() > endAtMs : false;
                    const canOpen =
                      !alreadySubmitted &&
                      !disqualified &&
                      !elapsed &&
                      ["scheduled", "live"].includes(String(row?.status || "").toLowerCase());
                    return (
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {idx + 1}. {row.exam?.title || "Exam"}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={row.status || "scheduled"} color={row.status === "live" ? "success" : "default"} />
                        <Chip
                          size="small"
                          label={row.attendance?.status || "Pending"}
                          color={row.attendance?.status === "Submitted" || row.attendance?.status === "Attended" ? "success" : "default"}
                        />
                      </Stack>
                    </Stack>
                    {disqualified ? (
                      <Alert severity="error" sx={{ py: 0 }}>
                        Exam closed: {row?.attendance?.cancellation_reason || "Proctoring violation detected."}
                      </Alert>
                    ) : null}
                    {elapsed ? (
                      <Alert severity="warning" sx={{ py: 0 }}>
                        Exam window elapsed. Opening paper is disabled.
                      </Alert>
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
                      Monitoring: {row.proctoring_mode || "none"}
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
                        onClick={() => navigate(`/portal/exams/${encodeURIComponent(row.id)}`)}
                        disabled={!canOpen}
                        sx={{ bgcolor: accent, "&:hover": { bgcolor: "#b91c1c" } }}
                      >
                        {alreadySubmitted ? "Already submitted" : disqualified ? "Exam closed" : elapsed ? "Window elapsed" : "Open exam paper"}
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
              {/* Score Section */}
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
                    {((result.totalScore / result.totalMax) * 100).toFixed(1)}% achieved
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(result.totalScore / result.totalMax) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": { bgcolor: accent },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Grade Section */}
              {result.grade && (
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
                        bgcolor: result.grade.includes("A") ? "#4caf50" : result.grade.includes("B") ? "#2196f3" : result.grade.includes("C") ? "#ff9800" : "#f44336",
                        color: "white",
                        px: 2,
                        py: 1,
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              <Divider />

              {/* Questions Section */}
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
                            value={(q.score / q.maxScore) * 100}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "#f0f0f0",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: q.score === q.maxScore ? "#4caf50" : q.score > 0 ? "#ff9800" : "#f44336",
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

