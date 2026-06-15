import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchSchoolPortalStudentExamSchedules } from "../api";
import { PortalLoading } from "../components/Portal/portalUi";
import PortalExamTakePage from "./PortalExamTakePage";
import PortalPdfExamTakePage from "./PortalPdfExamTakePage";

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
    if (hintedType === "pdf_form") return undefined;
    if (hintedType) return undefined;
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
    return <PortalLoading label="Preparing your exam…" />;
  }
  if (mode === "pdf") return <PortalPdfExamTakePage />;
  return <PortalExamTakePage />;
}
