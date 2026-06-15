import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  MenuBook as TeachingIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward,
} from "@mui/icons-material";
import { fetchPublicTeachers, fetchPublicSchoolAdmins } from "../api";
import { HOME } from "./Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomeGhostButton,
} from "./Home/homeUi";

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

const staffCardSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  boxShadow: HOME.shadowSm,
  cursor: "pointer",
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: HOME.shadowMd,
    borderColor: HOME.borderGold,
    transform: "translateY(-6px)",
    "& .staff-card-photo": { transform: "scale(1.04)" },
    "& .staff-card-cta": { color: HOME.gold, gap: 8 },
  },
};

function getStaffDisplayName(staff) {
  return staff.user?.full_name || staff.user?.username || staff.name || "—";
}

function getStaffPhoto(staff) {
  return staff.profile_picture || staff.user?.profile_image || null;
}

function StaffCardSkeleton() {
  return (
    <Box sx={{ ...staffCardSx, cursor: "default", "&:hover": { transform: "none" } }}>
      <Skeleton variant="rectangular" height={220} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="70%" height={28} />
        <Skeleton width="45%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="55%" height={18} sx={{ mt: 1.5 }} />
      </Box>
    </Box>
  );
}

function StaffCard({ staff, isTeacher, onClick }) {
  const displayName = getStaffDisplayName(staff);
  const photoSrc = getStaffPhoto(staff);
  const position = isTeacher ? staff.position : staff.admin_type;
  const department = staff.department || (isTeacher ? "Teaching staff" : "Administration");
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box onClick={onClick} sx={staffCardSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ position: "relative", overflow: "hidden", height: 220, bgcolor: HOME.sky }}>
        {photoSrc ? (
          <Box
            className="staff-card-photo"
            component="img"
            src={photoSrc}
            alt={displayName}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: HOME.navyGradient,
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontSize: "4rem",
                fontWeight: 700,
                color: HOME.goldMuted,
                lineHeight: 1,
              }}
            >
              {initial}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 35%, rgba(8,22,43,0.55) 75%, rgba(8,22,43,0.88) 100%)",
            pointerEvents: "none",
          }}
        />
        {position ? (
          <Chip
            size="small"
            label={position}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
              bgcolor: "rgba(255,255,255,0.94)",
              color: HOME.navyDeep,
              maxWidth: "calc(100% - 24px)",
            }}
          />
        ) : null}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: "1.35rem",
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            {displayName}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="body2" sx={{ color: HOME.inkMuted, fontWeight: 600, mb: 1.5 }}>
          {department}
        </Typography>
        <Stack
          className="staff-card-cta"
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mt: "auto", color: HOME.navy, fontWeight: 700, fontSize: "0.9rem", transition: "all 0.2s ease" }}
        >
          View profile
          <ArrowForward sx={{ fontSize: 16 }} />
        </Stack>
      </Box>
    </Box>
  );
}

function StaffDetailDialog({ open, staff, isTeacher, onClose }) {
  if (!staff) return null;

  const displayName = getStaffDisplayName(staff);
  const photoSrc = getStaffPhoto(staff);
  const position = isTeacher ? staff.position : staff.admin_type;
  const department = staff.department || (isTeacher ? "Teaching staff" : "Administration");
  const initial = displayName.charAt(0).toUpperCase();

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
          bgcolor: HOME.warmWhite,
        },
      }}
    >
      <Box sx={{ height: 4, background: HOME.navyGradient }} />
      <Box sx={{ position: "relative", height: { xs: 200, sm: 240 }, bgcolor: HOME.sky }}>
        {photoSrc ? (
          <Box
            component="img"
            src={photoSrc}
            alt={displayName}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: HOME.navyGradient,
            }}
          >
            <Typography sx={{ fontFamily: HOME.fontDisplay, fontSize: "5rem", fontWeight: 700, color: HOME.goldMuted }}>
              {initial}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(8,22,43,0.1) 0%, rgba(8,22,43,0.65) 100%)",
          }}
        />
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(255,255,255,0.94)",
            border: `1px solid ${HOME.border}`,
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box sx={{ position: "absolute", bottom: 16, left: 20, right: 56 }}>
          <Chip
            size="small"
            label={isTeacher ? "Teacher" : "School admin"}
            sx={{ mb: 1, fontWeight: 700, bgcolor: HOME.navy, color: "#fff" }}
          />
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            {displayName}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: HOME.sky,
              border: `1px solid ${HOME.border}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.1em", color: HOME.inkSoft }}>
              ROLE
            </Typography>
            <Typography sx={{ fontWeight: 700, color: HOME.navyDeep, mt: 0.25 }}>
              {position || "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: HOME.inkMuted, mt: 0.5 }}>
              {department}
            </Typography>
          </Box>

          {(staff.user?.email || staff.user?.phone) && (
            <Stack spacing={1.25}>
              {staff.user?.email && (
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: `1px solid ${HOME.border}`,
                  }}
                >
                  <EmailIcon sx={{ color: HOME.gold }} />
                  <Typography variant="body2" sx={{ color: HOME.navyDeep, fontWeight: 600, wordBreak: "break-all" }}>
                    {staff.user.email}
                  </Typography>
                </Stack>
              )}
              {staff.user?.phone && (
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: `1px solid ${HOME.border}`,
                  }}
                >
                  <PhoneIcon sx={{ color: HOME.gold }} />
                  <Typography variant="body2" sx={{ color: HOME.navyDeep, fontWeight: 600 }}>
                    {staff.user.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const StaffDirectory = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;
  const [staffData, setStaffData] = useState({ teachers: [], schoolAdmins: [] });
  const [pagination, setPagination] = useState({ teachers: {}, schoolAdmins: {} });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTab = selectedTab === 0 ? "teachers" : "schoolAdmins";
      const result =
        activeTab === "teachers"
          ? await fetchPublicTeachers(page, rowsPerPage)
          : await fetchPublicSchoolAdmins(page, rowsPerPage);
      setStaffData((prev) => ({ ...prev, [activeTab]: result.data }));
      setPagination((prev) => ({ ...prev, [activeTab]: result.pagination }));
    } catch (e) {
      setError(e.message || "Failed to load staff.");
      setStaffData((prev) => ({ ...prev, [selectedTab === 0 ? "teachers" : "schoolAdmins"]: [] }));
    } finally {
      setLoading(false);
    }
  }, [selectedTab, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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

  const currentStaff = selectedTab === 0 ? staffData.teachers : staffData.schoolAdmins;
  const activePagination = selectedTab === 0 ? pagination.teachers : pagination.schoolAdmins;
  const isTeacher = selectedTab === 0;

  const tabMeta = [
    { label: "Teachers", icon: <TeachingIcon sx={{ fontSize: 18 }} />, count: staffData.teachers.length },
    { label: "School admin", icon: <PeopleIcon sx={{ fontSize: 18 }} />, count: staffData.schoolAdmins.length },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, fontFamily: HOME.fontBody }}>
      {/* Hero header */}
      <HomeSectionShell
        bg={{
          background: `linear-gradient(180deg, ${HOME.sky} 0%, ${HOME.cream} 100%)`,
          pt: { xs: 1.5, md: 2 },
          pb: { xs: 1, md: 1.25 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(201,162,39,0.16) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <Box sx={{ ...sectionPad, position: "relative", zIndex: 1, width: "100%" }}>
          <Box sx={{ mb: { xs: 1, md: 1.25 } }}>
            <HomeGhostButton
              onClick={() => navigate("/about-us")}
              startIcon={<ArrowBackIcon />}
              sx={{ fontSize: "0.9rem" }}
            >
              Back to about us
            </HomeGhostButton>
          </Box>

          <HomeSectionHeader
            eyebrow="Meet our team"
            title="Dedicated educators &"
            titleAccent="leaders"
            subtitle="Meet the passionate individuals who make Elimu Plus a center of excellence."
            sx={{ mb: 0 }}
          />
        </Box>
      </HomeSectionShell>

      {/* Staff grid */}
      <HomeSectionShell bg={{ pt: { xs: 1, md: 1.5 }, pb: { xs: 3, md: 4 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 44,
                bgcolor: "rgba(12, 35, 64, 0.06)",
                borderRadius: "999px",
                p: 0.5,
                border: `1px solid ${HOME.border}`,
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTabs-flexContainer": { gap: 0.5 },
              }}
            >
              {tabMeta.map((tab, i) => (
                <Tab
                  key={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      {tab.label}
                      <Chip
                        label={tab.count}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 24,
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          bgcolor: selectedTab === i ? HOME.gold : "rgba(12,35,64,0.08)",
                          color: selectedTab === i ? HOME.navyDeep : HOME.inkSoft,
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    fontFamily: HOME.fontBody,
                    minHeight: 40,
                    px: { xs: 1.5, sm: 2.5 },
                    borderRadius: "999px",
                    color: HOME.navy,
                    opacity: selectedTab === i ? 1 : 0.7,
                    bgcolor: selectedTab === i ? "#fff" : "transparent",
                    boxShadow: selectedTab === i ? HOME.shadowSm : "none",
                    transition: "all 0.2s ease",
                    "&.Mui-selected": { color: HOME.navyDeep },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, border: `1px solid ${HOME.border}` }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <StaffCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : currentStaff.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                borderRadius: 3,
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
              }}
            >
              <PeopleIcon sx={{ fontSize: 48, color: HOME.gold, mb: 2, opacity: 0.8 }} />
              <Typography sx={{ fontFamily: HOME.fontDisplay, fontSize: "1.5rem", fontWeight: 700, color: HOME.navyDeep, mb: 1 }}>
                No team members yet
              </Typography>
              <Typography sx={{ color: HOME.inkMuted, maxWidth: 400, mx: "auto" }}>
                Staff profiles will appear here once they are published.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {currentStaff.map((staff) => (
                  <Grid key={staff.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <StaffCard
                      staff={staff}
                      isTeacher={isTeacher}
                      onClick={() => handleOpenDialog(staff)}
                    />
                  </Grid>
                ))}
              </Grid>

              {activePagination.total > rowsPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 4, md: 5 } }}>
                  <Pagination
                    count={activePagination.totalPages || 1}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontWeight: 700,
                        fontFamily: HOME.fontBody,
                        color: HOME.navyDeep,
                        border: `1px solid ${HOME.border}`,
                      },
                      "& .Mui-selected": {
                        bgcolor: `${HOME.gold} !important`,
                        color: `${HOME.navyDeep} !important`,
                        borderColor: HOME.gold,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </HomeSectionShell>

      <StaffDetailDialog
        open={openDialog}
        staff={selectedStaff}
        isTeacher={isTeacher}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default StaffDirectory;
