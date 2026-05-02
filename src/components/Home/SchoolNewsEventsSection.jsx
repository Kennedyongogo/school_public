import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArticleIcon from "@mui/icons-material/Article";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};

const formatDate = (post) => {
  const raw = post.publishDate || post.createdAt || post.updatedAt;
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
};

function TabScrollList({ items, emptyHint, onItemClick, icon: Icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid rgba(12, 35, 64, 0.12)`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#fafcfe",
      }}
    >
      <Box
        sx={{
          maxHeight: { xs: 360, sm: 420, md: 480 },
          overflowY: "auto",
          px: { xs: 1, sm: 1.5 },
          py: 1,
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(12, 35, 64, 0.25)",
            borderRadius: 4,
          },
        }}
      >
        {items.length === 0 ? (
          <Typography sx={{ py: 4, px: 2, textAlign: "center", color: "text.secondary" }}>
            {emptyHint}
          </Typography>
        ) : (
          items.map((post, idx) => (
            <Box key={post.id || idx}>
              <Box
                onClick={() => onItemClick(post)}
                sx={{
                  display: "flex",
                  gap: 1.25,
                  py: 1.5,
                  px: { xs: 0.5, sm: 1 },
                  cursor: "pointer",
                  borderRadius: 1,
                  transition: "background 0.2s ease",
                  "&:hover": { bgcolor: "rgba(12, 35, 64, 0.06)" },
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "rgba(201, 162, 39, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: BRAND.navy,
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: BRAND.navyDeep,
                      lineHeight: 1.35,
                      mb: 0.25,
                    }}
                  >
                    {post.title || "Untitled"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BRAND.gold, fontWeight: 600 }}>
                    {formatDate(post)}
                    {post.category ? ` · ${post.category}` : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.45,
                    }}
                  >
                    {(() => {
                      const raw =
                        post.excerpt ||
                        (post.content
                          ? String(post.content).replace(/\s+/g, " ").trim().slice(0, 220)
                          : "") ||
                        "";
                      return raw.length >= 220 && !post.excerpt ? `${raw.slice(0, 217)}…` : raw;
                    })()}
                  </Typography>
                </Box>
              </Box>
              {idx < items.length - 1 && <Divider sx={{ opacity: 0.8 }} />}
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}

export default function SchoolNewsEventsSection() {
  const [tab, setTab] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blogs/public?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setBlogs(data.data);
        } else {
          setBlogs([]);
        }
      })
      .catch(() => {
        if (!cancelled) setBlogs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { newsPosts, eventPosts } = useMemo(() => {
    const sorted = [...blogs].sort(
      (a, b) =>
        new Date(b.publishDate || b.createdAt || 0) -
        new Date(a.publishDate || a.createdAt || 0)
    );
    const isEvent = (b) => {
      const c = (b.category || "").toLowerCase();
      return c.includes("event") || c.includes("calendar") || c.includes("school trip");
    };
    return {
      newsPosts: sorted.filter((b) => !isEvent(b)),
      eventPosts: sorted.filter((b) => isEvent(b)),
    };
  }, [blogs]);

  const openPost = () => {};

  return (
    <Box
      id="school-news-events-section"
      sx={{
        bgcolor: "#f0f4fa",
        pt: { xs: 2, md: 3 },
        pb: { xs: 4, md: 6 },
        borderTop: `1px solid rgba(12, 35, 64, 0.08)`,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 1.75, sm: 2.5, md: 4 },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 700,
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            color: BRAND.navyDeep,
            textAlign: "center",
            mb: 1,
          }}
        >
          News & Events
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: "text.secondary",
            maxWidth: "min(1400px, 100%)",
            mx: "auto",
            mb: 3,
            fontSize: "1.9rem",
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          Stay informed with school announcements and upcoming activities.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: BRAND.gold }} />
          </Box>
        ) : (
          <>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              centered
              variant="fullWidth"
              sx={{
                mb: 2,
                minHeight: { xs: 64, sm: 72 },
                "& .MuiTab-root": {
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "2rem",
                  color: BRAND.navy,
                  "&.Mui-selected": { color: BRAND.gold },
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: BRAND.gold,
                },
              }}
            >
              <Tab label="School News" />
              <Tab label="Events" />
            </Tabs>

            {tab === 0 && (
              <TabScrollList
                items={newsPosts}
                emptyHint="No news posts yet. Check back soon."
                onItemClick={openPost}
                icon={ArticleIcon}
              />
            )}
            {tab === 1 && (
              <TabScrollList
                items={eventPosts}
                emptyHint='No events listed yet. Ask your administrator to publish posts under a category containing "event", or add calendar updates.'
                onItemClick={openPost}
                icon={CalendarTodayIcon}
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
