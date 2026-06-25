import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PortalSurfaceCard, PortalEmptyState } from "./portalUi";
import { PORTAL, portalPrimaryButtonSx } from "./portalShared";
import { getLessonJoinWindow } from "../../utils/liveLessonWindow";
import { formatLessonTimeRange } from "../../utils/lessonTimeFormat";

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

export default function PortalStudentLessonList({ lessons = [], showDate = false, emptyTitle, emptyDescription }) {
  const navigate = useNavigate();

  if (!lessons.length) {
    return (
      <PortalEmptyState
        icon={<CalendarMonthOutlinedIcon />}
        title={emptyTitle || "No lessons on this day"}
        description={
          emptyDescription ||
          "There are no classes scheduled for this date in your term. Pick another day on the calendar."
        }
      />
    );
  }

  return (
    <Stack spacing={2}>
      {lessons.map((row, idx) => {
        const isOnline = String(row.delivery_mode || "").toLowerCase() === "online";
        const hasLiveSession = !!row.live_session?.id;
        const joinWin =
          hasLiveSession && row.live_session?.can_join != null
            ? { can_join: row.live_session.can_join, reason: row.live_session.join_blocked_reason }
            : getLessonJoinWindow({
                lesson_date: row.lesson_date,
                starts_at: row.starts_at,
                ends_at: row.ends_at,
                timezone: row.timezone,
                session_status: row.live_session?.session_status,
                live_end_time: row.live_session?.end_time,
              });

        let canJoin = !!joinWin.can_join && hasLiveSession;
        let joinReason = joinWin.reason || null;
        if (isOnline && !hasLiveSession) {
          canJoin = false;
          joinReason = "Your teacher has not started this online class yet. You can join once the class goes live.";
        }

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
                  {showDate ? `${formatDate(row.lesson_date)} · ` : ""}
                  {formatLessonTimeRange(row.starts_at, row.ends_at)}
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

              {isOnline ? (
                <Stack spacing={0.75} sx={{ mt: 2.5, alignItems: "flex-start" }}>
                  <Button
                    size="medium"
                    variant="contained"
                    disableElevation
                    disabled={!canJoin}
                    startIcon={<VideoCallRoundedIcon />}
                    onClick={() => {
                      if (hasLiveSession && canJoin) {
                        navigate(`/portal/live-class/${row.live_session.id}`);
                      }
                    }}
                    sx={{
                      ...portalPrimaryButtonSx(),
                      opacity: canJoin ? 1 : 0.65,
                    }}
                  >
                    Join live class
                  </Button>
                  {joinReason ? (
                    <Typography variant="caption" sx={{ color: PORTAL.inkSoft, maxWidth: 360, lineHeight: 1.5 }}>
                      {joinReason}
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}
            </Box>
          </PortalSurfaceCard>
        );
      })}
    </Stack>
  );
}
