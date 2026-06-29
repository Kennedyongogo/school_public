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
import { portalAnchoredDrawerPaperSx } from "./portalAnchoredDrawerSx";
import { PORTAL } from "./portalShared";

const navBtnSx = (active) => ({
  textTransform: "none",
  fontWeight: 700,
  color: active ? PORTAL.navyDeep : "#fff",
  bgcolor: active ? PORTAL.goldMuted : "transparent",
  minWidth: 96,
  borderRadius: 2,
  "&:hover": {
    bgcolor: active ? PORTAL.gold : "rgba(255,255,255,0.12)",
  },
});

const drawerItemSx = (selected) => ({
  borderRadius: 2,
  mb: 0.5,
  fontWeight: selected ? 700 : 600,
  color: selected ? PORTAL.navyDeep : PORTAL.inkMuted,
  bgcolor: selected ? PORTAL.sky : "transparent",
  border: selected ? `1px solid ${PORTAL.borderGold}` : "1px solid transparent",
  "&.Mui-selected": {
    bgcolor: PORTAL.sky,
    borderColor: PORTAL.borderGold,
  },
  "&:hover": { bgcolor: PORTAL.sky },
});

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
  onGoAssignments,
  onGoReportCards,
  onGoFees,
  onGoReceipts,
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
  const goAssignments = () => {
    setMobileOpen(false);
    if (typeof onGoAssignments === "function") onGoAssignments();
  };
  const goReportCards = () => {
    setMobileOpen(false);
    if (typeof onGoReportCards === "function") onGoReportCards();
  };
  const goFees = () => {
    setMobileOpen(false);
    if (typeof onGoFees === "function") onGoFees();
  };
  const goReceipts = () => {
    setMobileOpen(false);
    if (typeof onGoReceipts === "function") onGoReceipts();
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
          bgcolor: PORTAL.navyDeep,
          background: PORTAL.navyGradient,
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
                color: PORTAL.goldMuted,
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
              sx={navBtnSx(currentNav === "profile")}
            >
              Profile
            </Button>
            {typeof onGoClasses === "function" && (
              <Button
                variant={currentNav === "classes" ? "contained" : "text"}
                size="small"
                onClick={onGoClasses}
                sx={navBtnSx(currentNav === "classes")}
              >
                Classes
              </Button>
            )}
            {typeof onGoExams === "function" && (
              <Button
                variant={currentNav === "exams" ? "contained" : "text"}
                size="small"
                onClick={onGoExams}
                sx={navBtnSx(currentNav === "exams")}
              >
                Exams
              </Button>
            )}
            {typeof onGoAssignments === "function" && (
              <Button
                variant={currentNav === "assignments" ? "contained" : "text"}
                size="small"
                onClick={goAssignments}
                sx={navBtnSx(currentNav === "assignments")}
              >
                Assignments
              </Button>
            )}
            {typeof onGoFees === "function" && (
              <Button
                variant={currentNav === "fees" ? "contained" : "text"}
                size="small"
                onClick={onGoFees}
                sx={{ ...navBtnSx(currentNav === "fees"), minWidth: 96 }}
              >
                Fees
              </Button>
            )}
            {typeof onGoReceipts === "function" && (
              <Button
                variant={currentNav === "receipts" ? "contained" : "text"}
                size="small"
                onClick={onGoReceipts}
                sx={{ ...navBtnSx(currentNav === "receipts"), minWidth: 100 }}
              >
                Receipts
              </Button>
            )}
            {typeof onGoReportCards === "function" && (
              <Button
                variant={currentNav === "report-cards" ? "contained" : "text"}
                size="small"
                onClick={onGoReportCards}
                sx={{ ...navBtnSx(currentNav === "report-cards"), minWidth: 110 }}
              >
                Report cards
              </Button>
            )}
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
                background: `linear-gradient(145deg, ${PORTAL.goldMuted}, ${PORTAL.gold})`,
                color: PORTAL.navyDeep,
                boxShadow: "0 4px 14px rgba(201, 162, 39, 0.35)",
                "&:hover": {
                  background: `linear-gradient(145deg, ${PORTAL.gold}, ${PORTAL.goldMuted})`,
                  color: PORTAL.navyDeep,
                },
              }}
            >
              Log out
            </Button>
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.25, flexShrink: 0 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
              }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
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
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": portalAnchoredDrawerPaperSx,
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontWeight: 800, color: PORTAL.navy, fontFamily: PORTAL.fontDisplay, fontSize: "1.25rem" }}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <List dense disablePadding>
            <ListItemButton onClick={goProfile} selected={currentNav === "profile"} sx={drawerItemSx(currentNav === "profile")}>
              <ListItemText primary="Profile" />
            </ListItemButton>
            {typeof onGoClasses === "function" && (
              <ListItemButton onClick={goClasses} selected={currentNav === "classes"} sx={drawerItemSx(currentNav === "classes")}>
                <ListItemText primary="Classes" />
              </ListItemButton>
            )}
            {typeof onGoExams === "function" && (
              <ListItemButton onClick={goExams} selected={currentNav === "exams"} sx={drawerItemSx(currentNav === "exams")}>
                <ListItemText primary="Exams" />
              </ListItemButton>
            )}
            {typeof onGoAssignments === "function" && (
              <ListItemButton onClick={goAssignments} selected={currentNav === "assignments"} sx={drawerItemSx(currentNav === "assignments")}>
                <ListItemText primary="Assignments" />
              </ListItemButton>
            )}
            {typeof onGoReportCards === "function" && (
              <ListItemButton onClick={goReportCards} selected={currentNav === "report-cards"} sx={drawerItemSx(currentNav === "report-cards")}>
                <ListItemText primary="Report cards" />
              </ListItemButton>
            )}
            {typeof onGoFees === "function" && (
              <ListItemButton onClick={goFees} selected={currentNav === "fees"} sx={drawerItemSx(currentNav === "fees")}>
                <ListItemText primary="Fees" />
              </ListItemButton>
            )}
            {typeof onGoReceipts === "function" && (
              <ListItemButton onClick={goReceipts} selected={currentNav === "receipts"} sx={drawerItemSx(currentNav === "receipts")}>
                <ListItemText primary="Receipts" />
              </ListItemButton>
            )}
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
              background: `linear-gradient(145deg, ${PORTAL.goldMuted}, ${PORTAL.gold})`,
              color: PORTAL.navyDeep,
              "&:hover": {
                background: `linear-gradient(145deg, ${PORTAL.gold}, ${PORTAL.goldMuted})`,
                color: PORTAL.navyDeep,
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
