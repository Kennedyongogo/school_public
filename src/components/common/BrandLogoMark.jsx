import React from "react";
import { Box } from "@mui/material";
import { BRAND_LOGO_SRC } from "../../brand";

/**
 * Full Elimu Plus lockup (crest + wordmark). `size` is target height in px; width follows aspect ratio.
 */
export default function BrandLogoMark({ size = 46, sx, imgSx }) {
  return (
    <Box
      sx={{
        height: size,
        width: "auto",
        maxWidth: `min(${Math.round(size * 5)}px, 88vw)`,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        ...sx,
      }}
    >
      <Box
        component="img"
        src={BRAND_LOGO_SRC}
        alt="Elimu Plus"
        sx={{
          height: "100%",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
          objectPosition: "left center",
          display: "block",
          ...imgSx,
        }}
      />
    </Box>
  );
}
