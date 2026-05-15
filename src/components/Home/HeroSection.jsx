import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Button, Container, Fade } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

/** Seconds between background transitions */
const SLIDE_INTERVAL_MS = 6500;
/** Crossfade duration (matches CSS transition) */
const SLIDE_CROSSFADE_MS = 1800;

/**
 * Hero filenames under `school_public/public/images/`.
 * Missing files are skipped automatically after preload check.
 */
const HERO_IMAGE_CANDIDATES = [
  "anilsharma26-children-7047124_1920.jpg",
  "ernestoeslava-bus-2690793_1920.jpg",
  "startupstockphotos-children-593313_1920.jpg",
];

function candidateToPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

export default function HeroSection() {
  const navigate = useNavigate();
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
      const ok = resolved.filter(Boolean);
      setSlideUrls(ok);
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

  // Detect when hero section is visible and notify header
  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          const scrollY = window.scrollY;
          const isAtTop = scrollY <= 20;

          const event = new CustomEvent("heroVisibilityChange", {
            detail: {
              isVisible: visible && isAtTop,
              intersectionRatio: entry.intersectionRatio,
              scrollY,
            },
          });
          window.dispatchEvent(event);
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0],
        rootMargin: "0px",
      }
    );

    observer.observe(heroSection);

    const t = window.setTimeout(() => {
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const isAtTop = window.scrollY <= 20;
      window.dispatchEvent(
        new CustomEvent("heroVisibilityChange", {
          detail: {
            isVisible: isInView && isAtTop,
            intersectionRatio: isInView ? 1 : 0,
            scrollY: window.scrollY,
          },
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
        boxSizing: "border-box",
        "@supports (height: 100svh)": {
          height: "100svh",
          maxHeight: "100svh",
        },
      }}
    >
      {/* Rotating backgrounds */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundColor: "#0b0b0b",
        }}
      >
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
            }}
          />
        ))}
        {/* Neutral vignette — keeps photos vivid while lifting text contrast */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.42) 100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          maxHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: "clamp(92px, 14vmin, 112px)",
          pb: "clamp(52px, 11vmin, 76px)",
          boxSizing: "border-box",
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            position: "relative",
            zIndex: 2,
            px: { xs: 1.75, sm: 2.5, md: 4 },
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <Fade in={isVisible} timeout={600}>
            <Box
              sx={{
                width: "100%",
                maxWidth: "min(960px, calc(100vw - 24px))",
                mx: "auto",
                textAlign: "center",
                borderRadius: { xs: 2.5, md: 3 },
                background: "rgba(8, 10, 14, 0.52)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.38)",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2.25, sm: 2.75, md: 3.25 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(12px, 2.8vmin, 26px)",
                minHeight: 0,
                flexShrink: 1,
              }}
            >
              {/* Chip */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: { xs: 0.5, sm: 1 },
                  flexShrink: 0,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "min(100%, calc(100vw - 48px))",
                    px: "clamp(12px, 2.5vmin, 22px)",
                    py: "clamp(6px, 1vmin, 10px)",
                    borderRadius: "999px",
                    background: "rgba(230, 207, 106, 0.28)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(201, 162, 39, 0.5)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "clamp(0.62rem, 1.55vmin, 0.8125rem)",
                      fontWeight: 600,
                      color: "#e6cf6a",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      fontFamily: "'Inter', 'Segoe UI', sans-serif",
                      lineHeight: 1.35,
                      textAlign: "center",
                      textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.65)",
                    }}
                  >
                    Public Portal Excellence in Education Since 2024
                  </Typography>
                </Box>
              </Box>

              {/* Heading + subtitle */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(8px, 1.8vmin, 16px)",
                  flexShrink: 0,
                  width: "100%",
                  px: { xs: 0.25, sm: 0.5 },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: "clamp(1.35rem, 5.2vmin, 2.45rem)",
                    fontWeight: 800,
                    fontFamily: "'Inter', 'Poppins', 'Segoe UI', sans-serif",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,0.85), 0 4px 28px rgba(0,0,0,0.55)",
                  }}
                >
                  Welcome to elimu plus
                </Typography>

                <Typography
                  sx={{
                    fontSize: "clamp(0.82rem, 2.35vmin, 1.06rem)",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.96)",
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    lineHeight: 1.48,
                    maxWidth: "38rem",
                    mx: "auto",
                    textShadow:
                      "0 1px 3px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.65)",
                  }}
                >
                  Where young minds discover their potential, embrace global perspectives, and build
                  tomorrow&apos;s legacy.
                </Typography>
              </Box>

              {/* Stats — single row on all breakpoints (compact on xs) */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "nowrap",
                  justifyContent: "center",
                  alignItems: "stretch",
                  gap: { xs: 0.75, sm: 1.25, md: 2 },
                  flexShrink: 0,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                {[
                  { icon: <SchoolIcon sx={{ fontSize: "inherit" }} />, number: "500+", label: "Students" },
                  { icon: <MenuBookIcon sx={{ fontSize: "inherit" }} />, number: "45+", label: "Faculty" },
                  {
                    icon: <EmojiEventsIcon sx={{ fontSize: "inherit" }} />,
                    number: "95%",
                    label: "Success Rate",
                  },
                ].map((stat, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 0.5, sm: 0.75, md: 1 },
                      px: { xs: 0.75, sm: 1.25, md: 2 },
                      py: { xs: 0.75, sm: 1, md: 1.25 },
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.14)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.28)",
                      color: "#FFD700",
                      fontSize: { xs: "0.82rem", sm: "clamp(1rem, 2.75vmin, 1.35rem)" },
                      flex: "1 1 0",
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ flexShrink: 0, lineHeight: 0, "& svg": { fontSize: { xs: "1rem", sm: "inherit" } } }}>
                      {stat.icon}
                    </Box>
                    <Box sx={{ textAlign: "left", minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.72rem", sm: "clamp(0.82rem, 2.35vmin, 1.08rem)" },
                          fontWeight: 800,
                          color: "#ffffff",
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.12,
                          textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.55)",
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.48rem", sm: "clamp(0.55rem, 1.55vmin, 0.72rem)" },
                          fontWeight: 600,
                          color: "rgba(255, 255, 255, 0.88)",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: { xs: "0.02em", sm: "0.03em" },
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                          textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                          whiteSpace: { xs: "normal", sm: "nowrap" },
                          wordBreak: "break-word",
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* CTAs */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "clamp(10px, 2vmin, 14px)",
                  flexShrink: 0,
                  width: "100%",
                  pt: "clamp(2px, 0.6vmin, 8px)",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/admission/apply")}
                  sx={{
                    minWidth: 0,
                    py: "clamp(8px, 1.5vmin, 12px)",
                    px: "clamp(18px, 3.5vmin, 26px)",
                    fontSize: "clamp(0.78rem, 1.75vmin, 0.875rem)",
                    fontWeight: 700,
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #FF0000 0%, #FF4444 100%)",
                    color: "#0a1a2a",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(255, 0, 0, 0.28)",
                    lineHeight: 1.2,
                    "&:hover": {
                      background: "linear-gradient(135deg, #FF3333 0%, #FF6666 100%)",
                    },
                    "&:focus": { outline: "none", boxShadow: "none" },
                  }}
                >
                  Apply for Admission
                </Button>

                <Button
                  variant="outlined"
                  onClick={() =>
                    document
                      .getElementById("school-news-events-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  sx={{
                    minWidth: 0,
                    py: "clamp(8px, 1.5vmin, 12px)",
                    px: "clamp(18px, 3.5vmin, 26px)",
                    fontSize: "clamp(0.78rem, 1.75vmin, 0.875rem)",
                    fontWeight: 600,
                    borderRadius: "999px",
                    borderColor: "rgba(255, 255, 255, 0.35)",
                    borderWidth: "1px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    color: "white",
                    textTransform: "none",
                    lineHeight: 1.2,
                    "&:hover": {
                      borderColor: "#FFD700",
                      backgroundColor: "rgba(255, 215, 0, 0.12)",
                    },
                    "&:focus": { outline: "none", boxShadow: "none" },
                  }}
                >
                  Take a Virtual Tour
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Pinned inside hero — positive bottom avoids page overflow scroll */}
      <Box
        sx={{
          position: "absolute",
          bottom: "clamp(8px, 2vmin, 16px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(2px, 0.6vmin, 6px)",
          cursor: "pointer",
          animation: "heroBounce 2s ease-in-out infinite",
          "@keyframes heroBounce": {
            "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
            "50%": { transform: "translateX(-50%) translateY(6px)" },
          },
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <Typography
          sx={{
            fontSize: "clamp(0.58rem, 1.4vmin, 0.6875rem)",
            color: "rgba(255, 255, 255, 0.88)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.55)",
          }}
        >
          Discover More
        </Typography>
        <Box
          sx={{
            width: "clamp(18px, 4vmin, 22px)",
            height: "clamp(28px, 6vmin, 34px)",
            border: "2px solid rgba(255, 255, 255, 0.28)",
            borderRadius: "20px",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "3px",
              height: "6px",
              backgroundColor: "#FFD700",
              borderRadius: "2px",
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
