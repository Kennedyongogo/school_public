/**
 * Right-anchored panel positioned below the portal AppBar (menu + notifications).
 * Matches Toolbar: minHeight xs 56 / sm 64.
 */
export const portalAnchoredDrawerPaperSx = {
  width: { xs: "260px", sm: "300px" },
  marginRight: { xs: 2, sm: 3 },
  top: { xs: "56px", sm: "64px" },
  height: "auto",
  maxHeight: { xs: "calc(100vh - 64px)", sm: "calc(100vh - 80px)" },
  bgcolor: "#f5f8fc",
  overflowY: "auto",
};
