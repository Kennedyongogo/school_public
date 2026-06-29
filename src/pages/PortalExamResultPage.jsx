import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import {
  fetchSchoolPortalStudentExamResult,
  fetchSchoolPortalStudentExamResultPdf,
  fetchSchoolPortalStudentExamAnsweredPdf,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";
import { PortalLoading } from "../components/Portal/portalUi";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";
import StablePdfIframe from "../components/Exam/StablePdfIframe";

const mediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const isImageMime = (mime, name) => {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(String(name || ""));
};

const isPdfMime = (mime, name) => {
  const m = String(mime || "").toLowerCase();
  if (m === "application/pdf") return true;
  return String(name || "").toLowerCase().endsWith(".pdf");
};

const EDGE_PAD = { xs: 1, sm: 1.5, md: 2 };

const PAGE_GRADIENT = `linear-gradient(
  180deg,
  ${PORTAL.navyDeep} 0%,
  #122d52 18%,
  #1a3d6b 32%,
  #dce6f3 58%,
  ${PORTAL.cream} 78%,
  #fff 100%
)`;

const PAGE_SHELL_SX = {
  minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: PAGE_GRADIENT,
  position: "relative",
  overflowX: "hidden",
};

function gradePalette(grade) {
  const g = String(grade || "").toUpperCase();
  if (g.startsWith("A")) return { main: "#16a34a", glow: "rgba(22, 163, 74, 0.35)", soft: "#ecfdf3" };
  if (g.startsWith("B")) return { main: "#2563eb", glow: "rgba(37, 99, 235, 0.35)", soft: "#eff6ff" };
  if (g.startsWith("C")) return { main: "#d97706", glow: "rgba(217, 119, 6, 0.35)", soft: "#fffbeb" };
  return { main: "#dc2626", glow: "rgba(220, 38, 38, 0.35)", soft: "#fef2f2" };
}

function ScoreRing({ value, size = 132, stroke = 9 }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ transform: "rotate(-90deg)" }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#scoreGold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="scoreGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PORTAL.gold} />
            <stop offset="100%" stopColor={PORTAL.goldMuted} />
          </linearGradient>
        </defs>
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "1.65rem", color: "#fff", lineHeight: 1 }}>
          {pct}%
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.72)", mt: 0.35, letterSpacing: "0.08em" }}>
          ACHIEVED
        </Typography>
      </Box>
    </Box>
  );
}

function isResultNotPublishedError(err) {
  if (!err) return false;
  if (err.code === "RESULT_NOT_PUBLISHED") return true;
  if (err.status === 404) return true;
  const m = String(err.message || err).toLowerCase();
  return (
    m.includes("not graded") ||
    m.includes("not published") ||
    m.includes("not found") ||
    m.includes("not available")
  );
}

function ResultNotPublishedBanner({ message, onBack, onRefresh, refreshing }) {
  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 4, md: 6 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          textAlign: "center",
          color: "#fff",
          bgcolor: alpha("#fff", 0.1),
          border: `1px solid ${alpha("#fff", 0.2)}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: `0 28px 64px ${alpha(PORTAL.navyDeep, 0.32)}`,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(PORTAL.gold, 0.16),
            border: `1px solid ${alpha(PORTAL.gold, 0.45)}`,
            boxShadow: `0 0 0 10px ${alpha(PORTAL.gold, 0.08)}`,
          }}
        >
          <HourglassTopRoundedIcon sx={{ fontSize: 36, color: PORTAL.goldMuted }} />
        </Box>

        <Typography
          sx={{
            fontFamily: PORTAL.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.65rem", sm: "1.85rem" },
            lineHeight: 1.2,
            mb: 1.25,
          }}
        >
          Your result isn&apos;t ready yet
        </Typography>

        <Typography sx={{ color: alpha("#fff", 0.88), lineHeight: 1.65, fontSize: "0.98rem", mb: 2.5 }}>
          {message ||
            "Your teacher is still marking this exam, or hasn't published the grades. When it's ready, you'll see your score, grade, and feedback here."}
        </Typography>

        <Stack
          spacing={1}
          sx={{
            textAlign: "left",
            mb: 3,
            p: 1.75,
            borderRadius: 2.5,
            bgcolor: alpha("#000", 0.12),
            border: `1px solid ${alpha("#fff", 0.08)}`,
          }}
        >
          {[
            "Your answers are already submitted — nothing else for you to do.",
            "Teachers save marks first, then publish the final grade.",
            "Come back to this page anytime; no need to resubmit.",
          ].map((line) => (
            <Stack key={line} direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: PORTAL.gold,
                  mt: 0.85,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ color: alpha("#fff", 0.82), fontSize: "0.9rem", lineHeight: 1.55 }}>
                {line}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="center">
          <Button
            variant="contained"
            onClick={onBack}
            sx={{ ...portalPrimaryButtonSx(), px: 3 }}
          >
            Back to my exams
          </Button>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            sx={{
              color: "#fff",
              borderColor: alpha("#fff", 0.35),
              "&:hover": { borderColor: PORTAL.gold, bgcolor: alpha("#fff", 0.06) },
            }}
          >
            {refreshing ? "Checking…" : "Check again"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function QuestionCard({ index, question, answer, score, maxScore, comment }) {
  const hasScore = score != null && Number.isFinite(Number(score));
  const hasMax = maxScore != null && Number(maxScore) > 0;
  const perfect = hasScore && hasMax && score === maxScore;
  const pct = hasScore && hasMax ? (score / maxScore) * 100 : null;
  const scoreLabel = hasMax
    ? `${hasScore ? score : "—"} / ${maxScore}`
    : hasScore
      ? `${score} marks`
      : null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: "#fff",
        border: `1px solid ${PORTAL.border}`,
        boxShadow: PORTAL.shadowSm,
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        "&:hover": {
          boxShadow: PORTAL.shadowMd,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          borderBottom: `1px solid ${PORTAL.border}`,
          bgcolor: alpha(PORTAL.sky, 0.55),
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: "0.95rem",
            color: PORTAL.navyDeep,
            bgcolor: "#fff",
            border: `1px solid ${PORTAL.borderGold}`,
            boxShadow: `0 4px 12px ${alpha(PORTAL.gold, 0.15)}`,
          }}
        >
          {index + 1}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.15rem", sm: "1.25rem" },
              color: PORTAL.navyDeep,
              lineHeight: 1.35,
            }}
          >
            {question}
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={perfect ? <CheckCircleOutlineRoundedIcon sx={{ fontSize: "16px !important" }} /> : undefined}
          label={scoreLabel || "Feedback"}
          sx={{
            fontWeight: 800,
            flexShrink: 0,
            bgcolor: perfect ? alpha("#16a34a", 0.12) : alpha(PORTAL.gold, 0.14),
            color: perfect ? "#15803d" : PORTAL.navyDeep,
            border: `1px solid ${perfect ? alpha("#16a34a", 0.25) : PORTAL.borderGold}`,
          }}
        />
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
        <Stack spacing={1.75}>
          {answer ? (
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                <MenuBookOutlinedIcon sx={{ fontSize: 17, color: PORTAL.inkSoft }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, letterSpacing: "0.07em", color: PORTAL.inkSoft, textTransform: "uppercase" }}
                >
                  Your answer
                </Typography>
              </Stack>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: PORTAL.warmWhite,
                  border: `1px solid ${PORTAL.border}`,
                }}
              >
                <Typography sx={{ whiteSpace: "pre-wrap", color: PORTAL.ink, lineHeight: 1.65, fontSize: "0.98rem" }}>
                  {answer}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {pct != null ? (
            <Box>
              <Box sx={{ height: 6, borderRadius: 999, bgcolor: alpha(PORTAL.navyDeep, 0.08), overflow: "hidden" }}>
                <Box
                  sx={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 999,
                    bgcolor: perfect ? "#16a34a" : PORTAL.gold,
                    transition: "width 0.6s ease",
                  }}
                />
              </Box>
            </Box>
          ) : null}

          {comment ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(PORTAL.gold, 0.08),
                borderLeft: `4px solid ${PORTAL.gold}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 17, color: PORTAL.goldMuted }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, letterSpacing: "0.07em", color: PORTAL.navyDeep, textTransform: "uppercase" }}
                >
                  Teacher feedback
                </Typography>
              </Stack>
              <Typography sx={{ whiteSpace: "pre-wrap", color: PORTAL.ink, lineHeight: 1.65, fontStyle: "italic" }}>
                {comment}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

function WorkingPaperCard({ index, paper }) {
  const studentUrl = mediaUrl(paper.studentFileUrl);
  const marked = paper.markedReturn || null;
  const markedUrl = marked?.url ? mediaUrl(marked.url) : "";

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: "#fff",
        border: `1px solid ${PORTAL.border}`,
        boxShadow: PORTAL.shadowSm,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          borderBottom: `1px solid ${PORTAL.border}`,
          bgcolor: alpha(PORTAL.sky, 0.55),
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            color: PORTAL.navyDeep,
            bgcolor: "#fff",
            border: `1px solid ${PORTAL.borderGold}`,
          }}
        >
          <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
              color: PORTAL.navyDeep,
            }}
          >
            {paper.name || `Working paper ${index + 1}`}
          </Typography>
        </Box>
        {markedUrl ? (
          <Chip size="small" label="Marked copy available" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
        ) : null}
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
        <Stack spacing={1.75}>
          {studentUrl ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={studentUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<DownloadOutlinedIcon />}
              >
                Your upload
              </Button>
            </Stack>
          ) : null}

          {isImageMime(paper.mime, paper.name) && studentUrl ? (
            <Box
              component="img"
              src={studentUrl}
              alt={paper.name || `Working paper ${index + 1}`}
              sx={{
                width: "100%",
                maxHeight: 280,
                objectFit: "contain",
                borderRadius: 2,
                border: `1px solid ${PORTAL.border}`,
                bgcolor: PORTAL.warmWhite,
              }}
            />
          ) : isPdfMime(paper.mime, paper.name) && studentUrl ? (
            <Box sx={{ height: 320, borderRadius: 2, overflow: "hidden", border: `1px solid ${PORTAL.border}` }}>
              <StablePdfIframe src={studentUrl} title={`Your upload ${index + 1}`} height={320} />
            </Box>
          ) : null}

          {markedUrl ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha("#16a34a", 0.06),
                border: `1px solid ${alpha("#16a34a", 0.2)}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.07em", color: "#15803d", textTransform: "uppercase" }}>
                Teacher marked copy
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: markedUrl ? 1 : 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  component="a"
                  href={markedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<DownloadOutlinedIcon />}
                  sx={portalPrimaryButtonSx()}
                >
                  {marked.name || "Download marked file"}
                </Button>
              </Stack>
              {isImageMime(marked.mime, marked.name) ? (
                <Box
                  component="img"
                  src={markedUrl}
                  alt={marked.name || "Marked paper"}
                  sx={{
                    width: "100%",
                    maxHeight: 280,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: `1px solid ${alpha("#16a34a", 0.2)}`,
                  }}
                />
              ) : isPdfMime(marked.mime, marked.name) ? (
                <Box sx={{ height: 320, borderRadius: 2, overflow: "hidden", border: `1px solid ${alpha("#16a34a", 0.2)}` }}>
                  <StablePdfIframe src={markedUrl} title={`Marked paper ${index + 1}`} height={320} />
                </Box>
              ) : null}
            </Box>
          ) : null}

          {paper.markerComment ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(PORTAL.gold, 0.08),
                borderLeft: `4px solid ${PORTAL.gold}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 17, color: PORTAL.goldMuted }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, letterSpacing: "0.07em", color: PORTAL.navyDeep, textTransform: "uppercase" }}
                >
                  Teacher feedback
                </Typography>
              </Stack>
              <Typography sx={{ whiteSpace: "pre-wrap", color: PORTAL.ink, lineHeight: 1.65, fontStyle: "italic" }}>
                {paper.markerComment}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

export default function PortalExamResultPage() {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notPublished, setNotPublished] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState(null);
  const [downloadingResult, setDownloadingResult] = useState(false);
  const [downloadingAnswered, setDownloadingAnswered] = useState(false);

  const loadResult = async ({ soft = false } = {}) => {
    if (!hasPortalSession()) {
      navigate("/login", { replace: true });
      return;
    }
    if (!scheduleId) {
      navigate("/portal/exams", { replace: true });
      return;
    }
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");
    setNotPublished(false);
    try {
      const me = await fetchSchoolPortalUser();
      if (me.role !== "student") {
        navigate("/portal", { replace: true });
        return;
      }
      const data = await fetchSchoolPortalStudentExamResult(scheduleId);
      setResult(data);
    } catch (e) {
      if (isResultNotPublishedError(e)) {
        setNotPublished(true);
        setError(e.message || "");
      } else {
        setError(e.message || "Could not load exam result.");
      }
      setResult(null);
    } finally {
      if (soft) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    void loadResult();
  }, [navigate, scheduleId]);

  const percentage = useMemo(() => {
    if (!result) return 0;
    if (result.percentage != null) return result.percentage;
    if (result.totalMax > 0) return Number(((result.totalScore / result.totalMax) * 100).toFixed(1));
    return 0;
  }, [result]);

  const gradeColors = useMemo(() => gradePalette(result?.grade), [result?.grade]);

  const safeFilenameBase = useMemo(() => {
    const title = String(result?.examTitle || "exam")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
    return title || "exam";
  }, [result?.examTitle]);

  const downloadResultPdf = async () => {
    setDownloadingResult(true);
    setError("");
    try {
      const blob = await fetchSchoolPortalStudentExamResultPdf(scheduleId);
      downloadBlob(blob, `exam-result-${safeFilenameBase}.pdf`);
    } catch (e) {
      setError(e.message || "Could not download result PDF.");
    } finally {
      setDownloadingResult(false);
    }
  };

  const downloadAnsweredPdf = async () => {
    setDownloadingAnswered(true);
    setError("");
    try {
      const blob = await fetchSchoolPortalStudentExamAnsweredPdf(scheduleId);
      downloadBlob(blob, `exam-answered-${safeFilenameBase}.pdf`);
    } catch (e) {
      setError(e.message || "Could not download answered exam PDF.");
    } finally {
      setDownloadingAnswered(false);
    }
  };

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: -80,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(PORTAL.gold, 0.22)} 0%, transparent 68%)`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 120,
          left: -100,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha("#60a5fa", 0.16)} 0%, transparent 70%)`,
        }}
      />

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          px: EDGE_PAD,
          py: 1.25,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          bgcolor: alpha(PORTAL.navyDeep, 0.55),
          borderBottom: `1px solid ${alpha("#fff", 0.1)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => navigate("/portal/exams")}
            aria-label="Back to exams"
            sx={{
              color: "#fff",
              bgcolor: alpha("#fff", 0.08),
              border: `1px solid ${alpha("#fff", 0.12)}`,
              "&:hover": { bgcolor: alpha("#fff", 0.14) },
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            sx={{
              flex: 1,
              fontWeight: 700,
              color: "#fff",
              fontSize: { xs: "0.92rem", sm: "1rem" },
              opacity: 0.92,
            }}
            noWrap
          >
            {result?.examTitle || "Exam result"}
          </Typography>
          {result ? (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={downloadingResult ? <CircularProgress size={14} color="inherit" /> : <DownloadOutlinedIcon />}
                onClick={() => void downloadResultPdf()}
                disabled={downloadingResult}
                sx={{
                  ...portalPrimaryButtonSx(),
                  minWidth: 0,
                  px: { xs: 1.5, sm: 2.25 },
                  fontSize: { xs: "0.78rem", sm: "0.88rem" },
                }}
              >
                {downloadingResult ? "…" : "PDF"}
              </Button>
              {result.canDownloadAnsweredPdf ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={downloadingAnswered ? <CircularProgress size={14} color="inherit" /> : <DownloadOutlinedIcon />}
                  onClick={() => void downloadAnsweredPdf()}
                  disabled={downloadingAnswered}
                  sx={{
                    color: "#fff",
                    borderColor: alpha("#fff", 0.35),
                    fontSize: { xs: "0.78rem", sm: "0.88rem" },
                    "&:hover": { borderColor: PORTAL.gold, bgcolor: alpha("#fff", 0.06) },
                  }}
                >
                  {downloadingAnswered ? "…" : "Paper"}
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, px: EDGE_PAD, pb: { xs: 4, md: 6 }, width: "100%", boxSizing: "border-box" }}>
        {loading ? (
          <Box sx={{ py: 10 }}>
            <PortalLoading label="Loading result…" />
          </Box>
        ) : notPublished ? (
          <ResultNotPublishedBanner
            message={error}
            onBack={() => navigate("/portal/exams")}
            onRefresh={() => void loadResult({ soft: true })}
            refreshing={refreshing}
          />
        ) : error && !result ? (
          <Box sx={{ pt: 4 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            <Button variant="outlined" onClick={() => navigate("/portal/exams")} sx={{ mt: 2 }}>
              Back to exams
            </Button>
          </Box>
        ) : !result ? (
          <ResultNotPublishedBanner
            onBack={() => navigate("/portal/exams")}
            onRefresh={() => void loadResult({ soft: true })}
            refreshing={refreshing}
          />
        ) : (
          <Stack spacing={{ xs: 3, md: 4 }} sx={{ pt: { xs: 2.5, md: 3.5 }, width: "100%" }}>
            <Box sx={{ textAlign: { xs: "left", md: "center" }, width: "100%" }}>
              <Chip
                label="Exam result"
                size="small"
                sx={{
                  mb: 1.25,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  bgcolor: alpha(PORTAL.gold, 0.18),
                  color: "#fff",
                  border: `1px solid ${alpha(PORTAL.gold, 0.45)}`,
                }}
              />
              <Typography
                sx={{
                  fontFamily: PORTAL.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", sm: "2.45rem", md: "2.75rem" },
                  color: "#fff",
                  lineHeight: 1.12,
                  textShadow: `0 8px 28px ${alpha("#000", 0.25)}`,
                }}
              >
                {result.examTitle}
              </Typography>
              {result.subjectName ? (
                <Chip
                  label={result.subjectName}
                  size="small"
                  sx={{
                    mt: 1.25,
                    fontWeight: 700,
                    bgcolor: alpha("#fff", 0.12),
                    color: alpha("#fff", 0.95),
                    border: `1px solid ${alpha("#fff", 0.22)}`,
                  }}
                />
              ) : null}
            </Box>

            {error ? (
              <Alert severity="error" sx={{ borderRadius: 2, width: "100%" }}>
                {error}
              </Alert>
            ) : null}

            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: result.grade ? "1.15fr 0.85fr" : "1fr" },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  p: { xs: 2, sm: 2.75 },
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.1),
                  border: `1px solid ${alpha("#fff", 0.18)}`,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: `0 24px 60px ${alpha(PORTAL.navyDeep, 0.28)}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={{ xs: 2, sm: 3 }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{ letterSpacing: "0.12em", color: alpha("#fff", 0.72), fontWeight: 800 }}
                    >
                      Your score
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography
                        sx={{
                          fontFamily: PORTAL.fontDisplay,
                          fontWeight: 700,
                          fontSize: { xs: "3rem", sm: "3.5rem" },
                          lineHeight: 1,
                        }}
                      >
                        {result.totalScore}
                      </Typography>
                      <Typography sx={{ fontSize: "1.35rem", color: alpha("#fff", 0.65), fontWeight: 600 }}>
                        / {result.totalMax}
                      </Typography>
                    </Stack>
                    <Typography sx={{ mt: 1, color: alpha("#fff", 0.78), fontSize: "0.98rem" }}>
                      {percentage}% achieved
                      {percentage >= 100 ? " · perfect score" : percentage >= 70 ? " · well done" : ""}
                    </Typography>
                  </Box>
                  <ScoreRing value={percentage} />
                </Stack>
              </Box>

              {result.grade ? (
                <Box
                  sx={{
                    borderRadius: 4,
                    p: { xs: 2, sm: 2.75 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    bgcolor: "#fff",
                    border: `1px solid ${alpha(gradeColors.main, 0.2)}`,
                    boxShadow: `0 20px 48px ${gradeColors.glow}`,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: "0.12em", color: PORTAL.inkSoft, fontWeight: 800, mb: 1 }}
                  >
                    Grade
                  </Typography>
                  <Box
                    sx={{
                      width: 88,
                      height: 88,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: gradeColors.soft,
                      border: `3px solid ${gradeColors.main}`,
                      boxShadow: `0 0 0 8px ${alpha(gradeColors.main, 0.12)}`,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: PORTAL.fontDisplay,
                        fontWeight: 800,
                        fontSize: "2.4rem",
                        color: gradeColors.main,
                        lineHeight: 1,
                      }}
                    >
                      {result.grade}
                    </Typography>
                  </Box>
                  {result.gradeRemarks ? (
                    <Typography sx={{ color: PORTAL.inkMuted, fontSize: "0.95rem", lineHeight: 1.55, maxWidth: 260 }}>
                      {result.gradeRemarks}
                      {result.points != null && !String(result.gradeRemarks || "").includes("point")
                        ? ` · ${Number(result.points).toFixed(2)} points`
                        : ""}
                    </Typography>
                  ) : result.points != null ? (
                    <Typography sx={{ color: PORTAL.inkMuted, fontSize: "0.95rem", lineHeight: 1.55 }}>
                      {Number(result.points).toFixed(2)} points
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Box>

            {result.showQuestionBreakdown && result.questions?.length ? (
              <Box sx={{ width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                  <Box sx={{ width: 4, height: 28, borderRadius: 999, bgcolor: PORTAL.gold }} />
                  <Typography
                    sx={{
                      fontFamily: PORTAL.fontDisplay,
                      fontWeight: 700,
                      fontSize: { xs: "1.45rem", sm: "1.65rem" },
                      color: PORTAL.navyDeep,
                    }}
                  >
                    Question breakdown
                  </Typography>
                  <Chip
                    size="small"
                    label={`${result.questions.length} questions`}
                    sx={{ fontWeight: 700, bgcolor: alpha(PORTAL.gold, 0.14), border: `1px solid ${PORTAL.borderGold}` }}
                  />
                </Stack>

                <Stack spacing={2}>
                  {result.questions.map((q, i) => (
                    <QuestionCard
                      key={i}
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

            {result.showWorkingPapers && result.workingPapers?.length ? (
              <Box sx={{ width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                  <Box sx={{ width: 4, height: 28, borderRadius: 999, bgcolor: PORTAL.gold }} />
                  <Typography
                    sx={{
                      fontFamily: PORTAL.fontDisplay,
                      fontWeight: 700,
                      fontSize: { xs: "1.45rem", sm: "1.65rem" },
                      color: PORTAL.navyDeep,
                    }}
                  >
                    Uploaded working papers
                  </Typography>
                  <Chip
                    size="small"
                    label={`${result.workingPapers.length} file${result.workingPapers.length === 1 ? "" : "s"}`}
                    sx={{ fontWeight: 700, bgcolor: alpha(PORTAL.gold, 0.14), border: `1px solid ${PORTAL.borderGold}` }}
                  />
                </Stack>
                <Stack spacing={2}>
                  {result.workingPapers.map((paper, i) => (
                    <WorkingPaperCard key={paper.id || `paper-${i}`} index={i} paper={paper} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {result.isPdfExam &&
            !result.questions?.length &&
            !result.workingPapers?.length &&
            !result.canDownloadAnsweredPdf ? (
              <Alert severity="info" sx={{ borderRadius: 3, width: "100%", boxShadow: PORTAL.shadowSm }}>
                Your overall score and grade are shown above. Your teacher did not add per-question or uploaded-paper
                feedback for this exam.
              </Alert>
            ) : null}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
