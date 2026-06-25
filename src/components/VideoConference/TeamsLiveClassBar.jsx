import React, { useCallback } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

/** Teams video opens externally; whiteboard is rendered by the parent page. */
export default function TeamsLiveClassBar({
  meetUrl = "",
  subjectName = "Online class",
  onLeave,
}) {
  const url = String(meetUrl || "").trim();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      sx={{
        px: 1.5,
        py: 1.5,
        flexShrink: 0,
        bgcolor: "#0b1220",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          variant="contained"
          size="small"
          startIcon={<OpenInNewIcon />}
          disabled={!url}
          onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
        >
          Open Microsoft Teams
        </Button>
        <Typography variant="caption" color="grey.400">
          {subjectName} — use Teams for camera and microphone. Annotations are on the board below.
        </Typography>
      </Stack>
      {onLeave ? (
        <Button variant="outlined" color="inherit" size="small" onClick={onLeave}>
          Leave class
        </Button>
      ) : null}
    </Stack>
  );
}
