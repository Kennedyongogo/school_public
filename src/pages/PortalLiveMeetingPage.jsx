import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  postSchoolPortalLiveSessionJoin,
  postSchoolPortalLiveSessionLeave,
  beaconSchoolPortalLiveSessionLeave,
} from "../api";

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
    const token =
      typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
    if (!token) {
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
      <Box sx={{ p: 3, maxWidth: 480, mx: "auto", mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Invalid meeting link
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Open the class notification again from your portal, or ask your teacher for the join link.
        </Typography>
        <IconButton color="primary" onClick={() => navigate("/portal")} aria-label="Back to portal">
          <ArrowBackRoundedIcon />
        </IconButton>
      </Box>
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
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 48 }}>
          <IconButton edge="start" color="inherit" aria-label="Leave meeting" onClick={() => void handleBack()}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
            Live class
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            Tap ← when you finish to record your leave time
          </Typography>
        </Toolbar>
      </AppBar>
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
    </Box>
  );
}
