import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalStudentTimetableLessons,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";
import { filterLessonsForStudentTerm } from "../utils/lessonTermFilter";
import PortalStudentLessonList from "../components/Portal/PortalStudentLessonList";
import {
  PortalPageShell,
  PortalPageContent,
  PortalLoading,
} from "../components/Portal/portalUi";
import { PORTAL, portalGhostButtonSx } from "../components/Portal/portalShared";

function formatDayHeading(iso) {
  if (!iso) return "Classes";
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PortalClassesDayPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const [searchParams] = useSearchParams();
  const month = searchParams.get("month") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState([]);

  const backToCalendar = () => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (date) params.set("date", date);
    const q = params.toString();
    navigate(q ? `/portal/classes?${q}` : "/portal/classes");
  };

  useEffect(() => {
    const load = async () => {
      if (!hasPortalSession()) {
        navigate("/login", { replace: true });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
        setError("Invalid date.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const me = await fetchSchoolPortalUser();
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        const [profile, rows] = await Promise.all([
          fetchSchoolPortalStudentProfile(),
          fetchSchoolPortalStudentTimetableLessons({ date }),
        ]);
        setLessons(filterLessonsForStudentTerm(rows, profile?.curriculum_class_level?.id));
      } catch (e) {
        setError(e.message || "Could not load classes for this day.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [date, navigate]);

  return (
    <PortalPageShell>
      <PortalPageContent fullWidth sx={{ pt: { xs: 1, sm: 1.5 } }}>
        <Stack spacing={2}>
          <Button
            onClick={backToCalendar}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ ...portalGhostButtonSx(), alignSelf: "flex-start" }}
          >
            Back to calendar
          </Button>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <CalendarMonthOutlinedIcon sx={{ color: PORTAL.gold }} />
              <Typography
                sx={{
                  fontFamily: PORTAL.fontDisplay,
                  fontWeight: 800,
                  fontSize: { xs: "1.35rem", sm: "1.55rem" },
                  color: PORTAL.navyDeep,
                  lineHeight: 1.2,
                }}
              >
                {formatDayHeading(date)}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: PORTAL.inkMuted, fontWeight: 600 }}>
              {lessons.length
                ? `${lessons.length} class${lessons.length === 1 ? "" : "es"} in your term`
                : "No classes scheduled for this day in your term"}
            </Typography>
          </Box>

          {loading ? (
            <PortalLoading label="Loading classes…" />
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          ) : (
            <PortalStudentLessonList lessons={lessons} />
          )}
        </Stack>
      </PortalPageContent>
    </PortalPageShell>
  );
}
