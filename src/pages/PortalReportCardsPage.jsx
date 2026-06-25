import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  fetchSchoolPortalStudentProfile,
  fetchSchoolPortalStudentReportCards,
  fetchSchoolPortalStudentReportCardPdf,
  fetchSchoolPortalUser,
  hasPortalSession,
} from "../api";

import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalSurfaceCard,
  PortalLoading,
  PortalEmptyState,
  PortalPrimaryButton,
} from "../components/Portal/portalUi";
import { PORTAL } from "../components/Portal/portalShared";

function formatDate(card) {
  const raw = card?.created_at ?? card?.createdAt;
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function gradeChipColor(grade) {
  const g = String(grade || "").trim().toUpperCase();
  if (["A+", "A", "A-"].some((x) => g.startsWith(x))) return "success";
  if (["B+", "B", "B-"].some((x) => g.startsWith(x))) return "info";
  if (["C+", "C", "C-"].some((x) => g.startsWith(x))) return "warning";
  return "default";
}

export default function PortalReportCardsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [profile, setProfile] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [openingPdfId, setOpeningPdfId] = useState(null);

  const openReportCardPdf = async (cardId) => {
    setOpeningPdfId(cardId);
    setError("");
    try {
      const blob = await fetchSchoolPortalStudentReportCardPdf(cardId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(e.message || "Could not open report card PDF.");
    } finally {
      setOpeningPdfId(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { rows: list, pagination } = await fetchSchoolPortalStudentReportCards({ page, limit: 12 });
      setRows(list);
      setTotalPages(pagination.totalPages ?? 1);
      setTotal(pagination.total ?? list.length);
    } catch (e) {
      setError(e.message || "Could not load report cards.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!hasPortalSession()) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      try {
        const me = await fetchSchoolPortalUser();
        if (me.role !== "student") {
          navigate("/portal", { replace: true });
          return;
        }
        const row = await fetchSchoolPortalStudentProfile();
        setProfile(row);
        setAuthReady(true);
      } catch (e) {
        setError(e.message || "Could not load report cards.");
        setLoading(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, load]);

  const classLabel = profile?.curriculum_class?.name || "—";

  return (
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<DescriptionOutlinedIcon />}
        title="My report cards"
        subtitle={`Official summaries published by your school · Class ${classLabel}`}
        chip={
          !loading && !error ? (
            <Chip
              label={`${total} report card${total === 1 ? "" : "s"}`}
              size="small"
              sx={{ mt: 1.5, bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, border: `1px solid ${PORTAL.borderGold}` }}
            />
          ) : null
        }
      />

      <PortalPageContent fullWidth>
        {loading ? (
          <PortalLoading label="Loading report cards…" />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : rows.length === 0 ? (
          <PortalEmptyState
            icon={<DescriptionOutlinedIcon />}
            title="No report cards yet"
            description="When teachers publish your term report cards, they will appear here. You can download each PDF anytime."
          />
        ) : (
          <>
            <Stack spacing={2}>
              {rows.map((card, index) => {
                const expanded = expandedId === card.id;
                const lineCount = card.lines?.length ?? 0;
                return (
                  <PortalSurfaceCard
                      key={card.id}
                      sx={{
                        height: "100%",
                        borderColor: expanded ? PORTAL.gold : PORTAL.border,
                        boxShadow: expanded ? PORTAL.shadowMd : PORTAL.shadowSm,
                      }}
                    >
                      <Box sx={{ p: 0 }}>
                      <Box sx={{ p: { xs: 2, sm: 2.25 }, pb: expanded ? 1 : 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="overline" sx={{ color: PORTAL.gold, fontWeight: 800, letterSpacing: 1 }}>
                              #{((page - 1) * 12 + index + 1).toString().padStart(2, "0")}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: PORTAL.navyDeep, lineHeight: 1.25, fontFamily: PORTAL.fontDisplay }}>
                              {card.title || "Report card"}
                            </Typography>
                          </Box>
                          {card.overall_grade ? (
                            <Chip
                              icon={<EmojiEventsOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                              label={card.overall_grade}
                              color={gradeChipColor(card.overall_grade)}
                              sx={{ fontWeight: 800, flexShrink: 0 }}
                            />
                          ) : null}
                        </Stack>

                        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
                          <Chip
                            size="small"
                            icon={<SchoolOutlinedIcon />}
                            label={card.curriculum_class?.name || classLabel}
                            variant="outlined"
                          />
                          {card.curriculum_class_level?.name ? (
                            <Chip size="small" label={card.curriculum_class_level.name} variant="outlined" />
                          ) : null}
                          <Chip
                            size="small"
                            icon={<CalendarMonthOutlinedIcon />}
                            label={formatDate(card)}
                            variant="outlined"
                          />
                        </Stack>

                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: PORTAL.sky,
                            border: `1px solid ${PORTAL.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Total marks
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: PORTAL.navyDeep }}>
                              {card.total_marks_obtained}
                              {card.total_marks_possible != null ? ` / ${card.total_marks_possible}` : ""}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {lineCount} exam{lineCount === 1 ? "" : "s"}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <PortalPrimaryButton
                            size="small"
                            startIcon={
                              openingPdfId === card.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <DownloadOutlinedIcon />
                              )
                            }
                            disabled={openingPdfId === card.id}
                            onClick={() => void openReportCardPdf(card.id)}
                            sx={{ flex: 1 }}
                          >
                            {openingPdfId === card.id ? "Opening…" : "Open PDF"}
                          </PortalPrimaryButton>
                          {lineCount > 0 ? (
                            <IconButton
                              size="small"
                              aria-label={expanded ? "Hide details" : "Show exam breakdown"}
                              onClick={() => setExpandedId(expanded ? null : card.id)}
                              sx={{ border: `1px solid ${PORTAL.border}`, borderRadius: 1, color: PORTAL.navyDeep }}
                            >
                              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          ) : null}
                        </Stack>

                        <Collapse in={expanded}>
                          <Divider sx={{ my: 1.5 }} />
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Exam</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  Marks
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(card.lines || []).map((line) => (
                                <TableRow key={line.id || line.exam_id}>
                                  <TableCell>{line.exam_title}</TableCell>
                                  <TableCell align="right">
                                    {line.marks_obtained}
                                    {line.total_marks != null ? ` / ${line.total_marks}` : ""}
                                  </TableCell>
                                  <TableCell>{line.grade || "—"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </Box>
                      </Box>
                    </PortalSurfaceCard>
                );
              })}
            </Stack>

            {totalPages > 1 ? (
              <Stack alignItems="center" sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      bgcolor: PORTAL.gold,
                      color: PORTAL.navyDeep,
                      fontWeight: 700,
                    },
                  }}
                  shape="rounded"
                />
              </Stack>
            ) : null}
          </>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
