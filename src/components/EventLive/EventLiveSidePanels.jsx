import React from "react";
import { Box } from "@mui/material";
import EventLiveSidebar from "./EventLiveSidebar";

const panelWrapSx = {
  width: { md: "min(360px, 32vw)" },
  maxWidth: { md: "32vw" },
  minWidth: { md: 260 },
  height: "100%",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
  borderLeft: { md: 1 },
  borderColor: "divider",
  bgcolor: "background.paper",
};

/** Chat / Q&A column — same pattern as live class side panel for students. */
export default function EventLiveSidePanels({ eventId, token, socket, isStaff, isNarrow, mobilePanel }) {
  if (!eventId || !token) return null;
  const showChat = !isNarrow || mobilePanel === "chat";
  if (!showChat) return null;

  return (
    <Box sx={panelWrapSx}>
      <EventLiveSidebar eventId={eventId} token={token} socket={socket} isStaff={isStaff} />
    </Box>
  );
}
