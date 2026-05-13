import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Chip,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  MenuBook as TeachingIcon,
  ArrowBackIosNew as ArrowBackIcon,
} from "@mui/icons-material";
import { fetchPublicTeachers, fetchPublicSchoolAdmins } from "../api";

const NAVY = "#16213e";
const NAVY_DEEP = "#1a1a2e";
const GOLD = "#FFD700";

const StaffDirectory = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [staffData, setStaffData] = useState({ teachers: [], schoolAdmins: [] });
  const [pagination, setPagination] = useState({ teachers: {}, schoolAdmins: {} });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTab = selectedTab === 0 ? "teachers" : "schoolAdmins";
      let result;
      if (activeTab === "teachers") {
        result = await fetchPublicTeachers(page, rowsPerPage);
      } else {
        result = await fetchPublicSchoolAdmins(page, rowsPerPage);
      }
      setStaffData((prev) => ({ ...prev, [activeTab]: result.data }));
      setPagination((prev) => ({ ...prev, [activeTab]: result.pagination }));
    } catch (e) {
      setError(e.message || "Failed to load staff.");
      setStaffData((prev) => ({ ...prev, [selectedTab === 0 ? "teachers" : "schoolAdmins"]: [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTab, page]);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
    setPage(1);
  };

  const handleOpenDialog = (staff) => {
    setSelectedStaff(staff);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  const getCurrentStaff = () => {
    return selectedTab === 0 ? staffData.teachers : staffData.schoolAdmins;
  };

  const activePagination = selectedTab === 0 ? pagination.teachers : pagination.schoolAdmins;

  const tabLabels = [
    { label: "Teachers", icon: <TeachingIcon />, count: staffData.teachers.length },
    { label: "School Admin", icon: <PeopleIcon />, count: staffData.schoolAdmins.length },
  ];

  return (
    <Box sx={{ py: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0.5, mt: -1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/team")}
            startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9375rem",
              letterSpacing: "0.02em",
              px: 2.5,
              py: 1,
              borderRadius: "999px",
              borderWidth: 2,
              borderColor: NAVY,
              color: NAVY_DEEP,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              boxShadow: `0 4px 18px rgba(22, 33, 62, 0.12), inset 0 1px 0 rgba(255,255,255,0.85)`,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "& .MuiButton-startIcon": { mr: 1 },
              "&:focus": { outline: "none" },
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

        <Box sx={{ textAlign: "center", mb: 2 }}>
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
            Meet the passionate individuals who make Elimu Plus a center of excellence
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                minWidth: "auto",
                px: 4,
                py: 1.5,
                borderRadius: "12px 12px 0 0",
                mx: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 215, 0, 0.1)",
                },
              },
              "& .Mui-selected": {
                color: "#FFD700",
                bgcolor: "rgba(255, 215, 0, 0.08)",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFD700",
                height: 3,
                borderRadius: 2,
              },
              "& .MuiTab-root:focus": {
                outline: "none",
              },
            }}
          >
            {tabLabels.map((tab, idx) => (
              <Tab
                key={tab.label}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{tab.label}</span>
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        bgcolor: `${GOLD}20`,
                        color: GOLD,
                        fontWeight: 700,
                        height: 20,
                      }}
                    />
                  </Box>
                }
                icon={tab.icon}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: NAVY }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {getCurrentStaff().length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    No staff found.
                  </Typography>
                </Grid>
              ) : (
                getCurrentStaff().map((staff) => {
                  const displayName = staff.user?.full_name || staff.user?.username || staff.name || "—";
                  const photoSrc = staff.profile_picture || staff.user?.profile_image;
                  const position = selectedTab === 0 ? staff.position : staff.admin_type;
                  const department = staff.department || "Staff";

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={staff.id}>
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
                            src={photoSrc || undefined}
                            variant="square"
                            sx={{
                              width: "100%",
                              height: 200,
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
                              {displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: GOLD }}>
                              {position}
                            </Typography>
                          </Box>
                        </Box>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {department}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>

            {activePagination.total > rowsPerPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={activePagination.totalPages}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: NAVY_DEEP,
                    },
                    "& .Mui-selected": {
                      bgcolor: `${GOLD}20`,
                      color: GOLD,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          {selectedStaff && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton onClick={handleCloseDialog} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Avatar
                  src={selectedStaff.profile_picture || selectedStaff.user?.profile_image || undefined}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: `${NAVY}22`,
                    color: NAVY_DEEP,
                    fontWeight: 700,
                  }}
                >
                  {!selectedStaff.profile_picture && !selectedStaff.user?.profile_image
                    ? (selectedStaff.user?.full_name || selectedStaff.name || "?").charAt(0).toUpperCase()
                    : null}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {selectedStaff.user?.full_name || selectedStaff.user?.username || selectedStaff.name || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                    {selectedStaff.admin_type || selectedStaff.position || "—"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {selectedStaff.user?.email && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedStaff.user.email}</Typography>
                      </Box>
                    )}
                    {selectedStaff.user?.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedStaff.user.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default StaffDirectory;