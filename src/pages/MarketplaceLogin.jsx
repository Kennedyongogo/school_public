import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  School,
  MenuBook,
  Groups,
  VerifiedUser,
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { loginMarketplaceUser, savePortalSession } from "../api";
import BrandLogoMark from "../components/common/BrandLogoMark";
import { HOME, homeGlassSx } from "../components/Home/homeShared";
import { HomeGhostButton, HomePrimaryButton } from "../components/Home/homeUi";

const HERO_IMAGE_CANDIDATES = [
  "anilsharma26-children-7047124_1920.jpg",
  "ernestoeslava-bus-2690793_1920.jpg",
  "startupstockphotos-children-593313_1920.jpg",
];

function heroPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

const FEATURE_ITEMS = [
  {
    icon: <MenuBook />,
    title: "Academic excellence",
    text: "Rigorous programmes and inspiring teaching in every classroom.",
  },
  {
    icon: <School />,
    title: "Holistic growth",
    text: "Arts, athletics, and character alongside strong academics.",
  },
  {
    icon: <Groups />,
    title: "Safe community",
    text: "Pastoral care and wellbeing at the heart of school life.",
  },
  {
    icon: <VerifiedUser />,
    title: "Parent partnership",
    text: "Stay connected with news, events, and your child's progress.",
  },
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
  "& .MuiInputBase-input": { color: HOME.navyDeep, fontSize: "1rem" },
};

export default function MarketplaceLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo =
    typeof location.state?.returnTo === "string" && location.state.returnTo.startsWith("/")
      ? location.state.returnTo
      : "/portal";
  const [roleTab, setRoleTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const heroUrls = HERO_IMAGE_CANDIDATES.map(heroPublicUrl);

  useEffect(() => {
    if (heroUrls.length <= 1) return undefined;
    const id = window.setInterval(() => setSlideIndex((i) => (i + 1) % heroUrls.length), 6500);
    return () => window.clearInterval(id);
  }, [heroUrls.length]);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const swalGold = { confirmButtonColor: HOME.gold };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) {
      Swal.fire({
        icon: "error",
        title: "Login",
        text: "Please enter your email or username and password.",
        ...swalGold,
      });
      return;
    }
    setLoginLoading(true);
    try {
      const response = await loginMarketplaceUser({
        email: emailOrPhone.trim().toLowerCase(),
        password,
      });
      const payload = response.data || response;
      const token = payload.token;
      const user = payload.user;
      if (!token || !user) {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: "Invalid response from server.",
          ...swalGold,
        });
        return;
      }
      const expectedRole = roleTab === 0 ? "parent" : "student";
      if (user.role !== expectedRole) {
        Swal.fire({
          icon: "warning",
          title: "Wrong login tab",
          text:
            expectedRole === "parent"
              ? "This email belongs to a student account. Switch to the Student login tab."
              : "This email belongs to a parent account. Switch to the Parent login tab.",
          ...swalGold,
        });
        return;
      }
      savePortalSession({
        token,
        user,
        portalLoginRole: roleTab === 0 ? "parent" : "student",
      });
      Swal.fire({
        icon: "success",
        title: "Welcome back!",
        timer: 1200,
        showConfirmButton: false,
        ...swalGold,
      });
      navigate(returnTo, { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.message || "Login failed.",
        ...swalGold,
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        height: "100dvh",
        maxHeight: "100dvh",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: HOME.cream,
        fontFamily: HOME.fontBody,
      }}
    >
      {/* Left hero */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "50%",
          flex: "0 0 50%",
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: HOME.navyDeep,
          overflow: "hidden",
          position: "relative",
          minHeight: 0,
        }}
      >
        {heroUrls.map((src, i) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === slideIndex ? 1 : 0,
              transform: i === slideIndex ? "scale(1)" : "scale(1.04)",
              transition: "opacity 1.8s ease-in-out, transform 8s ease-out",
              zIndex: 0,
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: HOME.heroOverlay,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 2, p: 3, flexShrink: 0 }}>
          <BrandLogoMark
            size={52}
            sx={{
              height: 52,
              maxWidth: 260,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
            }}
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            px: 3,
            py: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Chip
            label="Parent & student portal"
            sx={{
              mb: 2,
              width: "fit-content",
              fontWeight: 700,
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              bgcolor: "rgba(201, 162, 39, 0.15)",
              color: HOME.goldMuted,
              border: `1px solid ${HOME.borderGold}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              color: "#fff",
              maxWidth: 440,
              lineHeight: 1.15,
              mb: 1.5,
              fontSize: "clamp(1.75rem, 3vh, 2.25rem)",
            }}
          >
            Learn • Grow •{" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              Excel
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "1.05rem",
              maxWidth: 460,
              mb: 2.5,
              lineHeight: 1.65,
            }}
          >
            Excellence in education with a global outlook — preparing young minds for tomorrow&apos;s
            legacy.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.25,
              maxWidth: 500,
            }}
          >
            {FEATURE_ITEMS.map((item) => (
              <Box
                key={item.title}
                sx={{
                  ...homeGlassSx({ radius: 2 }),
                  p: 1.5,
                }}
              >
                <Box sx={{ color: HOME.goldMuted, mb: 0.75, lineHeight: 0 }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 700, color: "#fff", mb: 0.25, fontSize: "0.9rem" }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Stack direction="row" spacing={0.75} sx={{ mt: 2.5 }}>
            {heroUrls.map((_, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlideIndex(i)}
                sx={{
                  width: i === slideIndex ? 24 : 8,
                  height: 8,
                  p: 0,
                  border: "none",
                  borderRadius: "999px",
                  cursor: "pointer",
                  bgcolor: i === slideIndex ? HOME.gold : "rgba(255,255,255,0.35)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, p: 3, flexShrink: 0 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
            © {new Date().getFullYear()} {HOME.name}. Learn • Grow • Excel.
          </Typography>
        </Box>
      </Box>

      {/* Right: login form */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: HOME.cream,
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexShrink: 0, px: { xs: 1.25, sm: 2 }, pt: { xs: 1.25, sm: 1.5 }, pb: 0.5 }}>
          <HomeGhostButton onClick={() => navigate("/")} startIcon={<ArrowBack />} sx={{ fontSize: "0.875rem" }}>
            Back to home
          </HomeGhostButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 1.25, sm: 2 },
            pb: { xs: 1.25, sm: 1.5 },
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", lg: "none" },
              flexDirection: "column",
              alignItems: "center",
              mb: { xs: 1, sm: 1.25 },
              flexShrink: 0,
            }}
          >
            <BrandLogoMark size={48} sx={{ height: 40, maxWidth: 240 }} />
          </Box>

          <Box
            sx={{
              width: "100%",
              maxWidth: 420,
              flexShrink: 1,
              minHeight: 0,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
              boxShadow: HOME.shadowLg,
            }}
          >
            <Box sx={{ height: 4, background: HOME.navyGradient }} />

            <Box sx={{ p: { xs: 1.75, sm: 2 }, pb: 1 }}>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.45rem", sm: "1.6rem" },
                  color: HOME.navyDeep,
                  textAlign: "center",
                  mb: 0.25,
                }}
              >
                Welcome back
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: HOME.inkMuted, textAlign: "center", mb: 1.25, lineHeight: 1.5, fontSize: "0.875rem" }}
              >
                Sign in to your school portal
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tabs
                  value={roleTab}
                  onChange={(_, v) => setRoleTab(v)}
                  sx={{
                    minHeight: 40,
                    bgcolor: "rgba(12, 35, 64, 0.06)",
                    borderRadius: "999px",
                    p: 0.4,
                    border: `1px solid ${HOME.border}`,
                    mb: 1.25,
                    "& .MuiTabs-indicator": { display: "none" },
                    "& .MuiTabs-flexContainer": { gap: 0.5 },
                  }}
                >
                  {["Parent login", "Student login"].map((label, i) => (
                    <Tab
                      key={label}
                      label={label}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        fontFamily: HOME.fontBody,
                        minHeight: 34,
                        py: 0.5,
                        px: { xs: 1.75, sm: 2.25 },
                        borderRadius: "999px",
                        color: HOME.navy,
                        opacity: roleTab === i ? 1 : 0.65,
                        bgcolor: roleTab === i ? "#fff" : "transparent",
                        boxShadow: roleTab === i ? HOME.shadowSm : "none",
                        transition: "all 0.2s ease",
                        "&.Mui-selected": { color: HOME.navyDeep },
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: HOME.inkMuted,
                  mb: 0,
                  lineHeight: 1.5,
                  fontSize: "0.84rem",
                  textAlign: "center",
                }}
              >
                {roleTab === 0
                  ? "Access fees, report cards, events, and school updates for your family."
                  : "Access classes, exams, schedules, and learning resources."}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{
                px: { xs: 1.75, sm: 2 },
                pb: { xs: 2, sm: 2.25 },
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
            <TextField
              fullWidth
              size="small"
              type="email"
              label="Email or username"
              placeholder="you@family.com"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle sx={{ color: HOME.gold, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: HOME.gold, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      sx={{ color: HOME.navy }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="#"
                variant="body2"
                onClick={(e) => e.preventDefault()}
                sx={{
                  color: HOME.gold,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  "&:hover": { textDecoration: "underline", color: HOME.navyDeep },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <HomePrimaryButton
              type="submit"
              fullWidth
              disabled={loginLoading}
              sx={{ py: 1.1, fontSize: "0.95rem", mt: 0.25 }}
            >
              {loginLoading ? (
                <CircularProgress size={22} sx={{ color: HOME.navyDeep }} />
              ) : roleTab === 0 ? (
                "Sign in as parent"
              ) : (
                "Sign in as student"
              )}
            </HomePrimaryButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
