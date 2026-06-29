import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { theme } from "./theme";
import "./App.css";
import React, { useEffect, Suspense, lazy } from "react";
import PublicHeader from "./components/Header/PublicHeader";
import Footer from "./components/Footer/Footer";
import BrandPageLoader from "./components/common/BrandPageLoader";

const Home = lazy(() => import("./pages/Home"));
const Team = lazy(() => import("./pages/Team"));
const MeetOurTeam = lazy(() => import("./pages/MeetOurTeam"));
const MarketplaceLogin = lazy(() => import("./pages/MarketplaceLogin"));
const PortalProfilePage = lazy(() => import("./pages/PortalProfilePage"));
const PortalClassesPage = lazy(() => import("./pages/PortalClassesPage"));
const PortalClassesDayPage = lazy(() => import("./pages/PortalClassesDayPage"));
const PortalExamsPage = lazy(() => import("./pages/PortalExamsPage"));
const PortalReportCardsPage = lazy(() => import("./pages/PortalReportCardsPage"));
const PortalFeesPage = lazy(() => import("./pages/PortalFeesPage"));
const PortalReceiptsPage = lazy(() => import("./pages/PortalReceiptsPage"));
const PortalExamResultPage = lazy(() => import("./pages/PortalExamResultPage"));
const PortalExamTakeRouter = lazy(() => import("./pages/PortalExamTakeRouter"));
const PortalAssignmentsPage = lazy(() => import("./pages/PortalAssignmentsPage"));
const PortalAssignmentTakeRouter = lazy(() => import("./pages/PortalAssignmentTakeRouter"));
const PortalAssignmentFeedbackPage = lazy(() => import("./pages/PortalAssignmentFeedbackPage"));
const PortalExamInvigilationPage = lazy(() => import("./pages/PortalExamInvigilationPage"));
const PortalLiveMeetingPage = lazy(() => import("./pages/PortalLiveMeetingPage"));
const PortalLiveClassPage = lazy(() => import("./pages/PortalLiveClassPage"));
const PortalEventLivePage = lazy(() => import("./pages/PortalEventLivePage"));
const PortalPrivateLayout = lazy(() => import("./components/Portal/PortalPrivateLayout"));
const AdmissionApplication = lazy(() => import("./pages/AdmissionApplication"));
const AdmissionForm = lazy(() => import("./pages/AdmissionForm"));
const AdmissionSuccess = lazy(() => import("./pages/AdmissionSuccess"));
const CurriculumSelection = lazy(() => import("./pages/CurriculumSelection"));
const FeeStructureView = lazy(() => import("./pages/FeeStructureView"));

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
    location.pathname.startsWith("/portal") || location.pathname === "/login";

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <PublicHeader />}
      <Box component="main" sx={{ flex: 1, width: "100%" }}>
        <Suspense fallback={<BrandPageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/about-us"
              element={
                <>
                  <Team />
                  <Footer />
                </>
              }
            />
            <Route path="/team" element={<Navigate to="/about-us" replace />} />
            <Route
              path="/meet-our-team"
              element={
                <>
                  <MeetOurTeam />
                  <Footer />
                </>
              }
            />
            <Route path="/login" element={<MarketplaceLogin />} />
            <Route path="/marketplace" element={<Navigate to="/login" replace />} />
            <Route path="/portal/live-meeting" element={<PortalLiveMeetingPage />} />
            <Route path="/portal/live-class/:liveClassId" element={<PortalLiveClassPage />} />
            <Route path="/portal/exam-schedule/:scheduleId/invigilation" element={<PortalExamInvigilationPage />} />
            <Route path="/portal/event/:eventId" element={<PortalEventLivePage />} />
            <Route path="/portal" element={<PortalPrivateLayout />}>
              <Route index element={<PortalProfilePage />} />
              <Route path="classes" element={<PortalClassesPage />} />
              <Route path="classes/day/:date" element={<PortalClassesDayPage />} />
              <Route path="exams" element={<PortalExamsPage />} />
              <Route path="exams/:scheduleId/result" element={<PortalExamResultPage />} />
              <Route path="exams/:scheduleId" element={<PortalExamTakeRouter />} />
              <Route path="assignments" element={<PortalAssignmentsPage />} />
              <Route path="assignments/:assignmentId/feedback" element={<PortalAssignmentFeedbackPage />} />
              <Route path="assignments/:assignmentId" element={<PortalAssignmentTakeRouter />} />
              <Route path="report-cards" element={<PortalReportCardsPage />} />
              <Route path="fees" element={<PortalFeesPage />} />
              <Route path="receipts" element={<PortalReceiptsPage />} />
            </Route>
            <Route path="/admission/apply" element={<AdmissionApplication />} />
            <Route path="/admission/select" element={<CurriculumSelection />} />
            <Route path="/admission/form" element={<AdmissionForm />} />
            <Route path="/admission/fee-structure/:curriculumId" element={<FeeStructureView />} />
            <Route path="/admission/success" element={<AdmissionSuccess />} />
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
