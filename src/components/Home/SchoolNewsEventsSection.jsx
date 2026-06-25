import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowCarousel from "./ArrowCarousel";
import { HOME, homeBodyFontSize } from "./homeShared";
import { HomeSectionHeader, HomeSectionShell, HomePrimaryButton } from "./homeUi";
import { hasPortalSession } from "../../api";

const BRAND = HOME;

/** Shared gallery card dimensions (news & events). */
const GALLERY_POSTER_HEIGHT = { xs: 168, sm: 188, md: 200 };

const galleryCardShellSx = {
  width: "100%",
  height: "100%",
  minHeight: { xs: 360, md: 400 },
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  boxShadow: HOME.shadowSm,
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: HOME.shadowMd,
    borderColor: HOME.borderGold,
    transform: "translateY(-4px)",
  },
};

const galleryCardBodySx = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  p: { xs: 2, sm: 2.25, md: 2.5 },
  boxSizing: "border-box",
};

function GalleryCardWrap({ children }) {
  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", minWidth: 0 }}>
      {children}
    </Box>
  );
}

function GalleryStrip({ items, ariaLabel, renderCard }) {
  if (!items.length) return null;

  return (
    <ArrowCarousel
      ariaLabel={ariaLabel}
      items={items}
      visibleMd={3}
      visibleSm={2}
      visibleXs={1}
      renderCard={(item) => <GalleryCardWrap>{renderCard(item)}</GalleryCardWrap>}
    />
  );
}

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

function PosterHero({ src, alt, height = GALLERY_POSTER_HEIGHT }) {
  const resolvedHeight = typeof height === "object" ? height : { xs: height, md: height };
  const url = mediaUrl(src);
  if (!url) {
    return (
      <Box
        sx={{
          height: resolvedHeight,
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
        height: resolvedHeight,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function NewsCard({ item, onClick }) {
  return (
    <Box onClick={() => onClick(item)} sx={galleryCardShellSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <PosterHero src={item.poster_image} alt={item.title} />
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
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.15rem", md: "1.3rem" },
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
              fontSize: homeBodyFontSize,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.summary || excerpt(item.content, 140)}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mt: "auto", pt: 1.5, color: BRAND.gold, fontFamily: HOME.fontBody }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Read more
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Stack>
        </Box>
      </Box>
  );
}

function EventCard({ item, onClick }) {
  const online = item.delivery_mode === "online" || item.delivery_mode === "hybrid";
  const upcoming = isUpcomingEvent(item);

  return (
    <Box onClick={() => onClick(item)} sx={galleryCardShellSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <PosterHero src={item.poster_image} alt={item.title} />
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
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.15rem", md: "1.3rem" },
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
              fontSize: homeBodyFontSize,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt(item.description, 120)}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mt: "auto", pt: 1.5, color: BRAND.gold, fontFamily: HOME.fontBody }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              View details
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Stack>
        </Box>
      </Box>
  );
}

function DetailDialog({ open, onClose, item, kind, onJoinEvent, hasPortalToken }) {
  if (!item) return null;
  const isNews = kind === "news";
  const isOnlineEvent =
    !isNews && (item.delivery_mode === "online" || item.delivery_mode === "hybrid");
  const canJoin = isOnlineEvent && canJoinOnlineEvent(item);
  const joinClosed = isOnlineEvent && !canJoin;
  const dateLabel = isNews
    ? formatNewsDate(item)
    : formatEventRange(item.start_date, item.end_date);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2.5, sm: 3 },
          overflow: "hidden",
          border: `1px solid ${HOME.border}`,
          boxShadow: HOME.shadowLg,
          bgcolor: HOME.warmWhite,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box sx={{ height: 4, background: HOME.navyGradient }} />
        <PosterHero src={item.poster_image} alt={item.title} height={{ xs: 220, sm: 280 }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            top: 4,
            background:
              "linear-gradient(180deg, rgba(8,22,43,0.05) 0%, rgba(8,22,43,0.02) 45%, rgba(8,22,43,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            bgcolor: "rgba(255,255,255,0.94)",
            border: `1px solid ${HOME.border}`,
            boxShadow: HOME.shadowSm,
            color: HOME.navyDeep,
            "&:hover": { bgcolor: "#fff", transform: "scale(1.05)" },
            transition: "all 0.2s ease",
          }}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Stack
          direction="row"
          spacing={0.75}
          flexWrap="wrap"
          useFlexGap
          sx={{ position: "absolute", bottom: 16, left: 16, right: 56 }}
        >
          <Chip
            label={isNews ? "News" : "Event"}
            size="small"
            sx={{ fontWeight: 700, bgcolor: HOME.navy, color: "#fff" }}
          />
          {isNews ? (
            <Chip
              label={NEWS_CATEGORY_LABELS[item.category] || item.category || "General"}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.94)", color: HOME.navyDeep }}
            />
          ) : (
            <>
              <Chip
                label={EVENT_TYPE_LABELS[item.event_type] || "Event"}
                size="small"
                sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.94)", color: HOME.navyDeep }}
              />
              {item.is_featured ? (
                <Chip
                  size="small"
                  icon={<StarRoundedIcon sx={{ fontSize: "16px !important" }} />}
                  label="Featured"
                  sx={{ fontWeight: 700, bgcolor: HOME.gold, color: HOME.navyDeep }}
                />
              ) : null}
            </>
          )}
        </Stack>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.85rem", sm: "2.25rem" },
                color: HOME.navyDeep,
                lineHeight: 1.15,
                mb: 1.25,
              }}
            >
              {item.title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: HOME.sky,
                border: `1px solid ${HOME.border}`,
              }}
            >
              {isNews ? (
                <ArticleOutlinedIcon sx={{ fontSize: 20, color: HOME.gold }} />
              ) : (
                <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: HOME.gold }} />
              )}
              <Typography variant="body2" sx={{ color: HOME.navyDeep, fontWeight: 700 }}>
                {dateLabel}
              </Typography>
              {!isNews && item.delivery_mode ? (
                <Chip
                  size="small"
                  label={deliveryLabel(item.delivery_mode)}
                  icon={
                    item.delivery_mode !== "physical" ? (
                      <VideocamOutlinedIcon sx={{ fontSize: "16px !important" }} />
                    ) : undefined
                  }
                  sx={{ fontWeight: 700, bgcolor: "#fff", color: HOME.navyDeep }}
                />
              ) : null}
            </Stack>
          </Box>

          {!isNews && item.location && item.delivery_mode !== "online" ? (
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
              }}
            >
              <LocationOnOutlinedIcon sx={{ color: HOME.gold, mt: 0.15 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.08em", color: HOME.inkSoft }}>
                  LOCATION
                </Typography>
                <Typography variant="body1" sx={{ color: HOME.navyDeep, fontWeight: 600 }}>
                  {item.location}
                </Typography>
              </Box>
            </Stack>
          ) : null}

          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2.5,
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: HOME.inkMuted,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                fontSize: { xs: "0.98rem", sm: "1.05rem" },
              }}
            >
              {isNews ? item.content : item.description}
            </Typography>
          </Box>

          {isOnlineEvent ? (
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                background: joinClosed
                  ? "rgba(12, 35, 64, 0.04)"
                  : `linear-gradient(135deg, ${HOME.sky} 0%, #fff 100%)`,
                border: `1px solid ${joinClosed ? HOME.border : HOME.borderGold}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <VideocamOutlinedIcon sx={{ color: HOME.gold }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: HOME.navyDeep }}>
                  Online participation
                </Typography>
                <Chip
                  size="small"
                  label={canJoin ? "Join open" : "Join closed"}
                  sx={{
                    ml: "auto",
                    fontWeight: 700,
                    bgcolor: canJoin ? "rgba(46, 125, 50, 0.12)" : "rgba(12, 35, 64, 0.08)",
                    color: canJoin ? "#2e7d32" : HOME.inkSoft,
                  }}
                />
              </Stack>
              {canJoin ? (
                <>
                  <Typography variant="body2" sx={{ color: HOME.inkMuted, lineHeight: 1.65, mb: 2 }}>
                    {hasPortalToken
                      ? "Join the live video room with chat, reactions, and questions. You will wait in a lobby until staff admits you."
                      : "Sign in as a parent or student to join the live video room with chat and Q&A."}
                  </Typography>
                  <HomePrimaryButton onClick={() => onJoinEvent?.(item)}>
                    {hasPortalToken ? "Join event" : "Sign in to join"}
                  </HomePrimaryButton>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: HOME.inkMuted, lineHeight: 1.65 }}>
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
        <Skeleton variant="rounded" height={{ xs: 360, md: 400 }} sx={{ borderRadius: 3, width: "100%" }} />
      </Box>
      <IconButton disabled sx={{ opacity: 0.35 }}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}

export default function SchoolNewsEventsSection() {
  const navigate = useNavigate();
  const hasPortalToken = hasPortalSession();

  const handleJoinEvent = useCallback(
    (eventItem) => {
      if (!eventItem?.id || !canJoinOnlineEvent(eventItem)) return;
      const path = `/portal/event/${eventItem.id}`;
      if (hasPortalToken) {
        navigate(path);
      } else {
        navigate("/login", { state: { returnTo: path } });
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
    <HomeSectionShell
      id="school-news-events-section"
      bg={{
        background: `linear-gradient(180deg, ${HOME.sky} 0%, ${HOME.cream} 50%, #fff 100%)`,
        py: { xs: 5, md: 7 },
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
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 1.25, sm: 1.5, md: 2 },
        }}
      >
        <HomeSectionHeader
          eyebrow="Stay connected"
          title="News &"
          titleAccent="events"
          subtitle="News, achievements, and what's happening at school."
        />

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
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
            {["News", "Events"].map((label, i) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  fontFamily: HOME.fontBody,
                  minHeight: 40,
                  px: 3,
                  borderRadius: "999px",
                  color: HOME.navy,
                  opacity: tab === i ? 1 : 0.65,
                  bgcolor: tab === i ? "#fff" : "transparent",
                  boxShadow: tab === i ? HOME.shadowSm : "none",
                  transition: "all 0.2s ease",
                  "&.Mui-selected": { color: HOME.navyDeep },
                }}
              />
            ))}
          </Tabs>
        </Box>

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
                <GalleryStrip
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
                <GalleryStrip
                  ariaLabel="School events"
                  items={sortedEvents}
                  renderCard={(item) => <EventCard item={item} onClick={openEvent} />}
                />
              )
            ) : null}
          </>
        )}
      </Box>

      <DetailDialog
        open={detail.open}
        onClose={() => setDetail({ open: false, item: null, kind: null })}
        item={detail.item}
        kind={detail.kind}
        onJoinEvent={handleJoinEvent}
        hasPortalToken={hasPortalToken}
      />
    </HomeSectionShell>
  );
}
