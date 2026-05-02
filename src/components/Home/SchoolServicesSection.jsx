import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Container,
  Fade,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ScienceIcon from "@mui/icons-material/Science";
import PsychologyIcon from "@mui/icons-material/Psychology";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ComputerIcon from "@mui/icons-material/Computer";

/** Matches header / footer / hero accents */
const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};
const LOGIN_BTN_GRAD = `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`;

const ROTATE_MS = 3200;

/**
 * action: scroll target id without #, or "marketplace"
 */
const SCHOOL_SERVICES = [
  {
    Icon: MenuBookIcon,
    name: "Academic Programs",
    description: "Rigorous programmes from early years through secondary — inquiry, literacy, and examination readiness.",
    action: "school-news-events-section",
  },
  {
    Icon: SportsSoccerIcon,
    name: "Sports & Activities",
    description: "Team sports, swimming, athletics, and clubs that build teamwork, discipline, and wellbeing.",
    action: "reviews-section",
  },
  {
    Icon: ScienceIcon,
    name: "STEM & Innovation",
    description: "Hands-on science, computing, and projects that spark curiosity and problem-solving.",
    action: "school-news-events-section",
  },
  {
    Icon: PsychologyIcon,
    name: "Student Support",
    description: "Pastoral care, learning support, and guidance so every learner thrives socially and academically.",
    action: "reviews-section",
  },
  {
    Icon: DirectionsBusIcon,
    name: "Transportation",
    description: "Planned routes and supervised travel options designed with learner safety first.",
    action: "reviews-section",
  },
  {
    Icon: ComputerIcon,
    name: "Digital Learning",
    description: "Secure portals and blended tools that keep families informed and students connected.",
    action: "marketplace",
  },
];

export default function SchoolServicesSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);

  const serviceCount = SCHOOL_SERVICES.length;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveService((prev) => (prev + 1) % serviceCount);
    }, ROTATE_MS);
    return () => window.clearInterval(interval);
  }, [serviceCount]);

  const active = useMemo(() => SCHOOL_SERVICES[activeService], [activeService]);

  const handleLearnMore = () => {
    const { action } = active;
    if (action === "marketplace") {
      navigate("/marketplace");
      return;
    }
    document.getElementById(action)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const ActiveIcon = active.Icon;

  return (
    <Box
      id="school-services-section"
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        bgcolor: "#f0f4fa",
        pt: { xs: 3, md: 5 },
        pb: { xs: 4, md: 6 },
        borderTop: `1px solid rgba(12, 35, 64, 0.08)`,
        fontFamily: '"Open Sans", "Segoe UI", sans-serif',
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 1.75, sm: 2.5, md: 4 },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Fade in={isVisible} timeout={700}>
          <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ width: "100%" }}>
            {/* Full-width intro */}
            <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
              <Box
                sx={{
                  textAlign: "center",
                  maxWidth: "min(900px, 100%)",
                  mx: "auto",
                  mb: { xs: 1, md: 0.5 },
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    px: 2,
                    py: 0.5,
                    mb: 2,
                    borderRadius: "999px",
                    bgcolor: "rgba(201, 162, 39, 0.12)",
                    border: `1px solid rgba(201, 162, 39, 0.35)`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: BRAND.navyDeep,
                    }}
                  >
                    What we offer
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 800,
                    fontSize: { xs: "1.85rem", sm: "2.25rem", md: "2.5rem" },
                    color: BRAND.navyDeep,
                    lineHeight: 1.15,
                    mb: 2,
                  }}
                >
                  Programmes &{" "}
                  <Box component="span" sx={{ color: BRAND.gold }}>
                    services
                  </Box>
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(8, 22, 43, 0.88)",
                    fontSize: { xs: "1rem", md: "1.15rem" },
                    lineHeight: 1.65,
                  }}
                >
                  A balanced school experience: strong academics, enriching activities, and support
                  systems — all within a safe, welcoming community aligned with our{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: BRAND.navy }}>
                    Learn • Lead • Succeed
                  </Box>{" "}
                  motto.
                </Typography>
              </Box>
            </Grid>

            {/* Full-width service card */}
            <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                  pb: 4,
                  boxSizing: "border-box",
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid rgba(12, 35, 64, 0.12)`,
                    boxShadow: "0 12px 40px rgba(8, 22, 43, 0.1)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2.5, sm: 3.5, md: 4 },
                      "&:last-child": { pb: { xs: 2.5, sm: 3.5, md: 4 } },
                    }}
                  >
                    <Box
                      key={activeService}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "center", sm: "center" },
                        textAlign: { xs: "center", sm: "left" },
                        gap: { xs: 2.5, sm: 4 },
                        width: "100%",
                        minWidth: 0,
                        animation: "svcFadeIn 0.45s ease",
                        "@keyframes svcFadeIn": {
                          "0%": { opacity: 0, transform: "translateY(12px)" },
                          "100%": { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 88,
                          height: 88,
                          minWidth: 88,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `linear-gradient(145deg, rgba(230, 207, 106, 0.25), rgba(201, 162, 39, 0.18))`,
                          border: `1px solid rgba(201, 162, 39, 0.4)`,
                          color: BRAND.navyDeep,
                        }}
                      >
                        <ActiveIcon sx={{ fontSize: 44 }} />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontWeight: 800,
                            fontSize: { xs: "1.4rem", md: "1.65rem" },
                            color: BRAND.navyDeep,
                            mb: 1,
                          }}
                        >
                          {active.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(8, 22, 43, 0.85)",
                            lineHeight: 1.6,
                            fontSize: { xs: "0.98rem", md: "1.05rem" },
                          }}
                        >
                          {active.description}
                        </Typography>
                      </Box>

                      <Button
                        onClick={handleLearnMore}
                        sx={{
                          px: 3,
                          py: 1.25,
                          fontWeight: 700,
                          textTransform: "none",
                          borderRadius: 2,
                          whiteSpace: "nowrap",
                          background: LOGIN_BTN_GRAD,
                          color: BRAND.navyDeep,
                          border: "1px solid rgba(255,255,255,0.35)",
                          boxShadow: "0 4px 14px rgba(12, 35, 64, 0.15)",
                          alignSelf: { xs: "center", sm: "center" },
                          flexShrink: 0,
                          "&:hover": {
                            bgcolor: BRAND.goldMuted,
                            boxShadow: "0 6px 18px rgba(12, 35, 64, 0.2)",
                          },
                        }}
                      >
                        Learn more
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  {SCHOOL_SERVICES.map((_, idx) => (
                    <Box
                      key={idx}
                      component="button"
                      type="button"
                      aria-label={`Show service ${idx + 1}`}
                      onClick={() => setActiveService(idx)}
                      sx={{
                        width: activeService === idx ? 22 : 8,
                        height: 8,
                        p: 0,
                        border: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        bgcolor:
                          activeService === idx ? BRAND.gold : "rgba(12, 35, 64, 0.2)",
                        "&:hover": { bgcolor: BRAND.goldMuted },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}
