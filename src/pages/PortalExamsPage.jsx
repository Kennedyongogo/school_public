import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
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
import {
  fetchSchoolPortalStudentExamSchedules,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";

import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalSurfaceCard,
  PortalLoading,
  PortalEmptyState,
} from "../components/Portal/portalUi";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";

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

function formatDateTime(iso, timezone = "Africa/Nairobi") {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  try {
    return d.toLocaleString(undefined, { timeZone: timezone || "Africa/Nairobi" });
  } catch {
    return d.toLocaleString();
  }
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

  useEffect(() => {
    const load = async () => {
      if (!hasPortalSession()) {
        navigate("/login", { replace: true });
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

  const sortedRows = useMemo(() => sortExamsLatestFirst(rows), [rows]);

  return (
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<QuizIcon />}
        title="My exams"
        subtitle="Open scheduled papers, join invigilation rooms, and review your results when published."
      />

      <PortalPageContent fullWidth>
        {loading ? (
          <PortalLoading label="Loading your exams…" />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : sortedRows.length === 0 ? (
          <PortalEmptyState
            icon={<QuizIcon />}
            title="No exams yet"
            description="When your teachers schedule exams for your class, they will appear here with open and result links."
          />
        ) : (
          <Stack spacing={2}>
            {flashMessage ? (
              <Alert severity="success" onClose={() => navigate(location.pathname, { replace: true, state: {} })}>
                {flashMessage}
              </Alert>
            ) : null}
            {sortedRows.map((row, idx) => (
              <PortalSurfaceCard key={row.id || idx} noStrip sx={{ "& > div:last-child": { p: { xs: 2, sm: 2.25 } } }}>
                  {(() => {
                    const alreadySubmitted =
                      row?.submission_status === "submitted" ||
                      row?.open_block_reason === "already_submitted" ||
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
                      canOpenSession &&
                      (typeof row?.can_open !== "boolean" || row.can_open);
                    return (
                      <Stack spacing={1}>
                        <Typography sx={{ fontFamily: PORTAL.fontDisplay, fontWeight: 700, fontSize: "1.25rem", color: PORTAL.navyDeep }}>
                          {row.exam?.title || "Exam"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 700 }}>
                          EXAM {idx + 1}
                        </Typography>
                        {disqualified ? (
                          <Alert severity="error" sx={{ py: 0 }}>
                            Exam closed: {row?.attendance?.cancellation_reason || "Proctoring violation detected."}
                          </Alert>
                        ) : null}
                        {row?.retained_by_submission ? (
                          <Alert severity="info" sx={{ py: 0 }}>
                            You submitted this exam. It may no longer be assigned to you, but your submission stays on record for marking and review.
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
                            {formatDateTime(row.start_time, row.timezone)} - {formatDateTime(row.end_time, row.timezone)}
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
                            sx={portalPrimaryButtonSx()}
                          >
                            {openButtonLabel(row, {
                              alreadySubmitted,
                              durationEnded,
                              scheduleElapsed,
                              disqualified,
                              canOpen,
                            })}
                          </Button>
                          <Tooltip title="View result">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/portal/exams/${encodeURIComponent(row.id)}/result`)}
                              sx={{
                                color: PORTAL.navyDeep,
                                borderColor: PORTAL.border,
                                "&:hover": { bgcolor: PORTAL.sky, borderColor: PORTAL.gold },
                              }}
                            >
                              View result
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    );
                  })()}
              </PortalSurfaceCard>
            ))}
          </Stack>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
