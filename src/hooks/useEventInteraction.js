import { useCallback, useEffect, useState } from "react";
import {
  fetchEventInteractions,
  markEventQuestionAnswered,
  postEventChat,
  postEventReaction,
} from "../api";

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

export function useEventInteraction({ eventId, token, socket, isStaff, userId }) {
  const [chat, setChat] = useState([]);
  const [raisedHands, setRaisedHands] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myHandRaised, setMyHandRaised] = useState(false);

  const load = useCallback(
    async (opts = {}) => {
      const silent = opts?.silent === true;
      if (!eventId || !token) return;
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await fetchEventInteractions(eventId);
        const hands = Array.isArray(data?.raised_hands) ? data.raised_hands : [];
        setChat(Array.isArray(data?.chat) ? data.chat : []);
        setRaisedHands(hands);
        setReactions(Array.isArray(data?.reactions) ? data.reactions : []);
        if (userId) {
          setMyHandRaised(hands.some((h) => String(h.user_id) === String(userId)));
        }
      } catch (e) {
        if (!silent) setError(e.message || "Failed to load chat");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [eventId, token, userId]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!eventId || !token) return undefined;
    const id = setInterval(() => void load({ silent: true }), 6000);
    return () => clearInterval(id);
  }, [eventId, token, load]);

  useEffect(() => {
    if (!socket || !eventId) return undefined;

    const joinRoom = () => socket.emit("join:event", eventId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const onChatNew = ({ message, event_id }) => {
      if (String(event_id) !== String(eventId) || !message?.id) return;
      if (message.parent_id) {
        void load({ silent: true });
        return;
      }
      setChat((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    };

    const onChatSync = ({ chat: next, event_id }) => {
      if (String(event_id) !== String(eventId)) return;
      if (Array.isArray(next)) setChat(next);
    };

    const onReaction = (payload) => {
      if (String(payload?.event_id) !== String(eventId)) return;
      setReactions((prev) => {
        const key = `${payload.user_id}-${payload.at}-${payload.emoji}`;
        if (prev.some((r) => `${r.user_id}-${r.at}-${r.emoji}` === key)) return prev;
        return [...prev.slice(-49), payload];
      });
    };

    const onHandUpdate = ({ raised_hands, event_id }) => {
      if (String(event_id) !== String(eventId)) return;
      const hands = Array.isArray(raised_hands) ? raised_hands : [];
      setRaisedHands(hands);
      const uid = userId;
      setMyHandRaised(uid ? hands.some((h) => String(h.user_id) === String(uid)) : false);
    };

    socket.on("event-chat:new", onChatNew);
    socket.on("event-chat:sync", onChatSync);
    socket.on("event-reaction", onReaction);
    socket.on("event-hand:update", onHandUpdate);

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave:event", eventId);
      socket.off("event-chat:new", onChatNew);
      socket.off("event-chat:sync", onChatSync);
      socket.off("event-reaction", onReaction);
      socket.off("event-hand:update", onHandUpdate);
    };
  }, [socket, eventId, load, userId]);

  const sendChat = useCallback(
    async ({ message, is_question = false, parent_id = null }) => {
      const row = await postEventChat(eventId, { message, is_question, parent_id });
      if (row?.parent_id) await load({ silent: true });
      else if (row) setChat((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      return row;
    },
    [eventId, load]
  );

  const markAnswered = useCallback(
    async (messageId) => {
      await markEventQuestionAnswered(eventId, messageId);
      await load({ silent: true });
    },
    [eventId, load]
  );

  const toggleRaiseHand = useCallback(async () => {
    const base = getBaseUrl();
    const path = myHandRaised ? "lower" : "raise";
    const res = await fetch(`${base}/api/events/${encodeURIComponent(eventId)}/hand/${path}`, {
      method: "POST",
      headers: authHeaders(token),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || "Could not update hand raise");
    setMyHandRaised(!myHandRaised);
    await load({ silent: true });
  }, [eventId, token, myHandRaised, load]);

  const dismissHand = useCallback(
    async (handId) => {
      const base = getBaseUrl();
      const res = await fetch(
        `${base}/api/events/${encodeURIComponent(eventId)}/hand/${encodeURIComponent(handId)}/dismiss`,
        { method: "POST", headers: authHeaders(token) }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not dismiss hand");
      await load({ silent: true });
    },
    [eventId, token, load]
  );

  const sendReaction = useCallback(
    async (emoji) => {
      const payload = await postEventReaction(eventId, emoji);
      if (payload) {
        setReactions((prev) => {
          const key = `${payload.user_id}-${payload.at}-${payload.emoji}`;
          if (prev.some((r) => `${r.user_id}-${r.at}-${r.emoji}` === key)) return prev;
          return [...prev.slice(-49), payload];
        });
      }
      return payload;
    },
    [eventId]
  );

  return {
    chat,
    raisedHands,
    reactions,
    loading,
    error,
    myHandRaised,
    load,
    sendChat,
    markAnswered,
    toggleRaiseHand,
    dismissHand,
    sendReaction,
    isStaff,
  };
}
