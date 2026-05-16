import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";
import { LiveKitRoom, useConnectionState, useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "@livekit/components-styles";
import LiveKitVideoRoom from "../VideoConference/LiveKitVideoRoom";
import LiveKitMediaControls from "../VideoConference/LiveKitMediaControls";

function LiveKitConnectionTracker({ wasConnectedRef }) {
  const room = useRoomContext();
  const state = useConnectionState(room);
  useEffect(() => {
    if (state === ConnectionState.Connected) wasConnectedRef.current = true;
  }, [state, wasConnectedRef]);
  return null;
}

/** Minimal LiveKit room for school events (no live-class chat sidebar). */
export default function EventLiveKitRoom({ token, url, onLeave }) {
  const [error, setError] = useState("");
  const intentionalLeaveRef = useRef(false);
  const wasConnectedRef = useRef(false);

  const handleRequestLeave = useCallback(() => {
    intentionalLeaveRef.current = true;
  }, []);

  const handleDisconnected = useCallback(() => {
    if (!intentionalLeaveRef.current) return;
    intentionalLeaveRef.current = false;
    onLeave?.();
  }, [onLeave]);

  const handleRoomError = useCallback((err) => {
    const msg = err?.message || "";
    if (/device|permission|not found|in use/i.test(msg)) {
      console.warn("LiveKit media (non-fatal):", msg);
      return;
    }
    if (/client initiated|cancelled|canceled|abort/i.test(msg)) {
      return;
    }
    setError(msg || "LiveKit connection error.");
  }, []);

  if (!token || !url) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Alert severity="error">Video room is not available.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0b1220",
        overflow: "hidden",
      }}
    >
      <LiveKitRoom
        video
        audio
        token={token}
        serverUrl={url}
        connect
        onDisconnected={handleDisconnected}
        onError={handleRoomError}
        data-lk-theme="default"
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <LiveKitConnectionTracker wasConnectedRef={wasConnectedRef} />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            "& .lk-video-conference": { height: "100%" },
            "& .lk-chat": { display: "none !important" },
            "& .lk-control-bar": { display: "none !important" },
          }}
        >
          {error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <LiveKitVideoRoom />
          )}
        </Box>
        <LiveKitMediaControls onRequestLeave={handleRequestLeave} />
      </LiveKitRoom>
    </Box>
  );
}
