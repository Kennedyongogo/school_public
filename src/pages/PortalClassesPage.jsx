import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Chip, Stack } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalStudentTimetableLessons,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";
import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalLoading,
} from "../components/Portal/portalUi";
import PortalTermMonthCalendar from "../components/Portal/PortalTermMonthCalendar";
import { portalChipSx } from "../components/Portal/portalShared";
import { filterLessonsForStudentTerm } from "../utils/lessonTermFilter";

export default function PortalClassesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthKey = searchParams.get("month") || "";
  const highlightDate = searchParams.get("date") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!hasPortalSession()) {
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
        setLessons(timetableLessons || []);
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
  const termLevel = student?.curriculum_class_level;
  const termLabel = termLevel?.name || "—";

  const termLessons = useMemo(
    () => filterLessonsForStudentTerm(lessons, termLevel?.id),
    [lessons, termLevel?.id]
  );

  const lessonCountsByDate = useMemo(() => {
    const map = {};
    termLessons.forEach((row) => {
      const d = String(row.lesson_date || "").slice(0, 10);
      if (!d) return;
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [termLessons]);

  const handleDaySelect = (iso) => {
    if (!iso) return;
    const month = iso.slice(0, 7);
    navigate(`/portal/classes/day/${iso}?month=${month}`);
  };

  return (
    <PortalPageShell
      sx={{
        minHeight: 0,
        height: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <PortalPageHero
        compact
        fullWidth
        icon={<ClassIcon />}
        title="My classes"
        subtitle="Your timetable, teachers, and live online sessions — all in one place."
        chip={
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
            <Chip icon={<SchoolIcon />} label={`Curriculum: ${curriculumLabel}`} size="small" sx={portalChipSx()} />
            <Chip icon={<ClassIcon />} label={`Class: ${classLabel}`} size="small" sx={portalChipSx()} />
            {termLevel ? (
              <Chip icon={<CalendarMonthOutlinedIcon />} label={`Term: ${termLabel}`} size="small" sx={portalChipSx()} />
            ) : null}
          </Stack>
        }
      />

      <PortalPageContent
        fullWidth
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          pt: 0,
          pb: { xs: 1, sm: 1.25 },
          overflow: "hidden",
        }}
      >
        {loading ? (
          <PortalLoading label="Loading your timetable…" />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
            {student?.curriculum_class_id && !termLevel ? (
              <Alert severity="info" sx={{ borderRadius: 2, flexShrink: 0 }}>
                Your profile has no term assigned yet. You will only see classes for your term once the school office sets it on your student record.
              </Alert>
            ) : null}
            <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
            <PortalTermMonthCalendar
              termName={termLevel?.name}
              termStart={termLevel?.start_date}
              termEnd={termLevel?.end_date}
              lessonCountsByDate={lessonCountsByDate}
              highlightDate={highlightDate}
              initialMonthKey={monthKey}
              onDaySelect={handleDaySelect}
            />
            </Box>
          </Box>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
