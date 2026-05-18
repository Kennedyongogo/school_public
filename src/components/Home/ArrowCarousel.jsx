import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const HOVER_BG = "#f0f4fa";

/**
 * Paginated horizontal gallery with previous / next arrows (news, events, reviews).
 */
export default function ArrowCarousel({
  items,
  ariaLabel,
  renderCard,
  visibleMd = 3,
  visibleSm = 2,
  visibleXs = 1,
}) {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const visibleCount = upMd ? visibleMd : upSm ? visibleSm : visibleXs;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items, visibleCount]);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const visible = items.slice(index, index + visibleCount);

  if (!items.length) return null;

  const arrowSx = {
    flexShrink: 0,
    bgcolor: "#fff",
    border: "1px solid rgba(12, 35, 64, 0.12)",
    boxShadow: "0 2px 8px rgba(12, 35, 64, 0.08)",
    "&:hover": { bgcolor: HOVER_BG },
    "&.Mui-disabled": { opacity: 0.35 },
  };

  return (
    <Box role="region" aria-label={ariaLabel}>
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
        <IconButton
          aria-label="Previous"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          sx={arrowSx}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 2.5 },
              alignItems: "stretch",
            }}
          >
            {visible.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: `1 1 ${100 / visibleCount}%`,
                  minWidth: 0,
                  maxWidth: `${100 / visibleCount}%`,
                }}
              >
                {renderCard(item)}
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          aria-label="Next"
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
          disabled={!canNext}
          sx={arrowSx}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
