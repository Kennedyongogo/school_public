import React from "react";
import { Box } from "@mui/material";
import SchoolPortfolio from "../components/SchoolPortfolio";

export default function Portfolio() {
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
      <SchoolPortfolio />
    </Box>
  );
}
