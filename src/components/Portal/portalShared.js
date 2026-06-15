import { alpha } from "@mui/material/styles";
import { HOME, homePrimaryButtonSx, homeGhostButtonSx } from "../Home/homeShared";

export const PORTAL = {
  ...HOME,
  pageBg: `linear-gradient(180deg, ${HOME.sky} 0%, ${HOME.cream} 42%, #fff 100%)`,
  liveBg: "#08162b",
  liveBgGradient: `linear-gradient(160deg, ${HOME.navyDeep} 0%, ${HOME.navy} 50%, #0a1a30 100%)`,
};

export const portalPagePad = { px: { xs: 1.5, sm: 2, md: 2.5 }, pb: { xs: 3, md: 4 } };

export const portalBodyFontSize = { xs: "0.95rem", md: "1.05rem" };

export function portalPageShellSx() {
  return {
    minHeight: "100vh",
    bgcolor: HOME.cream,
    background: PORTAL.pageBg,
    fontFamily: HOME.fontBody,
  };
}

export function portalCardSx() {
  return {
    borderRadius: 3,
    bgcolor: "#fff",
    border: `1px solid ${HOME.border}`,
    boxShadow: HOME.shadowSm,
    overflow: "hidden",
    transition: "all 0.24s ease",
    "&:hover": {
      borderColor: HOME.borderGold,
      boxShadow: HOME.shadowMd,
    },
  };
}

export function portalPrimaryButtonSx() {
  return homePrimaryButtonSx();
}

export function portalGhostButtonSx({ light = false } = {}) {
  return homeGhostButtonSx({ light });
}

export function portalChipSx() {
  return {
    fontWeight: 700,
    bgcolor: HOME.sky,
    color: HOME.navyDeep,
    border: `1px solid ${HOME.border}`,
  };
}

export function portalFullscreenShellSx() {
  return {
    position: "fixed",
    inset: 0,
    zIndex: 1300,
    display: "flex",
    flexDirection: "column",
    bgcolor: PORTAL.liveBg,
    background: PORTAL.liveBgGradient,
    fontFamily: HOME.fontBody,
  };
}

export function portalFullscreenAppBarSx() {
  return {
    background: `linear-gradient(120deg, ${HOME.navyDeep} 0%, ${HOME.navy} 100%)`,
    borderBottom: `1px solid ${alpha(HOME.gold, 0.28)}`,
    color: "#fff",
  };
}

export { alpha };
