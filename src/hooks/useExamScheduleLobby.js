import { useCallback, useEffect, useState } from "react";
import { fetchSchoolPortalMyExamLobbyStatus } from "../api";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

function authHeaders(token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useExamScheduleLobby({
  examScheduleId,
  token,
  socket,
  isTeacher,
  enabled = true,
  joinMode = "auto",
}) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [myStatus, setMyStatus] = useState(isTeacher ? "admitted" : "none");

  const requestJoin = useCallback(async ({ fresh = false } = {}) => {
    if (!examScheduleId || !token) return null;
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/school-portal/exam-schedule/${encodeURIComponent(examScheduleId)}/lobby/join`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ fresh: !!fresh }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || "Could not request to join");
    const status = data.data?.status || "waiting";
    setMyStatus(status);
    return data.data;
  }, [examScheduleId, token]);

  const leaveLobby = useCallback(async () => {
    if (!examScheduleId || !token) return;
    const base = getBaseUrl();
    await fetch(`${base}/api/school-portal/exam-schedule/${encodeURIComponent(examScheduleId)}/lobby/leave`, {
      method: "POST",
      headers: authHeaders(token),
    }).catch(() => {});
  }, [examScheduleId, token]);

  useEffect(() => {
    if (!enabled || !examScheduleId || !token) return undefined;
    let cancelled = false;
    (async () => {
      setSyncing(true);
      setError("");
      try {
        if (isTeacher) {
          setMyStatus("admitted");
        } else if (joinMode === "fresh") {
          const joined = await requestJoin({ fresh: true });
          if (cancelled) return;
          setMyStatus(joined?.status || "waiting");
        } else {
          const existing = await fetchSchoolPortalMyExamLobbyStatus(examScheduleId);
          if (cancelled) return;
          const status = existing?.status || "none";
          if (status === "waiting" || status === "denied" || status === "admitted") {
            setMyStatus(status);
            if (status === "admitted") setError("");
          } else {
            const joined = await requestJoin({ fresh: false });
            if (cancelled) return;
            setMyStatus(joined?.status || "waiting");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Lobby error");
          setMyStatus("error");
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, examScheduleId, token, isTeacher, joinMode, requestJoin]);

  useEffect(() => {
    if (!socket || !examScheduleId) return undefined;
    const onLobbyStatus = (payload) => {
      if (String(payload?.exam_schedule_id) !== String(examScheduleId)) return;
      if (!isTeacher) {
        const next = payload.status || "waiting";
        setMyStatus(next);
        if (next === "admitted") setError("");
      }
    };
    const joinRoom = () => socket.emit("join:exam-schedule", examScheduleId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("exam-lobby:status", onLobbyStatus);
    return () => {
      socket.off("connect", joinRoom);
      socket.off("exam-lobby:status", onLobbyStatus);
    };
  }, [socket, examScheduleId, isTeacher]);

  const refreshMyStatus = useCallback(async () => {
    if (!examScheduleId || !token || isTeacher) return;
    try {
      const existing = await fetchSchoolPortalMyExamLobbyStatus(examScheduleId);
      const status = existing?.status || "none";
      if (status === "waiting" || status === "denied" || status === "admitted") {
        setMyStatus(status);
        if (status === "admitted") setError("");
      }
    } catch {
      // keep last known status
    }
  }, [examScheduleId, token, isTeacher]);

  useEffect(() => {
    if (!enabled || !examScheduleId || !token || isTeacher) return undefined;
    if (myStatus !== "waiting") return undefined;
    const poll = setInterval(() => {
      void refreshMyStatus();
    }, 3000);
    return () => clearInterval(poll);
  }, [enabled, examScheduleId, token, isTeacher, myStatus, refreshMyStatus]);

  return {
    syncing,
    error,
    myStatus,
    requestJoin,
    leaveLobby,
  };
}
