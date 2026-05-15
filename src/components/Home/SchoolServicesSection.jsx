import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Box,
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
import SchoolIcon from "@mui/icons-material/School";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

const ICON_BY_KEY = {
  MenuBook: MenuBookIcon,
  SportsSoccer: SportsSoccerIcon,
  Science: ScienceIcon,
  Psychology: PsychologyIcon,
  DirectionsBus: DirectionsBusIcon,
  Computer: ComputerIcon,
};

function resolveIcon(iconKey) {
  return ICON_BY_KEY[iconKey] || SchoolIcon;
}

/** Matches header / footer / hero accents */
const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};

const ROTATE_MS = 3200;

async function fetchPublicSchoolServices() {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/school-services/public`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch {
    return [];
  }
}

export default function SchoolServicesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [schoolServices, setSchoolServices] = useState([]);

  const serviceCount = schoolServices.length;

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetchPublicSchoolServices().then((list) => {
      if (!cancelled) {
        setSchoolServices(list);
        setActiveService(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (serviceCount < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveService((prev) => (prev + 1) % serviceCount);
    }, ROTATE_MS);
    return () => window.clearInterval(interval);
  }, [serviceCount]);

  const active = useMemo(
    () => schoolServices[activeService] || schoolServices[0],
    [schoolServices, activeService]
  );

  const ActiveIcon = resolveIcon(active?.icon_key);
  const hasServices = serviceCount > 0;

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
                    Learn • Grow • Excel
                  </Box>{" "}
                  motto.
                </Typography>
              </Box>
            </Grid>

            {hasServices && (
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
                    </Box>
                  </CardContent>
                </Card>

                {serviceCount > 1 && (
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
                    {schoolServices.map((_, idx) => (
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
                )}
              </Box>
            </Grid>
            )}
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}
