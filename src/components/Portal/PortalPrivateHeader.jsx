import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { schoolPortalMediaUrl } from "../../api";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};

/**
 * Private portal chrome: avatar + name (left), notifications + logout (right).
 */
export default function PortalPrivateHeader({
  displayName,
  profileImageUrl,
  portalRoleLabel,
  onLogout,
  notificationCount = 0,
  onNotificationsClick,
  currentNav = "profile",
  onGoProfile,
  onGoClasses,
  onGoExams,
}) {
  const imgSrc = profileImageUrl ? schoolPortalMediaUrl(profileImageUrl) : null;
  const initial = (displayName || "?").trim().charAt(0).toUpperCase() || "?";
  const [mobileOpen, setMobileOpen] = useState(false);

  const goProfile = () => {
    setMobileOpen(false);
    if (typeof onGoProfile === "function") onGoProfile();
  };
  const goClasses = () => {
    setMobileOpen(false);
    if (typeof onGoClasses === "function") onGoClasses();
  };
  const goExams = () => {
    setMobileOpen(false);
    if (typeof onGoExams === "function") onGoExams();
  };
  const openNotifications = () => {
    setMobileOpen(false);
    if (typeof onNotificationsClick === "function") onNotificationsClick();
  };
  const logout = () => {
    setMobileOpen(false);
    if (typeof onLogout === "function") onLogout();
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          bgcolor: BRAND.navyDeep,
          background: `linear-gradient(120deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 55%, #122b4d 100%)`,
          borderBottom: `1px solid rgba(230, 207, 106, 0.22)`,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 2 },
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: "1 1 auto" }}>
            <Avatar
              src={imgSrc || undefined}
              alt=""
              sx={{
                width: { xs: 34, sm: 40 },
                height: { xs: 34, sm: 40 },
                bgcolor: "rgba(230, 207, 106, 0.25)",
                color: BRAND.goldMuted,
                fontWeight: 700,
                border: `2px solid rgba(230, 207, 106, 0.45)`,
              }}
            >
              {!imgSrc ? initial : null}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: "45vw", sm: "360px", md: "480px" },
                }}
              >
                {displayName || "Account"}
              </Typography>
              {portalRoleLabel ? (
                <Typography variant="caption" sx={{ color: "rgba(230, 207, 106, 0.92)", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                  {portalRoleLabel}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Button
              variant={currentNav === "profile" ? "contained" : "text"}
              size="small"
              onClick={onGoProfile}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: currentNav === "profile" ? BRAND.navyDeep : "#fff",
                bgcolor: currentNav === "profile" ? BRAND.goldMuted : "transparent",
                minWidth: 96,
                "&:hover": {
                  bgcolor: currentNav === "profile" ? BRAND.gold : "rgba(255,255,255,0.12)",
                },
              }}
            >
              Profile
            </Button>
            <Button
              variant={currentNav === "classes" ? "contained" : "text"}
              size="small"
              onClick={onGoClasses}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: currentNav === "classes" ? BRAND.navyDeep : "#fff",
                bgcolor: currentNav === "classes" ? BRAND.goldMuted : "transparent",
                minWidth: 96,
                "&:hover": {
                  bgcolor: currentNav === "classes" ? BRAND.gold : "rgba(255,255,255,0.12)",
                },
              }}
            >
              Classes
            </Button>
            <Button
              variant={currentNav === "exams" ? "contained" : "text"}
              size="small"
              onClick={onGoExams}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: currentNav === "exams" ? BRAND.navyDeep : "#fff",
                bgcolor: currentNav === "exams" ? BRAND.goldMuted : "transparent",
                minWidth: 96,
                "&:hover": {
                  bgcolor: currentNav === "exams" ? BRAND.gold : "rgba(255,255,255,0.12)",
                },
              }}
            >
              Exams
            </Button>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                aria-label="Notifications"
                onClick={onNotificationsClick || (() => {})}
                sx={{
                  color: "rgba(255,255,255,0.92)",
                  "&:hover": { bgcolor: "rgba(230, 207, 106, 0.12)" },
                }}
              >
                <Badge
                  color="warning"
                  overlap="circular"
                  invisible={!notificationCount || notificationCount <= 0}
                  badgeContent={
                    notificationCount > 99 ? "99+" : notificationCount > 0 ? notificationCount : undefined
                  }
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <NotificationsOutlinedIcon sx={{ fontSize: 26 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              size="medium"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                textTransform: "none",
                background: `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
                color: BRAND.navyDeep,
                boxShadow: "0 4px 14px rgba(201, 162, 39, 0.35)",
                "&:hover": {
                  background: `linear-gradient(145deg, ${BRAND.gold}, ${BRAND.goldMuted})`,
                  color: BRAND.navyDeep,
                },
              }}
            >
              Log out
            </Button>
          </Box>

          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
            }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "260px", sm: "300px" },
            marginRight: { xs: 2, sm: 3 },
            top: { xs: "64px", sm: "72px" },
            height: "auto",
            maxHeight: { xs: "calc(100vh - 72px)", sm: "calc(100vh - 80px)" },
            bgcolor: "#f5f8fc",
            overflowY: "auto",
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontWeight: 800, color: BRAND.navy }}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <List dense disablePadding>
            <ListItemButton onClick={goProfile} selected={currentNav === "profile"} sx={{ borderRadius: 1 }}>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton onClick={goClasses} selected={currentNav === "classes"} sx={{ borderRadius: 1 }}>
              <ListItemText primary="Classes" />
            </ListItemButton>
            <ListItemButton onClick={goExams} selected={currentNav === "exams"} sx={{ borderRadius: 1 }}>
              <ListItemText primary="Exams" />
            </ListItemButton>
            <ListItemButton onClick={openNotifications} sx={{ borderRadius: 1 }}>
              <ListItemText primary={`Notifications${notificationCount > 0 ? ` (${notificationCount > 99 ? "99+" : notificationCount})` : ""}`} />
            </ListItemButton>
          </List>
          <Divider sx={{ my: 1 }} />
          <Button
            variant="contained"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              background: `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
              color: BRAND.navyDeep,
              "&:hover": {
                background: `linear-gradient(145deg, ${BRAND.gold}, ${BRAND.goldMuted})`,
                color: BRAND.navyDeep,
              },
            }}
          >
            Log out
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
