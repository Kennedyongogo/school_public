import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  RocketLaunch,
  Visibility,
  CheckCircle,
  Verified,
  Gavel,
  Lightbulb,
  WorkspacePremium,
  Nature,
  Groups,
  Close,
  Send,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { postContact } from "../api";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};
const LOGIN_BTN_GRAD = `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`;

const ABOUT_PAGE_IMAGES = [
  "anilsharma26-children-7047124_1920.jpg",
  "ernestoeslava-bus-2690793_1920.jpg",
  "startupstockphotos-children-593313_1920.jpg",
];

function aboutPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

export default function Team() {
  const navigate = useNavigate();
  const [aboutSlideIndex, setAboutSlideIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      serviceType: "",
      message: "",
    });
  };

  const aboutHeroUrls = ABOUT_PAGE_IMAGES.map(aboutPublicUrl);
  const leadershipGridUrls = [...aboutHeroUrls, aboutHeroUrls[0]];
  const aboutHeroCount = ABOUT_PAGE_IMAGES.length;

  useEffect(() => {
    if (aboutHeroCount <= 1) return undefined;
    const id = window.setInterval(
      () => setAboutSlideIndex((i) => (i + 1) % aboutHeroCount),
      6500
    );
    return () => window.clearInterval(id);
  }, [aboutHeroCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields (Full Name, Email, and Message).",
        confirmButtonColor: BRAND.gold,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: BRAND.gold,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await postContact(formData);
      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        confirmButtonColor: BRAND.gold,
      });
      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: BRAND.gold,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f4fa",
        display: "flex",
        flexDirection: "column",
        pt: 0,
        pb: 1,
        fontFamily: '"Open Sans", "Segoe UI", sans-serif',
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <Card
        sx={{
          mt: 0,
          mx: 0.3,
          mb: 0.15,
          borderRadius: { xs: 3, md: 4 },
          border: `1px solid rgba(12, 35, 64, 0.12)`,
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box sx={{ pt: 0, pb: { xs: 2.5, md: 5 } }}>
          <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 4, md: 0 },
                alignItems: { xs: "center", md: "stretch" },
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", md: "50%" },
                  flex: { xs: "0 0 auto", md: "0 0 50%" },
                  minWidth: 0,
                  display: { xs: "flex", md: "block" },
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Card
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "400px", md: "none" },
                    aspectRatio: { xs: "4/3", md: "auto" },
                    height: { xs: "auto", md: "100%" },
                    minHeight: { xs: "300px", md: "400px" },
                    borderRadius: { xs: 3, md: "12px 0 0 12px" },
                    overflow: "hidden",
                    boxShadow: 6,
                    mx: { xs: "0.5rem", md: 0 },
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      minHeight: { xs: "300px", md: "400px" },
                    }}
                  >
                    {aboutHeroUrls.map((src, i) => (
                      <Box
                        key={src}
                        component="img"
                        src={src}
                        alt="Carlvyne International School"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: i === aboutSlideIndex ? 1 : 0,
                          transition: "opacity 1.8s ease-in-out",
                        }}
                      />
                    ))}
                  </Box>
                </Card>
              </Box>

              <Box
                sx={{
                  width: { xs: "100%", md: "50%" },
                  flex: { xs: "0 0 auto", md: "0 0 50%" },
                  minWidth: 0,
                  px: { xs: 0, md: 1.5 },
                  py: { xs: 0, md: 1.5 },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
                  <Box
                    sx={{
                      bgcolor: "rgba(201, 162, 39, 0.15)",
                      color: BRAND.navyDeep,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      px: 1,
                      py: 0.25,
                      borderRadius: "9999px",
                      width: "fit-content",
                      border: `1px solid rgba(201, 162, 39, 0.35)`,
                    }}
                  >
                    About Carlvyne
                  </Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontWeight: 900,
                      color: BRAND.navyDeep,
                      lineHeight: 1.15,
                      letterSpacing: "-0.035em",
                      whiteSpace: "nowrap",
                      width: "100%",
                      minWidth: 0,
                      fontSize: {
                        xs: "clamp(10px, calc((100vw - 36px) / 26), 1.65rem)",
                        md: "clamp(11px, calc((50vw - 72px) / 21), 2.35rem)",
                      },
                    }}
                  >
                    Where Young Minds{" "}
                    <span style={{ color: BRAND.gold }}>Learn, Lead</span>, and Grow
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(8, 22, 43, 0.92)",
                      fontSize: "1.25rem",
                      lineHeight: 1.75,
                    }}
                  >
                    Carlvyne International School offers a nurturing, rigorous education that blends
                    academic excellence with character development and a global outlook. Our learners
                    are encouraged to discover their strengths, respect diverse perspectives, and
                    prepare for university and life beyond the classroom.
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(8, 22, 43, 0.92)",
                      fontSize: "1.25rem",
                      lineHeight: 1.75,
                    }}
                  >
                    Guided by our motto — Learn • Lead • Succeed — we partner closely with families
                    and educators to create a safe, inspiring environment where every child can thrive.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/meet-our-team")}
                      sx={{
                        background: LOGIN_BTN_GRAD,
                        color: BRAND.navyDeep,
                        fontWeight: 700,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        minWidth: 140,
                        border: "1px solid rgba(255,255,255,0.35)",
                        boxShadow: "0 4px 14px rgba(12, 35, 64, 0.22)",
                        "&:hover": {
                          background: BRAND.goldMuted,
                          boxShadow: "0 6px 18px rgba(12, 35, 64, 0.26)",
                        },
                      }}
                    >
                      Meet our team
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: BRAND.navy,
                        color: BRAND.navy,
                        fontWeight: 700,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        minWidth: { xs: "auto", sm: 200 },
                        whiteSpace: { xs: "normal", sm: "nowrap" },
                        textAlign: "center",
                        lineHeight: 1.25,
                        borderWidth: 2,
                        "&:hover": {
                          borderColor: BRAND.gold,
                          bgcolor: "rgba(201, 162, 39, 0.08)",
                          borderWidth: 2,
                        },
                      }}
                      onClick={() => navigate("/portfolio")}
                    >
                      View our portfolio
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        <Box sx={{ bgcolor: "white", pt: 2, pb: 4 }}>
          <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  color: BRAND.navyDeep,
                  mb: 2,
                }}
              >
                Our Strategic Direction
              </Typography>
              <Box
                sx={{
                  width: 64,
                  height: 4,
                  bgcolor: BRAND.gold,
                  mx: "auto",
                  borderRadius: "9999px",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 0.3,
                width: "100%",
              }}
            >
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  border: `1px solid rgba(12, 35, 64, 0.12)`,
                  bgcolor: "#fafcfe",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  p: 4,
                  ml: 0.3,
                  "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography
                    sx={{
                      color: BRAND.gold,
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Our Mission
                  </Typography>
                  <RocketLaunch sx={{ fontSize: 40, color: BRAND.gold, opacity: 0.65 }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 3 }}>
                  <Typography sx={{ fontSize: { xs: "2.5rem", md: "3rem" }, fontWeight: 900, color: BRAND.navyDeep }}>
                    Excellence
                  </Typography>
                  <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: BRAND.gold }}>
                    Every learner
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    "Deliver outstanding teaching and pastoral care so students achieve their academic potential.",
                    "Foster curiosity, creativity, and confidence through inquiry-based learning and rich co-curricular programs.",
                    "Build partnerships with families and the wider community to support wellbeing and lifelong success.",
                  ].map((text, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 2 }}>
                      <CheckCircle sx={{ color: BRAND.gold, fontSize: 24 }} />
                      <Typography sx={{ fontSize: "1.125rem", fontWeight: 500, color: "rgba(8, 22, 43, 0.9)" }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  border: `1px solid rgba(12, 35, 64, 0.12)`,
                  bgcolor: "#fafcfe",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  p: 4,
                  mr: 0.3,
                  "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography
                    sx={{
                      color: BRAND.gold,
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Our Vision
                  </Typography>
                  <Visibility sx={{ fontSize: 40, color: BRAND.gold, opacity: 0.65 }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 3 }}>
                  <Typography sx={{ fontSize: { xs: "2.5rem", md: "3rem" }, fontWeight: 900, color: BRAND.navyDeep }}>
                    Tomorrow
                  </Typography>
                  <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: BRAND.gold }}>
                    Global citizens
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    "Graduates who think critically, act ethically, and contribute positively to society.",
                    "A vibrant school culture rooted in respect, inclusion, and international mindedness.",
                    "Leadership in holistic education — blending academics, arts, athletics, and service.",
                  ].map((text, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 2 }}>
                      <Verified sx={{ color: BRAND.gold, fontSize: 24 }} />
                      <Typography sx={{ fontSize: "1.125rem", fontWeight: 500, color: "rgba(8, 22, 43, 0.9)" }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>
          </Container>
        </Box>

        <Box sx={{ pt: 2, pb: 5, bgcolor: "#f0f4fa" }}>
          <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 700,
                  color: BRAND.navyDeep,
                  mb: 1,
                }}
              >
                Our Core Values
              </Typography>
              <Typography sx={{ color: "rgba(8, 22, 43, 0.85)", mt: 1, fontSize: "2rem" }}>
                The principles that shape daily life at Carlvyne
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: { xs: "nowrap", sm: "wrap", md: "nowrap" },
                width: "100%",
              }}
            >
              {[
                { icon: Gavel, title: "Integrity", description: "Honesty, fairness, and accountability in everything we do." },
                { icon: Lightbulb, title: "Curiosity", description: "Encouraging inquiry, creativity, and love of learning." },
                { icon: WorkspacePremium, title: "Excellence", description: "High expectations for teaching, learning, and conduct." },
                { icon: Nature, title: "Respect", description: "Valuing every individual and our shared environment." },
                { icon: Groups, title: "Community", description: "Strong partnerships among students, staff, and families." },
              ].map((value, index) => (
                <Paper
                  key={index}
                  sx={{
                    flex: { xs: "0 0 calc(100% - 1rem)", sm: "0 0 calc(50% - 1rem)", md: "1 1 0" },
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: `1px solid rgba(12, 35, 64, 0.1)`,
                    bgcolor: "white",
                    transition: "transform 0.3s",
                    minWidth: 0,
                    m: 0.7,
                    ml: index === 0 ? 1.5 : 0.7,
                    mr: index === 4 ? 1.5 : 0.7,
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: "rgba(201, 162, 39, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <value.icon sx={{ fontSize: 32, color: BRAND.gold }} />
                  </Box>
                  <Typography sx={{ fontSize: "1.375rem", fontWeight: 700, mb: 1, color: BRAND.navyDeep }}>
                    {value.title}
                  </Typography>
                  <Typography sx={{ fontSize: "1.125rem", color: "rgba(8, 22, 43, 0.88)" }}>{value.description}</Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        <Box sx={{ pt: 2, pb: 10, bgcolor: "white" }}>
          <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "center" }}>
              <Box sx={{ width: { xs: "100%", md: "50%" }, flexShrink: 0 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    fontWeight: 700,
                    color: BRAND.navyDeep,
                    mb: 3,
                  }}
                >
                  Our Leadership & Faculty
                </Typography>
                <Typography sx={{ fontSize: "1.25rem", color: "rgba(8, 22, 43, 0.92)", lineHeight: 1.75, mb: 3 }}>
                  Carlvyne is led by experienced educators and administrators who are passionate about student wellbeing
                  and academic rigor. Our teachers bring diverse backgrounds and ongoing professional development to the
                  classroom every day.
                </Typography>
                <Typography sx={{ fontSize: "1.25rem", color: "rgba(8, 22, 43, 0.92)", lineHeight: 1.75, mb: 4 }}>
                  Together with specialist staff in pastoral care, learning support, and activities, we ensure each learner
                  receives guidance tailored to their goals — from early years through graduation.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 1, md: 4 },
                    flexWrap: { xs: "nowrap", md: "wrap" },
                    justifyContent: { xs: "space-between", md: "flex-start" },
                  }}
                >
                  {[
                    ["500+", "Students"],
                    ["45+", "Faculty & Staff"],
                    ["95%", "Parent Satisfaction"],
                  ].map(([num, label]) => (
                    <Box key={label} sx={{ flex: { xs: 1, md: "none" }, textAlign: { xs: "center", md: "left" } }}>
                      <Typography sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 900, color: BRAND.gold }}>
                        {num}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.65rem", md: "0.75rem" },
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: BRAND.navyDeep,
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                sx={{
                  width: { xs: "100%", md: "50%" },
                  flexShrink: 0,
                  display: { xs: "flex", md: "block" },
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Card
                  sx={{
                    width: { xs: "calc(100% - 1rem)", md: "calc(100% - 0.5rem)" },
                    maxWidth: { xs: "400px", md: "100%" },
                    borderRadius: 3,
                    border: `1px solid rgba(12, 35, 64, 0.12)`,
                    bgcolor: "#fafcfe",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    p: { xs: 2, md: 2.5 },
                    mx: { xs: "0.5rem", md: "0.25rem" },
                    boxSizing: "border-box",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: { xs: 1, md: 1.5 },
                      width: "100%",
                      boxSizing: "border-box",
                      m: 0,
                    }}
                  >
                    {leadershipGridUrls.map((src, index) => (
                      <Box
                        key={`leadership-photo-${index}`}
                        sx={{
                          width: "100%",
                          aspectRatio: "1",
                          borderRadius: 3,
                          backgroundImage: `url("${src}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          boxShadow: 4,
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                        role="img"
                        aria-label={`Carlvyne campus life ${index + 1}`}
                      />
                    ))}
                  </Box>
                </Card>
              </Box>
            </Box>
          </Container>
        </Box>

        <Box sx={{ pt: 0, pb: 2 }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
            <Paper
              sx={{
                background: `linear-gradient(145deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 100%)`,
                color: "white",
                p: 6,
                borderRadius: 4,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                border: `1px solid rgba(201, 162, 39, 0.25)`,
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    fontWeight: 900,
                    mb: 2,
                    color: "white",
                  }}
                >
                  Ready to explore Carlvyne?
                </Typography>
                <Typography sx={{ fontSize: "1.125rem", opacity: 0.92, mb: 4, maxWidth: "42rem", mx: "auto" }}>
                  Ask about admissions, campus visits, or how we can support your child&apos;s journey.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    onClick={handleOpenDialog}
                    sx={{
                      background: LOGIN_BTN_GRAD,
                      color: BRAND.navyDeep,
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.35)",
                      "&:hover": { background: BRAND.goldMuted },
                    }}
                  >
                    Contact Admissions
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/")}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      color: "white",
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      borderWidth: 2,
                      "&:hover": {
                        borderColor: BRAND.goldMuted,
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderWidth: 2,
                      },
                    }}
                  >
                    Back to Home
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: BRAND.navyDeep,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Contact Us
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: "#f0f4fa" }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            id="contact-form"
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}
          >
            <TextField
              fullWidth
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
            />
            <FormControl fullWidth>
              <InputLabel>Inquiry topic</InputLabel>
              <Select
                value={formData.serviceType}
                onChange={(e) => handleInputChange("serviceType", e.target.value)}
                label="Inquiry topic"
                sx={{ bgcolor: "white", borderRadius: 2 }}
              >
                <MenuItem value="Admissions">Admissions</MenuItem>
                <MenuItem value="Fees & Finance">Fees & Finance</MenuItem>
                <MenuItem value="Academic Programs">Academic Programs</MenuItem>
                <MenuItem value="School Visit / Tour">School Visit / Tour</MenuItem>
                <MenuItem value="Pastoral / Student wellbeing">Pastoral / Student wellbeing</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={5}
              required
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0, bgcolor: "#f0f4fa", justifyContent: "center" }}>
          <Button onClick={handleCloseDialog} sx={{ mr: 2, textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="contact-form"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              px: 4,
              py: 1,
              background: LOGIN_BTN_GRAD,
              color: BRAND.navyDeep,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
