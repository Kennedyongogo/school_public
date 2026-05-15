import React from "react";
import { Box, Typography } from "@mui/material";
import BrandLogoMark from "./BrandLogoMark";
import { BRAND } from "../../brand";

export default function BrandPageLoader({
  message = "Preparing your experience...",
  submessage = "Loading pages and resources for students, families, and staff.",
}) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: "56px", sm: "64px" },
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "#f0f4fa",
        background:
          "linear-gradient(135deg, rgba(240, 246, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(232, 238, 248, 0.96) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1399,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(12, 35, 64, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201, 162, 39, 0.08) 0%, transparent 50%)",
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ mb: 3, position: "relative", zIndex: 1, textAlign: "center", px: 2 }}>
        <Box
          sx={{
            mx: "auto",
            mb: 2,
            animation: "bounce 2s ease-in-out infinite",
            filter: "drop-shadow(0 4px 12px rgba(12, 35, 64, 0.2))",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <BrandLogoMark
            size={120}
            sx={{
              height: { xs: 100, sm: 120 },
              maxWidth: "min(320px, 92vw)",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: BRAND.gold,
                animation: `pulse 1.5s ease-in-out infinite ${index * 0.2}s`,
                boxShadow: "0 0 10px rgba(201, 162, 39, 0.45)",
              }}
            />
          ))}
        </Box>
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: BRAND.navy,
          textAlign: "center",
          fontWeight: 600,
          position: "relative",
          zIndex: 1,
          mb: 1,
          fontSize: "1.05rem",
        }}
      >
        {message}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: BRAND.navyDeep,
          textAlign: "center",
          fontWeight: 400,
          position: "relative",
          zIndex: 1,
          opacity: 0.85,
          maxWidth: "340px",
          mx: "auto",
          px: 2,
        }}
      >
        {submessage}
      </Typography>
    </Box>
  );
}
