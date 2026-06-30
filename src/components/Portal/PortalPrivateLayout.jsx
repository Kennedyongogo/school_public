import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, Box, Stack, Typography, IconButton, Button, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import PortalPrivateHeader from "./PortalPrivateHeader";
import PortalReviewPromptDialog from "./PortalReviewPromptDialog";
import { portalAnchoredDrawerPaperSx } from "./portalAnchoredDrawerSx";
import { PORTAL, portalGhostButtonSx } from "./portalShared";
import {
  clearSchoolPortalSession,
  fetchMyPortalReviewStatus,
  fetchSchoolPortalNotifications,
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalUser,
  fetchStudentTermStatus,
  hasPortalSession,
  markAllSchoolPortalNotificationsRead,
  markSchoolPortalNotificationRead,
  schoolPortalMediaUrl,
} from "../../api";

function playPortalChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ding = (freq, when, dur) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + when;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.03);
    };
    ding(784, 0, 0.11);
    ding(988, 0.13, 0.14);
    setTimeout(() => ctx.close().catch(() => {}), 450);
  } catch {
    // ignore
  }
}

export default function PortalPrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [termStatus, setTermStatus] = useState(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [portalUnreadCount, setPortalUnreadCount] = useState(0);
  const [portalNotifications, setPortalNotifications] = useState([]);
  const [reviewPromptOpen, setReviewPromptOpen] = useState(false);
  const lastUnreadRef = useRef(null);
  const wasPortalUnlockedRef = useRef(null);

  const applyTermStatus = useCallback((status) => {
    const next = status || null;
    const nowUnlocked = Boolean(next?.portal_unlocked);
    const wasUnlocked = wasPortalUnlockedRef.current;

    if (wasUnlocked === true && !nowUnlocked) {
      void fetchSchoolPortalStudentProfile()
        .then((row) => setStudent(row || null))
        .catch(() => setStudent(null));
    }

    wasPortalUnlockedRef.current = nowUnlocked;
    setTermStatus(next);
    return next;
  }, []);

  const reloadTermStatus = useCallback(async () => {
    if (user?.role !== "student") return null;
    try {
      const status = await fetchStudentTermStatus();
      return applyTermStatus(status);
    } catch {
      return null;
    }
  }, [applyTermStatus, user?.role]);

  useEffect(() => {
    if (!hasPortalSession()) {
      navigate("/login", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const me = await fetchSchoolPortalUser();
        setUser(me);
        if (me.role === "student") {
          try {
            const row = await fetchSchoolPortalStudentProfile();
            setStudent(row || null);
          } catch {
            setStudent(null);
          }
          try {
            const status = await fetchStudentTermStatus();
            applyTermStatus(status);
          } catch {
            applyTermStatus(null);
          }
        } else {
          setStudent(null);
          wasPortalUnlockedRef.current = null;
          setTermStatus(null);
        }
      } catch {
        clearSchoolPortalSession();
        navigate("/login", { replace: true });
      }
    };
    void load();
  }, [applyTermStatus, navigate]);

  useEffect(() => {
    if (user?.role !== "student") return undefined;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      await reloadTermStatus();
    };

    void poll();
    const intervalId = setInterval(() => void poll(), 45000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reloadTermStatus, user?.role]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchMyPortalReviewStatus();
        if (!cancelled && status && !status.has_review) {
          setReviewPromptOpen(true);
        }
      } catch {
        // ignore — no prompt if status check fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await fetchSchoolPortalNotifications();
        if (cancelled) return;
        const unread = Number(data?.unread_count) || 0;
        const list = Array.isArray(data?.notifications) ? data.notifications : [];
        setPortalUnreadCount(unread);
        setPortalNotifications(list);
        if (lastUnreadRef.current != null && unread > lastUnreadRef.current) playPortalChime();
        lastUnreadRef.current = unread;
      } catch {
        // ignore
      }
    };
    void poll();
    const id = setInterval(() => void poll(), 45000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  const refreshNotificationsOnly = useCallback(async () => {
    try {
      const data = await fetchSchoolPortalNotifications();
      const unread = Number(data?.unread_count) || 0;
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
      setPortalUnreadCount(unread);
      setPortalNotifications(list);
      lastUnreadRef.current = unread;
    } catch {
      // ignore
    }
  }, []);

  const headerAvatarSrc = useMemo(() => {
    const profilePic = student?.profile_picture ? schoolPortalMediaUrl(student.profile_picture) : "";
    const userPic = user?.profile_image ? schoolPortalMediaUrl(user.profile_image) : "";
    return profilePic || userPic || undefined;
  }, [student, user]);

  const portalLabel = user?.role === "student" ? "Student portal" : user?.role === "parent" ? "Parent portal" : "";
  const isExamResultPage = /\/portal\/exams\/[^/]+\/result\/?$/.test(location.pathname);
  const studentPortalUnlocked = user?.role !== "student" || Boolean(termStatus?.portal_unlocked);

  useEffect(() => {
    if (user?.role !== "student") return;
    if (termStatus == null) return;
    if (termStatus.portal_unlocked) return;
    const path = location.pathname.replace(/\/$/, "") || "/portal";
    if (path === "/portal") return;
    navigate("/portal", { replace: true });
  }, [user?.role, termStatus, location.pathname, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: "56px", sm: "64px" },
        bgcolor: isExamResultPage ? "transparent" : PORTAL.cream,
      }}
    >
      <PortalPrivateHeader
        displayName={user?.full_name || "Account"}
        profileImageUrl={headerAvatarSrc}
        portalRoleLabel={portalLabel}
        onLogout={() => {
          clearSchoolPortalSession();
          navigate("/login", { replace: true });
        }}
        notificationCount={portalUnreadCount}
        onNotificationsClick={() => setNotificationDrawerOpen(true)}
        currentNav={
          location.pathname.startsWith("/portal/classes")
            ? "classes"
            : location.pathname.startsWith("/portal/exams")
            ? "exams"
            : location.pathname.startsWith("/portal/assignments")
            ? "assignments"
            : location.pathname.startsWith("/portal/report-cards")
            ? "report-cards"
            : location.pathname.startsWith("/portal/fees")
            ? "fees"
            : location.pathname.startsWith("/portal/receipts")
            ? "receipts"
            : "profile"
        }
        onGoProfile={() => navigate("/portal")}
        {...(user?.role === "student" && studentPortalUnlocked && {
          onGoClasses: () => navigate("/portal/classes"),
          onGoExams: () => navigate("/portal/exams"),
          onGoAssignments: () => navigate("/portal/assignments"),
          onGoReportCards: () => navigate("/portal/report-cards"),
        })}
        {...(user?.role === "parent" && {
          onGoFees: () => navigate("/portal/fees"),
          onGoReceipts: () => navigate("/portal/receipts"),
        })}
      />

      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": portalAnchoredDrawerPaperSx,
        }}
      >
        <Box sx={{ p: 0, width: "100%", boxSizing: "border-box" }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: PORTAL.navyGradient,
              color: "#fff",
              borderBottom: `1px solid ${PORTAL.borderGold}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: PORTAL.fontDisplay }}>
                Notifications
              </Typography>
              <IconButton aria-label="Close notifications" onClick={() => setNotificationDrawerOpen(false)} size="small" sx={{ color: PORTAL.goldMuted }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
          <Box sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={portalUnreadCount <= 0}
              onClick={async () => {
                await markAllSchoolPortalNotificationsRead();
                await refreshNotificationsOnly();
              }}
              sx={portalGhostButtonSx()}
            >
              Mark all read
            </Button>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          {portalNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No alerts yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {portalNotifications.map((n) => (
                <ListItemButton
                  key={n.id}
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: n.is_read ? "transparent" : PORTAL.sky,
                    border: n.is_read ? "1px solid transparent" : `1px solid ${PORTAL.border}`,
                    "&:hover": { bgcolor: PORTAL.sky },
                  }}
                  onClick={async () => {
                    try {
                      if (!n.is_read) {
                        await markSchoolPortalNotificationRead(n.id);
                        await refreshNotificationsOnly();
                      }
                      const url = n.action_url && String(n.action_url).trim();
                      if (url) {
                        const webrtcMatch = url.match(/\/portal\/live-class\/([0-9a-f-]{36})/i);
                        if (webrtcMatch && user?.role === "student") {
                          setNotificationDrawerOpen(false);
                          navigate(`/portal/live-class/${webrtcMatch[1]}`);
                          return;
                        }
                        if (/^https?:\/\//i.test(url)) {
                          if (user?.role === "student") {
                            setNotificationDrawerOpen(false);
                            navigate(`/portal/live-meeting?target=${encodeURIComponent(url)}`);
                            return;
                          }
                          window.location.assign(url);
                        }
                      }
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <ListItemText
                    primary={n.title || "Notice"}
                    secondary={`${n.message || ""}${n.created_at ? `\n${new Date(n.created_at).toLocaleString()}` : ""}`}
                    secondaryTypographyProps={{ sx: { whiteSpace: "pre-wrap", display: "block", mt: 0.25 } }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
          </Box>
        </Box>
      </Drawer>

      <PortalReviewPromptDialog
        open={reviewPromptOpen}
        onClose={() => setReviewPromptOpen(false)}
        onSubmitted={() => setReviewPromptOpen(false)}
        user={user}
        student={student}
      />

      <Outlet
        context={{
          termStatus,
          setTermStatus,
          reloadTermStatus,
        }}
      />
    </Box>
  );
}

