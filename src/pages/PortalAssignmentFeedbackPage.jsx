import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { fetchSchoolPortalAssignmentPdfTemplateBlob, fetchSchoolPortalStudentAssignmentFeedback } from "../api";
import AssignmentQuestionInput from "../components/Portal/AssignmentQuestionInput";
import {
  PdfFeedbackQuestionCard,
  PdfFeedbackWorkingPaperCard,
} from "../components/Portal/portalPdfFeedbackUi";
import { PORTAL } from "../components/Portal/portalShared";
import { PortalLoading } from "../components/Portal/portalUi";
import StablePdfIframe from "../components/Exam/StablePdfIframe";
import { getCachedExamPdfBlobUrl, peekCachedExamPdfBlobUrl } from "../utils/pdfExamBlobCache";
import { answerFromStoredRow } from "../utils/assignmentQuestionUtils";

const cardBorder = PORTAL.border;
const edgePad = { xs: 1.5, sm: 2, md: 2.5 };

function feedbackAnswerValue(row) {
  return answerFromStoredRow(
    { answer_text: row.answerText, answer_json: row.answerJson },
    row.questionType || "short_text"
  );
}

function scorePercent(score, max) {
  if (max == null || max <= 0 || score == null) return null;
  return Math.round((Number(score) / Number(max)) * 100);
}

function OnlineQuestionFeedbackCard({ q, idx }) {
  const qNum = q.orderNumber || idx + 1;
  const maxScore = q.maxScore != null ? Number(q.maxScore) : null;
  const pct = scorePercent(q.score, maxScore);
  const questionStub = {
    question_type: q.questionType || "short_text",
    options: q.questionOptions,
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        border: `1px solid ${cardBorder}`,
        borderRadius: 2,
        bgcolor: "#fff",
      }}
    >
      <CardContent sx={{ px: { xs: 1.75, sm: 2.5 }, py: { xs: 1.75, sm: 2 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 1.25 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.05rem" }, lineHeight: 1.45, flex: 1, minWidth: 0 }}>
            {qNum}. {q.question}
            {maxScore ? ` (${maxScore} marks)` : ""}
          </Typography>
          {q.score != null ? (
            <Chip
              size="small"
              label={`${q.score}${maxScore != null ? ` / ${maxScore}` : ""} marks`}
              color={pct != null && pct >= 70 ? "success" : pct != null && pct >= 50 ? "warning" : "default"}
              sx={{ fontWeight: 700, flexShrink: 0 }}
            />
          ) : null}
        </Stack>

        <Box sx={{ borderRadius: 1.5, bgcolor: "#f8fafc", border: "1px solid #eef2f7", p: { xs: 1.25, sm: 1.5 }, mb: q.comment ? 1.25 : 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
            Your answer
          </Typography>
          <AssignmentQuestionInput question={questionStub} value={feedbackAnswerValue(q)} disabled />
        </Box>

        {q.comment ? (
          <Box sx={{ borderRadius: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", p: { xs: 1.25, sm: 1.5 } }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: PORTAL.navyDeep, display: "block", mb: 0.5 }}>
              Teacher comment
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
              {q.comment}
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function PortalAssignmentFeedbackPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const row = await fetchSchoolPortalStudentAssignmentFeedback(assignmentId);
        setData(row);
      } catch (e) {
        if (e.code === "MARKS_NOT_PUBLISHED") {
          setError(e.message || "Marks not published yet.");
        } else {
          setError(e.message || "Could not load feedback.");
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [assignmentId]);

  useEffect(() => {
    if (!data?.isPdfAssignment || !data?.pdfTemplatePath || !assignmentId) {
      setPdfUrl("");
      setPdfLoading(false);
      return undefined;
    }

    let cancelled = false;
    const cached = peekCachedExamPdfBlobUrl(assignmentId);
    if (cached) {
      setPdfUrl(cached);
      setPdfLoading(false);
    } else {
      setPdfLoading(true);
    }

    getCachedExamPdfBlobUrl(assignmentId, () => fetchSchoolPortalAssignmentPdfTemplateBlob(assignmentId))
      .then((url) => {
        if (!cancelled) {
          setPdfUrl(url);
          setPdfLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId, data?.isPdfAssignment, data?.pdfTemplatePath]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", minHeight: "calc(100vh - 64px)", bgcolor: "#f8fafc" }}>
        <PortalLoading label="Loading feedback…" />
      </Box>
    );
  }

  const isPdf = Boolean(data?.isPdfAssignment);
  const sortedQuestions = [...(data?.questions || [])].sort(
    (a, b) => Number(a.orderNumber || 0) - Number(b.orderNumber || 0)
  );
  const scoreLabel = data
    ? data.totalMax != null
      ? `${data.totalScore} / ${data.totalMax}`
      : `${data.totalScore} marks`
    : "";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#f8fafc",
        pb: 3,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: { xs: 56, sm: 64 },
          zIndex: 20,
          width: "100%",
          borderBottom: `1px solid ${cardBorder}`,
          bgcolor: "#fff",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box sx={{ height: 4, background: PORTAL.navyGradient, width: "100%" }} />
        <Box sx={{ px: edgePad, py: { xs: 1.25, sm: 1.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.25}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, fontFamily: PORTAL.fontDisplay, color: PORTAL.navyDeep, lineHeight: 1.25 }}
              >
                {data?.assignmentTitle || "Assignment feedback"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isPdf ? "Your marked work, uploaded papers, and teacher comments" : "Your marked work and teacher comments"}
              </Typography>
            </Box>
            {data ? (
              <Chip
                label={`Score: ${scoreLabel}`}
                color="success"
                sx={{ fontWeight: 800, fontSize: "0.9rem", px: 0.5, flexShrink: 0 }}
              />
            ) : null}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: edgePad, pt: 1.5 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/portal/assignments")}
          sx={{ mb: 1.5, alignSelf: "flex-start", color: PORTAL.navyDeep, fontWeight: 600 }}
        >
          Back to assignments
        </Button>

        {error ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {data?.markerFeedback ? (
          <Alert severity="success" sx={{ mb: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Teacher feedback
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {data.markerFeedback}
            </Typography>
          </Alert>
        ) : null}

        {data && isPdf ? (
          <Stack spacing={2} sx={{ width: "100%" }}>
            {data.pdfTemplatePath ? (
              <Card elevation={0} sx={{ border: `1px solid ${cardBorder}`, borderRadius: 2, bgcolor: "#fff" }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.25, color: PORTAL.navyDeep }}>
                    Assignment paper
                  </Typography>
                  {pdfLoading && !pdfUrl ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress sx={{ color: PORTAL.gold }} />
                    </Box>
                  ) : pdfUrl ? (
                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: `1px solid ${PORTAL.border}` }}>
                      <StablePdfIframe src={pdfUrl} title="Assignment PDF" height={{ xs: 360, md: 480 }} />
                    </Box>
                  ) : (
                    <Alert severity="info">Assignment PDF is not available.</Alert>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {data.showQuestionBreakdown && sortedQuestions.length ? (
              <Box sx={{ width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                  <Box sx={{ width: 4, height: 24, borderRadius: 999, bgcolor: PORTAL.gold }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: PORTAL.navyDeep }}>
                    Typed answers
                  </Typography>
                  <Chip
                    size="small"
                    label={`${sortedQuestions.length} answer${sortedQuestions.length === 1 ? "" : "s"}`}
                    sx={{ fontWeight: 700, bgcolor: alpha(PORTAL.gold, 0.14) }}
                  />
                </Stack>
                <Stack spacing={2}>
                  {sortedQuestions.map((q, i) => (
                    <PdfFeedbackQuestionCard
                      key={`${q.orderNumber || i}-${q.question}`}
                      index={i}
                      question={q.question}
                      answer={q.answer}
                      score={q.score}
                      maxScore={q.maxScore}
                      comment={q.comment}
                    />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {data.showWorkingPapers && data.workingPapers?.length ? (
              <Box sx={{ width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                  <Box sx={{ width: 4, height: 24, borderRadius: 999, bgcolor: PORTAL.gold }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: PORTAL.navyDeep }}>
                    Uploaded working papers
                  </Typography>
                  <Chip
                    size="small"
                    label={`${data.workingPapers.length} file${data.workingPapers.length === 1 ? "" : "s"}`}
                    sx={{ fontWeight: 700, bgcolor: alpha(PORTAL.gold, 0.14) }}
                  />
                </Stack>
                <Stack spacing={2}>
                  {data.workingPapers.map((paper, i) => (
                    <PdfFeedbackWorkingPaperCard key={paper.id || `paper-${i}`} index={i} paper={paper} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {!data.showQuestionBreakdown &&
            !data.showWorkingPapers &&
            !data.markerFeedback ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Your overall score is shown above. Your teacher did not add per-answer or uploaded-paper feedback yet.
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        {data && !isPdf ? (
          <Stack spacing={1.5} sx={{ width: "100%" }}>
            {sortedQuestions.map((q, idx) => (
              <OnlineQuestionFeedbackCard key={`${q.orderNumber || idx}-${q.question}`} q={q} idx={idx} />
            ))}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}
