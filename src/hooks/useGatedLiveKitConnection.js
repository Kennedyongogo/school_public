import { useCallback, useMemo, useRef, useState } from "react";
import { Room } from "livekit-client";
import { isLiveKitRateLimitError } from "../utils/liveKitRoomErrors";

export const LIVEKIT_MAX_CONNECT_ATTEMPTS = 3;
export const LIVEKIT_RETRY_DELAY_MS = 8000;
export const LIVEKIT_RATE_LIMIT_COOLDOWN_MS = 120000;

export function useGatedLiveKitConnection() {
  const [connectAttempt, setConnectAttempt] = useState(0);
  const room = useMemo(() => new Room(), [connectAttempt]);
  const [connectEnabled, setConnectEnabled] = useState(false);
  const [attemptsExhausted, setAttemptsExhausted] = useState(false);
  const [rateLimitUntil, setRateLimitUntil] = useState(0);

  const preparedTokenRef = useRef(null);
  const lastAttemptAtRef = useRef(0);
  const failureCountRef = useRef(0);
  const preparingRef = useRef(false);

  const connectOptions = useMemo(
    () => ({
      maxRetries: 0,
      websocketTimeout: 30_000,
      peerConnectionTimeout: 30_000,
    }),
    []
  );

  const disableConnect = useCallback(() => {
    setConnectEnabled(false);
  }, []);

  const resetSession = useCallback(() => {
    failureCountRef.current = 0;
    setAttemptsExhausted(false);
    setRateLimitUntil(0);
    preparedTokenRef.current = null;
    preparingRef.current = false;
    lastAttemptAtRef.current = 0;
    setConnectEnabled(false);
  }, []);

  const onConnectionSuccess = useCallback(() => {
    failureCountRef.current = 0;
    setAttemptsExhausted(false);
    setRateLimitUntil(0);
  }, []);

  const onConnectionFailure = useCallback((message) => {
    setConnectEnabled(false);
    if (failureCountRef.current < LIVEKIT_MAX_CONNECT_ATTEMPTS) {
      failureCountRef.current += 1;
    }
    if (isLiveKitRateLimitError(message)) {
      setRateLimitUntil(Date.now() + LIVEKIT_RATE_LIMIT_COOLDOWN_MS);
      return "rate_limit";
    }
    if (failureCountRef.current >= LIVEKIT_MAX_CONNECT_ATTEMPTS) {
      setAttemptsExhausted(true);
      return "exhausted";
    }
    return "failed";
  }, []);

  const msUntilRetry = useCallback(() => {
    const rateWait = Math.max(0, rateLimitUntil - Date.now());
    const throttleWait = Math.max(0, LIVEKIT_RETRY_DELAY_MS - (Date.now() - lastAttemptAtRef.current));
    return Math.max(rateWait, throttleWait);
  }, [rateLimitUntil]);

  const canRetryNow = useCallback(() => {
    if (attemptsExhausted && failureCountRef.current >= LIVEKIT_MAX_CONNECT_ATTEMPTS) return false;
    return msUntilRetry() <= 0;
  }, [attemptsExhausted, msUntilRetry]);

  const prepareAndEnableConnect = useCallback(
    async (serverUrl, lkToken) => {
      if (!room || !serverUrl || !lkToken) return;
      if (preparingRef.current) return;
      if (Date.now() < rateLimitUntil) return;
      if (failureCountRef.current >= LIVEKIT_MAX_CONNECT_ATTEMPTS) {
        setAttemptsExhausted(true);
        return;
      }

      const now = Date.now();
      if (
        failureCountRef.current > 0 &&
        connectAttempt > 0 &&
        now - lastAttemptAtRef.current < LIVEKIT_RETRY_DELAY_MS
      ) {
        return;
      }

      preparingRef.current = true;
      lastAttemptAtRef.current = now;
      setConnectEnabled(false);

      try {
        if (preparedTokenRef.current !== lkToken) {
          await room.prepareConnection(serverUrl, lkToken);
          preparedTokenRef.current = lkToken;
        }
        if (Date.now() < rateLimitUntil) return;
        setConnectEnabled(true);
      } catch (err) {
        console.warn("LiveKit prepareConnection:", err?.message || err);
        onConnectionFailure(String(err?.message || err));
      } finally {
        preparingRef.current = false;
      }
    },
    [room, rateLimitUntil, onConnectionFailure, connectAttempt]
  );

  const forceReconnect = useCallback(() => {
    failureCountRef.current = 0;
    setAttemptsExhausted(false);
    setRateLimitUntil(0);
    preparedTokenRef.current = null;
    preparingRef.current = false;
    lastAttemptAtRef.current = 0;
    setConnectEnabled(false);
    try {
      if (room.state !== "disconnected") {
        room.disconnect(true);
      }
    } catch (_) {
      /* ignore */
    }
    setConnectAttempt((n) => n + 1);
    return true;
  }, [room]);

  const retryConnect = useCallback(() => {
    if (!canRetryNow()) return false;
    setConnectEnabled(false);
    preparedTokenRef.current = null;
    try {
      if (room.state !== "disconnected") {
        room.disconnect(true);
      }
    } catch (_) {
      /* ignore */
    }
    setConnectAttempt((n) => n + 1);
    return true;
  }, [canRetryNow, room]);

  return {
    room,
    connectAttempt,
    connectEnabled,
    connectOptions,
    prepareAndEnableConnect,
    disableConnect,
    onConnectionSuccess,
    onConnectionFailure,
    retryConnect,
    forceReconnect,
    resetSession,
    canRetryNow,
    msUntilRetry,
    attemptsExhausted,
    rateLimitUntil,
  };
}
