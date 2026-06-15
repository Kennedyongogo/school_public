import { PORTAL } from "./portalShared";

/**
 * Right-anchored panel positioned below the portal AppBar (menu + notifications).
 */
export const portalAnchoredDrawerPaperSx = {
  width: { xs: "min(300px, 92vw)", sm: 320 },
  marginRight: { xs: 1.5, sm: 2 },
  top: { xs: "56px", sm: "64px" },
  height: "auto",
  maxHeight: { xs: "calc(100vh - 64px)", sm: "calc(100vh - 80px)" },
  bgcolor: PORTAL.warmWhite,
  border: `1px solid ${PORTAL.border}`,
  borderRadius: "12px 0 0 12px",
  boxShadow: PORTAL.shadowLg,
  overflowY: "auto",
};
