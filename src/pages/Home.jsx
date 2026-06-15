import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import HomePortalSection from "../components/Home/HomePortalSection";
import SchoolServicesSection from "../components/Home/SchoolServicesSection";
import SchoolNewsEventsSection from "../components/Home/SchoolNewsEventsSection";
import HomeReviewsSection from "../components/Home/HomeReviewsSection";
import Footer from "../components/Footer/Footer";
import { HOME } from "../components/Home/homeShared";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: HOME.fontBody,
        bgcolor: HOME.warmWhite,
      }}
    >
      <HeroSection />
      <HomePortalSection />
      <SchoolServicesSection />
      <SchoolNewsEventsSection />
      <HomeReviewsSection />
      <Footer />
    </Box>
  );
}
