import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  MenuBook as MenuBookIcon,
  Phone as PhoneIcon,
  FactCheck as FactCheckIcon,
} from "@mui/icons-material";
import {
  fetchSchoolPortalUser,
  fetchSchoolPortalParentProfile,
  fetchSchoolPortalStudentProfile,
  clearSchoolPortalSession,
  schoolPortalMediaUrl,
} from "../api";

/** Match admin `ElimuPlusTeacherDetail` accent system */
const accent = "#DC2626";
const accentDark = "#B91C1C";
const accentLight = "#FEE2E2";
const backgroundLight = "#FEF2F2";

function formatDdMmYyyy(value) {
  if (value === undefined || value === null || value === "") return null;
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

function genderLabel(g) {
  if (!g) return null;
  const s = String(g).toLowerCase();
  if (s === "male") return "Male";
  if (s === "female") return "Female";
  if (s === "other") return "Other";
  return String(g);
}

function profileCardsGridSx(theme, extra = {}) {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    columnGap: theme.spacing(2.5),
    rowGap: theme.spacing(2.5),
    alignItems: "stretch",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    px: { xs: 0.5, sm: 1 },
    ...extra,
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "minmax(0, 1fr)",
      columnGap: theme.spacing(2),
      rowGap: theme.spacing(2),
    },
  };
}

const profileCardCellSx = {
  minHeight: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

function DetailCard({ icon: Icon, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${accentLight}`,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(255,255,255,0.96)",
        boxShadow: `0 12px 40px -24px ${accent}55`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2.5, py: 1.75, bgcolor: `${accent}08`, borderBottom: `1px solid ${accentLight}`, flexShrink: 0 }}
      >
        {Icon && <Icon sx={{ fontSize: 22, color: accentDark }} />}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: accentDark, lineHeight: 1.25 }}>
          {title}
        </Typography>
      </Stack>
      <Box
        sx={{
          p: 2.5,
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

/** Same pattern as teacher detail `Field` */
function Field({ label, value, mono, placeholder }) {
  const show = value !== null && value !== undefined && String(value).trim() !== "";
  const text = show ? String(value) : placeholder;
  if (text === undefined || text === null) return null;
  return (
    <Box sx={{ mb: 2, "&:last-of-type": { mb: 0 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.5, letterSpacing: "0.02em" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          wordBreak: "break-word",
          color: show ? "text.primary" : "text.secondary",
          fontFamily: mono ? "ui-monospace, monospace" : undefined,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function ChipField({ label, children }) {
  return (
    <Box sx={{ mb: 2, "&:last-of-type": { mb: 0 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.5, letterSpacing: "0.02em" }}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

export default function PortalProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    const token =
      typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
    if (!token) {
      navigate("/marketplace", { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const me = await fetchSchoolPortalUser();
      if (me.role !== "parent" && me.role !== "student") {
        clearSchoolPortalSession();
        navigate("/marketplace", { replace: true });
        return;
      }
      setUser(me);

      if (me.role === "parent") {
        try {
          const row = await fetchSchoolPortalParentProfile();
          setDetail({ kind: "parent", row });
        } catch {
          setDetail({ kind: "parent", row: null });
        }
      } else {
        try {
          const row = await fetchSchoolPortalStudentProfile();
          setDetail({ kind: "student", row });
        } catch {
          setDetail({ kind: "student", row: null });
        }
      }

      localStorage.setItem("marketplace_user", JSON.stringify(me));
    } catch (e) {
      setError(e.message || "Could not load your account.");
      if (/session|expired|401|403/i.test(e.message || "")) {
        clearSchoolPortalSession();
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const u = user || {};
  const profileImg = u.profile_image;
  const innerUser = detail?.row?.user || {};
  const st = detail?.kind === "student" ? detail.row : null;

  const initials = (name) => {
    const n = String(name || "").trim();
    if (!n) return "?";
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const displayName = u.full_name || innerUser.full_name || "Member";

  const homeroomTeacherDisplay =
    st?.class_teacher?.user?.full_name ||
    st?.class_teacher?.user?.username ||
    st?.class_teacher?.full_name ||
    st?.class_teacher?.username ||
    st?.class_teacher?.email ||
    null;

  const curriculumDisplay =
    st?.curriculum?.name != null && String(st.curriculum.name).trim() !== ""
      ? `${st.curriculum.name}${st.curriculum.type ? ` (${st.curriculum.type})` : ""}`
      : null;

  const classDisplay =
    st?.curriculum_class != null
      ? `${st.curriculum_class.name || ""}${st.curriculum_class.code ? ` (${st.curriculum_class.code})` : ""}`.trim() || null
      : null;

  const recordPhotoSrc =
    st?.profile_picture != null && String(st.profile_picture).trim() !== ""
      ? schoolPortalMediaUrl(st.profile_picture)
      : null;

  const pageShellSx = () => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    background: `linear-gradient(180deg, ${backgroundLight} 0%, #fff 48%)`,
  });

  const heroBandSx = {
    background: `linear-gradient(135deg, ${accentDark} 0%, ${accent} 52%, #EF4444 100%)`,
    px: { xs: 2, sm: 3 },
    pt: { xs: 2, sm: 2.5 },
    pb: { xs: 8, sm: 10 },
    color: "#fff",
    position: "relative",
  };

  const heroSummaryPaperSx = {
    borderRadius: 4,
    p: { xs: 2.5, sm: 3 },
    mb: 3,
    border: `1px solid ${accentLight}`,
    bgcolor: "rgba(255,255,255,0.98)",
    boxShadow: `0 20px 50px -28px ${accent}66`,
  };

  return (
    <Box sx={pageShellSx}>
      <Box sx={{ flex: "1 1 auto", width: "100%", minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: accent }} />
          </Box>
        ) : error ? (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        ) : detail?.kind === "student" && st ? (
          <>
            <Box sx={heroBandSx}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                  Student profile
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5 }}>
                  {displayName}
                </Typography>
                {u.email ? (
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1, opacity: 0.95 }}>
                    <EmailIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{u.email}</Typography>
                  </Stack>
                ) : null}
              </Box>
            </Box>

            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 4, mt: { xs: -6, sm: -7 } }}>
              <Paper elevation={0} sx={heroSummaryPaperSx}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "center", sm: "flex-start" }}>
                  <Avatar
                    src={recordPhotoSrc || undefined}
                    slotProps={
                      recordPhotoSrc
                        ? {
                            img: { style: { objectFit: "cover", objectPosition: "center top" } },
                          }
                        : undefined
                    }
                    sx={{
                      width: { xs: 112, sm: 128 },
                      height: { xs: 112, sm: 128 },
                      fontSize: "2.75rem",
                      fontWeight: 800,
                      bgcolor: `${accent}18`,
                      color: accentDark,
                      border: `4px solid ${accentLight}`,
                      boxShadow: `0 8px 24px ${accent}33`,
                    }}
                  >
                    {!recordPhotoSrc ? initials(displayName) : null}
                  </Avatar>
                  <Stack spacing={1.25} sx={{ flex: 1, width: "100%", alignItems: { xs: "center", sm: "flex-start" }, textAlign: { xs: "center", sm: "left" } }}>
                    <Stack direction="row" flexWrap="wrap" gap={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                      <Chip
                        icon={<BadgeIcon sx={{ fontSize: "18px !important" }} />}
                        label={`Admission ${st.admission_number || "—"}`}
                        sx={{ fontWeight: 700, bgcolor: `${accent}12`, border: `1px solid ${accentLight}` }}
                      />
                      {u.role && (
                        <Chip
                          label={String(u.role).replace(/_/g, " ")}
                          size="small"
                          sx={{ fontWeight: 700, textTransform: "capitalize" }}
                        />
                      )}
                      {classDisplay ? (
                        <Chip
                          icon={<ClassIcon sx={{ fontSize: "18px !important" }} />}
                          label={classDisplay}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : null}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                      School record photo and enrollment below match what staff entered in Elimu Plus (Create student profile). Your portal login is shown in the first card.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Box sx={(theme) => profileCardsGridSx(theme, { mb: 2.5 })}>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={PersonIcon} title="Portal login (account)">
                    <Field label="Full name" value={u.full_name} placeholder="—" />
                    <Field label="Username" value={u.username} mono placeholder="—" />
                    <Field label="Email" value={u.email} placeholder="—" />
                    <Field label="Phone" value={u.phone} placeholder="—" />
                    <Field label="Role" value={u.role ? String(u.role).replace(/_/g, " ") : null} placeholder="—" />
                  </DetailCard>
                </Box>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={PersonIcon} title="Student user (linked account)">
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontWeight: 600 }}>
                      Linked from <strong>Student user (no profile yet)</strong> when your school created your profile.
                    </Typography>
                    <Field label="Full name" value={innerUser.full_name} placeholder="—" />
                    <Field label="Username" value={innerUser.username} mono placeholder="—" />
                    <Field label="Email" value={innerUser.email} placeholder="—" />
                    <Field label="Phone" value={innerUser.phone} placeholder="—" />
                    <Field label="Address" value={innerUser.address} placeholder="—" />
                  </DetailCard>
                </Box>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={SchoolIcon} title="Enrollment — class & curriculum">
                    <Field label="Admission number" value={st.admission_number} mono placeholder="—" />
                    <Field label="Date of birth" value={formatDdMmYyyy(st.date_of_birth)} placeholder="—" />
                    <Field label="Gender" value={genderLabel(st.gender)} placeholder="—" />
                    <Field label="Curriculum" value={curriculumDisplay} placeholder="—" />
                    <Field label="Class" value={classDisplay} placeholder="—" />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, lineHeight: 1.45 }}>
                      Homeroom teacher is set automatically from the teacher assigned as class teacher for this class.
                    </Typography>
                    <Field label="Homeroom teacher" value={homeroomTeacherDisplay} placeholder="—" />
                    <Field label="Enrollment date" value={formatDdMmYyyy(st.enrollment_date)} placeholder="—" />
                  </DetailCard>
                </Box>
              </Box>

              <Box sx={(theme) => profileCardsGridSx(theme, {})}>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={MenuBookIcon} title="Health & planning">
                    <Field label="Graduation year" value={st.graduation_year != null ? String(st.graduation_year) : null} placeholder="—" />
                    <Field label="Blood group" value={st.blood_group} placeholder="—" />
                    <Field label="Medical conditions" value={st.medical_conditions} placeholder="—" />
                  </DetailCard>
                </Box>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={PhoneIcon} title="Emergency contact">
                    <Field label="Emergency contact name" value={st.emergency_contact_name} placeholder="—" />
                    <Field label="Emergency contact phone" value={st.emergency_contact_phone} mono placeholder="—" />
                  </DetailCard>
                </Box>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={FactCheckIcon} title="Record status">
                    <ChipField label="Alumni">
                      <Chip
                        size="small"
                        label={st.is_alumni ? "Yes" : "No"}
                        color={st.is_alumni ? "warning" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </ChipField>
                    <ChipField label="Account status">
                      <Chip size="small" label={st.account_status || "—"} sx={{ fontWeight: 600 }} />
                    </ChipField>
                    <Field
                      label="Profile photo on record"
                      value={recordPhotoSrc ? "Yes — shown above" : "No photo on file yet"}
                      placeholder="—"
                    />
                  </DetailCard>
                </Box>
              </Box>
            </Box>
          </>
        ) : detail?.kind === "student" && !detail.row ? (
          <>
            <Box sx={heroBandSx}>
              <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                Student profile
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5 }}>
                {displayName}
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 4, mt: { xs: -6, sm: -7 } }}>
              <Alert severity="info" sx={{ borderRadius: 2, border: `1px solid ${accentLight}` }}>
                No linked student profile was found for your login yet — similar to <strong>No student-role users without a profile</strong> on the admin side when creating a profile. Your portal login still works; ask the school to complete{" "}
                <strong>Create student profile</strong> under Elimu Plus so your enrollment and photo appear here.
              </Alert>
            </Box>
          </>
        ) : detail?.kind === "parent" && detail.row ? (
          <>
            <Box sx={heroBandSx}>
              <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                Parent profile
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5 }}>
                {displayName}
              </Typography>
              {u.email ? (
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1, opacity: 0.95 }}>
                  <EmailIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{u.email}</Typography>
                </Stack>
              ) : null}
            </Box>
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 4, mt: { xs: -6, sm: -7 } }}>
              <Paper elevation={0} sx={{ ...heroSummaryPaperSx, mb: 2.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "center", sm: "flex-start" }}>
                  <Avatar
                    src={profileImg ? schoolPortalMediaUrl(profileImg) : undefined}
                    sx={{
                      width: { xs: 112, sm: 128 },
                      height: { xs: 112, sm: 128 },
                      fontSize: "2.75rem",
                      fontWeight: 800,
                      bgcolor: `${accent}18`,
                      color: accentDark,
                      border: `4px solid ${accentLight}`,
                      boxShadow: `0 8px 24px ${accent}33`,
                    }}
                  >
                    {!profileImg ? initials(displayName) : null}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, alignSelf: "center" }}>
                    Parent record on file with the school appears in the card below.
                  </Typography>
                </Stack>
              </Paper>
              <Box
                sx={(theme) => ({
                  display: "grid",
                  gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
                  columnGap: theme.spacing(2.5),
                  rowGap: theme.spacing(2.5),
                  alignItems: "stretch",
                  width: "100%",
                  px: { xs: 0.5, sm: 1 },
                })}
              >
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={PersonIcon} title="Portal login (account)">
                    <Field label="Full name" value={u.full_name} placeholder="—" />
                    <Field label="Username" value={u.username} mono placeholder="—" />
                    <Field label="Email" value={u.email} placeholder="—" />
                    <Field label="Phone" value={u.phone} placeholder="—" />
                    <Field label="Role" value={u.role ? String(u.role).replace(/_/g, " ") : null} placeholder="—" />
                  </DetailCard>
                </Box>
                <Box sx={profileCardCellSx}>
                  <DetailCard icon={BadgeIcon} title="Parent record">
                    <Field label="Relationship" value={detail.row.relationship} placeholder="—" />
                    <Field label="Occupation" value={detail.row.occupation} placeholder="—" />
                    <ChipField label="Newsletter">
                      <Chip
                        size="small"
                        label={detail.row.newsletter_subscription ? "Subscribed" : "Not subscribed"}
                        sx={{ fontWeight: 600 }}
                      />
                    </ChipField>
                  </DetailCard>
                </Box>
              </Box>
            </Box>
          </>
        ) : detail?.kind === "parent" && !detail.row ? (
          <>
            <Box sx={heroBandSx}>
              <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                Parent profile
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5 }}>
                {displayName}
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 4, mt: { xs: -6, sm: -7 } }}>
              <Alert severity="info" sx={{ borderRadius: 2, border: `1px solid ${accentLight}` }}>
                No linked parent profile was found yet. Your login still works; contact the school if details are missing.
              </Alert>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
