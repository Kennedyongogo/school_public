import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Chip, CircularProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import { LiveKitRoom, useConnectionState, useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "@livekit/components-styles";
import { useSocket } from "../../hooks/useSocket";
import LiveKitVideoRoom from "../VideoConference/LiveKitVideoRoom";
import LiveKitMediaControls from "../VideoConference/LiveKitMediaControls";
import EventLiveAttendeeLayout from "./EventLiveAttendeeLayout";
import { useEventHostAlerts } from "../../hooks/useEventHostAlerts";
import { primeAlertAudio } from "../../utils/liveClassAlertSound";
import { eventLiveVideoSlotSx } from "./eventLiveVideoSlotSx";

function LiveKitConnectionTracker({ wasConnectedRef }) {
  const room = useRoomContext();
  const state = useConnectionState(room);
  useEffect(() => {
    if (state === ConnectionState.Connected) wasConnectedRef.current = true;
  }, [state, wasConnectedRef]);
  return null;
}

export default function EventLiveConference({
  eventId,
  token,
  userName,
  userId,
  isStaff = false,
  liveKitCredentials,
  onLeave,
  eventTitle,
}) {
  const [lkToken, setLkToken] = useState(liveKitCredentials?.token ?? null);
  const [serverUrl, setServerUrl] = useState(liveKitCredentials?.url ?? "");
  const [loading, setLoading] = useState(!liveKitCredentials?.token);
  const [error, setError] = useState("");
  const [mobilePanel, setMobilePanel] = useState("video");
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));
  const { socket, connected } = useSocket(token);
  useEventHostAlerts({
    socket,
    eventId,
    token,
    enabled: isStaff && !!eventId && !!token,
  });
  const intentionalLeaveRef = useRef(false);
  const sessionEndedRef = useRef(false);
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    primeAlertAudio();
  }, []);

  useEffect(() => {
    if (liveKitCredentials?.token && liveKitCredentials?.url) {
      setLkToken(liveKitCredentials.token);
      setServerUrl(liveKitCredentials.url);
      setLoading(false);
    }
  }, [liveKitCredentials?.token, liveKitCredentials?.url]);

  useEffect(() => {
    if (!socket || !eventId) return undefined;
    const joinRoom = () => socket.emit("join:event", eventId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const onSessionEnded = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      sessionEndedRef.current = true;
      intentionalLeaveRef.current = true;
      setLkToken(null);
      onLeave?.();
    };
    socket.on("event-live:ended", onSessionEnded);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("event-live:ended", onSessionEnded);
      socket.emit("leave:event", eventId);
    };
  }, [socket, eventId, onLeave]);

  const handleRequestLeave = useCallback(() => {
    intentionalLeaveRef.current = true;
  }, []);

  const handleDisconnected = useCallback(() => {
    const shouldLeave =
      intentionalLeaveRef.current ||
      sessionEndedRef.current ||
      (!isStaff && wasConnectedRef.current);
    if (!shouldLeave) return;
    intentionalLeaveRef.current = false;
    sessionEndedRef.current = false;
    onLeave?.();
  }, [onLeave, isStaff]);

  const handleRoomError = useCallback((err) => {
    const msg = err?.message || "";
    if (/device|permission|not found|in use|client initiated|cancelled|canceled|abort/i.test(msg)) return;
    setError(msg || "LiveKit connection error.");
  }, []);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", gap: 2 }}>
        <CircularProgress size={36} />
        <Typography>Connecting to video…</Typography>
      </Box>
    );
  }

  if (error || !lkToken || !serverUrl) {
    return (
      <Box sx={{ flex: 1, p: 2 }}>
        <Alert severity="error">{error || "Video is not available for this event."}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, width: "100%", bgcolor: "#0b1220", overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }} noWrap>
          {eventTitle || "Live event"}
        </Typography>
        <Chip size="small" label="LiveKit" color="info" variant="outlined" sx={{ display: { xs: "none", sm: "flex" } }} />
        <Chip
          size="small"
          label={connected ? "Live chat on" : "Live chat (polling)"}
          color={connected ? "success" : "warning"}
          variant={connected ? "filled" : "outlined"}
          sx={{ display: { xs: "none", sm: "flex" } }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <LiveKitRoom
          video
          audio
          token={lkToken}
          serverUrl={serverUrl}
          connect
          onDisconnected={handleDisconnected}
          onError={handleRoomError}
          data-lk-theme="default"
          style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <LiveKitConnectionTracker wasConnectedRef={wasConnectedRef} />
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <EventLiveAttendeeLayout
              eventId={eventId}
              token={token}
              socket={socket}
              isStaff={isStaff}
              userId={userId}
              isNarrow={isNarrow}
              mobilePanel={mobilePanel}
              onMobilePanelChange={setMobilePanel}
              videoSlot={
                <Box sx={eventLiveVideoSlotSx}>
                  <LiveKitVideoRoom />
                </Box>
              }
            />
          </Box>
          <Box sx={{ flexShrink: 0, zIndex: 2, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
            <LiveKitMediaControls onRequestLeave={handleRequestLeave} />
          </Box>
        </LiveKitRoom>
      </Box>
    </Box>
  );
}
