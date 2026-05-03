import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import PortalPrivateHeader from "../components/Portal/PortalPrivateHeader";
import {
  fetchSchoolPortalUser,
  fetchSchoolPortalParentProfile,
  fetchSchoolPortalStudentProfile,
  clearSchoolPortalSession,
  schoolPortalMediaUrl,
} from "../api";

const BG = "#f0f4fa";
const BRAND = {
  navy: "#0c2340",
  gold: "#c9a227",
};

function Field({ label, value }) {
  const text = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, color: BRAND.navy }}>
        {text}
      </Typography>
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

  const handleLogout = () => {
    clearSchoolPortalSession();
    navigate("/marketplace", { replace: true });
  };

  const u = user || {};
  const profileImg = u.profile_image;
  const portalLabel = u.role === "student" ? "Student portal" : u.role === "parent" ? "Parent portal" : "";

  const innerUser = detail?.row?.user || {};

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG, pt: { xs: "56px", sm: "64px" } }}>
      <PortalPrivateHeader
        displayName={u.full_name || innerUser.full_name || "Member"}
        profileImageUrl={profileImg || innerUser.profile_image}
        portalRoleLabel={portalLabel}
        onLogout={handleLogout}
      />

      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: BRAND.gold }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(12,35,64,0.12)" }}>
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BRAND.navy }}>
                Your profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Signed-in account details from the school records.
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.navy, mb: 1 }}>
                Account
              </Typography>
              <Stack divider={<Divider flexItem />}>
                <Field label="Full name" value={u.full_name} />
                <Field label="Email" value={u.email} />
                <Field label="Username" value={u.username} />
                <Field label="Phone" value={u.phone} />
                <Field label="Role" value={u.role} />
              </Stack>

              {detail?.kind === "parent" && detail.row ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.navy, mt: 3, mb: 1 }}>
                    Parent record
                  </Typography>
                  <Stack divider={<Divider flexItem />}>
                    <Field label="Relationship" value={detail.row.relationship} />
                    <Field label="Occupation" value={detail.row.occupation} />
                    <Box sx={{ py: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Newsletter
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={detail.row.newsletter_subscription ? "Subscribed" : "Not subscribed"}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </>
              ) : null}

              {detail?.kind === "parent" && !detail.row ? (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  No linked parent profile was found yet. Your login still works; contact the school if details are missing.
                </Alert>
              ) : null}

              {detail?.kind === "student" && detail.row ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.navy, mt: 3, mb: 1 }}>
                    Student record
                  </Typography>
                  <Stack divider={<Divider flexItem />}>
                    <Field label="Admission number" value={detail.row.admission_number} />
                    <Field label="Class" value={detail.row.current_class} />
                    <Field label="Section" value={detail.row.section} />
                    <Field label="Roll number" value={detail.row.roll_number} />
                    <Field label="Gender" value={detail.row.gender} />
                    <Field label="Date of birth" value={detail.row.date_of_birth} />
                    <Box sx={{ py: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Account status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip size="small" label={detail.row.account_status || "—"} sx={{ fontWeight: 600 }} />
                      </Box>
                    </Box>
                  </Stack>
                </>
              ) : null}

              {detail?.kind === "student" && !detail.row ? (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  No linked student profile was found yet. Your login still works; contact the school if details are missing.
                </Alert>
              ) : null}

              {(profileImg || innerUser.profile_image) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Profile photo
                  </Typography>
                  <Box
                    component="img"
                    src={schoolPortalMediaUrl(profileImg || innerUser.profile_image)}
                    alt=""
                    sx={{
                      mt: 1,
                      maxWidth: "100%",
                      maxHeight: 220,
                      borderRadius: 2,
                      border: "1px solid rgba(12,35,64,0.12)",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
