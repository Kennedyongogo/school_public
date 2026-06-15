import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Grid,
  Skeleton,
  Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicCurricula, fetchPublicFeeStructures } from "../api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

function formatKes(amount) {
  const n = parseFloat(amount);
  if (Number.isNaN(n)) return "KES —";
  return `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

function phaseLabel(phase) {
  if (phase === "first_half") return "First half";
  if (phase === "second_half") return "Second half";
  return String(phase || "Payment phase").replace(/_/g, " ");
}

function capitalizeItem(name) {
  if (!name) return "Fee item";
  return String(name).charAt(0).toUpperCase() + String(name).slice(1);
}

const feeCardSx = {
  height: "100%",
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

function FeeCardSkeleton() {
  return (
    <Box sx={{ ...feeCardSx, "&:hover": { transform: "none" } }}>
      <Skeleton variant="rectangular" height={4} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="60%" height={28} sx={{ mb: 2 }} />
        <Skeleton width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={80} />
      </Box>
    </Box>
  );
}

function BreakdownPhase({ phase }) {
  if (!phase) return null;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: HOME.cream,
        border: `1px solid ${HOME.border}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: HOME.inkSoft,
          }}
        >
          {phaseLabel(phase.phase)}
        </Typography>
        <Typography sx={{ fontWeight: 800, color: HOME.gold, fontSize: "0.95rem" }}>
          {formatKes(phase.amount)}
        </Typography>
      </Stack>

      {phase.items?.length > 0 ? (
        <Stack spacing={0.75}>
          {phase.items.map((item, i) => (
            <Stack
              key={`${item.name}-${i}`}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                py: 0.5,
                borderBottom: i < phase.items.length - 1 ? `1px dashed ${HOME.border}` : "none",
              }}
            >
              <Typography variant="body2" sx={{ color: HOME.inkMuted, fontWeight: 600 }}>
                {capitalizeItem(item.name)}
              </Typography>
              <Typography variant="body2" sx={{ color: HOME.navyDeep, fontWeight: 700 }}>
                {formatKes(item.amount)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color: HOME.inkSoft }}>
          No line items listed
        </Typography>
      )}
    </Box>
  );
}

function FeeStructureCard({ feeStructure }) {
  const className = feeStructure.curriculum_class?.name || "N/A";
  const classCode = feeStructure.curriculum_class?.code || "";
  const levelName = feeStructure.curriculum_class_level?.name || "N/A";
  const phases = feeStructure.payment_breakdown || [];

  return (
    <Box sx={feeCardSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />

      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 2 }}>
          <Chip
            size="small"
            icon={<SchoolOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            label={`Class: ${className}${classCode ? ` (${classCode})` : ""}`}
            sx={{ fontWeight: 700, bgcolor: HOME.sky, color: HOME.navyDeep, border: `1px solid ${HOME.border}` }}
          />
          <Chip
            size="small"
            icon={<LayersOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            label={`Level: ${levelName}`}
            sx={{ fontWeight: 700, bgcolor: HOME.sky, color: HOME.navyDeep, border: `1px solid ${HOME.border}` }}
          />
        </Stack>

        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 2.5,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${HOME.navyDeep} 0%, ${HOME.navy} 100%)`,
            border: `1px solid ${HOME.borderGold}`,
            textAlign: "center",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mb: 0.5 }}>
            <AccountBalanceWalletOutlinedIcon sx={{ color: HOME.goldMuted, fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Term fee
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.35rem" },
              color: HOME.goldMuted,
              lineHeight: 1.1,
            }}
          >
            {formatKes(feeStructure.term_fee_amount)}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
          <PaymentsOutlinedIcon sx={{ color: HOME.gold, fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, color: HOME.navyDeep, fontSize: "0.95rem" }}>
            Payment breakdown
          </Typography>
        </Stack>

        {phases.length > 0 ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ flex: 1 }}
          >
            {phases.map((phase, idx) => (
              <BreakdownPhase key={`${phase.phase}-${idx}`} phase={phase} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: HOME.inkMuted }}>
            No breakdown available for this term.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function FeeStructureView() {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const [curriculum, setCurriculum] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const curricula = await fetchPublicCurricula();
        const found = curricula.find((c) => c.id === curriculumId);
        if (!found) throw new Error("Curriculum not found");
        setCurriculum(found);

        const fees = await fetchPublicFeeStructures(curriculumId);
        setFeeStructures(fees);
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [curriculumId]);

  const handleApply = () => {
    if (curriculum) {
      localStorage.setItem(
        "selectedCurriculum",
        JSON.stringify({ id: curriculum.id, name: curriculum.name })
      );
    }
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: { xs: 1, md: 1.25 } }}
          >
            <HomeGhostButton onClick={() => navigate("/admission/apply")} startIcon={<ArrowBackIcon />}>
              Back to admission
            </HomeGhostButton>
            {curriculum ? (
              <Chip
                label={curriculum.name}
                sx={{
                  fontWeight: 800,
                  bgcolor: "rgba(201, 162, 39, 0.15)",
                  color: HOME.navyDeep,
                  border: `1px solid ${HOME.borderGold}`,
                  fontSize: "0.85rem",
                  height: 32,
                }}
              />
            ) : null}
          </Stack>

          <HomeSectionHeader
            eyebrow="Transparency"
            title="Fee"
            titleAccent="structure"
            subtitle="Review term fees and payment breakdowns by class and level before you apply."
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
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, lg: 6 }}>
                  <FeeCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : feeStructures.length === 0 ? (
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
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 48, color: HOME.gold, mb: 2, opacity: 0.85 }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: HOME.navyDeep,
                  mb: 1,
                }}
              >
                No fee structure available
              </Typography>
              <Typography sx={{ color: HOME.inkMuted, maxWidth: 420, mx: "auto", mb: 3 }}>
                Fee details for this curriculum have not been published yet. Contact the school for more information.
              </Typography>
              <HomeGhostButton onClick={() => navigate("/admission/apply")}>Back to admission</HomeGhostButton>
            </Box>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {feeStructures.map((fs) => (
                  <Grid key={fs.id} size={{ xs: 12, lg: 6 }}>
                    <FeeStructureCard feeStructure={fs} />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: HOME.border }} />

              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  textAlign: "center",
                  background: HOME.navyGradient,
                  border: `1px solid ${HOME.borderGold}`,
                  boxShadow: HOME.shadowMd,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: HOME.fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.35rem", sm: "1.6rem" },
                    color: "#fff",
                    mb: 1,
                  }}
                >
                  Ready to apply?
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.82)", mb: 2.5, maxWidth: 480, mx: "auto" }}>
                  Start your admission application for {curriculum?.name || "this curriculum"}.
                </Typography>
                <HomePrimaryButton endIcon={<ArrowForwardIcon />} onClick={handleApply}>
                  Apply for admission
                </HomePrimaryButton>
              </Box>
            </>
          )}
        </Box>
      </HomeSectionShell>
    </Box>
  );
}
