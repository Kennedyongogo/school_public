import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  fetchEventLiveKitToken,
  fetchEventLiveSession,
  fetchSchoolPortalUser,
} from "../api";
import EventLiveConference from "../components/EventLive/EventLiveConference";
import WaitingRoom from "../components/VideoConference/WaitingRoom";
import VideoConference from "../components/VideoConference/VideoConference";
import { useSocket } from "../hooks/useSocket";
import { useEventLobby } from "../hooks/useEventLobby";

const PORTAL_ROLES = new Set(["parent", "student"]);

function formatWhen(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function PortalEventLivePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [liveKitCreds, setLiveKitCreds] = useState(null);
  const [videoPrep, setVideoPrep] = useState(false);
  const leaveRecordedRef = useRef(false);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
  const { socket } = useSocket(token);

  const {
    syncing: lobbySyncing,
    error: lobbyError,
    myStatus,
    leaveLobby,
  } = useEventLobby({
    eventId,
    token,
    socket,
    enabled: !!eventId && !!token && !!session?.join_window?.can_join,
  });

  const leaveLobbyRef = useRef(leaveLobby);
  useEffect(() => {
    leaveLobbyRef.current = leaveLobby;
  }, [leaveLobby]);

  useEffect(() => {
    if (!token) {
      navigate("/login", {
        replace: true,
        state: { returnTo: `/portal/event/${eventId}` },
      });
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [me, live] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchEventLiveSession(eventId),
        ]);
        if (cancelled) return;
        if (!PORTAL_ROLES.has(me.role)) {
          navigate("/portal", { replace: true });
          return;
        }
        setUser(me);
        setSession(live);
        leaveRecordedRef.current = false;
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not open this event.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, navigate, token]);

  useEffect(() => {
    if (!socket || !eventId) return undefined;

    const onSessionEnded = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      setError("This event has ended.");
      setLiveKitCreds(null);
      void leaveLobbyRef.current();
      navigate("/", { replace: false });
    };
    socket.on("event-live:ended", onSessionEnded);
    return () => socket.off("event-live:ended", onSessionEnded);
  }, [socket, eventId, navigate]);

  useEffect(() => {
    if (!eventId) return undefined;

    const onPageHide = () => {
      if (leaveRecordedRef.current) return;
      leaveRecordedRef.current = true;
      void leaveLobbyRef.current();
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (!leaveRecordedRef.current) {
        leaveRecordedRef.current = true;
        void leaveLobbyRef.current();
      }
    };
  }, [eventId]);

  const event = session?.event;
  const joinWindow = session?.join_window;
  const admitted = myStatus === "admitted";
  const isLiveKit = session?.video_mode === "livekit";
  const meetingId = event?.live_meeting_id;

  const displayName = user?.full_name || user?.username || "Guest";

  const iceServers = useMemo(
    () => (Array.isArray(session?.ice_servers) ? session.ice_servers : []),
    [session?.ice_servers]
  );

  useEffect(() => {
    if (!admitted || !isLiveKit || !eventId) {
      setLiveKitCreds(null);
      setVideoPrep(false);
      return undefined;
    }
    let cancelled = false;
    setVideoPrep(true);
    (async () => {
      try {
        const data = await fetchEventLiveKitToken(eventId);
        if (!cancelled) setLiveKitCreds({ token: data.token, url: data.url });
      } catch (e) {
        if (!cancelled) {
          setLiveKitCreds(null);
          setError(e.message || "Could not join video.");
        }
      } finally {
        if (!cancelled) setVideoPrep(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [admitted, isLiveKit, eventId]);

  const recordLeaveOnce = async () => {
    if (leaveRecordedRef.current || !eventId) return;
    leaveRecordedRef.current = true;
    try {
      await leaveLobby();
    } catch {
      leaveRecordedRef.current = false;
    }
  };

  const handleBack = async () => {
    await recordLeaveOnce();
    navigate("/", { replace: false });
  };

  const handleLeave = useCallback(() => {
    void recordLeaveOnce().then(() => navigate("/", { replace: false }));
  }, [navigate]);

  const pageBusy = loading;

  let body = null;

  if (pageBusy) {
    body = (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          gap: 2,
        }}
      >
        <CircularProgress size={36} sx={{ color: "primary.light" }} />
        <Typography>Opening event…</Typography>
      </Box>
    );
  } else if (error && !admitted) {
    body = (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  } else if (!joinWindow?.can_join) {
    body = (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Alert severity="info" sx={{ maxWidth: 480 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {joinWindow?.reason || "This event is not open for joining yet."}
          </Typography>
          {joinWindow?.opens_at ? (
            <Typography variant="body2">Opens: {formatWhen(joinWindow.opens_at)}</Typography>
          ) : null}
          {joinWindow?.closes_at ? (
            <Typography variant="body2">Closes: {formatWhen(joinWindow.closes_at)}</Typography>
          ) : null}
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </Alert>
      </Box>
    );
  } else if (!session?.live_configured || !meetingId) {
    body = (
      <Alert severity="warning" sx={{ m: 2 }}>
        This event does not have a video room configured yet.
      </Alert>
    );
  } else if (admitted) {
    body = (
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {isLiveKit && (videoPrep || !liveKitCreds) ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              gap: 2,
            }}
          >
            <CircularProgress size={36} sx={{ color: "primary.light" }} />
            <Typography>Joining video…</Typography>
          </Box>
        ) : isLiveKit ? (
          <EventLiveConference
            key={eventId}
            eventId={eventId}
            token={token}
            userName={displayName}
            userId={user?.id}
            isStaff={false}
            liveKitCredentials={liveKitCreds}
            eventTitle={event?.title}
            onLeave={handleLeave}
          />
        ) : (
          <VideoConference
            key={eventId}
            token={token}
            meetingId={meetingId}
            liveClassId={eventId}
            userName={displayName}
            role={user?.role || "student"}
            iceServers={iceServers}
            onLeave={handleLeave}
            showLobbyPanel={false}
          />
        )}
      </Box>
    );
  } else {
    body = (
      <WaitingRoom
        status={myStatus}
        subjectName={event?.title}
        error={lobbyError}
        syncing={lobbySyncing}
        hostNoun="staff"
      />
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0b1220",
      }}
    >
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => void handleBack()} aria-label="Back">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
            {event?.title || "School event"}
          </Typography>
        </Toolbar>
      </AppBar>
      {body}
    </Box>
  );
}
