import React, { useCallback, useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LiveClassWhiteboard from "./LiveClassWhiteboard";
import { useSocket } from "../../hooks/useSocket";

export default function TeamsLiveClassConference({
  token,
  liveClassId,
  userName,
  meetUrl = "",
  subjectName = "Online class",
  onLeave,
  canAnnotate = true,
}) {
  const { socket } = useSocket(token);
  const url = String(meetUrl || "").trim();

  const finishLeave = useCallback(() => {
    if (socket?.connected && liveClassId) {
      socket.emit("leave:live-class", liveClassId);
    }
    onLeave?.();
  }, [socket, liveClassId, onLeave]);

  useEffect(() => {
    if (!socket || !liveClassId) return undefined;
    const joinRoom = () => socket.emit("join:live-class", liveClassId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave:live-class", liveClassId);
    };
  }, [socket, liveClassId]);

  const openTeams = () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0b1220",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, flexShrink: 0, borderBottom: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            size="small"
            startIcon={<OpenInNewIcon />}
            disabled={!url}
            onClick={openTeams}
          >
            Open Microsoft Teams
          </Button>
          <Typography variant="caption" color="grey.400">
            {subjectName} · video in Teams · board below
          </Typography>
        </Stack>
        <Button variant="outlined" color="inherit" size="small" onClick={finishLeave}>
          Leave class
        </Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, p: 1 }}>
        <LiveClassWhiteboard
          liveClassId={liveClassId}
          token={token}
          socket={socket}
          canDraw={canAnnotate}
          readOnlyLabel="View your teacher's annotations. You can draw after being admitted."
        />
      </Box>
    </Box>
  );
}
