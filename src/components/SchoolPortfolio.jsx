import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Avatar,
  Rating,
  Button,
  Divider,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Groups as AlumniIcon,
  School as SchoolIcon,
  MenuBook as AcademicIcon,
  Star as StarIcon,
  FormatQuote as QuoteIcon,
} from "@mui/icons-material";

const SchoolPortfolio = ({ embedded = false }) => {
  const [filter, setFilter] = useState("all");

  const portfolioItems = {
    achievements: [
      {
        id: 1,
        title: "National Science Olympiad Champions 2024",
        description: "First place in Robotics category. Beat 200+ schools nationwide.",
        image: "https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?w=600",
        date: "March 2024",
        medal: "Gold",
        students: ["Sarah Johnson", "Michael Chen", "Aisha Patel"],
      },
      {
        id: 2,
        title: "Cambridge Top in World Award",
        description: "Perfect score in A-Level Mathematics - Only 12 students worldwide achieved this.",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600",
        date: "January 2024",
        medal: "Highest Honor",
        student: "James Wilson",
      },
      {
        id: 3,
        title: "National Spelling Bee Champion",
        description: "Grades 6-8 category winner after 15 rounds.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
        date: "February 2024",
        medal: "Gold",
        student: "Emily Rodriguez",
      },
    ],
    universityAcceptances: [
      {
        id: 4,
        university: "Harvard University",
        student: "Alex Thompson",
        scholarship: "Full scholarship + living expenses",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png",
        course: "Computer Science",
        year: "2024",
      },
      {
        id: 5,
        university: "University of Oxford",
        student: "Priya Sharma",
        scholarship: "Rhodes Scholarship",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Oxford_University_logo.svg/200px-Oxford_University_logo.svg.png",
        course: "Medicine",
        year: "2024",
      },
      {
        id: 6,
        university: "MIT",
        student: "David Kim",
        scholarship: "Presidential Scholarship",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
        course: "Engineering",
        year: "2024",
      },
      {
        id: 7,
        university: "Stanford University",
        student: "Olivia Martinez",
        scholarship: "75% tuition scholarship",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Stanford_University_Logo.svg/200px-Stanford_University_Logo.svg.png",
        course: "Business",
        year: "2024",
      },
    ],
    alumniSuccess: [
      {
        id: 8,
        name: "Dr. Sarah Chen",
        graduation: "2010",
        achievement: "Youngest recipient of National Science Award 2024",
        currentRole: "AI Research Lead at Google",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        testimonial:
          "Carlvyne gave me the foundation to dream big. The critical thinking skills I learned here are invaluable.",
      },
      {
        id: 9,
        name: "Marcus Williams",
        graduation: "2012",
        achievement: "Founded EdTech startup valued at $50M",
        currentRole: "CEO at LearnSmart",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        testimonial: "The entrepreneurial spirit at Carlvyne shaped my career path.",
      },
      {
        id: 10,
        name: "Dr. Fatima Al-Rashid",
        graduation: "2008",
        achievement: "UNESCO Young Scientist Award 2023",
        currentRole: "Professor at Cambridge University",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        testimonial: "The research opportunities at Carlvyne were exceptional.",
      },
    ],
    parentTestimonials: [
      {
        id: 11,
        parent: "Robert & Lisa Johnson",
        student: "Emma Johnson (Class of 2023)",
        rating: 5,
        testimonial:
          "Our daughter received scholarships from 3 top universities. The college counseling was outstanding.",
        image: "https://randomuser.me/api/portraits/men/41.jpg",
      },
      {
        id: 12,
        parent: "Dr. Anil & Meera Patel",
        student: "Two children graduated",
        rating: 5,
        testimonial:
          "Both our children excelled academically and personally. The holistic development is unmatched.",
        image: "https://randomuser.me/api/portraits/women/29.jpg",
      },
    ],
    mediaHighlights: [
      {
        id: 13,
        outlet: "Education Today Magazine",
        headline: "Carlvyne International: Setting New Standards in STEM Education",
        date: "March 15, 2024",
        image: "https://images.unsplash.com/photo-1586333112964-c3bd1822ac08?w=600",
      },
      {
        id: 14,
        outlet: "National News Channel",
        headline: "Special Feature: How Carlvyne is Preparing Students for AI Era",
        date: "February 10, 2024",
        image: "https://images.unsplash.com/photo-1598550882865-9b51210b105b?w=600",
      },
    ],
  };

  const categories = [
    { id: "all", label: "All Achievements", icon: <TrophyIcon /> },
    { id: "academic", label: "Academic Wins", icon: <AcademicIcon /> },
    { id: "university", label: "University Acceptances", icon: <SchoolIcon /> },
    { id: "alumni", label: "Alumni Success", icon: <AlumniIcon /> },
    { id: "testimonials", label: "Parent Reviews", icon: <StarIcon /> },
  ];

  return (
    <Box sx={{ py: embedded ? 2 : 8, bgcolor: "#f5f7fa" }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="overline" sx={{ color: "#FFD700", fontWeight: 600, letterSpacing: "2px" }}>
            Our Track Record
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Proven Excellence
          </Typography>
          <Typography variant="body1" sx={{ color: "#666", maxWidth: "600px", mx: "auto" }}>
            Results, not promises. Here&apos;s what our students and alumni have achieved.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 6, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? "contained" : "outlined"}
              onClick={() => setFilter(cat.id)}
              startIcon={cat.icon}
              sx={{
                borderRadius: "60px",
                textTransform: "none",
                ...(filter === cat.id && {
                  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  color: "white",
                }),
              }}
            >
              {cat.label}
            </Button>
          ))}
        </Box>

        {(filter === "all" || filter === "academic") && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              🏆 Academic & Competition Wins
            </Typography>
            <Grid container spacing={3}>
              {portfolioItems.achievements.map((item) => (
                <Grid size={{ xs: 12, md: 4 }} key={item.id}>
                  <Card sx={{ borderRadius: "20px", overflow: "hidden", height: "100%" }}>
                    <CardMedia component="img" height="200" image={item.image} alt={item.title} />
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.date}
                        </Typography>
                        <Chip label={item.medal} size="small" sx={{ bgcolor: "#FFD70020", color: "#B8860B" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {item.student
                          ? `Student: ${item.student}`
                          : `Students: ${item.students?.join(", ")}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {(filter === "all" || filter === "university") && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              🎓 University Acceptances (Class of 2024)
            </Typography>
            <Grid container spacing={3}>
              {portfolioItems.universityAcceptances.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                  <Card sx={{ textAlign: "center", p: 3, borderRadius: "20px", height: "100%" }}>
                    <Box
                      sx={{
                        height: 60,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 800, fontSize: "2rem" }}>
                        {item.university.charAt(0)}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {item.university}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#FFD700", fontWeight: 600, my: 1 }}>
                      {item.student}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.course}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="success.main">
                      {item.scholarship}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {(filter === "all" || filter === "alumni") && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              🌟 Alumni Who Inspire Us
            </Typography>
            <Grid container spacing={3}>
              {portfolioItems.alumniSuccess.map((alumni) => (
                <Grid size={{ xs: 12, md: 4 }} key={alumni.id}>
                  <Card sx={{ borderRadius: "20px", p: 3, textAlign: "center", height: "100%" }}>
                    <Avatar src={alumni.image} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {alumni.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Class of {alumni.graduation}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#FFD700", fontWeight: 600, my: 1 }}>
                      {alumni.currentRole}
                    </Typography>
                    <Box sx={{ bgcolor: "#f0f0f0", p: 2, borderRadius: "12px", mt: 2 }}>
                      <QuoteIcon sx={{ fontSize: "20px", color: "#FFD700", mb: 1 }} />
                      <Typography variant="body2" fontStyle="italic">
                        &ldquo;{alumni.testimonial}&rdquo;
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {(filter === "all" || filter === "testimonials") && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              💬 What Parents Say
            </Typography>
            <Grid container spacing={3}>
              {portfolioItems.parentTestimonials.map((testimonial) => (
                <Grid size={{ xs: 12, md: 6 }} key={testimonial.id}>
                  <Card sx={{ borderRadius: "20px", p: 3 }}>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
                      &ldquo;{testimonial.testimonial}&rdquo;
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {testimonial.parent}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Parent of {testimonial.student}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {filter === "all" && portfolioItems.mediaHighlights.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              📰 Media Highlights
            </Typography>
            <Grid container spacing={3}>
              {portfolioItems.mediaHighlights.map((item) => (
                <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                  <Card sx={{ borderRadius: "20px", overflow: "hidden", height: "100%" }}>
                    <CardMedia component="img" height="180" image={item.image} alt={item.headline} />
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {item.date} · {item.outlet}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                        {item.headline}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box
          sx={{
            mt: 8,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: "32px",
            p: 6,
            textAlign: "center",
            color: "white",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
            Our Impact by Numbers
          </Typography>
          <Grid container spacing={4}>
            {[
              { number: "250+", label: "Academic Awards" },
              { number: "45+", label: "Top Universities" },
              { number: "$2.5M+", label: "Scholarships Earned" },
              { number: "98%", label: "Parent Satisfaction" },
              { number: "15+", label: "Countries Represented" },
              { number: "100%", label: "University Acceptance Rate" },
            ].map((stat, idx) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={idx}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "#FFD700" }}>
                  {stat.number}
                </Typography>
                <Typography variant="body2">{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default SchoolPortfolio;
