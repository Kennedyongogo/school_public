import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
  Link,
} from "@mui/material";
import { Facebook, LinkedIn, ArrowForwardRounded } from "@mui/icons-material";
import BrandLogoMark from "../common/BrandLogoMark";
import { HOME, homeBodyFontSize } from "../Home/homeShared";

const TikTokIcon = ({ sx, ...props }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{ width: 22, height: 22, ...sx }}
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Box>
);

const FOOTER_LINKS = [
  { label: "Apply for admission", path: "/admission/apply" },
  { label: "Parent portal", path: "/login" },
  { label: "About our school", path: "/about-us" },
  { label: "Meet our team", path: "/meet-our-team" },
];

const SOCIAL = [
  { icon: <Facebook fontSize="small" />, color: "#1877f2", label: "Facebook" },
  { icon: <LinkedIn fontSize="small" />, color: "#0077b5", label: "LinkedIn" },
  { icon: <TikTokIcon />, color: "#fff", label: "TikTok" },
];

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        background: HOME.navyGradient,
        color: "rgba(255,255,255,0.88)",
        fontFamily: HOME.fontBody,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${HOME.gold}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 1.25, sm: 1.5, md: 2 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", md: "grid" },
            flexDirection: { xs: "column" },
            gridTemplateColumns: { md: "1fr auto 1fr" },
            alignItems: { xs: "stretch", md: "start" },
            gap: { xs: 4, md: 3 },
            width: "100%",
          }}
        >
          <Box sx={{ minWidth: 0, justifySelf: { md: "start" } }}>
            <BrandLogoMark
              size={56}
              sx={{
                height: 52,
                maxWidth: 260,
                mb: 2,
                filter: "brightness(1.05)",
              }}
            />
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.35rem", md: "1.55rem" },
                color: HOME.goldMuted,
                mb: 1.5,
                lineHeight: 1.25,
              }}
            >
              Excellence in education. Global outlook.
            </Typography>
            <Typography
              sx={{
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.75)",
                mb: 2,
                maxWidth: { xs: "100%", md: 480 },
                fontSize: homeBodyFontSize,
              }}
            >
              Where young minds discover their potential and families stay connected to every step of
              the learning journey.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {["Learn", "Grow", "Excel"].map((word) => (
                <Chip
                  key={word}
                  label={word}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(201, 162, 39, 0.15)",
                    color: HOME.goldMuted,
                    border: `1px solid ${HOME.borderGold}`,
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              width: { xs: "100%", md: "auto" },
              justifySelf: { md: "center" },
              textAlign: { md: "center" },
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.75rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: HOME.goldMuted,
                mb: 2,
              }}
            >
              Quick links
            </Typography>
            <Stack spacing={1.25} alignItems={{ xs: "flex-start", md: "center" }}>
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  underline="none"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "rgba(255,255,255,0.82)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textAlign: { xs: "left", md: "center" },
                    transition: "color 0.2s ease",
                    "&:hover": { color: HOME.goldMuted },
                  }}
                >
                  {link.label}
                  <ArrowForwardRounded sx={{ fontSize: 16, opacity: 0.6 }} />
                </Link>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              width: { xs: "100%", md: "auto" },
              justifySelf: { md: "end" },
              textAlign: { md: "right" },
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.75rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: HOME.goldMuted,
                mb: 2,
              }}
            >
              Follow us
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              {SOCIAL.map((social) => (
                <IconButton
                  key={social.label}
                  aria-label={social.label}
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.9)",
                    transition: "all 0.22s ease",
                    "&:hover": {
                      bgcolor: social.color,
                      borderColor: social.color,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.12)" }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "center", sm: "center" }}
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", textAlign: { xs: "center", sm: "left" } }}>
            © {year} {HOME.name}. All rights reserved.
          </Typography>
          <Typography
            sx={{
              color: HOME.goldMuted,
              fontWeight: 700,
              fontSize: "0.82rem",
              letterSpacing: "0.02em",
              textAlign: { xs: "center", sm: "right" },
            }}
          >
            Developed by Carlvyne Technologies Ltd
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
