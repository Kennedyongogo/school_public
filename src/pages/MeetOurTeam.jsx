import React from "react";
import { Box } from "@mui/material";
import StaffDirectory from "../components/StaffDirectory";

export default function MeetOurTeam() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <StaffDirectory />
    </Box>
  );
}
