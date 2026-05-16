import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
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
import { loginMarketplaceUser } from "../api";
import BrandLogoMark from "../components/common/BrandLogoMark";

/** Elimu Plus palette — navy + red accent */
const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  red: "#DC2626",
  redDark: "#B91C1C",
  redLight: "#F87171",
};
const LOGIN_BTN_GRAD = `linear-gradient(145deg, ${BRAND.red}, ${BRAND.redDark})`;

const BG_LIGHT = "#f0f4fa";

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
    text: "Stay connected with news, events, and your child’s progress.",
  },
];

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
  const heroCount = HERO_IMAGE_CANDIDATES.length;

  useEffect(() => {
    if (heroCount <= 1) return undefined;
    const id = window.setInterval(
      () => setSlideIndex((i) => (i + 1) % heroCount),
      6500
    );
    return () => window.clearInterval(id);
  }, [heroCount]);

  const handleRoleTabChange = (_, newValue) => {
    setRoleTab(newValue);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) {
      Swal.fire({
        icon: "error",
        title: "Login",
        text: "Please enter your email or username and password.",
        confirmButtonColor: BRAND.red,
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
          confirmButtonColor: BRAND.red,
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
          confirmButtonColor: BRAND.red,
        });
        return;
      }
      localStorage.setItem("marketplace_token", token);
      localStorage.setItem("marketplace_user", JSON.stringify(user));
      localStorage.setItem(
        "portal_login_role",
        roleTab === 0 ? "parent" : "student"
      );
      Swal.fire({
        icon: "success",
        title: "Welcome back!",
        timer: 1200,
        showConfirmButton: false,
        confirmButtonColor: BRAND.red,
      });
      navigate(returnTo, { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.message || "Login failed.",
        confirmButtonColor: BRAND.red,
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
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        bgcolor: BG_LIGHT,
      }}
    >
      {/* Left: rotating hero imagery */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "50%",
          flex: "0 0 50%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: BRAND.navyDeep,
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
              transition: "opacity 1.8s ease-in-out",
              zIndex: 0,
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(165deg, rgba(8,22,43,0.88) 0%, rgba(12,35,64,0.55) 45%, rgba(8,22,43,0.82) 100%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 2, p: "clamp(0.75rem, 1.5vh, 1.5rem)", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BrandLogoMark
              size={52}
              sx={{
                height: { xs: 44, sm: 52 },
                maxWidth: "min(260px, 85vw)",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            px: "clamp(0.75rem, 1.5vh, 1.5rem)",
            py: "clamp(0.5rem, 2vh, 2rem)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              color: "white",
              maxWidth: 440,
              lineHeight: 1.2,
              mb: "clamp(0.5rem, 1.5vh, 1.5rem)",
              fontSize: "clamp(1.25rem, 2.8vh, 1.85rem)",
            }}
          >
            Learn • Grow •{" "}
            <Box component="span" sx={{ color: BRAND.redLight }}>
              Excel
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "clamp(0.9rem, 1.5vh, 1.05rem)",
              maxWidth: 460,
              mb: "clamp(1rem, 2vh, 1.75rem)",
              lineHeight: 1.5,
            }}
          >
            Excellence in education with a global outlook — preparing young minds for tomorrow&apos;s
            legacy.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(0.5rem, 1vh, 1rem)",
              maxWidth: 480,
            }}
          >
            {FEATURE_ITEMS.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: "clamp(0.5rem, 1.2vh, 1rem)",
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Box
                  sx={{
                    color: BRAND.redLight,
                    mb: 0.5,
                    "& .MuiSvgIcon-root": { fontSize: "clamp(22px, 2.5vh, 28px)" },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "white",
                    mb: 0.25,
                    fontSize: "clamp(0.85rem, 1.5vh, 1rem)",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.8rem, 1.3vh, 0.95rem)" }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, p: "clamp(0.5rem, 1vh, 1rem)", flexShrink: 0 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: "clamp(0.8rem, 1.2vh, 0.95rem)" }}>
            © {new Date().getFullYear()} Elimu Plus. Learn • Grow • Excel.
          </Typography>
        </Box>
      </Box>

      {/* Right: login */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pt: { xs: 5, sm: 6 },
          px: "clamp(0.5rem, 2vh, 1.5rem)",
          pb: "clamp(0.5rem, 1.5vh, 1rem)",
          bgcolor: BG_LIGHT,
          overflow: "auto",
          position: "relative",
          fontFamily: '"Open Sans", "Segoe UI", sans-serif',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          disableRipple
          sx={{
            position: "absolute",
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
            color: BRAND.navyDeep,
            fontSize: "0.95rem",
            textTransform: "none",
            fontWeight: 600,
            outline: "none",
            "&:focus": { outline: "none", boxShadow: "none" },
            "&:focus-visible": { outline: "none", boxShadow: "none" },
            "&:hover": { color: BRAND.red, backgroundColor: "transparent" },
          }}
        >
          Back to Home
        </Button>

        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            flexDirection: "column",
            alignItems: "center",
            mb: "clamp(0.5rem, 1.5vh, 1rem)",
            flexShrink: 0,
          }}
        >
          <BrandLogoMark
            size={56}
            sx={{
              mx: "auto",
              mb: 0.5,
              height: { xs: 48, sm: 56 },
              maxWidth: "min(280px, 90vw)",
            }}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            maxHeight: { xs: "none", lg: "min(78vh, 560px)" },
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid rgba(12, 35, 64, 0.15)`,
            boxShadow: "0 25px 50px -12px rgba(8, 22, 43, 0.12)",
            flexShrink: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            mt: 1.5,
          }}
        >
          <Tabs
            value={roleTab}
            onChange={handleRoleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              minHeight: 48,
              bgcolor: "rgba(12, 35, 64, 0.04)",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                py: 1.25,
                fontSize: "1rem",
                color: BRAND.navy,
                outline: "none",
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
                "&.Mui-focusVisible": {
                  outline: "none",
                  boxShadow: "none",
                  backgroundColor: "transparent",
                },
              },
              "& .Mui-selected": { color: BRAND.red },
              "& .MuiTabs-indicator": { backgroundColor: BRAND.red, height: 3 },
              "& .MuiTab-root:hover": { color: BRAND.red, opacity: 0.95 },
            }}
          >
            <Tab label="Parent login" disableRipple />
            <Tab label="Student login" disableRipple />
          </Tabs>

          <Box sx={{ p: "clamp(0.75rem, 1.5vh, 1.5rem)", flex: 1, minHeight: 0, overflow: "auto" }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 700,
                mb: 0.25,
                fontSize: "clamp(1.25rem, 2.5vh, 1.75rem)",
                color: BRAND.navyDeep,
              }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: "clamp(0.5rem, 1.5vh, 1rem)",
                fontSize: "clamp(0.95rem, 1.8vh, 1.05rem)",
                color: "rgba(8, 22, 43, 0.85)",
              }}
            >
              {roleTab === 0
                ? "Sign in to the parent portal for news, fees, and your child’s school updates."
                : "Sign in to your student portal for assignments, schedules, and resources."}
            </Typography>

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: "flex", flexDirection: "column", gap: "clamp(0.5rem, 1.2vh, 1rem)" }}
            >
              <TextField
                fullWidth
                type="email"
                label="Email or username"
                placeholder="you@family.com or your username"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: BRAND.navy, fontSize: 24 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "1rem",
                    "& .MuiOutlinedInput-notchedOutline": {},
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: BRAND.red,
                      borderWidth: 2,
                    },
                  },
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: BRAND.navy },
                  "& label.Mui-focused": { color: BRAND.red },
                  "& .MuiInputBase-input": { fontSize: "1rem", color: BRAND.navyDeep },
                }}
              />
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: BRAND.navy, fontSize: 24 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        disableRipple
                        sx={{
                          outline: "none",
                          color: BRAND.navy,
                          "&:focus": { outline: "none" },
                          "&:focus-visible": { outline: "none", boxShadow: "none" },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: "1rem",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: BRAND.red,
                      borderWidth: 2,
                    },
                  },
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: BRAND.navy },
                  "& label.Mui-focused": { color: BRAND.red },
                  "& .MuiInputBase-input": { fontSize: "1rem", color: BRAND.navyDeep },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Link
                  href="#"
                  variant="body2"
                  onClick={(e) => e.preventDefault()}
                  sx={{
                    color: BRAND.red,
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disableRipple
                disabled={loginLoading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  background: LOGIN_BTN_GRAD,
                  color: "#fff",
                  textTransform: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 10px 25px rgba(220, 38, 38, 0.28)",
                  outline: "none",
                  "&:focus": { outline: "none", boxShadow: "0 10px 25px rgba(220, 38, 38, 0.28)" },
                  "&:focus-visible": { outline: "none", boxShadow: "0 10px 25px rgba(220, 38, 38, 0.28)" },
                  "&:hover": {
                    background: BRAND.redDark,
                    boxShadow: "0 12px 28px rgba(185, 28, 28, 0.35)",
                  },
                }}
              >
                {loginLoading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : roleTab === 0 ? (
                  "Sign in as parent"
                ) : (
                  "Sign in as student"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>

      </Box>
    </Box>
  );
}
