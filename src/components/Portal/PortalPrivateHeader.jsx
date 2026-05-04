import React from "react";
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
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
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
}) {
  const imgSrc = profileImageUrl ? schoolPortalMediaUrl(profileImageUrl) : null;
  const initial = (displayName || "?").trim().charAt(0).toUpperCase() || "?";

  return (
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
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: "1 1 auto" }}>
          <Avatar
            src={imgSrc || undefined}
            alt=""
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
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
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: "52vw", sm: "360px", md: "480px" },
              }}
            >
              {displayName || "Account"}
            </Typography>
            {portalRoleLabel ? (
              <Typography variant="caption" sx={{ color: "rgba(230, 207, 106, 0.92)", fontWeight: 600 }}>
                {portalRoleLabel}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
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
      </Toolbar>
    </AppBar>
  );
}
