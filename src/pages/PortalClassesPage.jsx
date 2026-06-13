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
  Stack,
  Typography,
} from "@mui/material";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import {
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalStudentTimetableLessons,
  fetchSchoolPortalUser,
} from "../api";
import { getLessonJoinWindow } from "../utils/liveLessonWindow";

const accent = "#DC2626";
const accentLight = "#FEE2E2";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString();
  } catch {
    return String(iso);
  }
}

function formatTimeRange(start, end) {
  const s = String(start || "").slice(0, 5);
  const e = String(end || "").slice(0, 5);
  if (!s && !e) return "—";
  return `${s || "—"} - ${e || "—"}`;
}

export default function PortalClassesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);

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
        const [me, profile, timetableLessons] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchSchoolPortalStudentProfile(),
          fetchSchoolPortalStudentTimetableLessons(),
        ]);
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setStudent(profile);
        setLessons(
          [...timetableLessons].sort((a, b) => {
            const dateCmp = String(b.lesson_date || "").localeCompare(String(a.lesson_date || ""));
            if (dateCmp !== 0) return dateCmp;
            return String(b.starts_at || "").localeCompare(String(a.starts_at || ""));
          })
        );
      } catch (e) {
        setError(e.message || "Could not load classes.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate]);

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
        ) : lessons.length === 0 ? (
          <Alert severity="info">No lesson timetable entries found for your class yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {lessons.map((row, idx) => (
              <Card key={row.id || idx} elevation={0} sx={{ border: "1px solid #f1d5d5" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {idx + 1}. {row.subject?.name || "Lesson"}
                      </Typography>
                      <Chip
                        size="small"
                        label={String(row.delivery_mode || "physical").toLowerCase() === "online" ? "Online" : "Physical"}
                        color={String(row.delivery_mode || "").toLowerCase() === "online" ? "info" : "default"}
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                      <Typography variant="body2"><AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />{formatDate(row.lesson_date)} | {formatTimeRange(row.starts_at, row.ends_at)}</Typography>
                      <Typography variant="body2"><PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />{row.teacher?.user?.full_name || row.teacher?.user?.username || "Unassigned teacher"}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      <MenuBookIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                      Attendance: {row.attendance?.status || "Pending"}
                    </Typography>
                    {row.live_session?.id &&
                    String(row.delivery_mode || "").toLowerCase() === "online" &&
                    (row.live_session.session_status === "live" || row.live_session.session_status === "scheduled") ? (
                      (() => {
                        const joinWin =
                          row.live_session.can_join != null
                            ? {
                                can_join: row.live_session.can_join,
                                reason: row.live_session.join_blocked_reason,
                              }
                            : getLessonJoinWindow({
                                lesson_date: row.lesson_date,
                                starts_at: row.starts_at,
                                ends_at: row.ends_at,
                                session_status: row.live_session.session_status,
                              });
                        const canJoin = joinWin.can_join;
                        return (
                          <Stack spacing={0.5} sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!canJoin}
                              startIcon={<VideoCallRoundedIcon />}
                              onClick={() => navigate(`/portal/live-class/${row.live_session.id}`)}
                              sx={{
                                bgcolor: canJoin ? accent : undefined,
                                "&:hover": canJoin ? { bgcolor: "#B91C1C" } : undefined,
                              }}
                            >
                              Join live class
                            </Button>
                            {!canJoin && joinWin.reason ? (
                              <Typography variant="caption" color="text.secondary">
                                {joinWin.reason}
                              </Typography>
                            ) : null}
                          </Stack>
                        );
                      })()
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

