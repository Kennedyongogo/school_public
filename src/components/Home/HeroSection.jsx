import React, { useState, useEffect } from "react";
import { Typography, Box, Container, Fade, Stack } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { BRAND } from "../../brand";
import { HOME, homeGlassSx, homeBodyFontSize } from "./homeShared";
import { HomeStatPill } from "./homeUi";

const SLIDE_INTERVAL_MS = 6500;
const SLIDE_CROSSFADE_MS = 1800;

const HERO_IMAGE_CANDIDATES = [
  "anilsharma26-children-7047124_1920.jpg",
  "ernestoeslava-bus-2690793_1920.jpg",
  "startupstockphotos-children-593313_1920.jpg",
];

function candidateToPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [slideUrls, setSlideUrls] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const urls = HERO_IMAGE_CANDIDATES.map(candidateToPublicUrl);

    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
          })
      )
    ).then((resolved) => {
      if (cancelled) return;
      setSlideUrls(resolved.filter(Boolean));
      setActiveSlide(0);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slideUrls.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveSlide((i) => (i + 1) % slideUrls.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slideUrls.length]);

  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          const scrollY = window.scrollY;
          const isAtTop = scrollY <= 20;
          window.dispatchEvent(
            new CustomEvent("heroVisibilityChange", {
              detail: { isVisible: visible && isAtTop, intersectionRatio: entry.intersectionRatio, scrollY },
            })
          );
        });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0], rootMargin: "0px" }
    );

    observer.observe(heroSection);

    const t = window.setTimeout(() => {
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const isAtTop = window.scrollY <= 20;
      window.dispatchEvent(
        new CustomEvent("heroVisibilityChange", {
          detail: { isVisible: isInView && isAtTop, intersectionRatio: isInView ? 1 : 0, scrollY: window.scrollY },
        })
      );
    }, 200);

    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        width: "100%",
        marginTop: "-80px",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        "@supports (height: 100svh)": { height: "100svh", maxHeight: "100svh" },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0, bgcolor: BRAND.navyDeep }}>
        {slideUrls.map((src, index) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt=""
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: index === activeSlide ? 1 : 0,
              transition: `opacity ${SLIDE_CROSSFADE_MS}ms ease-in-out`,
              transform: index === activeSlide ? "scale(1.02)" : "scale(1)",
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: HOME.heroOverlay,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${BRAND.gold}22 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: "clamp(92px, 14vmin, 112px)",
          pb: "clamp(64px, 12vmin, 88px)",
          boxSizing: "border-box",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Fade in={isVisible} timeout={800}>
            <Box
              sx={{
                maxWidth: 920,
                mx: "auto",
                textAlign: "center",
                ...homeGlassSx({ radius: 4 }),
                px: { xs: 2.5, sm: 4, md: 5 },
                py: { xs: 3, sm: 4, md: 4.5 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 2, md: 2.75 },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 0.65,
                  borderRadius: "999px",
                  bgcolor: "rgba(201, 162, 39, 0.2)",
                  border: `1px solid ${HOME.borderGold}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: HOME.goldMuted,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {BRAND.tagline} · Excellence in Education
                </Typography>
              </Box>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: HOME.fontDisplay,
                    fontSize: { xs: "2.35rem", sm: "3rem", md: "3.65rem" },
                    fontWeight: 700,
                    lineHeight: 1.08,
                    letterSpacing: "-0.02em",
                    color: "#fff",
                    mb: 1.5,
                  }}
                >
                  Welcome to{" "}
                  <Box component="span" sx={{ color: HOME.goldMuted }}>
                    {BRAND.name}
                  </Box>
                </Typography>
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontSize: homeBodyFontSize,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.65,
                    maxWidth: 560,
                    mx: "auto",
                  }}
                >
                  A nurturing school community where young minds discover their potential, families stay
                  connected, and every learner is prepared for university and life beyond the classroom.
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 1.5 }}
                sx={{ width: "100%", maxWidth: 520 }}
              >
                {[
                  { icon: <SchoolIcon />, value: "500+", label: "Students" },
                  { icon: <MenuBookIcon />, value: "45+", label: "Faculty" },
                  { icon: <EmojiEventsIcon />, value: "95%", label: "Success" },
                ].map((stat) => (
                  <HomeStatPill key={stat.label} {...stat} />
                ))}
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: "clamp(12px, 2vmin, 20px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          animation: "heroBounce 2s ease-in-out infinite",
          "@keyframes heroBounce": {
            "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
            "50%": { transform: "translateX(-50%) translateY(6px)" },
          },
        }}
        onClick={() =>
          document
            .getElementById("portal-gateway-section")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      >
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Explore
        </Typography>
        <Box
          sx={{
            width: 22,
            height: 34,
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "20px",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 3,
              height: 6,
              bgcolor: HOME.gold,
              borderRadius: 2,
              animation: "heroScrollDot 2s ease-in-out infinite",
            },
            "@keyframes heroScrollDot": {
              "0%": { opacity: 1, transform: "translateX(-50%) translateY(0)" },
              "100%": { opacity: 0, transform: "translateX(-50%) translateY(10px)" },
            },
          }}
        />
      </Box>
    </Box>
  );
}
