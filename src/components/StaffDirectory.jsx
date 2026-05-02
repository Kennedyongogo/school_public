import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Rating,
  Stack,
  Button,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  EmojiEvents as AwardIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  MenuBook as TeachingIcon,
  ArrowBackIosNew as ArrowBackIcon,
} from "@mui/icons-material";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";

const StaffDirectory = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const staffData = {
    board: [
      {
        id: 1,
        name: "Dr. James Morrison",
        position: "Chairman of the Board",
        department: "Board of Directors",
        qualification: "Ph.D. in Education, Harvard University",
        experience: "35+ years in education leadership",
        bio: "Former Minister of Education, led multiple school transformations globally.",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        email: "j.morrison@carlvyne.edu",
        phone: "+254 700 123 456",
        expertise: ["Strategic Planning", "Education Policy", "Global Partnerships"],
        awards: ["Order of the Golden Lion", "Education Excellence Award 2020"],
        social: { linkedin: "#", twitter: "#" },
      },
      {
        id: 2,
        name: "Dr. Sarah Mbeki",
        position: "Vice Chairperson",
        department: "Board of Directors",
        qualification: "MBA, Stanford University",
        experience: "25+ years in corporate leadership",
        bio: "Leading expert in educational finance and sustainable development.",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
        email: "s.mbeki@carlvyne.edu",
        phone: "+254 700 123 457",
        expertise: ["Finance", "Sustainability", "Corporate Governance"],
        awards: ["African Business Leader of the Year 2022"],
        social: { linkedin: "#", twitter: "#" },
      },
    ],
    administration: [
      {
        id: 3,
        name: "Dr. Michael Omondi",
        position: "Principal / CEO",
        department: "Administration",
        qualification: "Ed.D., Columbia University",
        experience: "20+ years in school leadership",
        bio: "Passionate about holistic education and innovation in learning.",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        email: "m.omondi@carlvyne.edu",
        phone: "+254 700 123 458",
        expertise: ["Educational Leadership", "Curriculum Development", "Innovation"],
        awards: ["Best Principal Award 2023", "Innovation in Education Award"],
        social: { linkedin: "#", twitter: "#" },
      },
      {
        id: 4,
        name: "Mrs. Elizabeth Wanjiku",
        position: "Deputy Principal - Academics",
        department: "Administration",
        qualification: "M.Ed., University of Nairobi",
        experience: "18+ years",
        bio: "Dedicated to academic excellence and student success.",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        email: "e.wanjiku@carlvyne.edu",
        phone: "+254 700 123 459",
        expertise: ["Academic Planning", "Teacher Development", "Assessment"],
        awards: ["Excellence in Education Award 2021"],
        social: { linkedin: "#" },
      },
    ],
    teachers: [
      {
        id: 5,
        name: "Prof. John Kamau",
        position: "Head of Mathematics",
        department: "Mathematics",
        qualification: "Ph.D. Mathematics, MIT",
        experience: "15+ years",
        bio: "Published researcher in applied mathematics. Loves making math fun!",
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        email: "j.kamau@carlvyne.edu",
        phone: "+254 700 123 460",
        expertise: ["Calculus", "Statistics", "Algebra", "Math Olympiad"],
        subjects: ["Advanced Mathematics", "Calculus BC", "Statistics"],
        rating: 4.9,
        awards: ["National Best Math Teacher 2022", "MIT Math Excellence Award"],
        social: { linkedin: "#", twitter: "#" },
      },
      {
        id: 6,
        name: "Dr. Grace Achieng",
        position: "Head of Sciences",
        department: "Science",
        qualification: "Ph.D. Physics, Cambridge",
        experience: "12+ years",
        bio: "Former CERN researcher. Brings real-world science to classroom.",
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        email: "g.achieng@carlvyne.edu",
        phone: "+254 700 123 461",
        expertise: ["Physics", "Chemistry", "Robotics", "Astronomy"],
        subjects: ["Physics", "Chemistry", "Robotics Lab"],
        rating: 4.8,
        awards: ["Women in STEM Award 2023", "Best Science Teacher"],
        social: { linkedin: "#", twitter: "#" },
      },
      {
        id: 7,
        name: "Mr. David Kimani",
        position: "Head of Languages",
        department: "Languages",
        qualification: "M.A. English Literature, Oxford",
        experience: "10+ years",
        bio: "Published author. Creates love for literature in students.",
        image: "https://randomuser.me/api/portraits/men/7.jpg",
        email: "d.kimani@carlvyne.edu",
        phone: "+254 700 123 462",
        expertise: ["English Literature", "Creative Writing", "Drama", "Debate"],
        subjects: ["English Literature", "Creative Writing", "Public Speaking"],
        rating: 4.7,
        awards: ["Young Educator Award 2023"],
        social: { linkedin: "#", twitter: "#" },
      },
      {
        id: 8,
        name: "Ms. Fatima Hassan",
        position: "Computer Science Teacher",
        department: "Technology",
        qualification: "M.Sc. Computer Science, Stanford",
        experience: "8+ years",
        bio: "AI researcher turned teacher. Inspires future tech leaders.",
        image: "https://randomuser.me/api/portraits/women/8.jpg",
        email: "f.hassan@carlvyne.edu",
        phone: "+254 700 123 463",
        expertise: ["Python", "AI/ML", "Web Development", "Cybersecurity"],
        subjects: ["Computer Science", "AI Fundamentals", "Web Design"],
        rating: 4.9,
        awards: ["Google Certified Educator", "Tech Woman of the Year"],
        social: { linkedin: "#", twitter: "#" },
      },
    ],
    support: [
      {
        id: 9,
        name: "Mr. Peter Odhiambo",
        position: "Head of Student Affairs",
        department: "Student Support",
        qualification: "M.A. Counseling Psychology",
        experience: "15+ years",
        bio: "Student mentor and counselor. Always available for students.",
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        email: "p.odhiambo@carlvyne.edu",
        phone: "+254 700 123 464",
        expertise: ["Counseling", "Student Welfare", "Career Guidance"],
        social: { linkedin: "#" },
      },
      {
        id: 10,
        name: "Sr. Mary Ndirangu",
        position: "School Nurse",
        department: "Health Services",
        qualification: "B.Sc. Nursing",
        experience: "20+ years",
        bio: "Former head nurse at National Hospital. Ensures student wellness.",
        image: "https://randomuser.me/api/portraits/women/10.jpg",
        email: "m.ndirangu@carlvyne.edu",
        phone: "+254 700 123 465",
        expertise: ["First Aid", "Health Education", "Emergency Care"],
        social: {},
      },
    ],
  };

  const tabLabels = [
    { label: "Board of Directors", icon: <PeopleIcon />, count: staffData.board.length },
    { label: "Administration", icon: <SchoolIcon />, count: staffData.administration.length },
    { label: "Teaching Faculty", icon: <TeachingIcon />, count: staffData.teachers.length },
    { label: "Support Staff", icon: <WorkIcon />, count: staffData.support.length },
  ];

  const getCurrentStaff = () => {
    switch (selectedTab) {
      case 0:
        return staffData.board;
      case 1:
        return staffData.administration;
      case 2:
        return staffData.teachers;
      case 3:
        return staffData.support;
      default:
        return staffData.teachers;
    }
  };

  const handleOpenDialog = (staff) => {
    setSelectedStaff(staff);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  return (
    <Box sx={{ py: 8, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            mb: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/team")}
            startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9375rem",
              letterSpacing: "0.02em",
              px: { xs: 2.25, sm: 2.75 },
              py: 1.15,
              borderRadius: "999px",
              borderWidth: 2,
              borderColor: NAVY,
              color: NAVY_DEEP,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              boxShadow: `0 4px 18px rgba(22, 33, 62, 0.12), inset 0 1px 0 rgba(255,255,255,0.85)`,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "& .MuiButton-startIcon": { mr: { xs: 0.75, sm: 1 } },
              "&:hover": {
                borderWidth: 2,
                borderColor: GOLD,
                bgcolor: NAVY_DEEP,
                color: "white",
                boxShadow: `0 10px 28px rgba(26, 26, 46, 0.35), 0 0 0 1px rgba(255, 215, 0, 0.35)`,
                transform: "translateY(-2px)",
                "& .MuiSvgIcon-root": { color: GOLD },
              },
            }}
          >
            Back to About Us
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: GOLD,
              fontWeight: 600,
              letterSpacing: "2px",
              mb: 1,
              display: "block",
            }}
          >
            Meet Our Team
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
            Dedicated Educators & Leaders
          </Typography>
          <Typography variant="body1" sx={{ color: "#666", maxWidth: "600px", mx: "auto" }}>
            Meet the passionate individuals who make Carlvyne International School a center of excellence
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, v) => setSelectedTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                minWidth: "auto",
                px: 3,
                py: 1.5,
              },
              "& .Mui-selected": {
                color: "#FFD700",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFD700",
                height: 3,
              },
            }}
          >
            {tabLabels.map((tab, idx) => (
              <Tab
                key={tab.label}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon}
                    <span>{tab.label}</span>
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: selectedTab === idx ? "#FFD700" : "#e0e0e0",
                        color: selectedTab === idx ? "#1a1a2e" : "#666",
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {getCurrentStaff().map((staff) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={staff.id}>
              <Card
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => handleOpenDialog(staff)}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={staff.image}
                    variant="square"
                    sx={{
                      width: "100%",
                      height: 250,
                      borderRadius: 0,
                      "& img": { objectFit: "cover" },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      p: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                      {staff.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#FFD700" }}>
                      {staff.position}
                    </Typography>
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {staff.department}
                  </Typography>
                  {staff.rating != null && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating value={staff.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="caption">{staff.rating}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 8,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          {[
            { number: "45+", label: "Expert Faculty", icon: <TeachingIcon /> },
            { number: "15:1", label: "Student-Teacher Ratio", icon: <PeopleIcon /> },
            { number: "12+", label: "Average Experience (Years)", icon: <AwardIcon /> },
            { number: "85%", label: "Hold Advanced Degrees", icon: <SchoolIcon /> },
          ].map((stat) => (
            <Card
              key={stat.label}
              sx={{
                textAlign: "center",
                py: 4,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                color: "white",
              }}
            >
              <Box sx={{ fontSize: "40px", mb: 1, color: "#FFD700" }}>{stat.icon}</Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#FFD700" }}>
                {stat.number}
              </Typography>
              <Typography variant="body2">{stat.label}</Typography>
            </Card>
          ))}
        </Box>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px", overflow: "hidden" },
        }}
      >
        {selectedStaff && (
          <>
            <Box sx={{ position: "relative", height: 300 }}>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${selectedStaff.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
                  p: 2,
                }}
              >
                <IconButton onClick={handleCloseDialog} sx={{ color: "white" }} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                  p: 3,
                }}
              >
                <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                  {selectedStaff.name}
                </Typography>
                <Typography variant="h6" sx={{ color: "#FFD700" }}>
                  {selectedStaff.position}
                </Typography>
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Qualifications
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedStaff.qualification}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Experience
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedStaff.experience}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Bio
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedStaff.bio}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  {selectedStaff.expertise && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Areas of Expertise
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                        {selectedStaff.expertise.map((exp) => (
                          <Chip key={exp} label={exp} size="small" sx={{ bgcolor: "#FFD70020" }} />
                        ))}
                      </Stack>
                    </>
                  )}

                  {selectedStaff.subjects && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Subjects Taught
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                        {selectedStaff.subjects.map((subj) => (
                          <Chip key={subj} label={subj} size="small" color="primary" />
                        ))}
                      </Stack>
                    </>
                  )}

                  {selectedStaff.awards && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Awards & Recognition
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                        {selectedStaff.awards.map((award) => (
                          <Chip
                            key={award}
                            icon={<AwardIcon />}
                            label={award}
                            size="small"
                            sx={{ bgcolor: "#FFD70020" }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Contact
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{selectedStaff.email}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{selectedStaff.phone}</Typography>
                    </Box>
                  </Box>

                  {selectedStaff.social && Object.keys(selectedStaff.social).length > 0 && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {selectedStaff.social.linkedin && (
                        <IconButton size="small" sx={{ color: "#0077B5" }} aria-label="LinkedIn">
                          <LinkedInIcon />
                        </IconButton>
                      )}
                      {selectedStaff.social.twitter && (
                        <IconButton size="small" sx={{ color: "#1DA1F2" }} aria-label="Twitter">
                          <TwitterIcon />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StaffDirectory;
