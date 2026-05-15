import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchPublicCurricula, fetchPublicFeeStructures } from "../api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";
const RED = "#FF0000";
const CREAM = "#FFF8F0";

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
    loadCurricula();
  }, []);

  const handleApply = (curriculum) => {
    localStorage.setItem("selectedCurriculum", JSON.stringify({
      id: curriculum.id,
      name: curriculum.name,
    }));
    navigate("/admission/form");
  };

  return (
    <Box sx={{ pt: 2, pb: 4, bgcolor: "#f5f7fa", minWidth: "100vw", width: "100%", maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, pl: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={() => navigate("/")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.9375rem",
            letterSpacing: "0.02em",
px: 1.5,
                    py: 0.5,
            borderRadius: "999px",
            borderWidth: 2,
            borderColor: NAVY,
            color: "black",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            boxShadow: `0 4px 18px rgba(22, 33, 62, 0.12), inset 0 1px 0 rgba(255,255,255,0.85)`,
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiButton-startIcon": { mr: 1 },
            "&:focus": { outline: "none" },
            "&:hover": {
              borderWidth: 2,
              borderColor: RED,
              bgcolor: NAVY_DEEP,
              color: "white",
              boxShadow: `0 10px 28px rgba(26, 26, 46, 0.35), 0 0 0 1px rgba(255, 215, 0, 0.35)`,
              transform: "translateY(-2px)",
              "& .MuiSvgIcon-root": { color: GOLD },
            },
          }}
        >
          Back to Home
        </Button>
      </Box>
      <Box sx={{ textAlign: "center", mb: 4, width: "100%" }}>
        <Typography
          variant="overline"
          sx={{ color: RED, fontWeight: 700, letterSpacing: "2px", mb: 1, display: "block", fontSize: "1.1rem" }}
        >
          Start Your Journey
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            color: RED,
            fontSize: "2.2rem",
          }}
        >
          Apply for Admission
        </Typography>
        <Typography variant="body1" sx={{ color: "#333", maxWidth: "600px", mx: "auto", fontSize: "1.05rem" }}>
          Select your desired curriculum to begin the admission application process
        </Typography>
      </Box>

      {error && (
        <Box sx={{ width: "100%", px: 2 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: NAVY }} />
        </Box>
      ) : curricula.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, width: "100%" }}>
          <Typography color="text.secondary">No curricula available at this time.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, py: 2, width: "100%" }}>
          {curricula.map((curriculum) => (
            <Card
              key={curriculum.id}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                mb: 3,
                width: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                bgcolor: CREAM,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "nowrap",
                  pl: 0,
                  pr: 3,
                  py: 2,
                  bgcolor: "linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", pl: 2, minWidth: 0, flex: 1 }}>
                  <Chip
                    label={curriculum.name}
                    sx={{
                      bgcolor: RED,
                      color: "black",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      height: "auto",
                      py: 0.5,
                      "& .MuiChip-label": { px: 1.5 },
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleApply(curriculum)}
                  sx={{
                    bgcolor: RED,
                    color: "black",
                    textTransform: "none",
                    fontWeight: 700,
                    minWidth: 48,
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "#cc0000" },
                  }}
                >
                  Apply Now
                </Button>
              </Box>
              {(curriculum.description?.trim() || curriculum.period?.trim()) && (
                <Box sx={{ px: 3, py: 2 }}>
                  {curriculum.description?.trim() && (
                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: "black", fontSize: "1.2rem" }}>
                      {curriculum.description.trim()}
                    </Typography>
                  )}
                  {curriculum.period?.trim() && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#666", display: "block", mt: curriculum.description?.trim() ? 1.5 : 0 }}
                    >
                      {curriculum.period.trim()}
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, pt: 0 }}>
                <Tooltip title="View fee structure">
                  <IconButton
                    onClick={() => navigate(`/admission/fee-structure/${curriculum.id}`)}
                    sx={{ color: NAVY }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}