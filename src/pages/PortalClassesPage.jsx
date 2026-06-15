import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalStudentTimetableLessons,
  fetchSchoolPortalUser,
} from "../api";
import { getLessonJoinWindow } from "../utils/liveLessonWindow";
import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalSurfaceCard,
  PortalLoading,
  PortalEmptyState,
} from "../components/Portal/portalUi";
import { PORTAL, portalPrimaryButtonSx, portalChipSx } from "../components/Portal/portalShared";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return String(iso);
  }
}

function formatTimeRange(start, end) {
  const s = String(start || "").slice(0, 5);
  const e = String(end || "").slice(0, 5);
  if (!s && !e) return "—";
  return `${s || "—"} – ${e || "—"}`;
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
        navigate("/login", { replace: true });
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
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<ClassIcon />}
        title="My classes"
        subtitle="Your timetable, teachers, and live online sessions — all in one place."
        chip={
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
            <Chip icon={<SchoolIcon />} label={`Curriculum: ${curriculumLabel}`} size="small" sx={portalChipSx()} />
            <Chip icon={<ClassIcon />} label={`Class: ${classLabel}`} size="small" sx={portalChipSx()} />
          </Stack>
        }
      />

      <PortalPageContent fullWidth>
        {loading ? (
          <PortalLoading label="Loading your timetable…" />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : lessons.length === 0 ? (
          <PortalEmptyState
            icon={<CalendarMonthOutlinedIcon />}
            title="No lessons scheduled yet"
            description="When your school publishes your class timetable, lessons will appear here with join links for live sessions."
          />
        ) : (
          <Stack spacing={2}>
            {lessons.map((row, idx) => {
              const isOnline = String(row.delivery_mode || "").toLowerCase() === "online";
              const joinWin =
                row.live_session?.can_join != null
                  ? { can_join: row.live_session.can_join, reason: row.live_session.join_blocked_reason }
                  : getLessonJoinWindow({
                      lesson_date: row.lesson_date,
                      starts_at: row.starts_at,
                      ends_at: row.ends_at,
                      session_status: row.live_session?.session_status,
                    });
              const canJoin = joinWin.can_join;
              const showLive =
                row.live_session?.id &&
                isOnline &&
                (row.live_session.session_status === "live" || row.live_session.session_status === "scheduled");

              return (
                <PortalSurfaceCard key={row.id || idx} sx={{ p: 0 }}>
                  <Box sx={{ p: { xs: 2, sm: 2.25 } }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: "flex-start" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: PORTAL.fontDisplay,
                            fontWeight: 700,
                            fontSize: { xs: "1.2rem", sm: "1.35rem" },
                            color: PORTAL.navyDeep,
                            lineHeight: 1.25,
                          }}
                        >
                          {row.subject?.name || "Lesson"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 700, letterSpacing: "0.04em" }}>
                          LESSON {idx + 1}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={isOnline ? "Online" : "In person"}
                        sx={{
                          fontWeight: 700,
                          bgcolor: isOnline ? "rgba(12, 35, 64, 0.08)" : PORTAL.sky,
                          color: isOnline ? PORTAL.navy : PORTAL.inkMuted,
                          border: `1px solid ${PORTAL.border}`,
                        }}
                      />
                    </Stack>

                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: PORTAL.inkMuted, fontWeight: 600 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: PORTAL.gold }} />
                        {formatDate(row.lesson_date)} · {formatTimeRange(row.starts_at, row.ends_at)}
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: PORTAL.inkMuted, fontWeight: 600 }}>
                        <PersonIcon sx={{ fontSize: 18, color: PORTAL.gold }} />
                        {row.teacher?.user?.full_name || row.teacher?.user?.username || "Teacher to be assigned"}
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: PORTAL.inkMuted, fontWeight: 600 }}>
                        <MenuBookIcon sx={{ fontSize: 18, color: PORTAL.gold }} />
                        Attendance: {row.attendance?.status || "Pending"}
                      </Typography>
                    </Stack>

                    {showLive ? (
                      <Stack spacing={0.75} sx={{ mt: 2.5, alignItems: "flex-start" }}>
                        <Button
                          size="medium"
                          variant="contained"
                          disableElevation
                          disabled={!canJoin}
                          startIcon={<VideoCallRoundedIcon />}
                          onClick={() => navigate(`/portal/live-class/${row.live_session.id}`)}
                          sx={{
                            ...portalPrimaryButtonSx(),
                            opacity: canJoin ? 1 : 0.65,
                          }}
                        >
                          Join live class
                        </Button>
                        {!canJoin && joinWin.reason ? (
                          <Typography variant="caption" sx={{ color: PORTAL.inkSoft, maxWidth: 360, lineHeight: 1.5 }}>
                            {joinWin.reason}
                          </Typography>
                        ) : null}
                      </Stack>
                    ) : null}
                  </Box>
                </PortalSurfaceCard>
              );
            })}
          </Stack>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
