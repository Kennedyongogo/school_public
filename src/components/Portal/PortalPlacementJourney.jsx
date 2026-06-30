import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { PORTAL } from "./portalShared";
import { fetchMyPlacementRegister } from "../../api";

const REASON_LABELS = {
  admission: "Admitted",
  term_start: "Started term",
  admin_transfer: "Moved by school",
  placement_update: "Placement updated",
};

function formatDate(value) {
  if (!value) return "—";
  const s = String(value).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function dateRange(entry) {
  const start = formatDate(entry.started_on);
  const end = entry.is_active ? "Present" : formatDate(entry.completed_on);
  return `${start} → ${end}`;
}

function DetailRow({ label, value }) {
  if (!value || value === "—") return null;
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.25, sm: 1.5 }} sx={{ py: 0.45 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700, minWidth: { sm: 108 }, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, color: PORTAL.navyDeep, lineHeight: 1.45 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function JourneyEntryCard({ entry, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reason = REASON_LABELS[entry.reason] || entry.reason || "Record";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${entry.is_active ? `${PORTAL.gold}88` : PORTAL.border}`,
        bgcolor: entry.is_active ? `${PORTAL.gold}10` : PORTAL.warmWhite,
        overflow: "hidden",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((open) => !open);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0.5,
          px: 1.5,
          py: 1.35,
          cursor: "pointer",
          "&:hover": { bgcolor: `${PORTAL.gold}08` },
        }}
      >
        <IconButton
          size="small"
          aria-label={expanded ? "Collapse details" : "Expand details"}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((open) => !open);
          }}
          sx={{
            mt: 0.1,
            color: PORTAL.navyDeep,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: entry.is_active ? PORTAL.gold : `${PORTAL.gold}44`,
            color: entry.is_active ? PORTAL.navyDeep : PORTAL.navy,
            mt: 0.15,
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 16 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, color: PORTAL.navyDeep, fontSize: "0.92rem", lineHeight: 1.35 }}>
            {entry.placement_label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35, fontWeight: 600 }}>
            {dateRange(entry)}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} flexWrap="wrap">
            <Chip size="small" label={reason} sx={{ fontWeight: 700, height: 22 }} />
            {entry.is_active ? (
              <Chip size="small" color="success" label="Current" sx={{ fontWeight: 700, height: 22 }} />
            ) : null}
          </Stack>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            pb: 1.5,
            pt: 0.25,
            borderTop: `1px solid ${PORTAL.border}`,
            bgcolor: `${PORTAL.gold}06`,
          }}
        >
          <DetailRow label="From" value={entry.previous_registration?.placement_label} />
          {entry.previous_registration ? (
            <DetailRow
              label="Previous period"
              value={`${formatDate(entry.previous_registration.started_on)} → ${formatDate(entry.previous_registration.completed_on)}`}
            />
          ) : null}
          <DetailRow label="Term started" value={formatDate(entry.term_start_date)} />
          <DetailRow
            label="Term ends"
            value={entry.term_end_date ? formatDate(entry.term_end_date) : entry.is_active ? "Open" : "—"}
          />
          <DetailRow label="Recorded on" value={formatDate(entry.created_at)} />
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function PortalPlacementJourney() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sectionOpen, setSectionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMyPlacementRegister();
        if (!cancelled) setEntries(Array.isArray(data?.entries) ? data.entries : []);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not load your school journey.");
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeEntry = entries.find((entry) => entry.is_active);
  const collapsedSummary = activeEntry
    ? activeEntry.placement_label
    : entries.length
      ? `${entries.length} placement record${entries.length === 1 ? "" : "s"}`
      : "Your path through classes and terms";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${PORTAL.border}`,
        bgcolor: PORTAL.warmWhite,
        overflow: "hidden",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={sectionOpen}
        onClick={() => setSectionOpen((open) => !open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSectionOpen((open) => !open);
          }
        }}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          bgcolor: `${PORTAL.gold}12`,
          borderBottom: sectionOpen ? `1px solid ${PORTAL.border}` : "none",
          cursor: "pointer",
          "&:hover": { bgcolor: `${PORTAL.gold}18` },
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconButton
            size="small"
            aria-label={sectionOpen ? "Collapse school journey" : "Expand school journey"}
            onClick={(e) => {
              e.stopPropagation();
              setSectionOpen((open) => !open);
            }}
            sx={{
              color: PORTAL.navyDeep,
              transform: sectionOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
          <SchoolRoundedIcon sx={{ color: PORTAL.gold, fontSize: 28, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: PORTAL.navyDeep }}>
              My school journey
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: sectionOpen ? "normal" : "nowrap",
              }}
            >
              {sectionOpen
                ? "Your path through classes and terms — tap a card to see more"
                : collapsedSummary}
            </Typography>
          </Box>
          {!sectionOpen && activeEntry ? (
            <Chip size="small" color="success" label="Current" sx={{ fontWeight: 700, height: 24, flexShrink: 0 }} />
          ) : null}
        </Stack>
      </Box>

      <Collapse in={sectionOpen}>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} sx={{ color: PORTAL.gold }} />
            </Box>
          ) : error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : !entries.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Your movement history will appear here after admission and term starts.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {entries.map((entry) => (
                <JourneyEntryCard key={entry.id} entry={entry} defaultExpanded={Boolean(entry.is_active)} />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
