import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { theme } from "./theme";
import "./App.css";
import React, { useEffect, Suspense, lazy } from "react";
import PublicHeader from "./components/Header/PublicHeader";
import Footer from "./components/Footer/Footer";

const Home = lazy(() => import("./pages/Home"));
const Team = lazy(() => import("./pages/Team"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const MeetOurTeam = lazy(() => import("./pages/MeetOurTeam"));
const MarketplaceLogin = lazy(() => import("./pages/MarketplaceLogin"));
const PortalProfilePage = lazy(() => import("./pages/PortalProfilePage"));
const PortalClassesPage = lazy(() => import("./pages/PortalClassesPage"));
const PortalExamsPage = lazy(() => import("./pages/PortalExamsPage"));
const PortalExamTakePage = lazy(() => import("./pages/PortalExamTakePage"));
const PortalLiveMeetingPage = lazy(() => import("./pages/PortalLiveMeetingPage"));
const PortalPrivateLayout = lazy(() => import("./components/Portal/PortalPrivateLayout"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const hideHeader =
    location.pathname === "/marketplace" || location.pathname.startsWith("/portal");

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <PublicHeader />}
      <Box component="main" sx={{ flex: 1, width: "100%" }}>
        <Suspense
          fallback={
            <Box
              sx={{
                position: "fixed",
                top: "72px",
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "#f0f4fa",
                background:
                  "linear-gradient(135deg, rgba(240, 246, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(232, 238, 248, 0.96) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1399,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 20% 80%, rgba(12, 35, 64, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201, 162, 39, 0.08) 0%, transparent 50%)",
                  zIndex: -1,
                },
              }}
            >
              <Box sx={{ mb: 3, position: "relative", zIndex: 1, textAlign: "center", px: 2 }}>
                <Box
                  component="img"
                  src="/images/0437ecf6-7509-45a2-af0b-f514ef208228-removebg-preview.png"
                  alt="Carlvyne International School"
                  sx={{
                    height: { xs: 72, sm: 88 },
                    width: "auto",
                    mx: "auto",
                    display: "block",
                    mb: 2,
                    animation: "bounce 2s ease-in-out infinite",
                    filter: "drop-shadow(0 4px 12px rgba(12, 35, 64, 0.2))",
                  }}
                />

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#0c2340",
                    mb: 0.75,
                    textAlign: "center",
                    fontSize: { xs: "1.45rem", md: "1.85rem" },
                    fontFamily: '"Cormorant Garamond", serif',
                  }}
                >
                  Carlvyne International School
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#c9a227",
                    textAlign: "center",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: "0.95rem", md: "1.1rem" },
                  }}
                >
                  Learn • Lead • Succeed
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
                  {[0, 1, 2].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#c9a227",
                        animation: `pulse 1.5s ease-in-out infinite ${index * 0.2}s`,
                        boxShadow: "0 0 10px rgba(201, 162, 39, 0.45)",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#0c2340",
                  textAlign: "center",
                  fontWeight: 600,
                  position: "relative",
                  zIndex: 1,
                  mb: 1,
                  fontSize: "1.05rem",
                }}
              >
                Preparing your experience...
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#08162b",
                  textAlign: "center",
                  fontWeight: 400,
                  position: "relative",
                  zIndex: 1,
                  opacity: 0.85,
                  maxWidth: "340px",
                  mx: "auto",
                  px: 2,
                }}
              >
                Loading pages and resources for students, families, and staff.
              </Typography>
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/team"
              element={
                <>
                  <Team />
                  <Footer />
                </>
              }
            />
            <Route
              path="/portfolio"
              element={
                <>
                  <Portfolio />
                  <Footer />
                </>
              }
            />
            <Route
              path="/meet-our-team"
              element={
                <>
                  <MeetOurTeam />
                  <Footer />
                </>
              }
            />
            <Route path="/marketplace" element={<MarketplaceLogin />} />
            <Route path="/portal/live-meeting" element={<PortalLiveMeetingPage />} />
            <Route path="/portal" element={<PortalPrivateLayout />}>
              <Route index element={<PortalProfilePage />} />
              <Route path="classes" element={<PortalClassesPage />} />
              <Route path="exams" element={<PortalExamsPage />} />
              <Route path="exams/:scheduleId" element={<PortalExamTakePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <Router style={{ margin: 0, padding: 0 }}>
          <CssBaseline />
          <AppLayout />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

const styles = `
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
