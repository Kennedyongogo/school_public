import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NAVY = "#16213e";
const RED = "#FF0000";

export default function CurriculumSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const curriculum = state.curriculum;

  useEffect(() => {
    if (!curriculum) {
      navigate("/admission/apply");
      return;
    }
  }, [curriculum, navigate]);

  const handleContinue = () => {
    localStorage.setItem("selectedCurriculum", JSON.stringify({
      id: curriculum.id,
      name: curriculum.name,
    }));
    navigate("/admission/form");
  };

  if (!curriculum) return null;

  return (
    <Box sx={{ py: 4, bgcolor: "#f5f7fa", minWidth: "100vw", width: "100%", maxWidth: "100%" }}>
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
              bgcolor: "#1a1a2e",
              color: "white",
              boxShadow: `0 10px 28px rgba(26, 26, 46, 0.35), 0 0 0 1px rgba(255, 215, 0, 0.35)`,
              transform: "translateY(-2px)",
              "& .MuiSvgIcon-root": { color: "#FFD700" },
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
          {curriculum.name}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: "900px", mx: "auto", px: 2 }}>
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{
            width: "100%",
            bgcolor: RED,
            color: "black",
            "&:hover": { bgcolor: "#cc0000" },
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.05rem",
            py: 1.5,
            mt: 3,
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}