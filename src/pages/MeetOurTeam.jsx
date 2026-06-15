import React from "react";
import { Box } from "@mui/material";
import StaffDirectory from "../components/StaffDirectory";
import { HOME } from "../components/Home/homeShared";

export default function MeetOurTeam() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: HOME.cream,
        width: "100%",
      }}
    >
      <StaffDirectory />
    </Box>
  );
}
