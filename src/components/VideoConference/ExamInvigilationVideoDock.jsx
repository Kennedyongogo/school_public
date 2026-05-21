import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LiveKitRoom } from "@livekit/components-react";
import LiveKitVideoRoom from "./LiveKitVideoRoom";
import LiveKitMediaControls from "./LiveKitMediaControls";
import { fetchSchoolPortalExamScheduleLiveKitToken } from "../../api";
import { resolveLiveKitJoinMedia } from "../../utils/liveKitJoinMedia";
import "@livekit/components-styles";

/** Floating invigilation camera (bottom-right) while answering the exam. */
export default function ExamInvigilationVideoDock({ examScheduleId, mediaMode = "video" }) {
  const joinMedia = resolveLiveKitJoinMedia(mediaMode);
  const [expanded, setExpanded] = useState(true);
  const [lkToken, setLkToken] = useState(null);
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examScheduleId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSchoolPortalExamScheduleLiveKitToken(examScheduleId);
        if (cancelled) return;
        setLkToken(data.token);
        setServerUrl(data.url);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not connect invigilation camera.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examScheduleId]);

  if (!examScheduleId) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1200,
        width: expanded ? { xs: 280, sm: 320 } : "auto",
        maxWidth: "calc(100vw - 32px)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ px: 1, py: 0.75, bgcolor: "#0b1220", color: "#fff" }}
      >
        <VideocamOutlinedIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 700, flex: 1 }}>
          Invigilation camera
        </Typography>
        <Chip size="small" label="Live" color="error" sx={{ height: 20, fontSize: "0.65rem" }} />
        <IconButton
          size="small"
          onClick={() => setExpanded((v) => !v)}
          sx={{ color: "#fff" }}
          aria-label={expanded ? "Collapse camera" : "Expand camera"}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>

      {expanded ? (
        <Box sx={{ bgcolor: "#0b1220" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180, gap: 1 }}>
              <CircularProgress size={28} sx={{ color: "primary.light" }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Connecting…
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="warning" sx={{ m: 1, fontSize: "0.75rem" }}>
              {error}
            </Alert>
          ) : lkToken && serverUrl ? (
            <Box
              sx={{
                height: 180,
                "& .lk-video-conference": { height: "100%" },
                "& .lk-control-bar": { display: "none !important" },
              }}
            >
              <LiveKitRoom
                token={lkToken}
                serverUrl={serverUrl}
                connect
                audio={joinMedia.audio}
                video={joinMedia.video}
                data-lk-theme="default"
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <LiveKitVideoRoom allowFocusLayout={false} />
                </Box>
                <Box sx={{ flexShrink: 0, bgcolor: "background.paper" }}>
                  <LiveKitMediaControls showLeave={false} />
                </Box>
              </LiveKitRoom>
            </Box>
          ) : null}
          <Typography variant="caption" sx={{ display: "block", px: 1, py: 0.5, color: "rgba(255,255,255,0.65)" }}>
            Keep this open while you answer.
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}
