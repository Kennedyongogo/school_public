import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, Box, Stack, Typography, IconButton, Button, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import PortalPrivateHeader from "./PortalPrivateHeader";
import PortalReviewPromptDialog from "./PortalReviewPromptDialog";
import { portalAnchoredDrawerPaperSx } from "./portalAnchoredDrawerSx";
import {
  clearSchoolPortalSession,
  fetchMyPortalReviewStatus,
  fetchSchoolPortalNotifications,
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalUser,
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
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [portalUnreadCount, setPortalUnreadCount] = useState(0);
  const [portalNotifications, setPortalNotifications] = useState([]);
  const [reviewPromptOpen, setReviewPromptOpen] = useState(false);
  const lastUnreadRef = useRef(null);

  useEffect(() => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
    if (!token) {
      navigate("/marketplace", { replace: true });
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
        } else {
          setStudent(null);
        }
      } catch {
        clearSchoolPortalSession();
        navigate("/marketplace", { replace: true });
      }
    };
    void load();
  }, [navigate]);

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

  return (
    <Box sx={{ minHeight: "100vh", pt: { xs: "56px", sm: "64px" } }}>
      <PortalPrivateHeader
        displayName={user?.full_name || "Account"}
        profileImageUrl={headerAvatarSrc}
        portalRoleLabel={portalLabel}
        onLogout={() => {
          clearSchoolPortalSession();
          navigate("/marketplace", { replace: true });
        }}
        notificationCount={portalUnreadCount}
        onNotificationsClick={() => setNotificationDrawerOpen(true)}
        currentNav={
          location.pathname.startsWith("/portal/classes")
            ? "classes"
            : location.pathname.startsWith("/portal/exams")
            ? "exams"
            : "profile"
        }
        onGoProfile={() => navigate("/portal")}
        {...(user?.role === "student" && {
          onGoClasses: () => navigate("/portal/classes"),
          onGoExams: () => navigate("/portal/exams"),
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
        <Box sx={{ p: 1.5, width: "100%", boxSizing: "border-box" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Notifications
            </Typography>
            <IconButton aria-label="Close notifications" onClick={() => setNotificationDrawerOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={portalUnreadCount <= 0}
              onClick={async () => {
                await markAllSchoolPortalNotificationsRead();
                await refreshNotificationsOnly();
              }}
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
                  sx={{ borderRadius: 1, mb: 0.5, bgcolor: n.is_read ? "transparent" : "action.hover" }}
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
      </Drawer>

      <PortalReviewPromptDialog
        open={reviewPromptOpen}
        onClose={() => setReviewPromptOpen(false)}
        onSubmitted={() => setReviewPromptOpen(false)}
        user={user}
        student={student}
      />

      <Outlet />
    </Box>
  );
}

