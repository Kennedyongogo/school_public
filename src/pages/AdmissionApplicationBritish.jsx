import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import { uploadAdmissionDocuments } from "../api";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";
const RED = "#FF0000";
const CREAM = "#FFF8F0";

export default function AdmissionApplicationBritish() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantPhone: "",
    applicantEmail: "",
    studentName: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    studentPicture: null,
    studentReportcard: null,
    studentBirthcertificate: null,
  });
  const [uploading, setUploading] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCurriculum");
    if (stored) {
      setSelectedCurriculum(JSON.parse(stored));
    } else {
      navigate("/admission/apply");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalFiles = uploadedFiles;
      if (!uploadedFiles.studentPicture || !uploadedFiles.studentReportcard || !uploadedFiles.studentBirthcertificate) {
        setUploading(true);
        const uploadResult = await uploadAdmissionDocuments(uploadedFiles);
        finalFiles = uploadResult.files;
        setUploading(false);
      }

      const response = await fetch("/api/admission-applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          curriculum_level: selectedCurriculum?.level,
          curriculum_class: selectedCurriculum?.class?.name,
          curriculum: selectedCurriculum?.name,
          applicant_name: formData.applicantName,
          applicant_phone: formData.applicantPhone,
          applicant_email: formData.applicantEmail,
          student_name: formData.studentName,
          student_picture: finalFiles.studentPicture || null,
          student_reportcard: finalFiles.studentReportcard || null,
          student_birthcertificate: finalFiles.studentBirthcertificate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed");
      }

      setSuccess(true);
      localStorage.removeItem("selectedCurriculum");
      setTimeout(() => navigate("/admission/success"), 2000);
    } catch (e) {
      setError(e.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setUploadedFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  if (!selectedCurriculum) {
    return null;
  }

  return (
    <Box sx={{ py: 4, bgcolor: "#f5f7fa", minWidth: "100vw", width: "100%", maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, pl: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={() => navigate("/admission/apply")}
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
          Back
        </Button>
      </Box>
      <Box sx={{ textAlign: "center", mb: 4, width: "100%" }}>
        <Typography
          variant="overline"
          sx={{ color: RED, fontWeight: 700, letterSpacing: "2px", mb: 1, display: "block", fontSize: "1.1rem" }}
        >
          British System
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
          Admission Application
        </Typography>
      </Box>

      {error && (
        <Box sx={{ width: "100%", px: 2 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {success && (
        <Box sx={{ width: "100%", px: 2 }}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Application submitted successfully!
          </Alert>
        </Box>
      )}

      <Box sx={{ px: 2, py: 2, width: "100%" }}>
        <Paper sx={{ p: 4, borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", bgcolor: CREAM, width: "100%" }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3,
            pl: 0,
            pr: 3,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, fontSize: "1.8rem" }}>
                Admission Application
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ bgcolor: RED, color: "black", px: 1.5, borderRadius: 1, fontSize: "0.85rem", fontWeight: 700 }}>
                  {selectedCurriculum.name}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY, mb: 2, mt: 2 }}>
              Applicant Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Applicant Full Name"
                  name="applicantName"
                  value={formData.applicantName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Applicant Phone"
                  name="applicantPhone"
                  value={formData.applicantPhone || ""}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Applicant Email"
                  name="applicantEmail"
                  type="email"
                  value={formData.applicantEmail || ""}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY, mb: 2, mt: 3 }}>
              Student Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Student Full Name"
                  name="studentName"
                  value={formData.studentName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Student Picture"
                  name="studentPicture"
                  type="file"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><UploadIcon /></InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleFileChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ accept: "image/*" }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Student Report Card"
                  name="studentReportcard"
                  type="file"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><UploadIcon /></InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleFileChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ accept: ".pdf,.doc,.docx" }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Student Birth Certificate"
                  name="studentBirthcertificate"
                  type="file"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><UploadIcon /></InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleFileChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ accept: ".pdf,.jpg,.jpeg,.png" }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || uploading}
                sx={{
                  flex: 1,
                  bgcolor: RED,
                  color: "black",
                  "&:hover": { bgcolor: "#cc0000" },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Apply Now"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}