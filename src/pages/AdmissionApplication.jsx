import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchPublicCurricula, fetchPublicFeeStructures } from "../api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

const curriculumCardSx = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  boxShadow: HOME.shadowSm,
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: HOME.shadowMd,
    borderColor: HOME.borderGold,
    transform: "translateY(-4px)",
  },
};

function CurriculumCardSkeleton() {
  return (
    <Box sx={{ ...curriculumCardSx, "&:hover": { transform: "none" } }}>
      <Skeleton variant="rectangular" height={4} />
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Skeleton width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={20} />
        <Skeleton width="85%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="30%" height={36} sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

function CurriculumCard({ curriculum, onApply, onViewFees }) {
  const hasDescription = Boolean(curriculum.description?.trim());
  const hasPeriod = Boolean(curriculum.period?.trim());

  return (
    <Box sx={curriculumCardSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ mb: hasDescription || hasPeriod ? 2 : 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                flexShrink: 0,
                bgcolor: "rgba(201, 162, 39, 0.12)",
                border: `1px solid ${HOME.borderGold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuBookOutlinedIcon sx={{ color: HOME.gold, fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Chip
                label="Curriculum"
                size="small"
                sx={{
                  mb: 0.5,
                  height: 22,
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  bgcolor: HOME.sky,
                  color: HOME.navyDeep,
                }}
              />
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.45rem", sm: "1.65rem" },
                  color: HOME.navyDeep,
                  lineHeight: 1.15,
                }}
              >
                {curriculum.name}
              </Typography>
            </Box>
          </Stack>

          <HomePrimaryButton
            onClick={() => onApply(curriculum)}
            endIcon={<ArrowForwardIcon />}
            sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
          >
            Apply now
          </HomePrimaryButton>
        </Stack>

        {(hasDescription || hasPeriod) && (
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: HOME.cream,
              border: `1px solid ${HOME.border}`,
              mb: 2,
            }}
          >
            {hasDescription && (
              <Typography
                sx={{
                  color: HOME.inkMuted,
                  lineHeight: 1.7,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {curriculum.description.trim()}
              </Typography>
            )}
            {hasPeriod && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: hasDescription ? 1.25 : 0 }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: HOME.gold }} />
                <Typography variant="body2" sx={{ color: HOME.inkSoft, fontWeight: 600 }}>
                  {curriculum.period.trim()}
                </Typography>
              </Stack>
            )}
          </Box>
        )}

        <Box sx={{ mt: "auto", pt: 1.5 }}>
          {curriculum.feeStructure ? (
            <HomeGhostButton
              onClick={() => onViewFees(curriculum.id)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              View fee structure
            </HomeGhostButton>
          ) : (
            <Typography variant="caption" sx={{ color: HOME.inkSoft, fontWeight: 600 }}>
              Contact school for fees
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function AdmissionApplication() {
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCurricula = async () => {
      try {
        const data = await fetchPublicCurricula();
        const curriculaWithFees = await Promise.all(
          data.map(async (c) => {
            try {
              const fees = await fetchPublicFeeStructures(c.id);
              return { ...c, feeStructure: fees.length > 0 };
            } catch {
              return { ...c, feeStructure: false };
            }
          })
        );
        setCurricula(curriculaWithFees);
      } catch (e) {
        setError(e.message || "Failed to load curricula");
      } finally {
        setLoading(false);
      }
    };
    void loadCurricula();
  }, []);

  const handleApply = (curriculum) => {
    localStorage.setItem(
      "selectedCurriculum",
      JSON.stringify({ id: curriculum.id, name: curriculum.name })
    );
    navigate("/admission/form");
  };

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", maxWidth: "100%", bgcolor: HOME.cream, fontFamily: HOME.fontBody }}>
      <HomeSectionShell
        bg={{
          background: `linear-gradient(180deg, ${HOME.sky} 0%, ${HOME.cream} 100%)`,
          pt: { xs: 1.5, md: 2 },
          pb: { xs: 1, md: 1.25 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -50,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(201,162,39,0.14) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <Box sx={{ ...sectionPad, position: "relative", zIndex: 1, width: "100%" }}>
          <Box sx={{ mb: { xs: 1, md: 1.25 } }}>
            <HomeGhostButton
              onClick={() => navigate("/")}
              startIcon={<ArrowBackIcon />}
              sx={{ fontSize: "0.9rem" }}
            >
              Back to home
            </HomeGhostButton>
          </Box>

          <HomeSectionHeader
            eyebrow="Start your journey"
            title="Apply for"
            titleAccent="admission"
            subtitle="Select your desired curriculum to begin the admission application process."
            sx={{ mb: 0 }}
          />
        </Box>
      </HomeSectionShell>

      <HomeSectionShell bg={{ pt: { xs: 1, md: 1.5 }, pb: { xs: 4, md: 6 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, border: `1px solid ${HOME.border}` }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Stack spacing={2}>
              {Array.from({ length: 2 }).map((_, i) => (
                <CurriculumCardSkeleton key={i} />
              ))}
            </Stack>
          ) : curricula.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                borderRadius: 3,
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
              }}
            >
              <MenuBookOutlinedIcon sx={{ fontSize: 48, color: HOME.gold, mb: 2, opacity: 0.85 }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: HOME.navyDeep,
                  mb: 1,
                }}
              >
                No curricula available
              </Typography>
              <Typography sx={{ color: HOME.inkMuted, maxWidth: 400, mx: "auto" }}>
                Please check back soon or contact the school for admission enquiries.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={{ xs: 2, md: 2.5 }}>
              {curricula.map((curriculum) => (
                <CurriculumCard
                  key={curriculum.id}
                  curriculum={curriculum}
                  onApply={handleApply}
                  onViewFees={(id) => navigate(`/admission/fee-structure/${id}`)}
                />
              ))}
            </Stack>
          )}
        </Box>
      </HomeSectionShell>
    </Box>
  );
}
