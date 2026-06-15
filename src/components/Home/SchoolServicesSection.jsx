import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Box, Fade, LinearProgress, Stack, Typography } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ScienceIcon from "@mui/icons-material/Science";
import PsychologyIcon from "@mui/icons-material/Psychology";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ComputerIcon from "@mui/icons-material/Computer";
import SchoolIcon from "@mui/icons-material/School";
import { HOME, homeBodyFontSize } from "./homeShared";
import { HomeSectionHeader, HomeSectionShell } from "./homeUi";

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

const ROTATE_MS = 6000;
const TICK_MS = 50;

async function fetchPublicSchoolServices() {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/school-services/public`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

function ServiceDetailPanel({ active, progress, ActiveIcon, showProgress }) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: 280, md: 300 },
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${HOME.border}`,
        boxShadow: HOME.shadowMd,
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ height: 6, background: HOME.navyGradient }} />
      {showProgress ? (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            bgcolor: HOME.sky,
            "& .MuiLinearProgress-bar": {
              bgcolor: HOME.gold,
              transition: `transform ${TICK_MS}ms linear`,
            },
          }}
        />
      ) : null}

      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, sm: 3, md: 3.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2, sm: 3.5 },
        }}
      >
        <Box
          sx={{
            width: { xs: 96, sm: 112, md: 120 },
            height: { xs: 96, sm: 112, md: 120 },
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, rgba(230,207,106,0.4), rgba(201,162,39,0.22))`,
            border: `2px solid ${HOME.borderGold}`,
            color: HOME.navyDeep,
            boxShadow: `0 12px 32px ${HOME.gold}33`,
          }}
        >
          <ActiveIcon sx={{ fontSize: { xs: 48, sm: 52, md: 56 } }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Fade in key={active?.id || active?.name} timeout={450}>
            <Box>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", md: "2.15rem" },
                  color: HOME.navyDeep,
                  mb: 1.5,
                  lineHeight: 1.12,
                }}
              >
                {active?.name}
              </Typography>
              <Typography
                sx={{
                  color: HOME.inkMuted,
                  lineHeight: 1.8,
                  fontSize: homeBodyFontSize,
                  whiteSpace: "pre-wrap",
                }}
              >
                {active?.description}
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}

export default function SchoolServicesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [schoolServices, setSchoolServices] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(0);

  const serviceCount = schoolServices.length;
  const hasMultiple = serviceCount > 1;

  const selectService = useCallback((idx) => {
    setActiveService(idx);
    progressRef.current = 0;
    setProgress(0);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetchPublicSchoolServices().then((list) => {
      if (!cancelled) {
        setSchoolServices(list);
        setActiveService(0);
        progressRef.current = 0;
        setProgress(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasMultiple || isPaused) return undefined;

    const interval = window.setInterval(() => {
      progressRef.current += (TICK_MS / ROTATE_MS) * 100;
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setActiveService((prev) => (prev + 1) % serviceCount);
        setProgress(0);
      } else {
        setProgress(progressRef.current);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [serviceCount, hasMultiple, isPaused, activeService]);

  const active = useMemo(
    () => schoolServices[activeService] || schoolServices[0],
    [schoolServices, activeService]
  );

  const ActiveIcon = resolveIcon(active?.icon_key);

  return (
    <HomeSectionShell
      id="school-services-section"
      bg={{
        bgcolor: HOME.cream,
        py: { xs: 5, md: 7 },
        borderTop: `1px solid ${HOME.border}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${HOME.gold}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 1.25, sm: 1.5, md: 2 },
        }}
      >
        <Fade in={isVisible} timeout={700}>
          <Box>
            <HomeSectionHeader
              eyebrow="What we offer"
              title="Programmes &"
              titleAccent="services"
              subtitle={
                <>
                  Academics, activities, and support — rooted in our{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: HOME.navy }}>
                    {HOME.tagline || "Learn • Grow • Excel"}
                  </Box>{" "}
                  motto.
                </>
              }
            />

            {serviceCount > 0 ? (
              <Box
                sx={{ width: "100%" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  progressRef.current = 0;
                  setProgress(0);
                }}
                onFocus={() => setIsPaused(true)}
                onBlur={() => {
                  setIsPaused(false);
                  progressRef.current = 0;
                  setProgress(0);
                }}
              >
                <ServiceDetailPanel
                  active={active}
                  progress={progress}
                  ActiveIcon={ActiveIcon}
                  showProgress={hasMultiple}
                />

                {hasMultiple ? (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={0.75}
                    sx={{ mt: 2.5 }}
                    role="tablist"
                    aria-label="School programmes"
                  >
                    {schoolServices.map((svc, idx) => (
                      <Box
                        key={svc.id || svc.name}
                        component="button"
                        type="button"
                        role="tab"
                        aria-selected={activeService === idx}
                        aria-label={`Show ${svc.name}`}
                        onClick={() => selectService(idx)}
                        sx={{
                          width: activeService === idx ? 24 : 8,
                          height: 8,
                          p: 0,
                          border: "none",
                          borderRadius: "999px",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          bgcolor: activeService === idx ? HOME.gold : "rgba(12, 35, 64, 0.16)",
                          "&:hover": {
                            bgcolor: activeService === idx ? HOME.goldMuted : "rgba(12, 35, 64, 0.28)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Fade>
      </Box>
    </HomeSectionShell>
  );
}
