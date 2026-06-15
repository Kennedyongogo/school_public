import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { HOME } from "./homeShared";

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
    alignSelf: "center",
    width: { xs: 36, md: 40 },
    height: { xs: 36, md: 40 },
    bgcolor: "#fff",
    border: `1px solid ${HOME.border}`,
    boxShadow: HOME.shadowSm,
    color: HOME.navyDeep,
    transition: "all 0.22s ease",
    "&:hover": {
      bgcolor: HOME.navyDeep,
      color: HOME.goldMuted,
      borderColor: HOME.navyDeep,
      transform: "scale(1.05)",
    },
    "&.Mui-disabled": { opacity: 0.35, bgcolor: HOME.sky },
  };

  return (
    <Box role="region" aria-label={ariaLabel}>
      <Stack
        direction="row"
        alignItems="stretch"
        spacing={{ xs: 0.5, sm: 0.75, md: 1 }}
        sx={{ width: "100%" }}
      >
        <IconButton
          aria-label="Previous"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          sx={arrowSx}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.5, md: 2 },
              alignItems: "stretch",
              width: "100%",
            }}
          >
            {visible.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: "1 1 0",
                  minWidth: 0,
                  width: `${100 / visibleCount}%`,
                  maxWidth: `${100 / visibleCount}%`,
                  display: "flex",
                }}
              >
                <Box sx={{ width: "100%", display: "flex" }}>{renderCard(item)}</Box>
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

      {items.length > visibleCount ? (
        <Stack direction="row" justifyContent="center" spacing={0.75} sx={{ mt: 2 }}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <Box
              key={i}
              component="button"
              type="button"
              aria-label={`Page ${i + 1}`}
              onClick={() => setIndex(i)}
              sx={{
                width: index === i ? 22 : 8,
                height: 8,
                p: 0,
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                bgcolor: index === i ? HOME.gold : "rgba(12, 35, 64, 0.18)",
              }}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
