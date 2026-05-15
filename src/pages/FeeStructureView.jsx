import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicCurricula, fetchPublicFeeStructures } from "../api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";
const RED = "#FF0000";
const CREAM = "#FFF8F0";

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
    loadData();
  }, [curriculumId]);

  return (
    <Box sx={{ pt: 2, pb: 4, bgcolor: "#f5f7fa", minWidth: "100vw", width: "100%", maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, pl: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={() => navigate("/admission/apply")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.9375rem",
            letterSpacing: "0.02em",
            px: 2.5,
            py: 1,
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
          Back
        </Button>
      </Box>
      <Box sx={{ textAlign: "center", mb: 4, width: "100%" }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            color: RED,
            fontSize: "2.2rem",
          }}
        >
          Fee Structure
        </Typography>
        <Typography variant="body1" sx={{ color: "#333", maxWidth: "600px", mx: "auto", fontSize: "1.05rem" }}>
          {curriculum?.name || "Loading..."}
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
      ) : feeStructures.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, width: "100%" }}>
          <Typography color="text.secondary">No fee structure available for this curriculum.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, py: 2, width: "100%" }}>
          {feeStructures.map((fs) => (
            <Card
              key={fs.id}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                mb: 3,
                width: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                bgcolor: CREAM,
              }}
            >
              <Box sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY }}>
                    Term Fee: KES {parseFloat(fs.term_fee_amount).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: "black", fontSize: "1rem", mb: 2 }}>
                  Payment Breakdown:
                </Typography>
                {fs.payment_breakdown && fs.payment_breakdown.length > 0 ? (
                  fs.payment_breakdown.map((phase, idx) => (
                    <Box key={idx} sx={{ mb: 2, pl: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: NAVY }}>
                        {phase.phase === "first_half" ? "First Half" : "Second Half"}: KES {parseFloat(phase.amount).toLocaleString()}
                      </Typography>
                      {phase.items && phase.items.length > 0 ? (
                        <Box sx={{ pl: 2, mt: 1 }}>
                          {phase.items.map((item, i) => (
                            <Typography key={i} variant="caption" sx={{ display: "block", color: "#555" }}>
                              • {item.name}: KES {parseFloat(item.amount).toLocaleString()}
                            </Typography>
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">No breakdown available</Typography>
                )}
              </Box>
              <Box sx={{ px: 3, py: 1, pt: 0, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  <strong>Class:</strong> {fs.curriculum_class?.name || "N/A"} ({fs.curriculum_class?.code || ""})
                </Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>
                  <strong>Level:</strong> {fs.curriculum_class_level?.name || "N/A"}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}