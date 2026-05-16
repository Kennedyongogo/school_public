import { useCallback, useEffect, useState } from "react";
import { fetchMyEventLobbyStatus } from "../api";

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

export function useEventLobby({ eventId, token, socket, enabled = true }) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [myStatus, setMyStatus] = useState("none");

  const requestJoin = useCallback(async () => {
    if (!eventId || !token) return null;
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/lobby/join`, {
      method: "POST",
      headers: authHeaders(token),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || "Could not request to join");
    const status = data.data?.status || "waiting";
    setMyStatus(status);
    return data.data;
  }, [eventId, token]);

  const leaveLobby = useCallback(async () => {
    if (!eventId || !token) return;
    const base = getBaseUrl();
    await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/lobby/leave`, {
      method: "POST",
      headers: authHeaders(token),
    }).catch(() => {});
  }, [eventId, token]);

  useEffect(() => {
    if (!enabled || !eventId || !token) return undefined;

    let cancelled = false;
    (async () => {
      setSyncing(true);
      setError("");
      try {
        const existing = await fetchMyEventLobbyStatus(eventId);
        if (cancelled) return;

        const status = existing?.status || "none";
        if (status === "waiting" || status === "admitted" || status === "denied") {
          setMyStatus(status);
          if (status === "admitted") setError("");
        } else {
          const joined = await requestJoin();
          if (cancelled) return;
          setMyStatus(joined?.status || "waiting");
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
  }, [enabled, eventId, token, requestJoin]);

  useEffect(() => {
    if (!enabled || !eventId || !token || myStatus !== "waiting") return undefined;
    const poll = setInterval(() => {
      void fetchMyEventLobbyStatus(eventId)
        .then((data) => {
          const next = data?.status || "waiting";
          if (next === "admitted" || next === "denied") setMyStatus(next);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(poll);
  }, [enabled, eventId, token, myStatus]);

  useEffect(() => {
    if (!socket || !eventId) return undefined;

    const onLobbyStatus = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      const next = payload.status || "waiting";
      setMyStatus(next);
      if (next === "admitted") setError("");
      if (next === "left" && payload.reason === "ended") {
        setError("This event has ended.");
      }
    };

    const onSessionEnded = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      setMyStatus("left");
      setError("This event has ended.");
    };

    const joinRoom = () => socket.emit("join:event", eventId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("event-lobby:status", onLobbyStatus);
    socket.on("event-live:ended", onSessionEnded);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("event-lobby:status", onLobbyStatus);
      socket.off("event-live:ended", onSessionEnded);
      socket.emit("leave:event", eventId);
    };
  }, [socket, eventId]);

  return {
    syncing,
    error,
    myStatus,
    requestJoin,
    leaveLobby,
  };
}
