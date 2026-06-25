import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, AppBar, Box, Button, CircularProgress, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  fetchSchoolPortalExamScheduleLiveKitToken,
  fetchSchoolPortalExamScheduleRoom,
  fetchSchoolPortalUser,
  getPortalAuthToken,
} from "../api";
import LiveKitConference from "../components/VideoConference/LiveKitConference";
import WaitingRoom from "../components/VideoConference/WaitingRoom";
import { useSocket } from "../hooks/useSocket";
import { useExamScheduleLobby } from "../hooks/useExamScheduleLobby";
import {
  clearExamInvigilationPaperAccess,
  grantExamInvigilationPaperAccess,
  isLiveInvigilationMode,
} from "../utils/examInvigilation";

export default function PortalExamInvigilationPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [liveKitCreds, setLiveKitCreds] = useState(null);
  const [videoPrep, setVideoPrep] = useState(false);
  const leaveRecordedRef = useRef(false);

  const token = getPortalAuthToken();
  const { socket } = useSocket(token);
  const wantsFreshJoin = location.state?.freshJoin === true;

  const { syncing: lobbySyncing, error: lobbyError, myStatus, leaveLobby } = useExamScheduleLobby({
    examScheduleId: scheduleId,
    token,
    socket,
    isTeacher: false,
    enabled: !!scheduleId && !!token,
    joinMode: wantsFreshJoin ? "fresh" : "auto",
  });

  const admitted = myStatus === "admitted";
  const isLiveKit =
    isLiveInvigilationMode(room) &&
    (room?.video_mode === "livekit" || room?.platform === "livekit");

  useEffect(() => {
    if (wantsFreshJoin && scheduleId) {
      clearExamInvigilationPaperAccess(scheduleId);
    }
  }, [wantsFreshJoin, scheduleId]);

  const goToExamPaper = useCallback(() => {
    if (!admitted) return;
    grantExamInvigilationPaperAccess(scheduleId);
    navigate(`/portal/exams/${scheduleId}`);
  }, [navigate, scheduleId, admitted]);

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
          fetchSchoolPortalExamScheduleRoom(scheduleId),
        ]);
        if (cancelled) return;
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setUser(me);
        setRoom(roomData);
        if (roomData?.proctoring_mode && !isLiveInvigilationMode(roomData)) {
          navigate(`/portal/exams/${scheduleId}`, { replace: true });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not open invigilation room.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scheduleId, navigate, token]);

  useEffect(() => {
    if (!admitted || !isLiveKit || !scheduleId) {
      setLiveKitCreds(null);
      setVideoPrep(false);
      return undefined;
    }
    let cancelled = false;
    setVideoPrep(true);
    (async () => {
      try {
        const data = await fetchSchoolPortalExamScheduleLiveKitToken(scheduleId);
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
  }, [admitted, isLiveKit, scheduleId]);

  const handleBack = async () => {
    if (!leaveRecordedRef.current) {
      leaveRecordedRef.current = true;
      await leaveLobby();
    }
    navigate("/portal/exams", { replace: false });
  };

  const displayName = user?.full_name || user?.username || "Student";

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", flexDirection: "column", bgcolor: "#0b1220" }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => void handleBack()} aria-label="Back">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
            {room?.exam_title || "Exam invigilation"}
          </Typography>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", gap: 2 }}>
          <CircularProgress size={36} sx={{ color: "primary.light" }} />
          <Typography>Opening invigilation room…</Typography>
        </Box>
      ) : error && !admitted ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : !room?.meeting_id && isLiveKit ? (
        <Alert severity="warning" sx={{ m: 2 }}>
          Invigilation video is not set up yet. Ask your teacher to open the exam room first.
        </Alert>
      ) : admitted ? (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {isLiveKit && (videoPrep || !liveKitCreds) ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", gap: 2 }}>
              <CircularProgress size={36} sx={{ color: "primary.light" }} />
              <Typography>Joining video — allow camera and microphone…</Typography>
            </Box>
          ) : isLiveKit ? (
            <>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <LiveKitConference
                  key={`${scheduleId}-${liveKitCreds?.token || "lk"}`}
                  token={token}
                  examScheduleId={scheduleId}
                  userName={displayName}
                  role="student"
                  mediaMode={room.media_mode || "video"}
                  onLeave={handleBack}
                  showLobbyPanel={false}
                  liveKitCredentials={liveKitCreds}
                />
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  You were admitted. Turn on your camera above, then open the exam paper when ready.
                </Typography>
                <Button variant="contained" color="primary" onClick={goToExamPaper} disabled={!admitted}>
                  Continue to exam paper
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                You were admitted by your invigilator.
              </Alert>
              <Button variant="contained" onClick={goToExamPaper}>
                Continue to exam paper
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <WaitingRoom
          status={myStatus}
          subjectName={room?.exam_title}
          error={lobbyError || error}
          syncing={lobbySyncing}
          hostNoun="invigilator"
        />
      )}
    </Box>
  );
}
