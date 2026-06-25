import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  PORTAL,
  portalPagePad,
  portalPageShellSx,
  portalCardSx,
  portalPrimaryButtonSx,
  portalBodyFontSize,
  portalFullscreenShellSx,
  portalFullscreenAppBarSx,
} from "./portalShared";

export function PortalPageShell({ children, sx }) {
  return (
    <Box sx={{ ...portalPageShellSx(), ...sx }}>
      {children}
    </Box>
  );
}

export function PortalPageContent({ children, maxWidth = 1100, fullWidth = false, sx }) {
  return (
    <Box
      sx={{
        ...portalPagePad,
        width: "100%",
        ...(fullWidth ? { maxWidth: "none" } : { maxWidth, mx: "auto" }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function PortalPageHero({ icon, title, subtitle, chip, fullWidth = false, compact = false }) {
  return (
    <Box
      sx={{
        background: PORTAL.navyGradient,
        color: "#fff",
        px: { xs: 1.5, sm: 2, md: 2.5 },
        py: compact ? { xs: 1.25, sm: 1.5 } : { xs: 2.5, sm: 3 },
        mb: compact ? { xs: 1, md: 1.25 } : { xs: 2, md: 2.5 },
        borderBottom: `1px solid ${PORTAL.borderGold}`,
        flexShrink: 0,
      }}
    >
      <Box sx={{ ...(fullWidth ? { width: "100%" } : { maxWidth: 1100, mx: "auto", width: "100%" }) }}>
        <Stack direction="row" spacing={compact ? 1 : 1.5} alignItems="flex-start">
          {icon ? (
            <Box
              sx={{
                width: compact ? 40 : 48,
                height: compact ? 40 : 48,
                borderRadius: 2,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(201, 162, 39, 0.18)",
                border: `1px solid ${PORTAL.borderGold}`,
                color: PORTAL.goldMuted,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: PORTAL.fontDisplay,
                fontWeight: 700,
                fontSize: compact ? { xs: "1.35rem", sm: "1.5rem" } : { xs: "1.65rem", sm: "1.9rem" },
                lineHeight: 1.15,
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                sx={{
                  mt: compact ? 0.35 : 0.75,
                  opacity: 0.88,
                  fontSize: compact ? { xs: "0.88rem", md: "0.95rem" } : portalBodyFontSize,
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
            {chip || null}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function PortalSurfaceCard({ children, sx, noStrip }) {
  return (
    <Box sx={{ ...portalCardSx(), ...sx }}>
      {!noStrip ? <Box sx={{ height: 4, background: PORTAL.navyGradient }} /> : null}
      <Box sx={{ p: { xs: 2, sm: 2.25, md: 2.5 } }}>{children}</Box>
    </Box>
  );
}

export function PortalPrimaryButton({ children, sx, ...props }) {
  return (
    <Button variant="contained" disableElevation sx={{ ...portalPrimaryButtonSx(), ...sx }} {...props}>
      {children}
    </Button>
  );
}

export function PortalLoading({ label = "Loading…" }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
      <CircularProgress sx={{ color: PORTAL.gold }} />
      {label ? (
        <Typography sx={{ color: PORTAL.inkMuted, fontWeight: 600 }}>{label}</Typography>
      ) : null}
    </Box>
  );
}

export function PortalEmptyState({ icon, title, description }) {
  return (
    <PortalSurfaceCard sx={{ textAlign: "center", py: 5, px: 3 }}>
      {icon ? <Box sx={{ color: PORTAL.gold, mb: 1.5, "& svg": { fontSize: 52 } }}>{icon}</Box> : null}
      <Typography sx={{ fontFamily: PORTAL.fontDisplay, fontWeight: 700, fontSize: "1.35rem", color: PORTAL.navyDeep, mb: 1 }}>
        {title}
      </Typography>
      {description ? (
        <Typography sx={{ color: PORTAL.inkMuted, maxWidth: 420, mx: "auto", lineHeight: 1.65 }}>
          {description}
        </Typography>
      ) : null}
    </PortalSurfaceCard>
  );
}

export function PortalFullscreenChrome({ title, onBack, children, busy, busyLabel }) {
  return (
    <Box sx={portalFullscreenShellSx()}>
      <AppBar position="static" elevation={0} sx={portalFullscreenAppBarSx()}>
        <Toolbar variant="dense" sx={{ minHeight: { xs: 52, sm: 56 }, gap: 1 }}>
          <IconButton edge="start" onClick={onBack} aria-label="Back" sx={{ color: PORTAL.goldMuted }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1, color: "#fff" }} noWrap>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      {busy ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 2 }}>
          <CircularProgress size={36} sx={{ color: PORTAL.gold }} />
          <Typography>{busyLabel || "Please wait…"}</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</Box>
      )}
    </Box>
  );
}

export function PortalDetailCard({ icon: Icon, title, children }) {
  return (
    <Box sx={{ ...portalCardSx(), height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ height: 4, background: PORTAL.navyGradient, flexShrink: 0 }} />
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: PORTAL.sky,
          borderBottom: `1px solid ${PORTAL.border}`,
          flexShrink: 0,
        }}
      >
        {Icon ? <Icon sx={{ fontSize: 22, color: PORTAL.gold }} /> : null}
        <Typography sx={{ fontWeight: 800, color: PORTAL.navyDeep, lineHeight: 1.25 }}>{title}</Typography>
      </Stack>
      <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflow: "auto" }}>{children}</Box>
    </Box>
  );
}

export function PortalField({ label, value, mono, placeholder }) {
  const show = value !== null && value !== undefined && String(value).trim() !== "";
  const text = show ? String(value) : placeholder;
  if (text === undefined || text === null) return null;
  return (
    <Box sx={{ mb: 2, "&:last-of-type": { mb: 0 } }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, display: "block", mb: 0.5, letterSpacing: "0.06em", color: PORTAL.inkSoft, textTransform: "uppercase", fontSize: "0.68rem" }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          wordBreak: "break-word",
          color: show ? PORTAL.navyDeep : PORTAL.inkSoft,
          fontFamily: mono ? "ui-monospace, monospace" : PORTAL.fontBody,
          whiteSpace: "pre-wrap",
          fontSize: portalBodyFontSize,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
