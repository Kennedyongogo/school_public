import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Stack, Typography } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  fetchSchoolPortalStudentAssignments,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";
import { formatWallClockDateTime } from "../utils/scheduleTime";
import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalSurfaceCard,
  PortalLoading,
  PortalEmptyState,
} from "../components/Portal/portalUi";
import { PORTAL, portalPrimaryButtonSx } from "../components/Portal/portalShared";

export default function PortalAssignmentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!hasPortalSession()) {
        navigate("/login", { replace: true });
        return;
      }
      setLoading(true);
      try {
        const [me, list] = await Promise.all([
          fetchSchoolPortalUser(),
          fetchSchoolPortalStudentAssignments(),
        ]);
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        setRows(list);
      } catch (e) {
        setError(e.message || "Could not load assignments.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate]);

  return (
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<AssignmentTurnedInIcon />}
        title="My assignments"
        subtitle="Complete homework from your teachers and view feedback when marks are published."
      />
      <PortalPageContent fullWidth>
        {loading ? (
          <PortalLoading label="Loading assignments…" />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : rows.length === 0 ? (
          <PortalEmptyState
            icon={<AssignmentTurnedInIcon />}
            title="No assignments"
            description="When a teacher publishes an assignment for you, it will appear here."
          />
        ) : (
          <Stack spacing={2}>
            {rows.map((row) => {
              const submitted = row.submission_status === "submitted" || Boolean(row.submitted_at);
              const canOpen = row.can_open && !submitted;
              return (
                <PortalSurfaceCard key={row.id}>
                  <Stack spacing={1}>
                    <Typography sx={{ fontFamily: PORTAL.fontDisplay, fontWeight: 700, fontSize: "1.2rem" }}>
                      {row.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.assignment_type === "pdf_form" ? "PDF-style" : "Online"} · Due:{" "}
                      {row.due_date ? formatWallClockDateTime(row.due_date) : "No due date"}
                    </Typography>
                    {row.retained_by_submission ? (
                      <Alert severity="info" sx={{ py: 0 }}>
                        You submitted this assignment. It may no longer be assigned to you, but your work stays on record.
                      </Alert>
                    ) : null}
                    {row.is_closed && !submitted ? (
                      <Alert severity="warning" sx={{ py: 0 }}>This assignment is closed.</Alert>
                    ) : null}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowRoundedIcon />}
                        disabled={!canOpen}
                        onClick={() =>
                          navigate(`/portal/assignments/${row.id}`, {
                            state: { assignmentType: row.assignment_type },
                          })
                        }
                        sx={portalPrimaryButtonSx()}
                      >
                        {submitted ? "Submitted" : canOpen ? "Open assignment" : "Cannot open"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/portal/assignments/${row.id}/feedback`)}
                      >
                        View feedback
                      </Button>
                    </Stack>
                  </Stack>
                </PortalSurfaceCard>
              );
            })}
          </Stack>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
