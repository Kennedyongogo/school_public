import React, { useState, useEffect, useMemo } from "react";
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import {
  uploadAdmissionDocuments,
  submitAdmissionApplication,
  fetchPublicCurriculumClasses,
  fetchPublicCurriculumClassLevels,
} from "../api";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";
const RED = "#FF0000";
const CREAM = "#FFF8F0";

const FILE_FIELDS = [
  { name: "studentPicture", label: "Student Picture", accept: "image/*" },
  { name: "studentReportcard", label: "Student Report Card", accept: ".pdf,.doc,.docx" },
  { name: "studentBirthcertificate", label: "Student Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png" },
];

function getPreviewKind(file) {
  if (!(file instanceof File)) return null;
  const type = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  return "document";
}

function AdmissionDocumentPreview({ file, label, previewUrl, onClear }) {
  if (!(file instanceof File) || !previewUrl) return null;

  const kind = getPreviewKind(file);
  const sizeKb = Math.max(1, Math.round(file.size / 1024));

  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid rgba(22, 33, 62, 0.15)",
        bgcolor: "rgba(255,255,255,0.7)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: NAVY }}>
          Preview — {label}
        </Typography>
        <Button
          type="button"
          size="small"
          startIcon={<CloseIcon sx={{ fontSize: "1rem !important" }} />}
          onClick={onClear}
          sx={{ textTransform: "none", color: "#666", minWidth: 0 }}
        >
          Remove
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 1 }}>
        {file.name} ({sizeKb} KB)
      </Typography>

      {kind === "image" && (
        <Box
          component="img"
          src={previewUrl}
          alt={`${label} preview`}
          sx={{
            display: "block",
            maxWidth: "100%",
            maxHeight: 220,
            borderRadius: 1,
            border: "1px solid rgba(0,0,0,0.08)",
            objectFit: "contain",
            bgcolor: "#fff",
          }}
        />
      )}

      {kind === "pdf" && (
        <Box
          component="iframe"
          src={previewUrl}
          title={`${label} preview`}
          sx={{
            width: "100%",
            height: { xs: 240, sm: 320 },
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 1,
            bgcolor: "#fff",
          }}
        />
      )}

      {kind === "document" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: 1,
            bgcolor: "#fff",
            border: "1px dashed rgba(22, 33, 62, 0.25)",
          }}
        >
          <DescriptionIcon sx={{ fontSize: 40, color: NAVY }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Document selected
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Word files cannot be previewed in the browser. The file will be uploaded on submit.
            </Typography>
          </Box>
        </Box>
      )}

      {kind === "pdf" && (
        <Button
          type="button"
          size="small"
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<PictureAsPdfIcon />}
          sx={{ mt: 1, textTransform: "none" }}
        >
          Open full preview
        </Button>
      )}
    </Box>
  );
}

export default function AdmissionForm() {
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
  const [classes, setClasses] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [fileInputKeys, setFileInputKeys] = useState({
    studentPicture: 0,
    studentReportcard: 0,
    studentBirthcertificate: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("selectedCurriculum");
    if (stored) {
      setSelectedCurriculum(JSON.parse(stored));
      fetchClassesAndLevels(JSON.parse(stored).id);
    } else {
      navigate("/admission/apply");
    }
  }, [navigate]);

  const fetchClassesAndLevels = async (curriculumId) => {
    setLoadingOptions(true);
    setError(null);
    try {
      const classesData = await fetchPublicCurriculumClasses(curriculumId);
      setClasses(classesData);
      const allLevelsData = [];
      for (const cls of classesData) {
        const levels = await fetchPublicCurriculumClassLevels(curriculumId, cls.id);
        levels.forEach(l => allLevelsData.push({ ...l, classId: cls.id, className: cls.name }));
      }
      setAllLevels(allLevelsData);
    } catch (e) {
      setError(e.message || "Failed to load options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    const filteredLevels = allLevels.filter(l => l.classId === cls.id);
    setTerms(filteredLevels);
    setSelectedTerm(null);
  };

  useEffect(() => {
    if (selectedClass && selectedTerm && !terms.some(t => t.id === selectedTerm?.id)) {
      fetchTerms(selectedCurriculum.id, selectedClass.id);
    }
  }, [selectedClass, selectedTerm, terms]);

  const fetchTerms = async (curriculumId, classId) => {
    setLoadingOptions(true);
    try {
      const data = await fetchPublicCurriculumClassLevels(curriculumId, classId);
      setTerms(data);
    } catch (e) {
      setError(e.message || "Failed to load terms");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setUploadedFiles((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const clearFile = (name) => {
    setUploadedFiles((prev) => ({ ...prev, [name]: null }));
    setFileInputKeys((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };

  const previewUrls = useMemo(() => {
    const urls = {};
    for (const { name } of FILE_FIELDS) {
      const file = uploadedFiles[name];
      if (file instanceof File) {
        urls[name] = URL.createObjectURL(file);
      }
    }
    return urls;
  }, [uploadedFiles]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const filePath = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

  const hasFileObjects = (files) =>
    Object.values(files).some((file) => file instanceof File);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let documentPaths = {
        studentPicture: filePath(uploadedFiles.studentPicture),
        studentReportcard: filePath(uploadedFiles.studentReportcard),
        studentBirthcertificate: filePath(uploadedFiles.studentBirthcertificate),
      };

      if (hasFileObjects(uploadedFiles)) {
        setUploading(true);
        const uploadResult = await uploadAdmissionDocuments(uploadedFiles);
        documentPaths = {
          studentPicture: uploadResult.files?.studentPicture ?? documentPaths.studentPicture,
          studentReportcard: uploadResult.files?.studentReportcard ?? documentPaths.studentReportcard,
          studentBirthcertificate:
            uploadResult.files?.studentBirthcertificate ?? documentPaths.studentBirthcertificate,
        };
        setUploading(false);
      }

      const result = await submitAdmissionApplication({
        curriculum: selectedCurriculum?.name,
        curriculum_class: selectedClass?.name,
        curriculum_level: selectedTerm?.name,
        applicant_name: formData.applicantName.trim(),
        applicant_phone: formData.applicantPhone.trim() || null,
        applicant_email: formData.applicantEmail.trim() || null,
        student_name: formData.studentName.trim(),
        student_picture: documentPaths.studentPicture,
        student_reportcard: documentPaths.studentReportcard,
        student_birthcertificate: documentPaths.studentBirthcertificate,
      });

      localStorage.removeItem("selectedCurriculum");

      const applicationNumber = result?.data?.application_number;
      await Swal.fire({
        icon: "success",
        title: "Application Submitted!",
        html: applicationNumber
          ? `Your admission application has been received.<br/><strong>Reference: ${applicationNumber}</strong>`
          : "Your admission application has been received. We will contact you soon.",
        confirmButtonText: "Continue",
        confirmButtonColor: NAVY,
      });

      navigate("/admission/success");
    } catch (e) {
      const message = e.message || "Failed to submit application";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: message,
        confirmButtonColor: NAVY,
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!selectedCurriculum) {
    return null;
  }

  return (
    <Box sx={{ pt: 0, pb: 0, mb: 0, bgcolor: "#f5f7fa", width: "100%", maxWidth: "100%" }}>
        <Paper
          sx={{
            pt: 2,
            px: 4,
            pb: 3,
            mb: 0,
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            bgcolor: CREAM,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
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
                flexShrink: 0,
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
            <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, fontSize: "1.8rem" }}>
              Admission Application
            </Typography>
            <Typography variant="caption" sx={{ bgcolor: RED, color: "black", px: 1.5, borderRadius: 1, fontSize: "0.85rem", fontWeight: 700 }}>
              {selectedCurriculum.name}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 0 }}>
              <Grid size={12}>
                <FormControl fullWidth sx={{ mb: 0 }}>
                  <FormLabel sx={{ fontWeight: 700, color: NAVY, mb: 1 }}>Select Class *</FormLabel>
                  {loadingOptions ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: NAVY }} />
                      <Typography variant="body2">Loading classes...</Typography>
                    </Box>
                  ) : (
                    <RadioGroup
                      value={selectedClass?.id || ""}
                      onChange={(e) => handleClassSelect(classes.find(c => c.id === e.target.value))}
                      sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 300, overflowY: "auto" }}
                    >
                      {classes.map((cls) => (
                        <FormControlLabel
                          key={cls.id}
                          value={cls.id}
                          control={<Radio size="small" />}
                          label={<Typography variant="body2">{cls.name}</Typography>}
                          sx={{ mr: 0, p: 1, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </FormControl>
              </Grid>

              <Grid size={12}>
                <FormControl fullWidth sx={{ mb: 0 }}>
                  <FormLabel sx={{ fontWeight: 700, color: NAVY, mb: 1 }}>Select Term/Level *</FormLabel>
                  {loadingOptions ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: NAVY }} />
                      <Typography variant="body2">Loading terms...</Typography>
                    </Box>
                  ) : allLevels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No terms available</Typography>
                  ) : (
                    <RadioGroup
                      value={selectedTerm?.id || ""}
                      onChange={(e) => {
                        const term = allLevels.find(t => t.id === e.target.value);
                        setSelectedTerm(term);
                      }}
                      sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 300, overflowY: "auto" }}
                    >
                      {allLevels.map((term) => (
                        <FormControlLabel
                          key={term.id}
                          value={term.id}
                          control={<Radio size="small" />}
                          label={<Typography variant="body2">{term.name} ({term.className})</Typography>}
                          sx={{ mr: 0, p: 1, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </FormControl>
              </Grid>
            </Grid>

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
              {FILE_FIELDS.map(({ name, label, accept }) => (
                <Grid key={name} size={12}>
                  <TextField
                    key={`${name}-${fileInputKeys[name]}`}
                    fullWidth
                    label={label}
                    name={name}
                    type="file"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UploadIcon />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleFileChange}
                    variant="outlined"
                    size="small"
                    inputProps={{ accept }}
                  />
                  <AdmissionDocumentPreview
                    file={uploadedFiles[name]}
                    label={label}
                    previewUrl={previewUrls[name]}
                    onClear={() => clearFile(name)}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 0 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || uploading || !selectedClass || !selectedTerm}
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
                {loading || uploading ? <CircularProgress size={24} /> : "Apply Now"}
              </Button>
            </Box>
          </Box>
        </Paper>
    </Box>
  );
}