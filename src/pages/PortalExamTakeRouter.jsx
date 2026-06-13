import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { fetchSchoolPortalStudentExamSchedules } from "../api";
import PortalExamTakePage from "./PortalExamTakePage";
import PortalPdfExamTakePage from "./PortalPdfExamTakePage";

const accent = "#DC2626";

export default function PortalExamTakeRouter() {
  const { scheduleId } = useParams();
  const location = useLocation();
  const hintedType = location.state?.examType || "";
  const [mode, setMode] = useState(() => {
    if (hintedType === "pdf_form") return "pdf";
    if (hintedType) return "standard";
    return "loading";
  });

  useEffect(() => {
    if (hintedType === "pdf_form") {
      setMode("pdf");
      return undefined;
    }
    if (hintedType) {
      setMode("standard");
      return undefined;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const schedules = await fetchSchoolPortalStudentExamSchedules();
        const sc = schedules.find((x) => String(x.id) === String(scheduleId));
        const examType = sc?.exam_type || sc?.exam?.exam_type || "questions";
        if (!cancelled) setMode(examType === "pdf_form" ? "pdf" : "standard");
      } catch {
        if (!cancelled) setMode("standard");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [scheduleId, hintedType]);

  if (mode === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }
  if (mode === "pdf") return <PortalPdfExamTakePage />;
  return <PortalExamTakePage />;
}
