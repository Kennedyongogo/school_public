import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogContent,
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
  ArrowForward,
  SchoolOutlined,
  EmojiEventsOutlined,
  FavoriteBorderOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { postContact } from "../api";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomePrimaryButton,
  HomeGhostButton,
} from "../components/Home/homeUi";
import DicedImageGrid from "../components/About/DicedImageGrid";

const SLIDE_INTERVAL_MS = 6500;

const ABOUT_PAGE_IMAGES = [
  "anilsharma26-children-7047124_1920.jpg",
  "ernestoeslava-bus-2690793_1920.jpg",
  "startupstockphotos-children-593313_1920.jpg",
];

const CORE_VALUES = [
  { icon: Gavel, title: "Integrity", description: "Honesty, fairness, and accountability in everything we do." },
  { icon: Lightbulb, title: "Curiosity", description: "Encouraging inquiry, creativity, and love of learning." },
  { icon: WorkspacePremium, title: "Excellence", description: "High expectations for teaching, learning, and conduct." },
  { icon: Nature, title: "Respect", description: "Valuing every individual and our shared environment." },
  { icon: Groups, title: "Community", description: "Strong partnerships among students, staff, and families." },
];

const STATS = [
  { value: "500+", label: "Students", icon: <SchoolOutlined /> },
  { value: "45+", label: "Faculty & staff", icon: <Groups /> },
  { value: "95%", label: "Parent satisfaction", icon: <FavoriteBorderOutlined /> },
];

const MOTTO = ["Learn", "Grow", "Excel"];

function aboutPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

const cardShellSx = {
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

function AboutHero({ slideIndex, onSelectSlide, imageUrls, onMeetTeam, onApply }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        minHeight: { xs: "auto", lg: "min(88vh, 720px)" },
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: { lg: "1 1 55%" },
          minHeight: { xs: 320, sm: 400, lg: "auto" },
          overflow: "hidden",
        }}
      >
        {imageUrls.map((src, i) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt={`${HOME.name} campus life`}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === slideIndex ? 1 : 0,
              transform: i === slideIndex ? "scale(1)" : "scale(1.04)",
              transition: "opacity 1.8s ease-in-out, transform 8s ease-out",
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(8,22,43,0.15) 0%, rgba(8,22,43,0.05) 40%, rgba(8,22,43,0.45) 100%)`,
            pointerEvents: "none",
          }}
        />
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ position: "absolute", bottom: 20, left: 20 }}
        >
          {imageUrls.map((_, i) => (
            <Box
              key={i}
              component="button"
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => onSelectSlide(i)}
              sx={{
                width: i === slideIndex ? 28 : 8,
                height: 8,
                p: 0,
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                bgcolor: i === slideIndex ? HOME.gold : "rgba(255,255,255,0.45)",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { lg: "1 1 45%" },
          display: "flex",
          alignItems: "center",
          bgcolor: HOME.warmWhite,
          borderLeft: { lg: `1px solid ${HOME.border}` },
          px: { xs: 2.5, sm: 3.5, lg: 5 },
          py: { xs: 4, sm: 5, lg: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 520 }}>
          <Chip
            label="About our school"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              height: 28,
              bgcolor: "rgba(201, 162, 39, 0.12)",
              color: HOME.navyDeep,
              border: `1px solid ${HOME.borderGold}`,
            }}
          />
          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2.35rem", sm: "2.75rem", lg: "3.1rem" },
              lineHeight: 1.1,
              color: HOME.navyDeep,
              mb: 2,
            }}
          >
            Where young minds{" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              learn, lead
            </Box>
            , and grow
          </Typography>
          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.75,
              mb: 2,
            }}
          >
            {HOME.name} offers a nurturing, rigorous education that blends academic excellence with
            character development and a global outlook.
          </Typography>
          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.75,
              mb: 3,
            }}
          >
            Guided by our motto — Learn • Grow • Excel — we partner with families to create a safe,
            inspiring environment where every child can thrive.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3.5 }}>
            {MOTTO.map((word) => (
              <Chip
                key={word}
                label={word}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: HOME.sky,
                  color: HOME.navyDeep,
                  border: `1px solid ${HOME.border}`,
                }}
              />
            ))}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <HomePrimaryButton endIcon={<ArrowForward />} onClick={onMeetTeam}>
              Meet our team
            </HomePrimaryButton>
            <HomeGhostButton onClick={onApply}>Apply for admission</HomeGhostButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function PillarCard({ eyebrow, headline, subline, icon: Icon, items, checkIcon: CheckIcon }) {
  return (
    <Box sx={cardShellSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
          <Typography
            sx={{
              color: HOME.gold,
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {eyebrow}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "rgba(201, 162, 39, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 26, color: HOME.gold }} />
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontSize: { xs: "2rem", md: "2.35rem" },
              fontWeight: 700,
              color: HOME.navyDeep,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </Typography>
          <Typography sx={{ color: HOME.gold, fontWeight: 700, fontSize: "1rem", mt: 0.5 }}>
            {subline}
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ mt: "auto" }}>
          {items.map((text) => (
            <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start">
              <CheckIcon sx={{ color: HOME.gold, fontSize: 22, mt: 0.25, flexShrink: 0 }} />
              <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.65, fontSize: "0.98rem" }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function ValueCard({ icon: Icon, title, description }) {
  return (
    <Box
      sx={{
        ...cardShellSx,
        p: { xs: 2.5, md: 3 },
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "rgba(201, 162, 39, 0.12)",
          border: `1px solid ${HOME.borderGold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 28, color: HOME.gold }} />
      </Box>
      <Typography
        sx={{
          fontFamily: HOME.fontDisplay,
          fontSize: "1.35rem",
          fontWeight: 700,
          color: HOME.navyDeep,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.65, fontSize: "0.95rem" }}>
        {description}
      </Typography>
    </Box>
  );
}

function ContactDialog({ open, onClose, formData, onChange, onSubmit, loading }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${HOME.border}`,
          boxShadow: HOME.shadowLg,
        },
      }}
    >
      <Box sx={{ height: 4, background: HOME.navyGradient }} />
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: HOME.navyDeep,
          color: "#fff",
        }}
      >
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.5rem" }}>
          Contact us
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }} aria-label="Close">
          <Close />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: HOME.sky }}>
        <Box
          component="form"
          onSubmit={onSubmit}
          id="about-contact-form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            label="Full name"
            required
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Phone number"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 } }}
          />
          <FormControl fullWidth>
            <InputLabel>Inquiry topic</InputLabel>
            <Select
              value={formData.serviceType}
              onChange={(e) => onChange("serviceType", e.target.value)}
              label="Inquiry topic"
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
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
            onChange={(e) => onChange("message", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2 } }}
          />
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600, color: HOME.navy }}>
              Cancel
            </Button>
            <HomePrimaryButton
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
            >
              {loading ? "Sending…" : "Send message"}
            </HomePrimaryButton>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });

  const imageUrls = ABOUT_PAGE_IMAGES.map(aboutPublicUrl);
  const leadershipSlides = [
    { title: "Campus life", image: imageUrls[0] },
    { title: "School community", image: imageUrls[1] },
    { title: "Learning together", image: imageUrls[2] },
    { title: "Student life", image: imageUrls[0] },
  ];

  useEffect(() => {
    if (imageUrls.length <= 1) return undefined;
    const id = window.setInterval(
      () => setSlideIndex((i) => (i + 1) % imageUrls.length),
      SLIDE_INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [imageUrls.length]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setFormData({ fullName: "", email: "", phone: "", serviceType: "", message: "" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please fill in all required fields.",
        confirmButtonColor: HOME.gold,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonColor: HOME.gold,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await postContact(formData);
      if (!data.success) throw new Error(data.message || "Failed to send message");
      Swal.fire({
        icon: "success",
        title: "Message sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        confirmButtonColor: HOME.gold,
      });
      handleCloseDialog();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: HOME.gold,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: HOME.cream,
        display: "flex",
        flexDirection: "column",
        fontFamily: HOME.fontBody,
        width: "100%",
      }}
    >
      {/* Hero */}
      <HomeSectionShell
        id="about-hero"
        bg={{ bgcolor: HOME.warmWhite }}
        sx={{ borderBottom: `1px solid ${HOME.border}` }}
      >
        <AboutHero
          slideIndex={slideIndex}
          onSelectSlide={setSlideIndex}
          imageUrls={imageUrls}
          onMeetTeam={() => navigate("/meet-our-team")}
          onApply={() => navigate("/admission/apply")}
        />
      </HomeSectionShell>

      {/* Mission & Vision */}
      <HomeSectionShell bg={{ py: { xs: 5, md: 7 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <HomeSectionHeader
            eyebrow="Our direction"
            title="Mission &"
            titleAccent="vision"
            subtitle="The purpose that guides every lesson, every relationship, and every milestone at our school."
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 2, md: 2.5 },
              width: "100%",
            }}
          >
            <PillarCard
              eyebrow="Our mission"
              headline="Excellence"
              subline="Every learner"
              icon={RocketLaunch}
              checkIcon={CheckCircle}
              items={[
                "Deliver outstanding teaching and pastoral care so students achieve their academic potential.",
                "Foster curiosity, creativity, and confidence through inquiry-based learning and rich co-curricular programs.",
                "Build partnerships with families and the wider community to support wellbeing and lifelong success.",
              ]}
            />
            <PillarCard
              eyebrow="Our vision"
              headline="Tomorrow"
              subline="Global citizens"
              icon={Visibility}
              checkIcon={Verified}
              items={[
                "Graduates who think critically, act ethically, and contribute positively to society.",
                "A vibrant school culture rooted in respect, inclusion, and international mindedness.",
                "Leadership in holistic education — blending academics, arts, athletics, and service.",
              ]}
            />
          </Box>
        </Box>
      </HomeSectionShell>

      {/* Core values */}
      <HomeSectionShell bg={{ py: { xs: 5, md: 7 }, bgcolor: HOME.sky }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <HomeSectionHeader
            eyebrow="What we stand for"
            title="Core"
            titleAccent="values"
            subtitle="The principles that shape daily life at school — in classrooms, on the field, and in our community."
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {CORE_VALUES.map((value) => (
              <ValueCard key={value.title} {...value} />
            ))}
          </Box>
        </Box>
      </HomeSectionShell>

      {/* Leadership */}
      <HomeSectionShell bg={{ py: { xs: 5, md: 7 }, bgcolor: "#fff" }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: { xs: 4, lg: 5 },
              alignItems: "center",
            }}
          >
            <Box>
              <HomeSectionHeader
                align="left"
                eyebrow="Our people"
                title="Leadership &"
                titleAccent="faculty"
                subtitle="Experienced educators passionate about student wellbeing, academic rigor, and personalised guidance from early years through graduation."
                sx={{ mb: { xs: 3, md: 4 }, textAlign: "left", alignItems: "flex-start" }}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(3, auto)" },
                  gap: { xs: 1.5, sm: 3 },
                  mb: 3,
                }}
              >
                {STATS.map(({ value, label, icon }) => (
                  <Box key={label}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Box sx={{ color: HOME.gold, lineHeight: 0 }}>{icon}</Box>
                      <Typography
                        sx={{
                          fontFamily: HOME.fontDisplay,
                          fontSize: { xs: "1.75rem", md: "2.25rem" },
                          fontWeight: 700,
                          color: HOME.gold,
                          lineHeight: 1,
                        }}
                      >
                        {value}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: HOME.inkSoft,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <HomePrimaryButton endIcon={<ArrowForward />} onClick={() => navigate("/meet-our-team")}>
                Meet our team
              </HomePrimaryButton>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: { xs: "center", lg: "flex-end" },
                alignItems: "center",
              }}
            >
              <DicedImageGrid
                slides={leadershipSlides}
                sx={{ width: "100%", maxWidth: { xs: 360, sm: 440, lg: 520 } }}
              />
            </Box>
          </Box>
        </Box>
      </HomeSectionShell>

      {/* CTA */}
      <HomeSectionShell bg={{ py: { xs: 5, md: 6 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 3, md: 4 },
              background: HOME.navyGradient,
              border: `1px solid ${HOME.borderGold}`,
              boxShadow: HOME.shadowLg,
              px: { xs: 3, sm: 5, md: 7 },
              py: { xs: 5, md: 6 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -80,
                right: -60,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${HOME.gold}22 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: 640, mx: "auto" }}>
              <Chip
                icon={<EmojiEventsOutlined sx={{ color: `${HOME.gold} !important` }} />}
                label="Take the next step"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: HOME.goldMuted,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <Typography
                component="h2"
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.65rem" },
                  color: "#fff",
                  lineHeight: 1.15,
                  mb: 1.5,
                }}
              >
                Ready to explore {HOME.name}?
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.7,
                  mb: 3.5,
                  maxWidth: 480,
                  mx: "auto",
                }}
              >
                Start your admission journey or get in touch — we are here to welcome your family.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <HomePrimaryButton onClick={() => navigate("/admission/apply")}>
                  Apply for admission
                </HomePrimaryButton>
                <HomeGhostButton light onClick={() => setOpenDialog(true)}>
                  Contact us
                </HomeGhostButton>
                <HomeGhostButton light onClick={() => navigate("/")}>
                  Back to home
                </HomeGhostButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </HomeSectionShell>

      <ContactDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Box>
  );
}
