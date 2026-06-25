import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Tab, Tabs, Typography } from "@mui/material";

import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

import GestureRoundedIcon from "@mui/icons-material/GestureRounded";

import ForumRoundedIcon from "@mui/icons-material/ForumRounded";

import {

  beaconSchoolPortalLiveSessionLeave,

  fetchSchoolPortalLiveClassRoom,

  fetchSchoolPortalLiveKitToken,

  fetchSchoolPortalUser,

  getPortalAuthToken,

  hasPortalSession,

  postSchoolPortalLiveSessionLeave,

} from "../api";

import VideoConference from "../components/VideoConference/VideoConference";

import LiveKitConference from "../components/VideoConference/LiveKitConference";

import TeamsLiveClassBar from "../components/VideoConference/TeamsLiveClassBar";

import LiveClassWhiteboard from "../components/VideoConference/LiveClassWhiteboard";

import LiveClassSidebar from "../components/VideoConference/LiveClassSidebar";

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

  const [studentPanel, setStudentPanel] = useState("class");

  const leaveRecordedRef = useRef(false);



  const token = getPortalAuthToken();

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



  const performLeaveSession = useCallback(async () => {
    if (!liveClassId) return;
    try {
      await leaveLobby();
      await postSchoolPortalLiveSessionLeave({ live_class_id: liveClassId });
    } catch {
      /* best-effort; pagehide/beacon may still record leave */
    }
  }, [liveClassId, leaveLobby]);

  const exitClass = useCallback(() => {
    const dest = "/portal/classes";
    if (leaveRecordedRef.current) {
      navigate(dest, { replace: false });
      return;
    }
    leaveRecordedRef.current = true;
    void performLeaveSession();
    navigate(dest, { replace: false });
  }, [navigate, performLeaveSession]);



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



  const handleBack = exitClass;



  const displayName = user?.full_name || user?.username || "Student";



  const iceServers = useMemo(

    () => (Array.isArray(room?.ice_servers) ? room.ice_servers : []),

    [room?.ice_servers]

  );



  const handleLeave = exitClass;



  const admitted = myStatus === "admitted";

  const isLiveKit = room?.video_mode === "livekit" || room?.platform === "livekit";

  const teamsUrl = room?.join_url || room?.host_url || "";

  const isTeams =

    room?.platform === "teams" ||

    String(teamsUrl).toLowerCase().includes("teams.microsoft.com") ||

    (room?.video_mode === "external" && !!teamsUrl);



  useEffect(() => {

    if (!liveClassId || !token || !socket) return undefined;

    const joinRoom = () => socket.emit("join:live-class", liveClassId);

    if (socket.connected) joinRoom();

    socket.on("connect", joinRoom);

    return () => {

      socket.off("connect", joinRoom);

    };

  }, [liveClassId, token, socket]);



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

  const videoBusy = admitted && isLiveKit && videoPrep && !liveKitCreds;

  const showSession = !!room && !pageBusy;



  const classPanel = (

    <Box

      sx={{

        flex: 1,

        minHeight: 0,

        minWidth: 0,

        display: "flex",

        flexDirection: "column",

        overflow: "hidden",

        bgcolor: "#0b1220",

      }}

    >

      {!admitted ? (

        <WaitingRoom

          status={myStatus}

          subjectName={room?.subject_name}

          error={lobbyError}

          syncing={lobbySyncing}

        />

      ) : isTeams ? (

        <>

          <TeamsLiveClassBar

            meetUrl={teamsUrl}

            subjectName={room?.subject_name || "Online class"}

            onLeave={handleLeave}

          />

          <Box

            sx={{

              flex: 1,

              minHeight: 0,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              p: 2,

            }}

          >

            <Typography variant="body2" color="grey.400" textAlign="center" maxWidth={420}>

              Tap <strong>Open Microsoft Teams</strong> for video and audio. Use <strong>Whiteboard</strong> or <strong>Chat</strong> tabs for class notes and messages.

            </Typography>

          </Box>

        </>

      ) : isLiveKit && videoBusy ? (

        <Box

          sx={{

            flex: 1,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: "#fff",

          }}

        >

          <Typography variant="body2">Joining video…</Typography>

        </Box>

      ) : isLiveKit ? (

        <LiveKitConference

          key={liveClassId}

          token={token}

          liveClassId={liveClassId}

          userName={displayName}

          role={room.role || "student"}

          mediaMode={room.media_mode || "optional"}

          onLeave={handleLeave}

          showLobbyPanel={false}

          showChatPanel={false}

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

          showChatPanel={false}

        />

      )}

    </Box>

  );



  const boardPanel = (

    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", bgcolor: "background.paper" }}>

      <LiveClassWhiteboard

        liveClassId={liveClassId}

        token={token}

        socket={socket}

        canDraw={admitted}

        canClear={false}

        compact

        readOnlyLabel="Join the class to draw or type on the shared board."

      />

    </Box>

  );



  const chatPanel = admitted ? (

    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", bgcolor: "background.paper" }}>

      <LiveClassSidebar

        liveClassId={liveClassId}

        token={token}

        socket={socket}

        isTeacher={false}

        userName={displayName}

        embedded

        fillParent

      />

    </Box>

  ) : (

    <Box

      sx={{

        flex: 1,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        p: 3,

        bgcolor: "#0b1220",

      }}

    >

      <Typography variant="body2" color="grey.400" textAlign="center" maxWidth={400}>

        Chat opens after your teacher admits you. Stay on the <strong>Class</strong> tab while you wait.

      </Typography>

    </Box>

  );



  return (

    <PortalFullscreenChrome

      title={room?.subject_name || "Online class"}

      onBack={() => void handleBack()}

      busy={pageBusy}

      busyLabel="Opening class…"

    >

      {error && !admitted ? (

        <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>

      ) : !room?.meeting_id && !isTeams && !pageBusy ? (

        <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>

          This session has no video room configured.

        </Alert>

      ) : showSession ? (

        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <Tabs

            value={studentPanel}

            onChange={(_, v) => v && setStudentPanel(v)}

            variant="fullWidth"

            sx={{

              flexShrink: 0,

              minHeight: 44,

              bgcolor: "background.paper",

              borderBottom: 1,

              borderColor: "divider",

              "& .MuiTab-root": { minHeight: 44, fontWeight: 700, fontSize: "0.8rem" },

            }}

          >

            <Tab icon={<VideocamRoundedIcon fontSize="small" />} iconPosition="start" label="Class" value="class" />

            <Tab icon={<GestureRoundedIcon fontSize="small" />} iconPosition="start" label="Whiteboard" value="board" />

            <Tab icon={<ForumRoundedIcon fontSize="small" />} iconPosition="start" label="Chat" value="chat" />

          </Tabs>



          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {studentPanel === "class" ? classPanel : studentPanel === "board" ? boardPanel : chatPanel}

          </Box>



          {!admitted && studentPanel === "class" ? (

            <Typography

              variant="caption"

              sx={{

                flexShrink: 0,

                px: 2,

                py: 0.75,

                textAlign: "center",

                bgcolor: "rgba(255,255,255,0.06)",

                color: "grey.400",

              }}

            >

              You can open the Whiteboard tab while you wait — teacher notes appear there in real time.

            </Typography>

          ) : null}

        </Box>

      ) : null}

    </PortalFullscreenChrome>

  );

}


