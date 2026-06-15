import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { HOME, homeBodyFontSize } from "./homeShared";
import { HomePrimaryButton, HomeSectionHeader, HomeSectionShell } from "./homeUi";

const PORTAL_CARDS = [
  {
    icon: <FamilyRestroomIcon />,
    title: "Parents & Students",
    description:
      "Access classes, exams, fees, report cards, and live online sessions — all in one secure portal.",
    cta: "Sign in to portal",
    action: (navigate) => navigate("/login"),
    accent: HOME.gold,
  },
  {
    icon: <HowToRegOutlinedIcon />,
    title: "New families",
    description:
      "Start your admission journey, explore curricula, and view fee structures before you apply.",
    cta: "Apply for admission",
    action: (navigate) => navigate("/admission/apply"),
    accent: "#5b8fc7",
  },
  {
    icon: <SchoolOutlinedIcon />,
    title: "Our community",
    description:
      "Meet our educators, discover our values, and see what makes Elimu Plus a place to learn, grow, and excel.",
    cta: "About our school",
    action: (navigate) => navigate("/about-us"),
    accent: "#2d8f6f",
  },
];

export default function HomePortalSection() {
  const navigate = useNavigate();

  return (
    <HomeSectionShell
      id="portal-gateway-section"
      bg={{
        background: `linear-gradient(180deg, ${HOME.warmWhite} 0%, ${HOME.sky} 100%)`,
        borderTop: `1px solid ${HOME.border}`,
        py: { xs: 5, md: 6 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 480,
          height: 200,
          background: `radial-gradient(ellipse, ${HOME.gold}22 0%, transparent 70%)`,
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
        <HomeSectionHeader
          eyebrow="Your school hub"
          title="Built for"
          titleAccent="parents & learners"
          subtitle="Admissions, learning, and school life — all in one place."
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch",
            gap: { xs: 1.5, sm: 1.5, md: 2 },
            width: "100%",
          }}
        >
          {PORTAL_CARDS.map((card) => (
            <Box
              key={card.title}
              sx={{
                flex: { xs: "1 1 auto", md: "1 1 0" },
                width: "100%",
                minWidth: 0,
                minHeight: { xs: "auto", md: 320 },
                p: { xs: 2, sm: 2.5, md: 3.5 },
                borderRadius: 3,
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
                boxShadow: HOME.shadowSm,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.28s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: HOME.shadowMd,
                  borderColor: HOME.borderGold,
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 44, sm: 52, md: 60 },
                  height: { xs: 44, sm: 52, md: 60 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: { xs: 1.5, md: 2 },
                  color: HOME.navyDeep,
                  bgcolor: `${card.accent}18`,
                  border: `1px solid ${card.accent}44`,
                  "& svg": { fontSize: { xs: 24, sm: 28, md: 32 } },
                }}
              >
                {card.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                  color: HOME.navyDeep,
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </Typography>
              <Typography
                sx={{
                  color: HOME.inkMuted,
                  lineHeight: 1.65,
                  fontSize: homeBodyFontSize,
                  flex: 1,
                  mb: { xs: 2, md: 2.5 },
                }}
              >
                {card.description}
              </Typography>
              <HomePrimaryButton
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => card.action(navigate)}
                sx={{
                  justifyContent: "space-between",
                  px: { xs: 1.5, md: 2.5 },
                  py: { xs: 1, md: 1.25 },
                  fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.95rem" },
                  mt: "auto",
                }}
              >
                {card.cta}
              </HomePrimaryButton>
            </Box>
          ))}
        </Box>
      </Box>
    </HomeSectionShell>
  );
}
