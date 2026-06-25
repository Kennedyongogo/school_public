import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  beaconSchoolPortalLiveSessionLeave,
  hasPortalSession,
  postSchoolPortalLiveSessionJoin,
  postSchoolPortalLiveSessionLeave,
} from "../api";
import { PortalFullscreenChrome } from "../components/Portal/portalUi";
import { PORTAL } from "../components/Portal/portalShared";

/** Live meetings stay inside this SPA (iframe). Leaving records attendance via toolbar or unload hooks. */
export default function PortalLiveMeetingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawTarget = params.get("target");
  const target = rawTarget != null ? String(rawTarget).trim() : "";
  const valid = /^https?:\/\//i.test(target);

  const leaveRecordedRef = useRef(false);
  const effectGenRef = useRef(0);

  const recordLeaveOnce = async () => {
    if (leaveRecordedRef.current || !valid) return;
    leaveRecordedRef.current = true;
    try {
      await postSchoolPortalLiveSessionLeave(target);
    } catch {
      leaveRecordedRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasPortalSession()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!valid) return undefined;

    leaveRecordedRef.current = false;
    void postSchoolPortalLiveSessionJoin(target).catch(() => {});

    const onPageHide = () => {
      if (leaveRecordedRef.current) return;
      leaveRecordedRef.current = true;
      beaconSchoolPortalLiveSessionLeave(target);
    };
    window.addEventListener("pagehide", onPageHide);

    const id = ++effectGenRef.current;
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.setTimeout(() => {
        if (id !== effectGenRef.current) return;
        if (!leaveRecordedRef.current) {
          leaveRecordedRef.current = true;
          void postSchoolPortalLiveSessionLeave(target).catch(() => {
            leaveRecordedRef.current = false;
          });
        }
      }, 0);
    };
  }, [target, valid]);

  const handleBack = async () => {
    await recordLeaveOnce();
    navigate("/portal", { replace: false });
  };

  if (!valid) {
    return (
      <Box sx={{ p: 3, maxWidth: 480, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: PORTAL.fontDisplay, fontWeight: 700, color: PORTAL.navyDeep }}>
          Invalid meeting link
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: PORTAL.inkMuted }}>
          Open the class notification again from your portal, or ask your teacher for the join link.
        </Typography>
        <IconButton onClick={() => navigate("/portal")} aria-label="Back to portal" sx={{ color: PORTAL.gold }}>
          <ArrowBackRoundedIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <PortalFullscreenChrome title="Live class" onBack={() => void handleBack()}>
      <Box
        component="iframe"
        title="Live class"
        src={target}
        sx={{
          flex: 1,
          width: "100%",
          border: 0,
          bgcolor: "#111",
        }}
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write"
      />
    </PortalFullscreenChrome>
  );
}
