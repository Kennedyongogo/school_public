import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { fetchSchoolPortalStudentAssignmentFeedback } from "../api";
import AssignmentQuestionInput from "../components/Portal/AssignmentQuestionInput";
import { PORTAL } from "../components/Portal/portalShared";
import { PortalLoading } from "../components/Portal/portalUi";
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

export default function PortalAssignmentFeedbackPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

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

  if (loading) {
    return (
      <Box sx={{ width: "100%", minHeight: "calc(100vh - 64px)", bgcolor: "#f8fafc" }}>
        <PortalLoading label="Loading feedback…" />
      </Box>
    );
  }

  const sortedQuestions = [...(data?.questions || [])].sort(
    (a, b) => Number(a.orderNumber || 0) - Number(b.orderNumber || 0)
  );

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
                Your marked work and teacher comments
              </Typography>
            </Box>
            {data ? (
              <Chip
                label={`Score: ${data.totalScore}${data.totalMax != null ? ` / ${data.totalMax}` : ""}`}
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

        {data ? (
          <Stack spacing={1.5} sx={{ width: "100%" }}>
            {sortedQuestions.map((q, idx) => {
              const qNum = q.orderNumber || idx + 1;
              const maxScore = q.maxScore != null ? Number(q.maxScore) : null;
              const pct = scorePercent(q.score, maxScore);
              const questionStub = {
                question_type: q.questionType || "short_text",
                options: q.questionOptions,
              };

              return (
                <Card
                  key={`${qNum}-${q.question}`}
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
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1rem", md: "1.05rem" },
                          lineHeight: 1.45,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
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

                    <Box
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: "#f8fafc",
                        border: "1px solid #eef2f7",
                        p: { xs: 1.25, sm: 1.5 },
                        mb: q.comment ? 1.25 : 0,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
                        Your answer
                      </Typography>
                      <AssignmentQuestionInput
                        question={questionStub}
                        value={feedbackAnswerValue(q)}
                        disabled
                      />
                    </Box>

                    {q.comment ? (
                      <Box
                        sx={{
                          borderRadius: 1.5,
                          bgcolor: "#fffbeb",
                          border: "1px solid #fde68a",
                          p: { xs: 1.25, sm: 1.5 },
                        }}
                      >
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
            })}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}
