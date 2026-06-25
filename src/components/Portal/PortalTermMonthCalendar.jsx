import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import { PORTAL, portalCardSx } from "./portalShared";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TERM_START_COLOR = "#15803d";
const TERM_END_COLOR = "#b45309";

function parseIsoDate(value) {
  if (!value) return null;
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfWeekSunday(d) {
  const out = new Date(d);
  out.setDate(out.getDate() - out.getDay());
  out.setHours(12, 0, 0, 0);
  return out;
}

function addDays(d, n) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isToday(d) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function formatDisplayDate(d) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initialViewDate(termStart, termEnd) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (termStart && termEnd && today >= termStart && today <= termEnd) {
    return startOfMonth(today);
  }
  if (termStart) return startOfMonth(termStart);
  return startOfMonth(today);
}

function inTermRange(day, termStart, termEnd) {
  if (!termStart || !termEnd) return false;
  const t = day.getTime();
  return t >= termStart.getTime() && t <= termEnd.getTime();
}

function LegendItem({ swatch, label }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      {swatch}
      <Typography variant="caption" sx={{ color: PORTAL.inkMuted, fontWeight: 600, fontSize: "0.72rem" }}>
        {label}
      </Typography>
    </Stack>
  );
}

export default function PortalTermMonthCalendar({
  termName,
  termStart: termStartRaw,
  termEnd: termEndRaw,
  lessonCountsByDate = {},
  selectedDate = "",
  highlightDate = "",
  initialMonthKey = "",
  onDaySelect,
}) {
  const termStart = parseIsoDate(termStartRaw);
  const termEnd = parseIsoDate(termEndRaw);
  const hasTermRange = !!(termStart && termEnd);
  const termStartIso = termStart ? isoDate(termStart) : "";
  const termEndIso = termEnd ? isoDate(termEnd) : "";

  const [viewDate, setViewDate] = useState(() => initialViewDate(termStart, termEnd));

  useEffect(() => {
    if (termStart || termEnd) {
      setViewDate(initialViewDate(termStart, termEnd));
    }
  }, [termStartRaw, termEndRaw]);

  useEffect(() => {
    if (!initialMonthKey || !/^\d{4}-\d{2}$/.test(initialMonthKey)) return;
    const [y, m] = initialMonthKey.split("-").map(Number);
    if (!y || !m) return;
    let target = new Date(y, m - 1, 1);
    const minView = termStart ? startOfMonth(termStart) : null;
    const maxView = termEnd ? startOfMonth(termEnd) : null;
    if (minView && target < minView) target = minView;
    if (maxView && target > maxView) target = maxView;
    setViewDate(target);
  }, [initialMonthKey, termStartRaw, termEndRaw]);

  const activeHighlight = highlightDate || selectedDate;

  const { daysInGrid, weekRows, title, canPrev, canNext } = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const gridStart = startOfWeekSunday(monthStart);
    const gridEnd = addDays(startOfWeekSunday(monthEnd), 6);
    const days = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    const minView = termStart ? startOfMonth(termStart) : null;
    const maxView = termEnd ? startOfMonth(termEnd) : null;
    const prevMonth = startOfMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = startOfMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    return {
      daysInGrid: days,
      weekRows: days.length / 7,
      title: `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`,
      canPrev: !minView || prevMonth >= minView,
      canNext: !maxView || nextMonth <= maxView,
    };
  }, [viewDate, termStart, termEnd]);

  const goPrev = () => {
    if (!canPrev) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (!canNext) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "stretch",
        gap: { xs: 1.25, sm: 2 },
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Month + term info card */}
      <Box
        sx={{
          ...portalCardSx(),
          width: { xs: "100%", md: 200, lg: 240 },
          flexShrink: 0,
          height: { xs: "auto", md: "100%" },
          alignSelf: { xs: "auto", md: "stretch" },
          p: { xs: 1.25, sm: 2 },
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "flex-start", md: "space-between" },
          minHeight: 0,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25}>
            <IconButton
              size="small"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous month"
              sx={{ color: PORTAL.navyDeep, p: 0.5 }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                fontFamily: PORTAL.fontDisplay,
                fontWeight: 800,
                fontSize: { xs: "0.82rem", sm: "1rem", md: "1.1rem" },
                color: PORTAL.navyDeep,
                textAlign: "center",
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {title}
            </Typography>
            <IconButton
              size="small"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next month"
              sx={{ color: PORTAL.navyDeep, p: 0.5 }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography
            sx={{
              mt: { xs: 1.25, sm: 2 },
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 800,
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
              color: PORTAL.navyDeep,
              lineHeight: 1.2,
            }}
          >
            {termName || "Your term"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: PORTAL.inkMuted,
              fontWeight: 600,
              fontSize: { xs: "0.72rem", sm: "0.85rem" },
              lineHeight: 1.45,
            }}
          >
            {hasTermRange ? `${formatDisplayDate(termStart)} – ${formatDisplayDate(termEnd)}` : "Term dates not set yet"}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "row", md: "column" }}
          flexWrap="wrap"
          useFlexGap
          spacing={{ xs: 1.25, md: 0.85 }}
          sx={{ mt: { xs: 1.25, md: 2 } }}
        >
          <LegendItem
            swatch={<Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: "rgba(12, 35, 64, 0.12)" }} />}
            label="Term day"
          />
          <LegendItem
            swatch={<FlagRoundedIcon sx={{ fontSize: "0.8rem", color: TERM_START_COLOR }} />}
            label="Term start"
          />
          <LegendItem
            swatch={<FlagRoundedIcon sx={{ fontSize: "0.8rem", color: TERM_END_COLOR }} />}
            label="Term end"
          />
        <LegendItem
          swatch={
            <Box
              sx={{
                minWidth: 14,
                height: 14,
                px: 0.35,
                borderRadius: 999,
                bgcolor: PORTAL.gold,
                color: "#fff",
                fontSize: "0.55rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              2
            </Box>
          }
          label="Classes that day"
        />
        </Stack>
      </Box>

      {/* Calendar grid card */}
      <Box
        sx={{
          ...portalCardSx(),
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 0,
        }}
      >
        <Box sx={{ height: 4, flexShrink: 0, background: PORTAL.navyGradient }} />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: { xs: 0.75, sm: 1 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `minmax(22px, auto) repeat(${weekRows}, minmax(0, 1fr))`,
              gap: { xs: 0.45, sm: 0.6 },
              alignContent: "stretch",
            }}
          >
            {WEEKDAY_LABELS.map((label, col) => (
              <Box
                key={label}
                sx={{
                  gridRow: 1,
                  gridColumn: col + 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: { xs: "0.58rem", sm: "0.65rem" },
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: PORTAL.inkSoft,
                }}
              >
                {label}
              </Box>
            ))}

            {daysInGrid.map((day, i) => {
              const inMonth = isSameMonth(day, viewDate);
              const today = isToday(day);
              const inTerm = inTermRange(day, termStart, termEnd);
              const iso = isoDate(day);
              const classCount = inTerm ? Number(lessonCountsByDate[iso] || 0) : 0;
              const hasLesson = classCount > 0;
              const daySelectable = !!onDaySelect && (!hasTermRange || inTerm);
              const isTermStart = hasTermRange && iso === termStartIso;
              const isTermEnd = hasTermRange && iso === termEndIso;
              const selected = activeHighlight === iso;
              const row = Math.floor(i / 7);

              let ring = "none";
              if (isTermStart) ring = `inset 0 0 0 2px ${TERM_START_COLOR}`;
              else if (isTermEnd) ring = `inset 0 0 0 2px ${TERM_END_COLOR}`;
              else if (selected) ring = `inset 0 0 0 2px ${PORTAL.gold}`;
              else if (today) ring = `inset 0 0 0 2px ${PORTAL.navy}`;

              return (
                <Box
                  key={iso}
                  component="button"
                  type="button"
                  onClick={() => {
                    if (!daySelectable) return;
                    onDaySelect?.(iso);
                  }}
                  disabled={!daySelectable}
                  aria-label={`${iso}${classCount ? `, ${classCount} class${classCount === 1 ? "" : "es"}` : ", no classes"}${isTermStart ? ", term start" : ""}${isTermEnd ? ", term end" : ""}`}
                  sx={{
                    gridRow: 2 + row,
                    gridColumn: (i % 7) + 1,
                    border: `1px solid ${PORTAL.border}`,
                    boxShadow: ring !== "none" ? ring : "none",
                    borderRadius: { xs: 1.25, sm: 1.5 },
                    minHeight: 0,
                    minWidth: 0,
                    height: "100%",
                    width: "100%",
                    alignSelf: "stretch",
                    p: 0.25,
                    cursor: daySelectable ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.15,
                    bgcolor: selected
                      ? "rgba(201, 162, 39, 0.18)"
                      : inTerm
                      ? "rgba(12, 35, 64, 0.05)"
                      : "#fff",
                    color: inMonth ? PORTAL.navyDeep : PORTAL.inkSoft,
                    fontWeight: today ? 800 : inMonth ? 600 : 400,
                    opacity: inMonth ? 1 : 0.4,
                    transition: "background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                    "&:hover": daySelectable ? { bgcolor: PORTAL.sky, borderColor: PORTAL.borderGold } : undefined,
                    "&:disabled": { opacity: inMonth ? (inTerm ? 1 : 0.55) : 0.4, cursor: "default" },
                  }}
                >
                {(isTermStart || isTermEnd) && (
                  <FlagRoundedIcon
                    sx={{
                      fontSize: { xs: "0.55rem", sm: "0.65rem" },
                      color: isTermStart ? TERM_START_COLOR : TERM_END_COLOR,
                    }}
                  />
                )}
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "clamp(0.62rem, 1.6vmin, 0.85rem)", sm: "clamp(0.7rem, 1.5vmin, 0.9rem)" },
                    fontWeight: "inherit",
                    lineHeight: 1,
                  }}
                >
                  {day.getDate()}
                </Typography>
                {(isTermStart || isTermEnd) && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.48rem",
                      fontWeight: 800,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      color: isTermStart ? TERM_START_COLOR : TERM_END_COLOR,
                    }}
                  >
                    {isTermStart && isTermEnd ? "Start·End" : isTermStart ? "Start" : "End"}
                  </Typography>
                )}
                {hasLesson ? (
                  <Box
                    sx={{
                      minWidth: 16,
                      height: 16,
                      px: 0.4,
                      borderRadius: 999,
                      bgcolor: PORTAL.gold,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {classCount}
                  </Box>
                ) : today && !isTermStart && !isTermEnd ? (
                  <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: PORTAL.navy, flexShrink: 0 }} />
                ) : null}
              </Box>
            );
          })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
