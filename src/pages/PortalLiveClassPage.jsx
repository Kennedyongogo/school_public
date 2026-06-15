import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box } from "@mui/material";
import {
  beaconSchoolPortalLiveSessionLeave,
  fetchSchoolPortalLiveClassRoom,
  fetchSchoolPortalLiveKitToken,
  fetchSchoolPortalUser,
  postSchoolPortalLiveSessionLeave,
} from "../api";
import VideoConference from "../components/VideoConference/VideoConference";
import LiveKitConference from "../components/VideoConference/LiveKitConference";
import WaitingRoom from "../components/VideoConference/WaitingRoom";
import { PortalFullscreenChrome } from "../components/Portal/portalUi";
import { useSocket } from "../hooks/useSocket";
import { useLiveClassLobby } from "../hooks/useLiveClassLobby";

export default function PortalLiveClassPage() {
  const { liveClassId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
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
  } = useLiveClassLobby({
    liveClassId,
    token,
    socket,
    isTeacher: false,
    enabled: !!liveClassId && !!token,
  });

  const leaveLobbyRef = useRef(leaveLobby);
  useEffect(() => {
    leaveLobbyRef.current = leaveLobby;
  }, [leaveLobby]);

  const recordLeaveOnce = async () => {
    if (leaveRecordedRef.current || !liveClassId) return;
    leaveRecordedRef.current = true;
    try {
      await leaveLobby();
      await postSchoolPortalLiveSessionLeave({ live_class_id: liveClassId });
    } catch {
      leaveRecordedRef.current = false;
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [me, roomData] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchSchoolPortalLiveClassRoom(liveClassId),
        ]);
        if (cancelled) return;
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setUser(me);
        setRoom(roomData);
        leaveRecordedRef.current = false;
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not open live class.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [liveClassId, navigate, token]);

  useEffect(() => {
    if (!liveClassId) return undefined;

    const onPageHide = () => {
      if (leaveRecordedRef.current) return;
      leaveRecordedRef.current = true;
      void leaveLobbyRef.current();
      beaconSchoolPortalLiveSessionLeave({ live_class_id: liveClassId });
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (!leaveRecordedRef.current) {
        leaveRecordedRef.current = true;
        void leaveLobbyRef.current();
        beaconSchoolPortalLiveSessionLeave({ live_class_id: liveClassId });
      }
    };
  }, [liveClassId]);

  const handleBack = async () => {
    await recordLeaveOnce();
    navigate("/portal/classes", { replace: false });
  };

  const displayName = user?.full_name || user?.username || "Student";

  const iceServers = useMemo(
    () => (Array.isArray(room?.ice_servers) ? room.ice_servers : []),
    [room?.ice_servers]
  );

  const handleLeave = useCallback(() => {
    void recordLeaveOnce().then(() => navigate("/portal/classes", { replace: false }));
  }, [navigate]);

  const admitted = myStatus === "admitted";
  const isLiveKit = room?.video_mode === "livekit" || room?.platform === "livekit";

  useEffect(() => {
    if (myStatus !== "admitted" || !liveClassId || !token) return undefined;
    setError("");
    if (room?.meeting_id) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const roomData = await fetchSchoolPortalLiveClassRoom(liveClassId);
        if (!cancelled) setRoom(roomData);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not open live class.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [myStatus, liveClassId, token, room?.meeting_id]);

  useEffect(() => {
    if (!admitted || !isLiveKit || !liveClassId) {
      setLiveKitCreds(null);
      setVideoPrep(false);
      return undefined;
    }
    let cancelled = false;
    setVideoPrep(true);
    (async () => {
      try {
        const data = await fetchSchoolPortalLiveKitToken(liveClassId);
        if (!cancelled) setLiveKitCreds({ token: data.token, url: data.url });
      } catch {
        if (!cancelled) setLiveKitCreds(null);
      } finally {
        if (!cancelled) setVideoPrep(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [admitted, isLiveKit, liveClassId]);

  const pageBusy = loading;
  const videoBusy = isLiveKit && (videoPrep || !liveKitCreds);

  return (
    <PortalFullscreenChrome
      title={room?.subject_name || "Online class"}
      onBack={() => void handleBack()}
      busy={pageBusy || (admitted && videoBusy)}
      busyLabel={pageBusy ? "Opening class…" : "Joining video…"}
    >
      {error && !admitted ? (
        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
      ) : !room?.meeting_id && !pageBusy ? (
        <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>
          This session has no video room configured.
        </Alert>
      ) : admitted && !videoBusy ? (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {isLiveKit ? (
            <LiveKitConference
              key={liveClassId}
              token={token}
              liveClassId={liveClassId}
              userName={displayName}
              role={room.role || "student"}
              mediaMode={room.media_mode || "optional"}
              onLeave={handleLeave}
              showLobbyPanel={false}
              liveKitCredentials={liveKitCreds}
            />
          ) : (
            <VideoConference
              key={liveClassId}
              token={token}
              meetingId={room.meeting_id}
              liveClassId={liveClassId}
              userName={displayName}
              role={room.role || "student"}
              iceServers={iceServers}
              onLeave={handleLeave}
              showLobbyPanel={false}
            />
          )}
        </Box>
      ) : !pageBusy ? (
        <WaitingRoom
          status={myStatus}
          subjectName={room?.subject_name}
          error={lobbyError}
          syncing={lobbySyncing}
        />
      ) : null}
    </PortalFullscreenChrome>
  );
}
