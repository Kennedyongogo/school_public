import React, { useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { PORTAL } from "./portalShared";
import { startStudentTerm } from "../../api";

function formatDate(value) {
  if (!value) return "—";
  const s = String(value).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export default function PortalStartTermCard({ termStatus, onStarted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!termStatus || termStatus.portal_unlocked) return null;

  const term = termStatus.term;
  const canStart = Boolean(termStatus.can_start_term);

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await startStudentTerm();
      onStarted?.(data);
    } catch (e) {
      setError(e.message || "Could not start term.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${PORTAL.gold}55`,
        overflow: "visible",
        bgcolor: PORTAL.warmWhite,
        boxShadow: PORTAL.shadowSm,
        mb: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          bgcolor: `${PORTAL.gold}12`,
          borderBottom: `1px solid ${PORTAL.border}`,
          borderRadius: "12px 12px 0 0",
        }}
      >
        <EventAvailableRoundedIcon sx={{ color: PORTAL.gold, fontSize: 32 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, color: PORTAL.navyDeep, fontSize: "1.05rem" }}>
            Start your term
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
            {termStatus.message ||
              "Begin your current term to unlock classes, exams, assignments, and report cards."}
          </Typography>
        </Box>
        {canStart ? (
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => void handleStart()}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              px: 2.5,
              bgcolor: PORTAL.gold,
              color: PORTAL.navyDeep,
              "&:hover": { bgcolor: PORTAL.goldMuted },
            }}
          >
            {loading ? "Starting…" : "Start term"}
          </Button>
        ) : null}
      </Stack>

      {term ? (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderRadius: "0 0 12px 12px" }}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip size="small" label={term.name} sx={{ fontWeight: 700 }} />
            <Chip size="small" variant="outlined" label={`Starts ${formatDate(term.start_date)}`} />
            <Chip size="small" variant="outlined" label={`Ends ${formatDate(term.end_date)}`} />
            {term.term_ended ? (
              <Chip size="small" color="warning" label="Term ended" sx={{ fontWeight: 700 }} />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
            Your start date is recorded when you click the button — you can begin on the official start date or any day
            before the term ends.
          </Typography>
        </Box>
      ) : null}

      {error ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : null}
    </Paper>
  );
}
