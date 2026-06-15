import React from "react";
import { Box } from "@mui/material";
import "./dicedImageGrid.css";

/** Warp corner classes — order matches DicedHeroSection grid layout. */
const GRID_MASK_CLASSES = [
  "diced-grid__img--bottom-right",
  "diced-grid__img--bottom-left",
  "diced-grid__img--top-right",
  "diced-grid__img--top-left",
];

/**
 * 2×2 image grid with curved “diced” masks (DicedHeroSection style).
 * Expects exactly 4 slides; displays as [3, 2, 1, 0] like the reference.
 */
export default function DicedImageGrid({
  slides,
  onImageClick,
  onImageHover,
  sx,
}) {
  if (!slides?.length) return null;

  const items = slides.length >= 4 ? slides.slice(0, 4) : slides;
  const ordered = [
    items[3] ?? items[0],
    items[2] ?? items[1] ?? items[0],
    items[1] ?? items[0],
    items[0],
  ];

  return (
    <Box
      className="diced-grid"
      sx={{
        maxWidth: { xs: 360, sm: 440, lg: "100%" },
        mx: { xs: "auto", lg: 0 },
        ...sx,
      }}
    >
      {ordered.map((slide, index) => (
        <Box key={`${slide.image}-${index}`} className="diced-grid__cell">
          <Box
            component="img"
            src={slide.image}
            alt={slide.title || `Campus life ${index + 1}`}
            className={`diced-grid__img ${GRID_MASK_CLASSES[index]}`}
            onClick={() => onImageClick?.(index, slide)}
            onMouseEnter={() => onImageHover?.(index, slide)}
          />
        </Box>
      ))}
    </Box>
  );
}
