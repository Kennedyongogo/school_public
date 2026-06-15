import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Swal from "sweetalert2";
import {
  uploadAdmissionDocuments,
  submitAdmissionApplication,
  fetchPublicCurriculumClasses,
  fetchPublicCurriculumClassLevels,
} from "../api";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

const FILE_FIELDS = [
  { name: "studentPicture", label: "Student picture", accept: "image/*" },
  { name: "studentReportcard", label: "Student report card", accept: ".pdf,.doc,.docx" },
  { name: "studentBirthcertificate", label: "Student birth certificate", accept: ".pdf,.jpg,.jpeg,.png" },
];

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff",
    borderRadius: 2,
    fontFamily: HOME.fontBody,
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HOME.borderGold },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HOME.gold, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: HOME.navyDeep },
};

const radioOptionSx = (selected) => ({
  mr: 0,
  ml: 0,
  width: "100%",
  p: { xs: 1.25, sm: 1.5 },
  m: 0,
  borderRadius: 2,
  border: `1px solid ${selected ? HOME.gold : HOME.border}`,
  bgcolor: selected ? "rgba(201, 162, 39, 0.08)" : "#fff",
  boxShadow: selected ? HOME.shadowSm : "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: HOME.borderGold,
    bgcolor: selected ? "rgba(201, 162, 39, 0.1)" : HOME.sky,
  },
  "& .MuiRadio-root": {
    color: HOME.inkSoft,
    "&.Mui-checked": { color: HOME.gold },
  },
});

function FormPanel({ title, icon, children, sx }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        boxShadow: HOME.shadowSm,
        mb: { xs: 2, md: 2.5 },
        ...sx,
      }}
    >
      <Box sx={{ height: 4, background: HOME.navyGradient }} />
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          {icon ? (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "rgba(201, 162, 39, 0.12)",
                border: `1px solid ${HOME.borderGold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: HOME.gold,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.4rem" },
              color: HOME.navyDeep,
            }}
          >
            {title}
          </Typography>
        </Stack>
        {children}
      </Box>
    </Box>
  );
}

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
        border: `1px solid ${HOME.border}`,
        bgcolor: HOME.cream,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: HOME.navyDeep }}>
          Preview — {label}
        </Typography>
        <Button
          type="button"
          size="small"
          startIcon={<CloseIcon sx={{ fontSize: "1rem !important" }} />}
          onClick={onClear}
          sx={{ textTransform: "none", color: HOME.inkSoft, minWidth: 0 }}
        >
          Remove
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: HOME.inkSoft, display: "block", mb: 1 }}>
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
            borderRadius: 1.5,
            border: `1px solid ${HOME.border}`,
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
            border: `1px solid ${HOME.border}`,
            borderRadius: 1.5,
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
            borderRadius: 1.5,
            bgcolor: "#fff",
            border: `1px dashed ${HOME.borderGold}`,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 40, color: HOME.gold }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: HOME.navyDeep }}>
              Document selected
            </Typography>
            <Typography variant="caption" sx={{ color: HOME.inkMuted }}>
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
          sx={{ mt: 1, textTransform: "none", color: HOME.navyDeep, fontWeight: 600 }}
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
      const parsed = JSON.parse(stored);
      setSelectedCurriculum(parsed);
      void fetchClassesAndLevels(parsed.id);
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
        levels.forEach((l) => allLevelsData.push({ ...l, classId: cls.id, className: cls.name }));
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
    const filteredLevels = allLevels.filter((l) => l.classId === cls.id);
    setTerms(filteredLevels);
    setSelectedTerm(null);
  };

  useEffect(() => {
    if (selectedClass && selectedTerm && !terms.some((t) => t.id === selectedTerm?.id)) {
      void fetchTerms(selectedCurriculum.id, selectedClass.id);
    }
  }, [selectedClass, selectedTerm, terms, selectedCurriculum?.id]);

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
    if (files?.[0]) {
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
      if (file instanceof File) urls[name] = URL.createObjectURL(file);
    }
    return urls;
  }, [uploadedFiles]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const filePath = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

  const hasFileObjects = (files) => Object.values(files).some((file) => file instanceof File);

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
        title: "Application submitted!",
        html: applicationNumber
          ? `Your admission application has been received.<br/><strong>Reference: ${applicationNumber}</strong>`
          : "Your admission application has been received. We will contact you soon.",
        confirmButtonText: "Continue",
        confirmButtonColor: HOME.gold,
      });

      navigate("/admission/success");
    } catch (e) {
      const message = e.message || "Failed to submit application";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: message,
        confirmButtonColor: HOME.gold,
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!selectedCurriculum) return null;

  const levelOptions = selectedClass
    ? allLevels.filter((l) => l.classId === selectedClass.id)
    : allLevels;

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
              Back
            </HomeGhostButton>
            <Chip
              label={selectedCurriculum.name}
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(201, 162, 39, 0.15)",
                color: HOME.navyDeep,
                border: `1px solid ${HOME.borderGold}`,
                fontSize: "0.85rem",
                height: 32,
              }}
            />
          </Stack>

          <HomeSectionHeader
            eyebrow="Admission application"
            title="Complete your"
            titleAccent="application"
            subtitle="Choose class and level, then fill in applicant and student details to apply."
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

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <FormPanel title="Select class" icon={<SchoolOutlinedIcon fontSize="small" />}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 700, color: HOME.navyDeep, mb: 1.5, fontFamily: HOME.fontBody }}>
                      Select class *
                    </FormLabel>
                    {loadingOptions ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={18} sx={{ color: HOME.gold }} />
                        <Typography variant="body2" sx={{ color: HOME.inkMuted }}>
                          Loading classes…
                        </Typography>
                      </Stack>
                    ) : classes.length === 0 ? (
                      <Typography variant="body2" sx={{ color: HOME.inkMuted }}>
                        No classes available for this curriculum.
                      </Typography>
                    ) : (
                      <RadioGroup
                        value={selectedClass?.id || ""}
                        onChange={(e) => handleClassSelect(classes.find((c) => c.id === e.target.value))}
                        sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 320, overflowY: "auto", pr: 0.5 }}
                      >
                        {classes.map((cls) => (
                          <FormControlLabel
                            key={cls.id}
                            value={cls.id}
                            control={<Radio size="small" />}
                            label={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: HOME.navyDeep }}>
                                {cls.name}
                              </Typography>
                            }
                            sx={radioOptionSx(selectedClass?.id === cls.id)}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                </FormPanel>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <FormPanel title="Select term / level" icon={<LayersOutlinedIcon fontSize="small" />}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ fontWeight: 700, color: HOME.navyDeep, mb: 1.5, fontFamily: HOME.fontBody }}>
                      Select term / level *
                    </FormLabel>
                    {loadingOptions ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={18} sx={{ color: HOME.gold }} />
                        <Typography variant="body2" sx={{ color: HOME.inkMuted }}>
                          Loading levels…
                        </Typography>
                      </Stack>
                    ) : levelOptions.length === 0 ? (
                      <Typography variant="body2" sx={{ color: HOME.inkMuted }}>
                        {selectedClass ? "No terms available for this class." : "Select a class first."}
                      </Typography>
                    ) : (
                      <RadioGroup
                        value={selectedTerm?.id || ""}
                        onChange={(e) => {
                          const term = levelOptions.find((t) => t.id === e.target.value);
                          setSelectedTerm(term);
                        }}
                        sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 320, overflowY: "auto", pr: 0.5 }}
                      >
                        {levelOptions.map((term) => (
                          <FormControlLabel
                            key={term.id}
                            value={term.id}
                            control={<Radio size="small" />}
                            label={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: HOME.navyDeep }}>
                                {term.name}
                                {!selectedClass && term.className ? (
                                  <Box component="span" sx={{ color: HOME.inkSoft, fontWeight: 500 }}>
                                    {" "}
                                    ({term.className})
                                  </Box>
                                ) : null}
                              </Typography>
                            }
                            sx={radioOptionSx(selectedTerm?.id === term.id)}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                </FormPanel>
              </Grid>

              <Grid size={12}>
                <FormPanel title="Applicant details" icon={<PersonOutlineIcon fontSize="small" />}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        required
                        label="Applicant full name"
                        name="applicantName"
                        value={formData.applicantName}
                        onChange={handleChange}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Applicant phone"
                        name="applicantPhone"
                        value={formData.applicantPhone}
                        onChange={handleChange}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Applicant email"
                        name="applicantEmail"
                        type="email"
                        value={formData.applicantEmail}
                        onChange={handleChange}
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </FormPanel>
              </Grid>

              <Grid size={12}>
                <FormPanel title="Student details & documents" icon={<PersonOutlineIcon fontSize="small" />}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Student full name"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        sx={textFieldSx}
                      />
                    </Grid>
                    {FILE_FIELDS.map(({ name, label, accept }) => (
                      <Grid key={name} size={{ xs: 12, md: 6 }}>
                        <TextField
                          key={`${name}-${fileInputKeys[name]}`}
                          fullWidth
                          label={label}
                          name={name}
                          type="file"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <UploadIcon sx={{ color: HOME.gold }} />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                          onChange={handleFileChange}
                          sx={textFieldSx}
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
                </FormPanel>
              </Grid>
            </Grid>

            <Box sx={{ mt: { xs: 2, md: 3 } }}>
              <HomePrimaryButton
                type="submit"
                fullWidth
                disabled={loading || uploading || !selectedClass || !selectedTerm}
                sx={{
                  py: 1.5,
                  fontSize: "1.05rem",
                  opacity: loading || uploading || !selectedClass || !selectedTerm ? 0.65 : 1,
                }}
              >
                {loading || uploading ? (
                  <CircularProgress size={24} sx={{ color: HOME.navyDeep }} />
                ) : (
                  "Submit application"
                )}
              </HomePrimaryButton>
            </Box>
          </Box>
        </Box>
      </HomeSectionShell>
    </Box>
  );
}
