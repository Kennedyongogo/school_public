import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Chip,
  Divider,
  Fade,
  Slide,
} from "@mui/material";
import { Facebook, LinkedIn } from "@mui/icons-material";
import BrandLogoMark from "../common/BrandLogoMark";

/** Matches PublicHeader — elimu plus crest navy & red */
const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c92727",
  goldMuted: "#e66a6a",
};

const LOGIN_BUTTON_GRADIENT = `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`;

// Custom TikTok icon
const TikTokIcon = ({ sx, ...props }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{
      width: 24,
      height: 24,
      ...sx,
    }}
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Box>
);

export default function Footer() {
  const socialLinks = [
    {
      icon: <Facebook />,
      color: "#1877f2",
      label: "Facebook",
      url: "#",
    },
    {
      icon: <LinkedIn />,
      color: "#0077b5",
      label: "LinkedIn",
      url: "#",
    },
    {
      icon: <TikTokIcon />,
      color: "#000000",
      label: "TikTok",
      url: "#",
    },
  ];

  const handleSocialClick = (url) => {
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const chipSx = {
    fontWeight: 600,
    fontSize: { xs: "0.7rem", sm: "0.75rem" },
    color: BRAND.navyDeep,
    background: LOGIN_BUTTON_GRADIENT,
    border: "1px solid rgba(255,255,255,0.35)",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 4px 14px rgba(12, 35, 64, 0.28)",
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        background: "#F5F5DC",
        pt: { xs: 0, sm: 0, md: 0 },
        pb: 0.4,
        mt: "auto",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Open Sans", "Segoe UI", sans-serif',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0.75, sm: 0.75, md: 0.75 },
          pt: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            py: { xs: 0.75, sm: 0.875, md: 1 },
            px: { xs: 0.75, sm: 0.75, md: 0.75 },
          }}
        >
          <Fade in timeout={1000}>
            <Box>
              <Grid
                container
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                justifyContent="space-between"
              >
                <Grid item xs={12} sm={12} md={4}>
                  <Slide direction="up" in timeout={1200}>
                    <Box sx={{ textAlign: "left" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1, sm: 1.5 },
                          mb: { xs: 0.75, sm: 1 },
                        }}
                      >
                        <BrandLogoMark
                          size={56}
                          sx={{
                            height: { xs: 44, sm: 52 },
                            maxWidth: { xs: "min(240px, 70vw)", sm: 260 },
                            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: { xs: 0.5, sm: 0.75 },
                            fontWeight: 700,
                            color: BRAND.goldMuted,
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            lineHeight: 1.25,
                          }}
                        >
                          Excellence in education. Global outlook.
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            lineHeight: 1.65,
                            color: "rgba(0, 0, 0, 0.82)",
                            fontSize: { xs: "0.95rem", sm: "1.05rem" },
                          }}
                        >
                          Where young minds discover their potential and build tomorrow&apos;s legacy.
                          Explore admissions, programs, and life at elimu plus.
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mb: { xs: 1, sm: 2 },
                          display: "flex",
                          flexWrap: "wrap",
                          gap: { xs: 0.5, sm: 0.75 },
                        }}
                      >
                        <Chip label="Learn" size="small" sx={chipSx} />
                        <Chip label="Lead" size="small" sx={chipSx} />
                        <Chip label="Succeed" size="small" sx={chipSx} />
                      </Box>

                      <Box sx={{ display: { xs: "block", md: "none" } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: { xs: 0.5, sm: 1 },
                            fontWeight: 700,
                            color: BRAND.navy,
                            fontSize: { xs: "1rem", sm: "1.15rem" },
                          }}
                        >
                          Follow Us
                        </Typography>
                        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                          {socialLinks.map((social, index) => (
                            <IconButton
                              key={index}
                              aria-label={social.label}
                              onClick={() => handleSocialClick(social.url)}
                            sx={{
                              color: "rgba(0, 0, 0, 0.9)",
                              background: "rgba(255, 255, 255, 0.8)",
                              border: `1px solid rgba(201, 39, 39, 0.25)`,
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              outline: "none",
                              "&:focus": { outline: "none" },
                              "&:focus-visible": { outline: "none" },
                              "&:hover": {
                                background: social.color,
                                color: "white",
                                border: `1px solid ${social.color}`,
                                transform: "translateY(-3px) scale(1.08)",
                                boxShadow: `0 8px 25px ${social.color}55`,
                              },
                            }}
                            >
                              {social.icon}
                            </IconButton>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Slide>
                </Grid>

                <Grid item xs={12} sm={12} md={4} sx={{ display: { xs: "none", md: "flex" } }}>
                  <Slide direction="up" in timeout={1600}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        textAlign: "right",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: `linear-gradient(90deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: { xs: "1.1rem", sm: "1.35rem" },
                        }}
                      >
                        Follow Us
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {socialLinks.map((social, index) => (
                          <IconButton
                            key={index}
                            aria-label={social.label}
                            onClick={() => handleSocialClick(social.url)}
                             sx={{
                               color: "rgba(0, 0, 0, 0.9)",
                               background: "rgba(255, 255, 255, 0.8)",
                               border: `1px solid rgba(201, 39, 39, 0.25)`,
                               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                               outline: "none",
                               "&:focus": { outline: "none" },
                               "&:focus-visible": { outline: "none" },
                               "&:hover": {
                                 background: social.color,
                                 color: "white",
                                 border: `1px solid ${social.color}`,
                                 transform: "translateY(-3px) scale(1.08)",
                                 boxShadow: `0 8px 25px ${social.color}55`,
                               },
                             }}
                          >
                            {social.icon}
                          </IconButton>
                        ))}
                      </Box>
                    </Box>
                  </Slide>
                </Grid>
              </Grid>

              <Fade in timeout={2000}>
                <Box>
                  <Divider
                    sx={{
                      my: 1,
                      borderColor: "rgba(201, 39, 39, 0.25)",
                      "&::before, &::after": {
                        borderColor: "rgba(201, 39, 39, 0.12)",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 0.75, sm: 0.875 },
                      textAlign: "center",
                      pt: 0.15,
                      pb: 0.05,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(0, 0, 0, 0.75)",
                        fontWeight: 500,
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      }}
                    >
                      © {new Date().getFullYear()} elimu plus. All rights reserved.
                    </Typography>
                    <Box
                      sx={{
                        py: { xs: 0.15, sm: 0.18 },
                        px: { xs: 0.45, sm: 0.5 },
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(10px)",
                        border: `1px solid rgba(201, 39, 39, 0.2)`,
                        borderRadius: "12px",
                        textAlign: "center",
                        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.12)",
                          borderColor: "rgba(230, 106, 106, 0.35)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: BRAND.goldMuted,
                          fontWeight: 700,
                          fontSize: { xs: "0.78rem", sm: "0.9rem" },
                        }}
                      >
                        Developed by Carlvyne Technologies Ltd
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
