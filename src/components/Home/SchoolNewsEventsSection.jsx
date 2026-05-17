import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailable";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
  cream: "#f7f5ef",
  sky: "#f0f4fa",
};

/** Shared gallery card dimensions (news & events). */
const GALLERY_CARD_HEIGHT = 440;
const GALLERY_POSTER_HEIGHT = 180;

const galleryCardShellSx = {
  height: GALLERY_CARD_HEIGHT,
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: "#fff",
  border: "1px solid rgba(12, 35, 64, 0.1)",
  boxShadow: "0 8px 28px rgba(12, 35, 64, 0.08)",
  transition: "box-shadow 0.25s ease",
  "&:hover": {
    boxShadow: "0 16px 40px rgba(12, 35, 64, 0.16)",
  },
};

const galleryCardBodySx = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  p: { xs: 2, sm: 2.25 },
  minHeight: GALLERY_CARD_HEIGHT - GALLERY_POSTER_HEIGHT,
  boxSizing: "border-box",
};

const NEWS_CATEGORY_LABELS = {
  academic: "Academic",
  announcement: "Announcement",
  achievement: "Achievement",
  event: "Event",
  holiday: "Holiday",
  general: "General",
};

const EVENT_TYPE_LABELS = {
  sports: "Sports",
  academic: "Academic",
  cultural: "Cultural",
  parent_meeting: "Parent meeting",
  admission: "Admission",
  holiday: "Holiday",
  workshop: "Workshop",
  competition: "Competition",
  other: "Event",
};

function getApiBase() {
  const env = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
}

function mediaUrl(path) {
  if (!path || typeof path !== "string") return null;
  const t = path.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `${getApiBase()}${t.startsWith("/") ? t : `/${t}`}`;
}

function formatNewsDate(item) {
  const raw = item?.published_at || item?.created_at;
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatEventRange(start, end) {
  if (!start) return "";
  try {
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const opts = { day: "numeric", month: "short", year: "numeric" };
    const timeOpts = { hour: "2-digit", minute: "2-digit" };
    if (!e || Number.isNaN(e.getTime())) {
      return s.toLocaleString("en-GB", { ...opts, ...timeOpts });
    }
    const sameDay = s.toDateString() === e.toDateString();
    if (sameDay) {
      return `${s.toLocaleDateString("en-GB", opts)} · ${s.toLocaleTimeString("en-GB", timeOpts)} – ${e.toLocaleTimeString("en-GB", timeOpts)}`;
    }
    return `${s.toLocaleString("en-GB", { ...opts, ...timeOpts })} – ${e.toLocaleString("en-GB", { ...opts, ...timeOpts })}`;
  } catch {
    return "";
  }
}

function excerpt(text, max = 140) {
  if (!text) return "";
  const raw = String(text).replace(/\s+/g, " ").trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

function deliveryLabel(mode) {
  if (mode === "online") return "Online";
  if (mode === "hybrid") return "Hybrid";
  return "In person";
}

function isUpcomingEvent(ev) {
  const end = ev?.end_date ? new Date(ev.end_date) : null;
  if (!end || Number.isNaN(end.getTime())) return true;
  return end >= new Date();
}

/** Whether parents/students can open the live room (API join_window or local fallback). */
function canJoinOnlineEvent(ev) {
  if (!ev || (ev.delivery_mode !== "online" && ev.delivery_mode !== "hybrid")) return false;
  if (ev.join_window != null) return !!ev.join_window.can_join;
  if (ev.session_status === "ended" || ev.session_status === "cancelled") return false;
  return isUpcomingEvent(ev);
}

function joinClosedMessage(ev) {
  if (ev?.join_window?.reason) return ev.join_window.reason;
  if (ev?.session_status === "ended") return "This event has ended.";
  if (ev?.session_status === "cancelled") return "This event was cancelled.";
  if (!isUpcomingEvent(ev)) return "This event has ended. The join option is no longer available.";
  return "Joining is not available right now.";
}

async function fetchJson(path) {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not load content.");
  }
  return Array.isArray(data.data) ? data.data : [];
}

function PosterHero({ src, alt, height = 200 }) {
  const url = mediaUrl(src);
  if (!url) {
    return (
      <Box
        sx={{
          height,
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 55%, ${BRAND.gold} 120%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <ArticleOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      sx={{
        width: "100%",
        height,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function ArrowCarousel({ items, ariaLabel, renderCard }) {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const visibleCount = upMd ? 3 : upSm ? 2 : 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items, visibleCount]);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const visible = items.slice(index, index + visibleCount);

  if (!items.length) return null;

  return (
    <Box role="region" aria-label={ariaLabel}>
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
        <IconButton
          aria-label="Previous"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          sx={{
            flexShrink: 0,
            bgcolor: "#fff",
            border: `1px solid rgba(12, 35, 64, 0.12)`,
            boxShadow: "0 2px 8px rgba(12, 35, 64, 0.08)",
            "&:hover": { bgcolor: BRAND.sky },
            "&.Mui-disabled": { opacity: 0.35 },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            {visible.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: `1 1 ${100 / visibleCount}%`,
                  minWidth: 0,
                  maxWidth: `${100 / visibleCount}%`,
                }}
              >
                {renderCard(item)}
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          aria-label="Next"
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
          disabled={!canNext}
          sx={{
            flexShrink: 0,
            bgcolor: "#fff",
            border: `1px solid rgba(12, 35, 64, 0.12)`,
            boxShadow: "0 2px 8px rgba(12, 35, 64, 0.08)",
            "&:hover": { bgcolor: BRAND.sky },
            "&.Mui-disabled": { opacity: 0.35 },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

function NewsCard({ item, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Box onClick={() => onClick(item)} sx={galleryCardShellSx}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <PosterHero src={item.poster_image} alt={item.title} height={GALLERY_POSTER_HEIGHT} />
          <Chip
            size="small"
            label={NEWS_CATEGORY_LABELS[item.category] || item.category || "News"}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
              bgcolor: "rgba(255,255,255,0.92)",
              color: BRAND.navyDeep,
            }}
          />
        </Box>
        <Box sx={galleryCardBodySx}>
          <Typography
            variant="caption"
            sx={{ color: BRAND.gold, fontWeight: 700, letterSpacing: 0.4 }}
          >
            {formatNewsDate(item)}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: "1.25rem",
              lineHeight: 1.2,
              color: BRAND.navyDeep,
              mt: 0.5,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.55,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.summary || excerpt(item.content, 140)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: "auto", pt: 1.5, color: BRAND.navy }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Read more
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
}

function EventCard({ item, onClick }) {
  const online = item.delivery_mode === "online" || item.delivery_mode === "hybrid";
  const upcoming = isUpcomingEvent(item);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Box onClick={() => onClick(item)} sx={galleryCardShellSx}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <PosterHero src={item.poster_image} alt={item.title} height={GALLERY_POSTER_HEIGHT} />
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ position: "absolute", top: 12, left: 12, flexWrap: "wrap", gap: 0.75 }}
          >
            <Chip
              size="small"
              icon={<CalendarMonthOutlinedIcon sx={{ fontSize: "16px !important" }} />}
              label={upcoming ? "Upcoming" : "Past"}
              sx={{
                fontWeight: 700,
                bgcolor: upcoming ? "rgba(201, 162, 39, 0.95)" : "rgba(120,120,120,0.9)",
                color: upcoming ? BRAND.navyDeep : "#fff",
              }}
            />
            {item.is_featured ? (
              <Chip
                size="small"
                icon={<StarRoundedIcon sx={{ fontSize: "16px !important" }} />}
                label="Featured"
                sx={{ fontWeight: 700, bgcolor: BRAND.navy, color: "#fff" }}
              />
            ) : null}
            {online ? (
              <Chip
                size="small"
                icon={<VideocamOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                label={deliveryLabel(item.delivery_mode)}
                sx={{ fontWeight: 700, bgcolor: "#fff", color: BRAND.navyDeep }}
              />
            ) : null}
          </Stack>
        </Box>
        <Box sx={galleryCardBodySx}>
          <Typography variant="caption" sx={{ color: BRAND.gold, fontWeight: 700 }}>
            {EVENT_TYPE_LABELS[item.event_type] || "Event"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: "1.25rem",
              lineHeight: 1.2,
              color: BRAND.navyDeep,
              mt: 0.5,
              mb: 0.75,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              mb: 0.75,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {formatEventRange(item.start_date, item.end_date)}
          </Typography>
          {item.location && item.delivery_mode !== "online" ? (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75, minHeight: 24 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: BRAND.navy, opacity: 0.7, flexShrink: 0 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.location}
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ minHeight: 24, mb: 0.75 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.55,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt(item.description, 120)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: "auto", pt: 1.5, color: BRAND.navy }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              View details
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
}

function DetailDialog({ open, onClose, item, kind, onJoinEvent, hasPortalToken }) {
  if (!item) return null;
  const isNews = kind === "news";
  const isOnlineEvent =
    !isNews && (item.delivery_mode === "online" || item.delivery_mode === "hybrid");
  const canJoin = isOnlineEvent && canJoinOnlineEvent(item);
  const joinClosed = isOnlineEvent && !canJoin;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <Box sx={{ position: "relative" }}>
        <PosterHero
          src={item.poster_image}
          alt={item.title}
          height={280}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: "#fff" },
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={isNews ? "News" : "Event"}
              size="small"
              sx={{ fontWeight: 700, bgcolor: BRAND.navy, color: "#fff" }}
            />
            {isNews ? (
              <Chip
                label={NEWS_CATEGORY_LABELS[item.category] || item.category}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <>
                <Chip
                  label={EVENT_TYPE_LABELS[item.event_type] || item.event_type}
                  size="small"
                />
                <Chip
                  label={deliveryLabel(item.delivery_mode)}
                  size="small"
                  icon={
                    item.delivery_mode !== "physical" ? (
                      <VideocamOutlinedIcon />
                    ) : undefined
                  }
                />
                {isOnlineEvent ? (
                  <Chip
                    size="small"
                    label={canJoin ? "Join open" : "Join closed"}
                    color={canJoin ? "success" : "default"}
                    variant={canJoin ? "filled" : "outlined"}
                  />
                ) : null}
              </>
            )}
          </Stack>

          <Typography
            component="h2"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.1rem" },
              color: BRAND.navyDeep,
              lineHeight: 1.15,
            }}
          >
            {item.title}
          </Typography>

          <Typography variant="body2" sx={{ color: BRAND.gold, fontWeight: 700 }}>
            {isNews
              ? formatNewsDate(item)
              : formatEventRange(item.start_date, item.end_date)}
          </Typography>

          {!isNews && item.location && item.delivery_mode !== "online" ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnOutlinedIcon sx={{ color: BRAND.navy }} />
              <Typography variant="body1">{item.location}</Typography>
            </Stack>
          ) : null}

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {isNews ? item.content : item.description}
          </Typography>

          {isOnlineEvent ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: joinClosed ? "action.hover" : BRAND.sky,
                border: `1px solid rgba(12, 35, 64, 0.1)`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND.navyDeep, mb: 0.5 }}>
                Online participation
              </Typography>
              {canJoin ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {hasPortalToken
                      ? "Join the live video room with chat, reactions, and questions — you will wait in a lobby until staff admits you."
                      : "Sign in as a parent or student to join the live video room with chat and Q&A."}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => onJoinEvent?.(item)}
                    sx={{
                      mt: 1.5,
                      bgcolor: BRAND.gold,
                      color: BRAND.navyDeep,
                      fontWeight: 700,
                      "&:hover": { bgcolor: BRAND.goldMuted },
                    }}
                  >
                    {hasPortalToken ? "Join event" : "Sign in to join"}
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {joinClosedMessage(item)}
                </Typography>
              )}
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function LoadingGallery({ ariaLabel = "Loading" }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} aria-label={ariaLabel}>
      <IconButton disabled sx={{ opacity: 0.35 }}>
        <ChevronLeftIcon />
      </IconButton>
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="rounded" height={GALLERY_CARD_HEIGHT} sx={{ borderRadius: 3 }} />
      </Box>
      <IconButton disabled sx={{ opacity: 0.35 }}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}

export default function SchoolNewsEventsSection() {
  const navigate = useNavigate();
  const hasPortalToken =
    typeof localStorage !== "undefined" && !!localStorage.getItem("marketplace_token");

  const handleJoinEvent = useCallback(
    (eventItem) => {
      if (!eventItem?.id || !canJoinOnlineEvent(eventItem)) return;
      const path = `/portal/event/${eventItem.id}`;
      if (hasPortalToken) {
        navigate(path);
      } else {
        navigate("/marketplace", { state: { returnTo: path } });
      }
    },
    [hasPortalToken, navigate]
  );

  const [tab, setTab] = useState(0);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState({ open: false, item: null, kind: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [newsRows, eventRows] = await Promise.all([
        fetchJson("/api/news/published?limit=50"),
        fetchJson("/api/events/published?limit=50"),
      ]);
      setNews(newsRows);
      setEvents(eventRows);
    } catch (e) {
      setError(e.message || "Could not load news and events.");
      setNews([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedNews = useMemo(
    () =>
      [...news].sort(
        (a, b) =>
          new Date(b.published_at || b.created_at || 0) -
          new Date(a.published_at || a.created_at || 0)
      ),
    [news]
  );

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0)
      ),
    [events]
  );

  const openNews = async (item) => {
    try {
      const base = getApiBase();
      const res = await fetch(
        `${base}/api/news/published/slug/${encodeURIComponent(item.slug)}?record_view=1`
      );
      const data = await res.json().catch(() => ({}));
      setDetail({
        open: true,
        kind: "news",
        item: data.success ? data.data : item,
      });
    } catch {
      setDetail({ open: true, kind: "news", item });
    }
  };

  const openEvent = async (item) => {
    try {
      const base = getApiBase();
      const res = await fetch(
        `${base}/api/events/published/slug/${encodeURIComponent(item.slug)}`
      );
      const data = await res.json().catch(() => ({}));
      setDetail({
        open: true,
        kind: "event",
        item: data.success ? data.data : item,
      });
    } catch {
      setDetail({ open: true, kind: "event", item });
    }
  };

  const showNews = tab === 0;
  const showEvents = tab === 1;

  return (
    <Box
      id="school-news-events-section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 2.5, md: 4 },
        pb: { xs: 3.5, md: 5.5 },
        background: `linear-gradient(180deg, ${BRAND.sky} 0%, ${BRAND.cream} 45%, #fff 100%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,162,39,0.18) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={0.75} alignItems="center" textAlign="center" sx={{ mb: { xs: 1.5, md: 2 } }}>
          <Chip
            icon={<EventAvailableOutlinedIcon />}
            label="Stay connected"
            sx={{
              fontWeight: 700,
              bgcolor: "rgba(12, 35, 64, 0.06)",
              color: BRAND.navy,
              border: `1px solid rgba(12, 35, 64, 0.08)`,
            }}
          />
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: { xs: "2.25rem", md: "3rem" },
              color: BRAND.navyDeep,
              lineHeight: 1.1,
            }}
          >
            News & Events
          </Typography>
          <Typography
            sx={{
              maxWidth: 560,
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.6,
            }}
          >
            Announcements, achievements, and what is happening at school — fresh from our
            community.
          </Typography>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{
            mb: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              minHeight: 48,
              color: BRAND.navy,
              opacity: 0.7,
              "&.Mui-selected": { opacity: 1, color: BRAND.navyDeep },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 2,
              bgcolor: BRAND.gold,
            },
          }}
        >
          <Tab label="News" />
          <Tab label="Events" />
        </Tabs>

        {loading ? (
          <LoadingGallery ariaLabel={tab === 0 ? "Loading news" : "Loading events"} />
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={load} sx={{ bgcolor: BRAND.navy }}>
              Try again
            </Button>
          </Box>
        ) : (
          <>
            {showNews ? (
              sortedNews.length === 0 ? (
                <Typography sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                  No news published yet. Check back soon.
                </Typography>
              ) : (
                <ArrowCarousel
                  ariaLabel="School news"
                  items={sortedNews}
                  renderCard={(item) => <NewsCard item={item} onClick={openNews} />}
                />
              )
            ) : null}

            {showEvents ? (
              sortedEvents.length === 0 ? (
                <Typography sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                  No events published yet.
                </Typography>
              ) : (
                <ArrowCarousel
                  ariaLabel="School events"
                  items={sortedEvents}
                  renderCard={(item) => <EventCard item={item} onClick={openEvent} />}
                />
              )
            ) : null}
          </>
        )}

      </Container>

      <DetailDialog
        open={detail.open}
        onClose={() => setDetail({ open: false, item: null, kind: null })}
        item={detail.item}
        kind={detail.kind}
        onJoinEvent={handleJoinEvent}
        hasPortalToken={hasPortalToken}
      />
    </Box>
  );
}
