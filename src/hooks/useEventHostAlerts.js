import { useEffect, useRef } from "react";
import { getPortalAuthUser } from "../utils/portalAuthStorage";
import {
  playAdmittedAlert,
  playChatAlert,
  playHandRaiseAlert,
  playLobbyKnockAlert,
  playQuestionAlert,
  playReactionAlert,
  requestNotificationPermission,
  tryBrowserNotification,
} from "../utils/liveClassAlertSound";

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

function getLocalUserId() {
  return getPortalAuthUser()?.id || null;
}

const NOTIFY_TAG = "event-live-host";

/** Staff host alerts for online events (same behaviour as online class host). */
export function useEventHostAlerts({ socket, eventId, token, enabled = false }) {
  const waitingCountRef = useRef(0);
  const admittedIdsRef = useRef(new Set());
  const chatIdsRef = useRef(new Set());
  const handIdsRef = useRef(new Set());
  const reactionKeysRef = useRef(new Set());
  const readyRef = useRef(false);
  const userIdRef = useRef(getLocalUserId());

  useEffect(() => {
    if (!enabled) return undefined;
    requestNotificationPermission();
    return undefined;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !eventId || !token) return undefined;

    const base = getBaseUrl();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/interactions`, {
          headers: authHeaders(token),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled || !res.ok || !data.success) return;
        const chat = Array.isArray(data.data?.chat) ? data.data.chat : [];
        chatIdsRef.current = new Set(chat.filter((m) => !m.parent_id).map((m) => m.id));
        handIdsRef.current = new Set((data.data?.raised_hands || []).map((h) => h.id));
        reactionKeysRef.current = new Set(
          (data.data?.reactions || []).map((r) => `${r.user_id}-${r.at}-${r.emoji}`)
        );
      } catch {
        /* non-fatal */
      }
      try {
        const lobbyRes = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/lobby`, {
          headers: authHeaders(token),
        });
        const lobbyJson = await lobbyRes.json().catch(() => ({}));
        if (!cancelled && lobbyRes.ok && lobbyJson.success) {
          const admitted = lobbyJson.data?.admitted || [];
          admittedIdsRef.current = new Set(admitted.map((e) => e.id));
          waitingCountRef.current = (lobbyJson.data?.waiting || []).length;
        }
      } catch {
        /* non-fatal */
      }
      if (!cancelled) readyRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, eventId, token]);

  useEffect(() => {
    if (!enabled || !socket || !eventId) return undefined;

    const onLobbyUpdate = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;

      const waiting = Array.isArray(payload?.waiting) ? payload.waiting.length : 0;
      if (readyRef.current && waiting > waitingCountRef.current) {
        playLobbyKnockAlert();
        tryBrowserNotification("Event lobby", "Someone is waiting to join.", NOTIFY_TAG);
      }
      waitingCountRef.current = waiting;

      const admitted = Array.isArray(payload?.admitted) ? payload.admitted : [];
      if (readyRef.current) {
        for (const entry of admitted) {
          if (entry?.id && !admittedIdsRef.current.has(entry.id)) {
            playAdmittedAlert();
            const name = entry.user?.full_name || entry.user?.username || "Participant";
            tryBrowserNotification("Event", `${name} joined the live session.`, NOTIFY_TAG);
            break;
          }
        }
      }
      admittedIdsRef.current = new Set(admitted.map((e) => e.id).filter(Boolean));
      readyRef.current = true;
    };

    const onChatNew = ({ message, event_id }) => {
      if (String(event_id) !== String(eventId) || !message?.id) return;
      if (message.parent_id) return;
      if (String(message.user_id) === String(userIdRef.current)) return;
      if (chatIdsRef.current.has(message.id)) return;
      chatIdsRef.current.add(message.id);
      if (!readyRef.current) return;

      const name = message.author?.full_name || message.author?.username || "Participant";
      const preview = String(message.message || "").slice(0, 80);

      if (message.is_question) {
        playQuestionAlert();
        tryBrowserNotification("New question", `${name}: ${preview}`, NOTIFY_TAG);
      } else {
        playChatAlert();
        tryBrowserNotification("Event chat", `${name}: ${preview}`, NOTIFY_TAG);
      }
    };

    const onChatSync = ({ chat, event_id }) => {
      if (String(event_id) !== String(eventId) || !Array.isArray(chat)) return;
      chatIdsRef.current = new Set(chat.filter((m) => !m.parent_id).map((m) => m.id));
      readyRef.current = true;
    };

    const onHandUpdate = ({ raised_hands, event_id }) => {
      if (String(event_id) !== String(eventId)) return;
      const hands = Array.isArray(raised_hands) ? raised_hands : [];
      const ids = new Set(hands.map((h) => h.id));
      if (readyRef.current) {
        for (const id of ids) {
          if (!handIdsRef.current.has(id)) {
            playHandRaiseAlert();
            const who = hands.find((h) => h.id === id);
            const name = who?.user?.full_name || who?.user?.username || "Someone";
            tryBrowserNotification("Raised hand", `${name} raised their hand.`, NOTIFY_TAG);
            break;
          }
        }
      }
      handIdsRef.current = ids;
      readyRef.current = true;
    };

    const onReaction = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      if (String(payload?.user_id) === String(userIdRef.current)) return;
      const key = `${payload.user_id}-${payload.at}-${payload.emoji}`;
      if (reactionKeysRef.current.has(key)) return;
      reactionKeysRef.current.add(key);
      if (!readyRef.current) return;
      playReactionAlert();
      const name = payload.user_name || "Someone";
      tryBrowserNotification("Reaction", `${name} reacted`, NOTIFY_TAG);
    };

    const joinRoom = () => socket.emit("join:event", eventId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("event-lobby:update", onLobbyUpdate);
    socket.on("event-chat:new", onChatNew);
    socket.on("event-chat:sync", onChatSync);
    socket.on("event-hand:update", onHandUpdate);
    socket.on("event-reaction", onReaction);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("event-lobby:update", onLobbyUpdate);
      socket.off("event-chat:new", onChatNew);
      socket.off("event-chat:sync", onChatSync);
      socket.off("event-hand:update", onHandUpdate);
      socket.off("event-reaction", onReaction);
      readyRef.current = false;
      waitingCountRef.current = 0;
      admittedIdsRef.current = new Set();
      chatIdsRef.current = new Set();
      handIdsRef.current = new Set();
      reactionKeysRef.current = new Set();
    };
  }, [enabled, socket, eventId, token]);
}
