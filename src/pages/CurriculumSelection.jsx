import React, { useEffect } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

export default function CurriculumSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const curriculum = location.state?.curriculum;

  useEffect(() => {
    if (!curriculum) navigate("/admission/apply");
  }, [curriculum, navigate]);

  const handleContinue = () => {
    localStorage.setItem(
      "selectedCurriculum",
      JSON.stringify({ id: curriculum.id, name: curriculum.name })
    );
    navigate("/admission/form");
  };

  if (!curriculum) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, fontFamily: HOME.fontBody }}>
      <HomeSectionShell
        bg={{
          background: `linear-gradient(180deg, ${HOME.sky} 0%, ${HOME.cream} 100%)`,
          py: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ ...sectionPad, width: "100%", maxWidth: 640, mx: "auto" }}>
          <Box sx={{ mb: 2 }}>
            <HomeGhostButton
              onClick={() => navigate("/admission/apply")}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </HomeGhostButton>
          </Box>

          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
              boxShadow: HOME.shadowMd,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                mx: "auto",
                mb: 2,
                bgcolor: "rgba(201, 162, 39, 0.12)",
                border: `1px solid ${HOME.borderGold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuBookOutlinedIcon sx={{ color: HOME.gold, fontSize: 28 }} />
            </Box>

            <HomeSectionHeader
              eyebrow="Selected curriculum"
              title={curriculum.name}
              subtitle="You are about to start your admission application for this programme."
              sx={{ mb: 3 }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
              <HomePrimaryButton endIcon={<ArrowForwardIcon />} onClick={handleContinue}>
                Continue to application
              </HomePrimaryButton>
              <HomeGhostButton onClick={() => navigate("/admission/apply")}>
                Choose another
              </HomeGhostButton>
            </Stack>
          </Box>
        </Box>
      </HomeSectionShell>
    </Box>
  );
}
