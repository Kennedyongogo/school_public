import React from "react";
import { alpha } from "@mui/material/styles";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { PORTAL, portalPrimaryButtonSx } from "./portalShared";
import StablePdfIframe from "../Exam/StablePdfIframe";

export const mediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

export const isImageMime = (mime, name) => {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(String(name || ""));
};

export const isPdfMime = (mime, name) => {
  const m = String(mime || "").toLowerCase();
  if (m === "application/pdf") return true;
  return String(name || "").toLowerCase().endsWith(".pdf");
};

export function PdfFeedbackQuestionCard({ index, question, answer, score, maxScore, comment }) {
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
          }}
        >
          {index + 1}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
              color: PORTAL.navyDeep,
              lineHeight: 1.35,
            }}
          >
            {question}
          </Typography>
        </Box>
        {scoreLabel ? (
          <Chip
            size="small"
            icon={perfect ? <CheckCircleOutlineRoundedIcon sx={{ fontSize: "16px !important" }} /> : undefined}
            label={scoreLabel}
            sx={{
              fontWeight: 800,
              flexShrink: 0,
              bgcolor: perfect ? alpha("#16a34a", 0.12) : alpha(PORTAL.gold, 0.14),
              color: perfect ? "#15803d" : PORTAL.navyDeep,
              border: `1px solid ${perfect ? alpha("#16a34a", 0.25) : PORTAL.borderGold}`,
            }}
          />
        ) : null}
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
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: PORTAL.warmWhite, border: `1px solid ${PORTAL.border}` }}>
                <Typography sx={{ whiteSpace: "pre-wrap", color: PORTAL.ink, lineHeight: 1.65, fontSize: "0.98rem" }}>
                  {answer}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {pct != null ? (
            <Box sx={{ height: 6, borderRadius: 999, bgcolor: alpha(PORTAL.navyDeep, 0.08), overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 999,
                  bgcolor: perfect ? "#16a34a" : PORTAL.gold,
                }}
              />
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
                  Teacher comment
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

export function PdfFeedbackWorkingPaperCard({ index, paper }) {
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
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, letterSpacing: "0.07em", color: "#15803d", textTransform: "uppercase" }}
              >
                Teacher marked copy
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
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
                  Teacher comment
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
