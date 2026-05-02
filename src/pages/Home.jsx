import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import SchoolServicesSection from "../components/Home/SchoolServicesSection";
import SchoolNewsEventsSection from "../components/Home/SchoolNewsEventsSection";
import HomeReviewsSection from "../components/Home/HomeReviewsSection";
import Footer from "../components/Footer/Footer";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: '"Open Sans", "Segoe UI", sans-serif',
      }}
    >
      <HeroSection />
      <SchoolServicesSection />
      <SchoolNewsEventsSection />
      <HomeReviewsSection />
      <Footer />
    </Box>
  );
}
