import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";
const RED = "#FF0000";
const CREAM = "#FFF8F0";

export default function AdmissionSuccess() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, pl: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={() => navigate("/")}
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
          Back to Home
        </Button>
      </Box>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: "20px", textAlign: "center", bgcolor: CREAM }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: `${RED}20`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Typography variant="h2" sx={{ color: RED, fontWeight: 800 }}>
              ✓
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, mb: 2, fontSize: "1.8rem" }}>
            Application Submitted!
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", mb: 3, fontSize: "1.05rem" }}>
            Thank you for your admission application. We will review your submission and contact you
            shortly with further details.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              bgcolor: RED,
              color: "black",
              "&:hover": { bgcolor: "#cc0000" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
            }}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}