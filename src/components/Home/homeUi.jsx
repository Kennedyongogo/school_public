import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { HOME, homeGhostButtonSx, homePrimaryButtonSx, homeBodyFontSize } from "./homeShared";

export function HomeSectionHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  align = "center",
  light = false,
  sx,
}) {
  const textColor = light ? "#fff" : HOME.navyDeep;
  const subColor = light ? "rgba(255,255,255,0.82)" : HOME.inkMuted;

  return (
    <Stack
      spacing={1.5}
      alignItems={align === "center" ? "center" : "flex-start"}
      textAlign={align}
      sx={{ mb: { xs: 3, md: 4 }, ...sx }}
    >
      {eyebrow ? (
        <Chip
          label={eyebrow}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            height: 28,
            bgcolor: light ? "rgba(255,255,255,0.12)" : "rgba(201, 162, 39, 0.12)",
            color: light ? HOME.goldMuted : HOME.navyDeep,
            border: `1px solid ${light ? "rgba(255,255,255,0.2)" : HOME.borderGold}`,
          }}
        />
      ) : null}
      <Typography
        component="h2"
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "2.85rem" },
          lineHeight: 1.1,
          color: textColor,
          maxWidth: 720,
        }}
      >
        {title}
        {titleAccent ? (
          <>
            {" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              {titleAccent}
            </Box>
          </>
        ) : null}
      </Typography>
      {subtitle ? (
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: homeBodyFontSize,
            lineHeight: 1.7,
            color: subColor,
            maxWidth: 620,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function HomePrimaryButton({ children, sx, ...props }) {
  return (
    <Button variant="contained" disableElevation sx={{ ...homePrimaryButtonSx(), ...sx }} {...props}>
      {children}
    </Button>
  );
}

export function HomeGhostButton({ children, light, sx, ...props }) {
  return (
    <Button variant="outlined" sx={{ ...homeGhostButtonSx({ light }), ...sx }} {...props}>
      {children}
    </Button>
  );
}

export function HomeStatPill({ icon, value, label }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 1.25, sm: 2 },
        py: { xs: 0.85, sm: 1.1 },
        borderRadius: "999px",
        bgcolor: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.22)",
        color: HOME.goldMuted,
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      <Box sx={{ lineHeight: 0, "& svg": { fontSize: { xs: 18, sm: 22 } } }}>{icon}</Box>
      <Box sx={{ textAlign: "left", minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.82rem", sm: "1rem" },
            color: "#fff",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 600,
            fontSize: { xs: "0.55rem", sm: "0.68rem" },
            color: "rgba(255,255,255,0.78)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export function HomeSectionShell({ id, children, sx, bg }) {
  return (
    <Box
      id={id}
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        fontFamily: HOME.fontBody,
        ...bg,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
